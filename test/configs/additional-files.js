exports.config = {
  emberModuleImport: {
    apps: [{
      namespace: "blogger",
      additional: ["../vendor/lodash"],
      exclude: [],
      manifestFile: "modules"
    }]
  },
  modules: [
    'ember-module-import',
    'es6-module-transpiler',
    'copy',
    'require'
  ],
  logger: {
    growl: {
      enabled: false
    }
  }
};