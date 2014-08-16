"use strict";

var fs = require( "fs" )
  , wrench = require( "wrench" )
  , _ = require( "lodash" );

var makeDirectory = function( folder ) {
  if ( !fs.existsSync( folder ) ) {
    return wrench.mkdirSyncRecursive( folder, 0x1ff );
  }
};

// write config cache
exports.writeCacheConfig = function( mimosaConfig ) {
  makeDirectory( mimosaConfig.emberModuleImport.cacheDir );
  var emi = mimosaConfig.emberModuleImport;
  fs.writeFileSync( emi.cacheConfig, JSON.stringify( emi.apps, null, 2) );
};

exports.readCache = function( mimosaConfig ) {
  try {
    mimosaConfig.emberModuleImport.cacheData = require( mimosaConfig.emberModuleImport.cacheFile );
  } catch (err) {
    mimosaConfig.log.debug( "Problem requiring ember-module-import tracking file", err );
    mimosaConfig.log.debug( "mimosa-ember-module-import: javascript files need recompiling" );
    mimosaConfig.__forceJavaScriptRecompile = true;
  }
};

exports.writeCache = function( mimosaConfig, manifestConfigs, done ) {
  var cacheObject = {};
  manifestConfigs.forEach( function( conf ) {
    cacheObject[conf.manifestFile] = conf.files.sort();
  });

  var cacheString = JSON.stringify( cacheObject, null, 2 );
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
      var cachedConfig = require( emi.cacheConfig );
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
