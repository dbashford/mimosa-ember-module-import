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
