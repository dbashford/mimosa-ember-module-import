exports.config = {
  emberModuleImport: {
    amd:1,
    cacheDir: false,
    apps: false,
    emberDirs: false,
    appImport: 3
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