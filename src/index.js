"use strict";

var path = require( "path" )
  , fs = require( "fs" )
  , _ = require( "lodash" )
  , moduleConfig = require( "./config" )
  , cache = require( "./cache" )
  , starters = [".","\\","/"]
  , appManifestConfig = [];

// need to transform paths to one that is relative to
// the namespace
var __transformPath = function( namespace, inputFileName ) {
  var relPath = path.relative( namespace, inputFileName );
  var firstChar = relPath.charAt(0);
  if ( starters.indexOf(firstChar) === -1 ) {
    relPath = "./" + relPath;
  }
  return relPath;
};

// Output manifest file after creating
// proper string output
var __writeManifest = function( mimosaConfig, manifest, done ) {
  var output = ""
    , files = manifest.files
    , namespace = manifest.namespace;

  files.forEach( function( file ) {
    var outPath = __transformPath( namespace, file );
    output += "require('" + outPath + "');\n";
  });

  fs.writeFile( manifest.manifestFile, output, function( err ) {
    if ( err ) {
      mimosaConfig.log.error( "ember-module-import: Error writing manifest file", err );
    } else {
      mimosaConfig.log.info( "ember-module-import wrote application manifest file [[ " + manifest.manifestFile + " ]]." );
      // if writing empty manifest, let the user know
      if ( !output.length ) {
        mimosaConfig.log.info("ember-module-import: [[ " + manifest.manifestFile + " ]] is an empty file." );
      }
    }

    done( true );
  });
};

var _processFileAddRemove = function( mimosaConfig, options, next ) {
  if ( options.files && options.files.length) {

  }
  next();
};

var _processFileUpdate = function( mimosaConfig, options, next ) {
  if ( options.files && options.files.length) {

  }
  next();
};

// As each javascript file is built during the initial build
// determine if it is a file to include in a manifest
// and if it is, add it to that manifest's files
var _processBuild = function( mimosaConfig, options, next ) {
  if ( options.files && options.files.length) {

    // iterate over each file, usually just 1
    options.files.forEach( function( file ) {

      // iterate over each app config
      appManifestConfig.forEach( function( manifest ) {

        // iterate over each emberDir/path to check
        // if file is one to include in a manifest
        var len = manifest.emberDirs.length;
        for ( var i = 0; i < len; i++ ) {
          if ( file.inputFileName.indexOf( manifest.emberDirs[i] ) === 0 ) {

            // TODO: deal with exclude for manifest
            manifest.files.push( file.inputFileName );
            break;
          }
        }
      });
    });
  }
  next();
};

// Build is done, time to go through all the apps
// and decide if they have manifest files to write.
// If any files are written, need to update cache.
var _buildDone = function( mimosaConfig, options, next ) {

  // if no config, time to leave
  if ( !appManifestConfig.length ) {
    return next();
  }

  // setup cache update, callers of "done" will
  // provide flag to inform if cache update is needed
  var completed = 0, appManifestConfigLength = appManifestConfig.length, updateCache = false;
  var done = function( needsCacheUpdate ) {
    if ( needsCacheUpdate ) {
      updateCache = true;
    }
    if ( ++completed === appManifestConfigLength ) {

      // Cache will be updated if any manifest file
      // was written during processing
      if ( updateCache ) {
        cache.writeCache( mimosaConfig, appManifestConfig, next );
      } else {
        next();
      }
    }
  };

  appManifestConfig.forEach( function( manifest ) {

    // remove dupes and sort files
    manifest.files = _.uniq( manifest.files );
    manifest.files.sort();

    // forceWrite can be set to true if the output
    // file to be written is missing. In that case
    // it is necessary.
    // Otherwise want to write file if files changed vs
    // cache set of files
    if ( !manifest.forceWrite ) {
      var write = true;
      var cacheData = mimosaConfig.emberModuleImport.cacheData;
      if ( !mimosaConfig.isBuild && cacheData ) {
        var cacheFiles = cacheData[manifest.manifestFile];
        if ( _.isEqual( cacheFiles, manifest.files ) ) {
          write = false;
        }
      }
    }

    // write manifest file
    if ( manifest.forceWrite || write ) {
      manifest.forceWrite = false;
      __writeManifest( mimosaConfig, manifest, done );
    } else {
      done( false );
    }
  });
};

