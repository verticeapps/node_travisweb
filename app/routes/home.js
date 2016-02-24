import BasicRoute from 'travis/routes/basic';
import limit from 'travis/utils/computed-limit';
import Ember from 'ember';

const { alias } = Ember.computed;

export default BasicRoute.extend({
  init: function() {
    var repos, store;

    store = this.store;
    repos = Ember.ArrayProxy.extend({
      isLoaded: alias('repos.isLoaded'),
      repos: [],
      sorted: Ember.computed.sort('repos', 'sortedReposKeys'),
      content: limit('sorted', 'limit'),
      sortedReposKeys: ['sortOrderForLandingPage:desc'],
      limit: 3
    }).create();

    this.set('repos', repos);
    this.loadMoreRepos();

    return this._super.apply(this, arguments);
  },

  loadMoreRepos() {
    return this.store.findAll('build').then( (builds) => {
      var repoIds, repos;
      repoIds = builds.mapBy('data.repo').uniq();
      repos = this.get('repos.repos');
      return this.store.query('repo', {
        ids: repoIds
      }).then(function(reposFromRequest) {
        return reposFromRequest.toArray().forEach(function(repo) {
          if (!repos.contains(repo)) {
            return repos.pushObject(repo);
          }
        });
      });
    });
  },

  activate() {
    return this.controllerFor('top').set('landingPage', true);
  },

  deactivate() {
    return this.controllerFor('top').set('landingPage', false);
  },

  setupController(controller, model) {
    return controller.set('repos', this.get('repos'));
  }
});
