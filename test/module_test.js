var fs = require( 'fs' )
  , path = require( 'path' )
  , exec = require('child_process').exec
  , utils = require( './util' )
  , projectName = "alternate-cache"
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
    expect(text).to.equal("require('./controllers/post_controller.js');\nrequire('./helpers/helpers.js');\nrequire('./routes/post_route.js');\nrequire('./routes/posts_route.js');\n");
  });

  it( 'it will build the proper cache file', function() {
    if (require.cache[env.cacheFile]) {
      delete require.cache[env.cacheFile];
    }
    var cacheFileJSON = require( env.cacheFile );
    expect(Object.keys(cacheFileJSON).length).to.equal(1);
    expect(cacheFileJSON[Object.keys(cacheFileJSON)[0]].length).to.equal(4);
    expect(Object.keys(cacheFileJSON)[0]).to.equal(env.manifest);
  });

  describe( 'and then watching with a cache and adding a new file', function() {

    before(function(done) {
      var newFile = path.join( env.namespaceDir, "controllers", "newcontroller.js");
      fs.writeFileSync( newFile, "console.log(\"foo\")");
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

    it( 'it will build a manifest file', function() {
      expect( fs.existsSync( env.manifest ) ).to.be.true;
    });

    it( 'it will build the proper manifest file with the new file included', function() {
      var text = fs.readFileSync( env.manifest, "utf8" );
      expect(text).to.equal("require('./controllers/newcontroller.js');\nrequire('./controllers/post_controller.js');\nrequire('./helpers/helpers.js');\nrequire('./routes/post_route.js');\nrequire('./routes/posts_route.js');\n");
    });

    it( 'it will build the proper cache file with the new file included', function() {
      if (require.cache[env.cacheFile]) {
        delete require.cache[env.cacheFile];
      }
      var cacheFileJSON = require( env.cacheFile );
      expect(Object.keys(cacheFileJSON).length).to.equal(1);
      expect(cacheFileJSON[Object.keys(cacheFileJSON)[0]].length).to.equal(5);
      expect(Object.keys(cacheFileJSON)[0]).to.equal(env.manifest);
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