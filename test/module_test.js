var fs = require( 'fs' )
  , path = require( 'path' )
  , wrench = require( 'wrench' )
  , exec = require('child_process').exec;

var generateImportantPaths = function( projectName ) {

  var projectDirectory = path.join( __dirname, projectName );
  var publicDirectory = path.join( projectDirectory, "public" );
  var cacheDirectory = path.join( projectDirectory, ".mimosa" );
  var manifestFile = path.join( publicDirectory, "javascripts", "blogger", "modules.js");

  return {
    projectDir: projectDirectory,
    publicDir: publicDirectory,
    cacheDir: cacheDirectory,
    manifest: manifestFile
  };
}

// fromscratch project
describe('When starting from scratch with no cache', function() {
  var paths = generateImportantPaths( "fromscratch" );

  this.timeout(15000);

  before(function(done){
    if ( fs.existsSync( paths.cacheDir ) ) {
      wrench.rmdirSyncRecursive( paths.cacheDir );
    }

    if ( fs.existsSync( paths.publicDir ) ) {
      wrench.rmdirSyncRecursive( paths.publicDir );
    }

    var cwd = process.cwd();
    process.chdir( path.join( paths.projectDir ) );
    exec( "mimosa build", function ( err, sout, serr ) {
      done();
      process.chdir(cwd);
    });
  })

  it( 'it will build a manifest file', function() {
    expect( fs.existsSync( paths.manifest ) ).to.be.true;
  });

  it( 'it will build the proper manifest file', function() {
    var text = fs.readFileSync( paths.manifest, "utf8" );
    expect(text).to.equal("require('./controllers/post_controller.js');\nrequire('./helpers/helpers.js');\nrequire('./routes/post_route.js');\nrequire('./routes/posts_route.js');\n");
  });
});
