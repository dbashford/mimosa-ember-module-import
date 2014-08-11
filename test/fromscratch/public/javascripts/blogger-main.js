require(['common'], function() {

  /*
    Application entry point.
  */
  require(['ember', 'app', 'blogger/router', 'blogger/modules'], function( Ember, App, routes ) {
    // Expose Ember App globally, because it's convenient at runtime for looking
    // things up through the console, e.g.: `App.__container__.lookup('route:index')`
    App = App.default;
    window.App = App;
    routes.default(App.Router);
    App.advanceReadiness();

    // Override didInsertElement() to trigger event to run
    // DOM-ready dependent code, like jQuery plugins
    Ember.View.reopen({
      didInsertElement : function(){
        this._super();
        Ember.run.scheduleOnce('afterRender', this, this.afterRenderEvent);
      },
      afterRenderEvent : function(){
        // implement this hook in your own Views
      }
    });
  });
});
