var fs = require( 'fs' )
  , path = require( 'path' )
  , exec = require('child_process').exec
  , utils = require( './util' )
  , env = utils.setupProjectData( "commonjs" )
  ;

utils.setupModuleData( env, null, "blogger"  );

describe('When not provided a configuration', function() {
  this.timeout(15000);

  before(function(done){
    utils.cleanProject( env );
    utils.setupProject( env, "namespaced" )

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
    var expected =
      "var _0 = require('./controllers/post_controller');\n" +
      "var _1 = require('./helpers/helpers');\n" +
      "var _2 = require('./routes/post_route');\n" +
      "var _3 = require('./routes/posts_route');\n\n" +
      "var modules = {\n" +
      "  PostController: _0 && (_0['default'] || _0),\n" +
      "  Helpers: _1 && (_1['default'] || _1),\n" +
      "  PostRoute: _2 && (_2['default'] || _2),\n" +
      "  PostsRoute: _3 && (_3['default'] || _3)\n" +
      "};\n\n" +
      "module.exports = modules;\n"
    expect(text).to.equal(expected);
  });
});