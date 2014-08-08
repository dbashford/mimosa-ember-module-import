"use strict";

var moduleConfig = require( "./config" )
  , path = require( "path" )
  , starters = [".","\\","/"]
  , appManifestConfig = [];

var _processFile = function( mimosaConfig, options, next ) {
  if ( options.files && options.files.length) {

  }
  next();
};

var _processBuild = function( mimosaConfig, options, next ) {
  if ( options.files && options.files.length) {

    // iterate over each file, usually just 1
    options.files.forEach( function( file ) {

      // iterate over each app config
      appManifestConfig.forEach( function( manifest ) {

        // iterate over each emberDir/path to include
        for ( var i = 0; i < manifest.emberDirs.length; i++ ) {
          if ( file.inputFileName.indexOf( manifest.emberDirs[i] ) === 0 ) {
            manifest.files.push( file.inputFileName );
            break;
          }
        }

      });
    });
  }
  next();
};

var _buildDone = function( mimosaConfig, options, next ) {
  // compare manifest object to cache manifest object
  // if different, generate new manifest and write it out
  // if same do nothing.

  console.log(JSON.stringify(appManifestConfig, null, 2));

  next();
};

var __writeManifest = function( mimosaConfig ) {

  // write manifest file

  // update cache with new manifest

};

var __updateCache = function( mimosaConfig ) {

};

var __transformPath = function( namespace, inputFileName ) {
  var relPath = path.relative( namespace, inputFileName );
  var firstChar = relPath.charAt(0);
  if ( starters.indexOf(firstChar) === -1 ) {
    relPath = "./" + relPath;
  }
  return relPath;
}

var registration = function (mimosaConfig, register) {
  // 1. need to watch as files go through to build list of files
  //
  // 2. when startup/build complete, need to build manifest, possibly use
  // info from mimosa-require re:paths?
  //
  // 3. while mimosa is watching need to check file paths vs
  // cached list of things in manifest
  //
  // 4. need to consider keeping cache of manifest data in .mimosa
  // so not forced to rebuild on startup if nothing changed, would involve
  // keeping cache updated

  register(
    [ "buildFile" ],
    "beforeWrite",
    _processBuild,
    mimosaConfig.extensions.javascript );

  register(
    [ "add", "update", "remove"],
    "beforeWrite",
    _processFile,
    mimosaConfig.extensions.javascript );

  register(
    ["postBuild"],
    "init",
    _buildDone );

  appManifestConfig = mimosaConfig.emberResolver.apps.map( function( app ) {
    return {
      namespace: app.namespace,
      exclude: app.exclude,
      manifestFile: app.manifestFile,
      emberDirs: app.emberDirs,
      files: []
    };
  });

};

module.exports = {
  registration: registration,
  defaults: moduleConfig.defaults,
  placeholder: moduleConfig.placeholder,
  validate: moduleConfig.validate
};
