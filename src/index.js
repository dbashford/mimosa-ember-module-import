"use strict";

var path = require( "path" )
  , fs = require( "fs" )
  , _ = require( "lodash" )
  , moduleConfig = require( "./config" )
  , cache = require( "./cache" )
  , starters = [".", "\\", "/"]
  , appManifestConfig = []
  , compiledTemplate;

var setCompiledTemplate = function( amd ) {
  var templatePath;
  if ( amd ) {
    templatePath = path.join( __dirname, "assets", "amd.template" );
  } else {
    templatePath = path.join( __dirname, "assets", "commonjs.template" );
  }
  var templateText = fs.readFileSync( templatePath );
  compiledTemplate = _.template( templateText );
};

// need to transform paths to one that is relative to
// the namespace
var __transformPath = function( namespace, inputFileName ) {
  var relPath = path.relative( namespace, inputFileName );
  var firstChar = relPath.charAt(0);
  if ( starters.indexOf(firstChar) === -1 ) {
    relPath = "./" + relPath;
  }
  relPath = relPath.replace( /.js$/, "" ).replace( /\\/g, "/" );
  return relPath;
};

// Output manifest file after creating
// proper string output
var __writeManifest = function( mimosaConfig, manifest, done ) {
  var files = manifest.files
    , namespace = manifest.namespace
    , emi = mimosaConfig.emberModuleImport;

  var preTemplateFiles = files.map( function( file ) {
    var outPath = __transformPath( namespace, file );
    var varName =
      path.basename( file, ".js" )
        .split( emi.fileSep )
        .map( function( filePortion ) {
          return filePortion.charAt(0).toUpperCase() + filePortion.slice(1);
        }).join("");

    return {
      path: outPath,
      varName: varName
    };
  });

  if( !compiledTemplate ) {
    setCompiledTemplate( emi.amd );
  }
  var output = compiledTemplate( { files: preTemplateFiles } );

  fs.writeFile( manifest.manifestFile, output, function( err ) {
    if ( err ) {
      mimosaConfig.log.error( "ember-module-import: Error writing manifest file", err );
    } else {
      mimosaConfig.log.info( "ember-module-import wrote application manifest file [[ " + manifest.manifestFile + " ]]." );
      // if writing empty manifest, let the user know
      if ( !files.length ) {
        mimosaConfig.log.info("ember-module-import: [[ " + manifest.manifestFile + " ]] is an empty file." );
      }
    }

    done( true );
  });
};

var __processManifests = function( mimosaConfig, options, matchCallback, noMatchCallback ) {

  // iterate over each file, usually just 1
  options.files.forEach( function( file ) {

    // iterate over each app config
    appManifestConfig.forEach( function( manifest ) {

      // iterate over each emberDir/path to check
      // if file is one to include in a manifest
      var len = manifest.emberDirs.length;
      for ( var i = 0; i < len; i++ ) {
        if ( file.inputFileName.indexOf( manifest.emberDirs[i] ) === 0 ) {

          // file matches, make sure it hasn't been excluded
          if ( manifest.exclude && manifest.exclude.indexOf( file.inputFileName ) !== -1 ) {
            if ( mimosaConfig.log.isDebug() ) {
              mimosaConfig.log.debug( "Not adding file to manifest [[ " + file.inputFileName + " ]] because it has been excluded via string path." );
            }
          } else if ( manifest.excludeRegex && file.inputFileName.match( manifest.excludeRegex ) ) {
            if ( mimosaConfig.log.isDebug() ) {
              mimosaConfig.log.debug( "Not adding file to manifest [[ " + file.inputFileName + " ]] because it has been excluded via regex." );
            }
          } else {

            // not excluded, have a file match, call callback with file and manifest
            noMatchCallback = undefined;
            matchCallback( manifest, file );
            break;
          }
        }
      }

      if ( noMatchCallback ) {
        noMatchCallback( manifest, file.inputFileName );
      }
    });
  });
};

