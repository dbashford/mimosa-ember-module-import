exports.config = {
  emberModuleImport: {
    cacheDir: {},
    apps: [{
      namespace: false,
      additional: false,
      exclude: false,
      manifestFile: false,
      appImport: 3
    }],
    emberDirs: [{}]
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