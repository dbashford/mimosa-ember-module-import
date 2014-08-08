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
           "                                         # this to null. Path is relative to project root.\n" +
           "    apps: [{                             # list of apps to create manifests for, one entry\n" +
           "                                         # in the array for each app in your mimosa project\n" +
           "      namespace: null,                   # the namespace of the app to create a manifest\n" +
           "                                         # for. namespace = root folder. If namespace is null\n" +
           "                                         # the entire project is used. namespace is relative\n" +
           "                                         # to watch.javascriptDir.\n" +
           "      additional: [],                    # Paths to additional/shared resources to include in the\n" +
           "                                         # manifest. Paths are relative to the namespace. Use '../'\n" +
           "                                         # paths to include files/folders outside the namespace\n" +
           "      exclude:[]                         # array of strings or regexes that match files\n" +
           "                                         # to not include in this manifest. Strings are paths\n" +
           "                                         # that can be relative to the namespace or absolute.\n" +
           "      manifestFile: \"app-modules\"        # The name of the manifest file to output.\n" +
           "                                         # '.js' is assumed. Path is relative to namespace\n" +
           "    }],                                  # \n" +
           "    emberDirs: [                         # Ember directories that contain files to\n" +
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

          var w = config.watch;
          // namespace can be null
          if ( app.namespace ) {
            app.namespace = path.join( w.sourceDir, w.javascriptDir, app.namespace );
          } else {
            app.namespace = path.join( w.sourceDir, w.javascriptDir);
          }

          if ( validators.ifExistsIsString( errors, "emberResolver.apps.manifestFile", app.manifestFile ) ) {
            // manifestFile is relative to namespace
            app.manifestFile = path.join( app.namespace, app.manifestFile + ".js" );
          }

          if ( validators.ifExistsIsArrayOfStrings( errors, "emberResolver.apps.additional", app.additional ) ) {
            app.additional = app.additional.map( function( add ) {
              return path.join( app.namespace, add );
            });
          }
        }

        validators.ifExistsFileExcludeWithRegexAndString( errors, "emberResolver.apps.exclude", app, app.namespace );
      });
    }

    validators.isArrayOfStringsMustExist( errors, "emberResolver.emberDirs", er.emberDirs );
  }


  if ( !errors.length ) {
    // populate each namespace with emberdirs for use of use later
    er.apps.forEach( function( app ) {
      app.emberDirs = er.emberDirs.map( function( emberDir ) {
        return path.join( app.namespace, emberDir );
      });

      app.emberDirs = app.emberDirs.concat( app.additional );

    });
  }

  return errors;
};
