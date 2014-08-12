var fs = require( 'fs' )
  , path = require( 'path' )
  , exec = require('child_process').exec
  , utils = require( './util' )
  , projectName = "alternate-cache"
  , env = utils.setupProjectData( "additional-files")
  ;

utils.setupModuleData( env, null, "blogger"  );

describe('When starting from scratch with no cache', function() {
  this.timeout(15000);

  before(function(done){
    utils.cleanProject( env );
    utils.setupProject( env, "namespaced" );

    var cwd = process.cwd();
    process.chdir( env.projectDir );
    exec( "mimosa build", function ( err, sout, serr ) {
      done();
      process.chdir(cwd);
    });
  });

  after(function() {
    utils.cleanProject( env );
  });

  it( 'it will build a manifest file', function() {
    expect( fs.existsSync( env.manifest ) ).to.be.true;
  });

  it( 'it will build the proper manifest file', function() {
    var text = fs.readFileSync( env.manifest, "utf8" );
    expect(text).to.equal(
      "require('./controllers/post_controller.js');\n" +
      "require('./helpers/helpers.js');\nrequire('./routes/post_route.js');\n" +
      "require('./routes/posts_route.js');\n" +
      "require('../vendor/lodash/lodash.compat.js');\n");
  });

  it( 'it will build the proper cache file', function() {
    var cacheFileJSON = require( env.cacheFile );
    expect(Object.keys(cacheFileJSON).length).to.equal(1);
    expect(cacheFileJSON[Object.keys(cacheFileJSON)[0]].length).to.equal(5);
    expect(Object.keys(cacheFileJSON)[0]).to.equal(env.manifest);
  });

});