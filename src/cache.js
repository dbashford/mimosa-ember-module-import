"use strict";

var fs = require( "fs" )
  , path = require( "path" )
  , wrench = require( "wrench" )
  , _ = require( "lodash" );

var makeDirectory = function( folder ) {
  if ( !fs.existsSync( folder ) ) {
    return wrench.mkdirSyncRecursive( folder, 0x1ff );
  }
};

// write config cache
exports.writeCacheConfig = function( mimosaConfig ) {

  // transform paths to relative
  var cacheConfig = _.cloneDeep(mimosaConfig.emberModuleImport.apps);
  var cDir = mimosaConfig.watch.compiledDir;
  var sDir = mimosaConfig.watch.sourceDir;
  cacheConfig = cacheConfig.map( function( acc ) {
    acc.namespace = acc.namespace.replace( sDir, "" );
    acc.manifestFile = acc.manifestFile.replace( cDir, "" );
    ["additional", "exclude", "emberDirs"].forEach( function( key ) {
      if ( acc[key] ) {
        acc[key] = acc[key].map( function( accKey ) {
          return accKey.replace( sDir, "" );
        });
      }
    });
    return acc;
  });

  makeDirectory( mimosaConfig.emberModuleImport.cacheDir );
  fs.writeFileSync(
    mimosaConfig.emberModuleImport.cacheConfig,
    JSON.stringify( cacheConfig, null, 2) );
};

var _readCacheConfig = function( mimosaConfig ) {
  var cacheConfig;
  try {
    cacheConfig = require( mimosaConfig.emberModuleImport.cacheConfig );
  } catch ( err ) {
    throw err;
  }

  var cDir = mimosaConfig.watch.compiledDir;
  var sDir = mimosaConfig.watch.sourceDir;
  cacheConfig = cacheConfig.map( function( acc ) {
    acc.namespace = path.join( sDir, acc.namespace );
    acc.manifestFile = path.join( cDir, acc.manifestFile );
    ["additional", "exclude", "emberDirs"].forEach( function( key ) {
      if ( acc[key] ) {
        acc[key] = acc[key].map( function( accKey ) {
          return path.join( sDir, accKey );
        });
      }
    });
    return acc;
  });

  return cacheConfig;
};

exports.readCache = function( mimosaConfig ) {
  var cacheData;
  try {
    cacheData = require( mimosaConfig.emberModuleImport.cacheFile );
  } catch (err) {
    mimosaConfig.log.debug( "Problem requiring ember-module-import tracking file", err );
    mimosaConfig.log.debug( "mimosa-ember-module-import: javascript files need recompiling" );
    mimosaConfig.__forceJavaScriptRecompile = true;
  }

  if ( cacheData ) {
    // paths back to full paths
    var newCacheData = {};
    Object.keys( cacheData ).forEach( function( key ) {
      var newKey = path.join( mimosaConfig.watch.compiledDir, key );
      newCacheData[newKey] = cacheData[key].map( function( p ) {
        return path.join( mimosaConfig.watch.sourceDir, p);
      });
    });
    mimosaConfig.emberModuleImport.cacheData = newCacheData;
  }
};

exports.writeCache = function( mimosaConfig, manifestConfigs, done ) {
  var cacheObject = {};
  manifestConfigs.forEach( function( conf ) {
    cacheObject[conf.manifestFile] = conf.files.sort();
  });

  // convert to relative paths to manage diffs across project teams
  var newCacheObject = {};
  Object.keys( cacheObject ).forEach( function( key ) {
    var newKey = key.replace( mimosaConfig.watch.compiledDir, "" );
    newCacheObject[newKey] = cacheObject[key].map( function( p ) {
      return p.replace( mimosaConfig.watch.sourceDir, "" );
    });
  });

  var cacheString = JSON.stringify( newCacheObject, null, 2 );
  makeDirectory( mimosaConfig.emberModuleImport.cacheDir );
  fs.writeFile( mimosaConfig.emberModuleImport.cacheFile, cacheString, function(err) {
    if ( err ) {
      mimosaConfig.log.error( "ember-module-import: Error writing cache file", err );
    }
    done();
  });
};

var __forceRecompile = function( mimosaConfig, message ) {
  mimosaConfig.__forceJavaScriptRecompile = true;
  mimosaConfig.log.info( message );
  mimosaConfig.emberModuleImport.cacheData = undefined;
};

exports.validateCache = function( mimosaConfig ) {
  var paths = [];
  var emi = mimosaConfig.emberModuleImport;
  var cd = emi.cacheData;
  if ( cd ) {

    // has the config for emberModuleImport changed
    // if so then need to force recompile to regenerate configs
    try {
      var cachedConfig = _readCacheConfig( mimosaConfig );
      var st = JSON.stringify;
      if ( !( _.isEqual( st(cachedConfig, null, 2), st(emi.apps, null, 2) ) ) ) {
        __forceRecompile( mimosaConfig,
          "ember-module-import configuration has changed since mimosa was last run, so it is forcing a recompile of assets to regenerate proper ember module imports." );
        return;
      }

    } catch (err) {
      // file is just missing, that's fine
    }

    Object.keys( cd ).forEach( function( key ) {
      paths.push( key );
      paths = paths.concat( cd[key] );
    });

    for ( var i = 0; i < paths.length; i++ ) {
      if ( !fs.existsSync( paths[i] ) ) {
        __forceRecompile( mimosaConfig,
          "ember-module-import cannot find file [[ " + paths[i] + " ]] which is referenced in its cache, so it is forcing a recompile of assets to regenerate proper ember module imports." );
        return;
      }
    }

  }
};
