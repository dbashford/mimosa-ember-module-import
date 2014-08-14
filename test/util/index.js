var fs = require( 'fs' )
  , path = require( 'path' )
  , wrench = require( 'wrench' )
  ;

exports.setupProjectData = function( projectName ) {
  var projectDirectory = path.join( __dirname, "..", projectName );
  var mimosaConfig = path.join( projectDirectory, "mimosa-config.js" );
  var publicDirectory = path.join( projectDirectory, "public" );
  var javascriptDirectory = path.join( publicDirectory, "javascripts" );

  return {
    projectName: projectName,
    projectDir: projectDirectory,
    publicDir: publicDirectory,
    javascriptDir: javascriptDirectory,
    mimosaConfig: mimosaConfig
  };
};

// setup specific for ember module import testing
exports.setupModuleData = function( env, alternateCache, namespace ) {
  var cacheFile = path.join( env.projectDir, alternateCache || path.join(".mimosa", "emberModuleImport"), "cache.json" );
  var manifestFile;
  if ( namespace ) {
    manifestFile = path.join( env.projectDir, "public", "javascripts", namespace, "modules.js");
  } else {
    manifestFile = path.join( env.projectDir, "public", "javascripts", "app-modules.js");
  }

  env.namespaceDir = path.dirname( manifestFile ).replace("public", "assets");
  env.cacheFile = cacheFile;
  env.namespace = namespace;
  env.manifest = manifestFile;
};

exports.setupProject = function( env, inProjectName ) {
  // copy project skeleton in
  var inProjectPath = path.join( __dirname, "..", "projects", inProjectName );
  wrench.copyDirSyncRecursive( inProjectPath, env.projectDir );

  // copy correct mimosa-config in
  var configInPath = path.join( __dirname, "..", "configs", env.projectName + ".js" );
  var configText = fs.readFileSync( configInPath, "utf8" );
  fs.writeFileSync(env.mimosaConfig, configText);
};

exports.cleanProject = function( env ) {
  // clean out cache
  if ( fs.existsSync( env.projectDir ) ) {
    wrench.rmdirSyncRecursive( env.projectDir );
  }
};
