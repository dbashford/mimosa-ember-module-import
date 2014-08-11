import Ember from 'ember';

var App = Ember.Application.create({
  // LOG_ACTIVE_GENERATION: true,
  // LOG_MODULE_RESOLVER: true,
  // LOG_TRANSITIONS: true,
  // LOG_VIEW_LOOKUPS: true
});

App.deferReadiness();

export default App;