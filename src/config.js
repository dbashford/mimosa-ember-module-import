"use strict";

var path = require( "path" );

exports.defaults = function() {
  return {
    emberModuleImport: {
      cacheDir: ".mimosa/emberModuleImport",
      amd: true,
      fileSep: "_",
      apps: [{
        namespace: null,
        additional: ["router"],
        exclude: [],
        manifestFile: "modules"
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
        "services",
        "transforms",
        "utils",
        "views"
      ]
    }
  };
};

exports.placeholder = function() {
  var ph = "  emberModuleImport:                         # settings for ember-resolver module\n" +
           "    cacheDir:\".mimosa/emberModuleImport\"     # location to place cache. To not cache, set\n" +
           "                                         # this to null. Path is relative to project root.\n" +
           "    amd: true                            # Whether or not the output is AMD or commonjs.\n" +
           "                                         # set to false for commonjs\n" +
           "    fileSep: \"_\"                         # Character/String used for separating portions of\n" +
           "                                         # file name. Ex: tag_editor_controller.js\n" +
           "    apps: [{                             # list of apps to create manifests for, one entry\n" +
           "                                         # in the array for each app in your mimosa project\n" +
           "      namespace: null,                   # the namespace of the app to create a manifest\n" +
           "                                         # for. namespace = root folder. If namespace is null\n" +
           "                                         # the entire project is used. namespace is relative\n" +
           "                                         # to watch.javascriptDir.\n" +
           "      additional: [\"router\"],            # Paths to additional/shared resources to include in the\n" +
           "                                         # manifest. Paths are relative to the namespace. Use '../'\n" +
           "                                         # paths to include files/folders outside the namespace\n" +
           "      exclude:[]                         # array of strings or regexes that match files\n" +
           "                                         # to not include in this manifest. Strings are paths\n" +
           "                                         # that can be relative to the namespace or absolute.\n" +
           "      manifestFile: \"modules\"        # The name of the manifest file to output.\n" +
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
           "      \"services\",\n" +
           "      \"transforms\",\n" +
           "      \"utils\",\n" +
           "      \"views\"\n" +
           "    ]\n";

  return ph;
};

exports.validate = function ( mimosaConfig, validators ) {
  var errors = []
    , er = mimosaConfig.emberModuleImport;

  if ( validators.ifExistsIsObject( errors, "emberModuleImport config", er ) ) {
    validators.ifExistsIsBoolean(errors, "emberModuleImport.amd", er.amd );
    validators.ifExistsIsString(errors, "emberModuleImport.fileSep", er.fileSep );
    if ( validators.ifExistsIsString(errors, "emberModuleImport.cacheDir", er.cacheDir ) ) {
      if ( er.cacheDir ) {
        // build full paths to directory and file
        er.cacheDir = path.join( mimosaConfig.root, er.cacheDir );
        er.cacheFile = path.join( er.cacheDir, "cache.json");
        er.cacheConfig = path.join( er.cacheDir, "config.json");
      }
    }

    if ( validators.isArrayOfObjects( errors, "emberModuleImport.apps", er.apps ) ) {
      er.apps.forEach( function( app ) {

        // namespace can be null
        if ( !app.namespace ) {
          app.namespace = "";
        }

        if ( validators.ifExistsIsString( errors, "emberModuleImport.apps.namespace", app.namespace ) ) {
          var w = mimosaConfig.watch;
          app.namespace = path.join( w.sourceDir, w.javascriptDir, app.namespace );

          if ( validators.ifExistsIsString( errors, "emberModuleImport.apps.manifestFile", app.manifestFile ) ) {
            // build full path to manifest file
            // manifestFile is relative to namespace and gets written to output directory
            app.manifestFile = path.join( app.namespace, app.manifestFile + ".js" )
              .replace( w.sourceDir, w.compiledDir );
          }

          if ( validators.ifExistsIsArrayOfStrings( errors, "emberModuleImport.apps.additional", app.additional ) ) {
            app.additional = app.additional.map( function( add ) {
              // additional files is relative to namespace
              // can use "../common" for things outside namespace
              return path.join( app.namespace, add );
            });
          }
        }

        validators.ifExistsFileExcludeWithRegexAndString( errors, "emberModuleImport.apps.exclude", app, app.namespace );
      });
    }

    validators.isArrayOfStringsMustExist( errors, "emberModuleImport.emberDirs", er.emberDirs );
  }


  if ( !errors.length ) {
    // populate each namespace with fullpath emberdir for ease of use later
    // add additioal files to the emberDirs
    er.apps.forEach( function( app ) {
      app.emberDirs = er.emberDirs.map( function( emberDir ) {
        return path.join( app.namespace, emberDir );
      });

      if ( app.additional ) {
        app.emberDirs = app.emberDirs.concat( app.additional );
      }
    });
  }

  return errors;
};
