define(
  ["ember","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    var Ember = __dependency1__["default"] || __dependency1__;

    var App = Ember.Application.create({
      // LOG_ACTIVE_GENERATION: true,
      // LOG_MODULE_RESOLVER: true,
      // LOG_TRANSITIONS: true,
      // LOG_VIEW_LOOKUPS: true
    });

    App.deferReadiness();

    __exports__["default"] = App;
  });