exports.config = {
  emberModuleImport: {
    apps: [{
      namespace: "foo",
      additional: [false],
      exclude: [2],
      manifestFile: "foo.js"
    }],
  },
  modules: [
    'ember-module-import'
  ],
  logger: {
    growl: {
      enabled: false
    }
  }
};