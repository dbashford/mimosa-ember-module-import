exports.config = {
  modules: [
    'ember-module-import',
    'es6-module-transpiler',
    'copy'
  ],
  logger: {
    growl: {
      enabled: false
    }
  },
  emberModuleImport: {
    apps: [{
      namespace: "blogger",
      additional: [],
      exclude: [],
      manifestFile: "modules"
    }],
    emberDirs: [
      "adapters",
      "components",
      "helpers",
      "initializers",
      "mixins",
      "models",
      "routes",
      "serializers",
      "transforms",
      "utils",
      "views"
    ]
  }
};