// setup remove callback for when match is found
var __removeMatchCallback = function( mimosaConfig, done) {
  return function( manifest, file ) {
    var inputFileName = file.inputFileName;

    // location of the deleted file in the manifests file list
    var fileLocation = manifest.files.indexOf( inputFileName );

    // if there is a match, need to write cache (later)
    // and need to write the manifest (now)
    if ( fileLocation > -1 ) {
      // update files and write manifest
      manifest.files.splice(fileLocation, 1);
      __writeManifest( mimosaConfig, manifest, done );
    } else {
      done( false );
    }
  };
};

// setup callback for when match is found
var __addMatchCallback = function( mimosaConfig, done) {
  return function( manifest, file ) {
    var inputFileName = file.inputFileName;

    // location of the added file in the manifests file list
    var fileLocation = manifest.files.indexOf( inputFileName );

    // if there is no match in existing files list, need to add write cache (later)
    // and need to write the manifest (now)
    if ( fileLocation === -1 ) {
      // update files and write manifest
      manifest.files.push( inputFileName );
      manifest.files.sort();
      __writeManifest( mimosaConfig, manifest, done );
    } else {
      done( false );
    }
  };
};

// Generic file processing.
// Handles all cache writing.
// Takes appropriate file/manifest match callback for add/update/delete scenarios
var __fileProcess = function( mimosaConfig, options, next, matchCallback ) {
  if ( !appManifestConfig.length || !options.files || !options.files.length ) {
    return next();
  }

  // set up wrap up callback
  var numChecks = appManifestConfig.length * options.files.length
    , completed = 0
    , updateCache = false;
  var done = function( shouldUpdateCache ) {
    if ( shouldUpdateCache ) {
      updateCache = true;
    }
    if ( ++completed === numChecks ) {
      if ( updateCache ) {
        cache.writeCache( mimosaConfig, appManifestConfig, next );
      } else {
        next();
      }
    }
  };

  // process file through manifests
  __processManifests( mimosaConfig, options, matchCallback(mimosaConfig, done), function(){
    done();
  });
};

var _processFileRemove = function( mimosaConfig, options, next ) {
  __fileProcess( mimosaConfig, options, next, __removeMatchCallback );
};

var _processFileAdd = function( mimosaConfig, options, next ) {
  __fileProcess( mimosaConfig, options, next, __addMatchCallback );
};

var __buildMatchCallback = function( manifest, file ) {
  manifest.files.push( file.inputFileName );
};

// As each javascript file is built during the initial build
// determine if it is a file to include in a manifest
// and if it is, add it to that manifest's files
var _processBuild = function( mimosaConfig, options, next ) {
  if ( options.files && options.files.length ) {
    __processManifests( mimosaConfig, options, __buildMatchCallback );
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
  var completed = 0
    , appManifestConfigLength = appManifestConfig.length
    , updateCache = false;
  var done = function() {
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
      updateCache = true;
      __writeManifest( mimosaConfig, manifest, done );
    } else {
      done();
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
      excludeRegex: app.excludeRegex,
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
  var exts = mimosaConfig.extensions.javascript;

  // during clean need to wipe out modules
  // files and clear the cache
  register( [ "preClean" ], "init", _clean );

  // is watch, need to deal with cache
  // build will recompile everything so no need for cache
  register( [ "preBuild" ], "init", function( mimosaConfig, options, next) {
    if ( mimosaConfig.isWatch ) {
      cache.readCache( mimosaConfig );
      cache.validateCache( mimosaConfig );
    }
    cache.writeCacheConfig( mimosaConfig );
    next();
  });

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
  register( [ "add" ], "beforeWrite", _processFileAdd, exts );

  // When file is removed and it belongs to manifest file,
  // then cache and manifest files must be written
  register( [ "remove"], "beforeWrite", _processFileRemove, exts );
};

module.exports = {
  registration: registration,
  defaults: moduleConfig.defaults,
  placeholder: moduleConfig.placeholder,
  validate: moduleConfig.validate
};
