var fs = require( 'fs' )
  , path = require( 'path' )
  , exec = require('child_process').exec
  , utils = require( './util' )
  , env = utils.setupProjectData( "basic6")
  , logPath = path.join( env.projectDir, "log.txt" )
  ;

utils.setupModuleData( env, null, "blogger"  );

describe('When building from scratch with no cache', function() {
  this.timeout(15000);

  var changedTime;

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

  it( 'it will build the proper cache config file', function() {
    if (require.cache[env.cacheConfig]) {
      delete require.cache[env.cacheConfig];
    }
    var cacheConfigJSON = require( env.cacheConfig );
    expect(Object.keys(cacheConfigJSON[0]).length).to.equal(5);
    expect(cacheConfigJSON[0].emberDirs.length).to.equal(13);
  });

  describe( 'and then changing the config between runs', function() {

    before(function(done) {
      var newConfig = fs.readFileSync(path.join(__dirname, "configs", "changed-ember-dirs.js"), "utf8");
      fs.writeFileSync(env.mimosaConfig, newConfig);

      var cwd = process.cwd();
      process.chdir( env.projectDir );
      var child = exec( "mimosa watch > log.txt", function ( err, sout, serr ) {
        // won't get here
      });

      setTimeout(function(){
        child.kill("SIGINT");
        process.chdir(cwd);
        done();
      }, 2500);
    });

    it('there should be a large number of writes because files were rerun', function() {
      var text = fs.readFileSync( logPath, "utf8" );
      var match = text.match(/Wrote file/g);
      var numberOfWrites = match ? match.length : 0;
      match = text.match(/ember-module-import configuration has changed since mimosa was last run, so it is forcing a recompile of assets to regenerate proper ember module imports./g);
      var message = match ? match.length : 0;

      expect(numberOfWrites).to.equal(16);
      expect(message).to.equal(1);

    });
  });
});