// Set up local manifest configuration object for keeping
// track of files as they process through mimosa
// Also note if manifest files are missing and flag
// them as forceWrite if they are
var _startup = function( mimosaConfig, options, next ) {

  appManifestConfig = mimosaConfig.emberModuleImport.apps.map( function( app ) {

    var files = [];
    // preload files with cached data
    var cd = mimosaConfig.emberModuleImport.cacheData;
    if (cd && cd[app.manifestFile] ) {
      files = cd[app.manifestFile];
    }

    // need to handle case there is cache, but the module
    // files are not there. Like mimosa watch -d.
    // so need to use cache, but if cache matches
    // still need to write
    var forceWrite = false;
    if ( !fs.existsSync( app.manifestFile ) ) {
      forceWrite = true;
    }

    return {
      namespace: app.namespace,
      exclude: app.exclude,
      forceWrite: forceWrite,
      manifestFile: app.manifestFile,
      emberDirs: app.emberDirs,
      files: files
    };
  });

  next();
};

// On clean, need to wipe out cache and manifestFiles
var _clean = function( mimosaConfig, options, next ) {
  if ( fs.existsSync( mimosaConfig.emberModuleImport.cacheFile ) ) {
    fs.unlinkSync( mimosaConfig.emberModuleImport.cacheFile );
    mimosaConfig.log.info( "mimosa-ember-module-import removed its cache file [[ " + mimosaConfig.emberModuleImport.cacheFile + " ]]" );
  }

  mimosaConfig.emberModuleImport.apps.forEach( function( app ) {
    if ( fs.existsSync( app.manifestFile ) ) {
      fs.unlinkSync( app.manifestFile );
      mimosaConfig.log.success( "mimosa-ember-module-import removed manifest file [[ " + app.manifestFile + " ]]" );
    }
  });

  next();
};

var registration = function (mimosaConfig, register) {
  // 2.possibly use info from mimosa-require re:paths?
  //
  // 3. while mimosa is watching need to check file paths vs
  // cached list of things in manifest

  var exts = mimosaConfig.extensions.javascript;

  // during clean need to wipe out modules
  // files and clear the cache
  register( [ "preClean" ], "init", _clean );

  // at beginning of build need to check status
  // of cache and manifestFiles and create
  // in memory data object that will hold
  // file data when files are processed
  register( [ "preBuild" ], "init", _startup );

  // As each file is processed, accumulate
  // files that may need to be included
  // in the ember module manifest
  register( [ "buildFile" ], "beforeWrite", _processBuild, exts );

  // When all the files have been processed
  // evaluated if manifest files need to be
  // written and manage cache objects
  register( [ "postBuild" ], "init", _buildDone );

  // When file is added and it belongs in manifest
  // then cache and manifest file must be written
  // When file is removed and it belongs to manifest file,
  // then cache and manifest files must be written
  // TODO: try add and remove at same time, see if
  // works together
  //register( [ "remove"], "beforeWrite", _processFileDelete, exts );
  register( [ "add", "remove" ], "beforeWrite", _processFileAddRemove, exts );

  // When file is updated and its in a manifest
  // for now need to do nothing
  // TODO: down the road, when allowing App. registering
  // need to check updated file to see if file
  // contains references to multiple Ember assets.
  // Example: export { PostController, PostsController };
  register( [ "update" ], "beforeWrite", _processFileUpdate, exts );
};

module.exports = {
  registration: registration,
  defaults: moduleConfig.defaults,
  placeholder: moduleConfig.placeholder,
  validate: moduleConfig.validate
};
