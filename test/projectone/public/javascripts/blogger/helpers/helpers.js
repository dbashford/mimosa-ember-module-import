define(
  ["ember","showdown","moment"],
  function(__dependency1__, __dependency2__, __dependency3__) {
    "use strict";
    var Ember = __dependency1__["default"] || __dependency1__;
    var Showdown = __dependency2__["default"] || __dependency2__;
    var moment = __dependency3__["default"] || __dependency3__;

    var showdown = new Showdown.converter();

    Ember.Handlebars.helper('format-markdown', function(input) {
      return new Handlebars.SafeString(showdown.makeHtml(input));
    });

    Ember.Handlebars.helper('format-date', function(date) {
      return moment(date).fromNow();
    });
  });