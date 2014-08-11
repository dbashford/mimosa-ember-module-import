define(
  ["ember","../data/posts","exports"],
  function(__dependency1__, __dependency2__, __exports__) {
    "use strict";
    var Ember = __dependency1__["default"] || __dependency1__;
    var posts = __dependency2__["default"] || __dependency2__;

    var PostsRoute = Ember.Route.extend({
      model: function() {
        return posts;
      }
    });

    __exports__["default"] = PostsRoute;
  });