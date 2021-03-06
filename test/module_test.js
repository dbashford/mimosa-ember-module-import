var fs = require( 'fs' )
  , path = require( 'path' )
  , exec = require('child_process').exec
  , utils = require( './util' )
  , env = utils.setupProjectData( "basic")
  ;

utils.setupModuleData( env, null, "blogger"  );

describe('When building from scratch with no cache', function() {
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
      "  var _0 = require('./controllers/post_controller');\n" +
      "  var _1 = require('./helpers/helpers');\n" +
      "  var _2 = require('./routes/post_route');\n" +
      "  var _3 = require('./routes/posts_route');\n\n" +
      "  var modules = {\n" +
      "    PostController: _0 && (_0['default'] || _0),\n" +
      "    Helpers: _1 && (_1['default'] || _1),\n" +
      "    PostRoute: _2 && (_2['default'] || _2),\n" +
      "    PostsRoute: _3 && (_3['default'] || _3)\n" +
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
    expect(cacheFileJSON[Object.keys(cacheFileJSON)[0]].length).to.equal(4);
    expect(Object.keys(cacheFileJSON)[0]).to.equal(env.manifest.replace(env.publicDir, ''));
  });

  it( 'it will build the proper cache config file', function() {
    if (require.cache[env.cacheConfig]) {
      delete require.cache[env.cacheConfig];
    }
    var cacheConfigJSON = require( env.cacheConfig );
    expect(Object.keys(cacheConfigJSON[0]).length).to.equal(5);
    expect(cacheConfigJSON[0].emberDirs.length).to.equal(13);
  });

  describe( 'and then watching with a cache and no new files', function() {

    var changedTime;

    before(function(done) {
      changedTime = fs.statSync( env.manifest ).mtime;

      var cwd = process.cwd();
      process.chdir( env.projectDir );
      var child = exec( "mimosa watch", function ( err, sout, serr ) {
        // won't get here
      });
      setTimeout(function(){
        child.kill("SIGINT");
        process.chdir(cwd);
        done();
      }, 1500);
    });

    it( 'will not result in cache file being rewritten', function() {
      expect( fs.statSync( env.manifest ).mtime.getTime() ).to.equal( changedTime.getTime() );
    });


    describe( 'and then cleaning', function() {

      before(function(done){
        var cwd = process.cwd();
        process.chdir( env.projectDir );
        exec( "mimosa clean", function ( err, sout, serr ) {
          done();
          process.chdir(cwd);
        });
      });

      it( 'the manifest file will be gone', function() {
        expect( fs.existsSync( env.manifest ) ).to.be.false;
      });

      it( 'the cache file will be gone', function() {
        expect( fs.existsSync( env.cacheFile ) ).to.be.false;
      });
    });
  });
});