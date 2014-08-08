"use strict";

var moduleConfig = require( "./config" );

var _process = function( mimosaConfig, options, next ) {
  if ( options.files && options.files.length) {

  }
  next();
};

var _processBuild = function( mimosaConfig, options, next ) {
  if ( options.files && options.files.length) {

    // build object of things to write to manifest
    // as files pass through initial build

  }
  next();
};

var _buildDone = function( mimosaConfig, options, next ) {
  // compare manifest object to cache manifest object
  // if different, generate new manifest and write it out
  // if same do nothing.

  next();
};

var __writeManifest = function( mimosaConfig ) {

  // write manifest file

  // update cache with new manifest

};

var __updateCache = function( mimosaConfig ) {

};


var registration = function (config, register) {
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
    config.extensions.javascript );


  register(
    [ "add", "update", "delete"],
    "beforeWrite",
    _process,
    config.extensions.javascript );

  register(
    ["postBuild"],
    "init",
    _buildDone );
};

module.exports = {
  registration: registration,
  defaults: moduleConfig.defaults,
  placeholder: moduleConfig.placeholder,
  validate: moduleConfig.validate
};
