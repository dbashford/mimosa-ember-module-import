exports.config = {
  emberModuleImport: {
    amd:1,
    cacheDir: false,
    apps: false,
    emberDirs: false
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