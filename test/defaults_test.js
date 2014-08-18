var fs = require( 'fs' )
  , path = require( 'path' )
  , exec = require('child_process').exec
  , utils = require( './util' )
  , env = utils.setupProjectData( "defaults" )
  ;

utils.setupModuleData( env );

describe('When not provided a configuration', function() {
  this.timeout(15000);

  before(function(done){
    utils.cleanProject( env );
    utils.setupProject( env, "defaults" )

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
    var expected = "define( function( require ) {\n" +
      "  var _0 = require('./controllers/post_controller');\n" +
      "  var _1 = require('./helpers/helpers');\n" +
      "  var _2 = require('./router');\n" +
      "  var _3 = require('./routes/post_route');\n" +
      "  var _4 = require('./routes/posts_route');\n\n" +
      "  var modules = {\n" +
      "    PostController: _0 && (_0['default'] || _0),\n" +
      "    Helpers: _1 && (_1['default'] || _1),\n" +
      "    Router: _2 && (_2['default'] || _2),\n" +
      "    PostRoute: _3 && (_3['default'] || _3),\n" +
      "    PostsRoute: _4 && (_4['default'] || _4)\n" +
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
    expect(cacheFileJSON[Object.keys(cacheFileJSON)[0]].length).to.equal(5);
    expect(Object.keys(cacheFileJSON)[0]).to.equal(env.manifest.replace(env.publicDir, ''));
  });

});