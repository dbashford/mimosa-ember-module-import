var fs = require( 'fs' )
  , path = require( 'path' )
  , wrench = require( 'wrench' )
  , exec = require('child_process').exec;

var generateImportantPaths = function( projectName, alternateCache ) {
  var projectDirectory = path.join( __dirname, projectName );
  var mimosaConfig = path.join( __dirname, projectName, "mimosa-config.js" );
  var publicDirectory = path.join( projectDirectory, "public" );
  var cacheDirectory = path.join( projectDirectory, ".mimosa" );
  var cacheFile = path.join( projectDirectory, ".mimosa", alternateCache || "emberModuleImport", "cache.json" );
  var manifestFile = path.join( publicDirectory, "javascripts", "blogger", "modules.js");

  return {
    projectDir: projectDirectory,
    publicDir: publicDirectory,
    cacheDir: cacheDirectory,
    cacheFile: cacheFile,
    manifest: manifestFile,
    mimosaConfig: mimosaConfig
  };
}

var writeConfig = function( configName, toProject ) {
  var configInPath = path.join( __dirname, "configs", configName + ".js" );
  var configOutPath = path.join( __dirname, toProject, "mimosa-config.js" );
  var configText = fs.readFileSync( configInPath, "utf8" );
  fs.writeFileSync(configOutPath, configText);
}

var cleanUp = function( paths ) {
  // clean out cache
  if ( fs.existsSync( paths.cacheDir ) ) {
    wrench.rmdirSyncRecursive( paths.cacheDir );
  }

  // clean out public directory
  if ( fs.existsSync( paths.publicDir ) ) {
    wrench.rmdirSyncRecursive( paths.publicDir );
  }

  // remove mimosa config
  if ( fs.existsSync( paths.mimosaConfig ) ) {
    fs.unlinkSync( paths.mimosaConfig );
  }
}

// fromscratch project
describe('When starting from scratch with no cache', function() {
  var paths = generateImportantPaths( "projectone" );

  this.timeout(15000);

  before(function(done){
    cleanUp( paths );
    writeConfig( "basic", "projectone" );
    var cwd = process.cwd();
    process.chdir( path.join( paths.projectDir ) );
    exec( "mimosa build", function ( err, sout, serr ) {
      done();
      process.chdir(cwd);
    });
  });

  after(function() {
    cleanUp( paths );
  });

  it( 'it will build a manifest file', function() {
    expect( fs.existsSync( paths.manifest ) ).to.be.true;
  });

  it( 'it will build the proper manifest file', function() {
    var text = fs.readFileSync( paths.manifest, "utf8" );
    expect(text).to.equal("require('./controllers/post_controller.js');\nrequire('./helpers/helpers.js');\nrequire('./routes/post_route.js');\nrequire('./routes/posts_route.js');\n");
  });

  it( 'it will build the proper cache file', function() {
    var cacheFileJSON = require( paths.cacheFile );
    expect(Object.keys(cacheFileJSON).length).to.equal(1);
    expect(cacheFileJSON[Object.keys(cacheFileJSON)[0]].length).to.equal(4);
    expect(Object.keys(cacheFileJSON)[0]).to.equal(paths.manifest);
  });

});

describe('When configured to write to different cache folder', function() {
  var paths = generateImportantPaths( "projectone", "someOtherDirectory" );

  this.timeout(15000);

  after(function() {
    cleanUp( paths );
  });

  before(function(done){
    cleanUp( paths );
    writeConfig( "alternate-cache", "projectone" );
    var cwd = process.cwd();
    process.chdir( path.join( paths.projectDir ) );
    exec( "mimosa build", function ( err, sout, serr ) {
      done();
      process.chdir(cwd);
    });
  })

  it( 'it will write to a different cache folder', function() {
    var cacheFileJSON = require( paths.cacheFile );
    expect(Object.keys(cacheFileJSON).length).to.equal(1);
    expect(cacheFileJSON[Object.keys(cacheFileJSON)[0]].length).to.equal(4);
    expect(Object.keys(cacheFileJSON)[0]).to.equal(paths.manifest);
  });
});


