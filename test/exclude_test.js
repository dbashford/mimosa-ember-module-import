var fs = require( 'fs' )
  , path = require( 'path' )
  , exec = require('child_process').exec
  , utils = require( './util' )
  , env = utils.setupProjectData( "exclude")
  ;

utils.setupModuleData( env, null, "blogger"  );

describe('When building from scratch with no cache with an exclude definition', function() {
  this.timeout(15000);

  before(function(done){
    utils.cleanProject( env );
    utils.setupProject( env, "namespaced" );

    var cwd = process.cwd();
    process.chdir( env.projectDir );
    exec( "mimosa build", function ( err, sout, serr ) {
      process.chdir(cwd);
      done();
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
    var expected = "define( function( require ) {\n" +
      "  var _0 = require('./helpers/helpers');\n" +
      "  var _1 = require('./routes/post_route');\n" +
      "  var _2 = require('./routes/posts_route');\n\n" +
      "  var modules = {\n" +
      "    Helpers: _0 && (_0['default'] || _0),\n" +
      "    PostRoute: _1 && (_1['default'] || _1),\n" +
      "    PostsRoute: _2 && (_2['default'] || _2)\n" +
      "  };\n" +
      "  return modules;\n});"
    expect(text).to.equal(expected);
  });

  it( 'it will build the proper cache file', function() {
    if (require.cache[env.cacheFile]) {
      delete require.cache[env.cacheFile];
    }
    var cacheFileJSON = require( env.cacheFile );
    expect(Object.keys(cacheFileJSON).length).to.equal(1);
    expect(cacheFileJSON[Object.keys(cacheFileJSON)[0]].length).to.equal(3);
    expect(Object.keys(cacheFileJSON)[0]).to.equal(env.manifest.replace(env.publicDir, ''));
  });

});