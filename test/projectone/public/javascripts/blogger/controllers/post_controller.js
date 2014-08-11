define(
  ["ember","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    var Ember = __dependency1__["default"] || __dependency1__;

    var PostController = Ember.ObjectController.extend({
      isEditing: false,

      actions: {
        edit: function() {
          this.set('isEditing', true);
        },

        doneEditing: function() {
          this.set('isEditing', false);
        }
      }
    });

    __exports__["default"] = PostController;
  });