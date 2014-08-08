"use strict";

var path = require( "path" );

exports.defaults = function() {
  return {
    emberResolver: {
      cacheDir: ".mimosa/emberResolver",
      apps: [{
        namespace: null,
        additional: [],
        exclude: [],
        manifestFile: "app-modules"
      }],
      emberDirs: [
        "adapters",
        "components",
        "controllers",
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
};

exports.placeholder = function() {
  var ph = "  emberResolver:                         # settings for ember-resolver module\n" +
           "    cacheDir:\".mimosa/emberResolver\"     # location to place cache. To not cache, set\n" +
           "                                           # this to null. Path is relative to project root.\n" +
           "    apps: [{                               # list of apps to create manifests for, one entry\n" +
           "                                           # in the array for each app in your mimosa project\n" +
           "      namespace: null,                     # the namespace of the app to create a manifest\n" +
           "                                           # for. namespace = root folder. If namespace is null\n" +
           "                                           # the entire project is used. namespace is relative\n" +
           "                                           # to watch.javascriptDir.\n" +
           "      additional: [],                      # Any additional/shared resources, either other\n" +
           "                                           # namespaces or files to include in this manifest\n" +
           "      exclude:[]                           # array of strings or regexes that match files\n" +
           "                                           # to not include in this manifest. Strings are paths\n" +
           "                                           # that can be relative to the manifest or absolute.\n" +
           "                                           # If manifest is null, paths are relative to\n" +
           "                                           # watch.javascriptDir.\n" +
           "      manifestFile: \"app-modules\"        # The name of the manifest file to output.\n" +
           "                                           # '.js' is assumed\n" +
           "    }],                                    # \n" +
           "    emberDirs: [                           # Ember directories that contain files to\n" +
           "      \"adapters\",                        # include in a manifest file. Any files in\n" +
           "      \"components\",                      # these directories or in subdirectories of\n" +
           "      \"controllers\",                     # these directories within a namespace will\n" +
           "      \"helpers\",                         # be require'd in the manifest file.\n" +
           "      \"initializers\",\n" +
           "      \"mixins\",\n" +
           "      \"models\",\n" +
           "      \"routes\",\n" +
           "      \"serializers\",\n" +
           "      \"transforms\",\n" +
           "      \"utils\",\n" +
           "      \"views\"\n" +
           "    ]\n";

  return ph;
};

exports.validate = function ( config, validators ) {
  var errors = []
    , er = config.emberResolver;

  if ( validators.ifExistsIsObject( errors, "emberResolver config", er ) ) {
    if ( validators.ifExistsIsString(errors, "emberResolver.cacheDir", er.cacheDir ) ) {
      if ( er.cacheDir ) {
        er.cacheDir = path.join( config.root, er.cacheDir );
      }
    }

    if ( validators.isArrayOfObjects( errors, "emberResolver.apps", er.apps ) ) {
      er.apps.forEach( function( app ) {
        if ( validators.ifExistsIsString( errors, "emberResolver.apps.namespace", app.namespace ) ) {
            if ( app.namespace ) {
              app.namespace = path.join( config.watch.javascriptDir, app.namespace );
            } else {
              app.namespace = config.watch.javascriptDir;
            }
        }
        validators.ifExistsIsString( errors, "emberResolver.apps.manifestFile", app.manifestFile );
        validators.ifExistsIsArrayOfStrings(errors, "emberResolver.apps.additional", app.additional );
        validators.ifExistsFileExcludeWithRegexAndString( errors, "emberResolver.apps.exclude", app, app.namespace );
      });
    }

    validators.isArrayOfStringsMustExist( errors, "emberResolver.emberDirs", er.emberDirs );

  }

  return errors;
};
