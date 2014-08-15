"use strict";

var fs = require( "fs" )
  , wrench = require( "wrench" );

var makeDirectory = function( folder ) {
  if ( !fs.existsSync( folder ) ) {
    return wrench.mkdirSyncRecursive( folder, 0x1ff );
  }
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

exports.validateCache = function( mimosaConfig ) {
  var paths = [];
  var cd = mimosaConfig.emberModuleImport.cacheData;
  if ( cd ) {
    Object.keys( cd ).forEach( function( key ) {
      paths.push( key );
      paths = paths.concat( cd[key] );
    });

    for ( var i = 0; i < paths.length; i++ ) {
      if ( !fs.existsSync( paths[i] ) ) {
        mimosaConfig.__forceJavaScriptRecompile = true;
        mimosaConfig.log.info( "ember-module-import cannot find file [[ " + paths[i] + " ]] which is referenced in its cache, so it is forcing a recompile of assets to regenerate proper ember module imports." );
        return;
      }
    }
  }
};
