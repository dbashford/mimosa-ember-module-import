var fs = require( 'fs' )
  , path = require( 'path' )
  , exec = require('child_process').exec
  , utils = require( './util' )
  , env = utils.setupProjectData( "basic3")
  , logPath = path.join( env.projectDir, "log.txt" )
  ;

utils.setupModuleData( env, null, "blogger"  );

describe('When building from scratch with no cache', function() {

  before(function(done){
    utils.cleanProject( env );
    utils.setupProject( env, "namespaced" );

    var cwd = process.cwd();
    process.chdir( env.projectDir );
    exec( "mimosa build > log.txt", function ( err, sout, serr ) {
      process.chdir(cwd);
      done();
    });
  });

  after(function() {
    utils.cleanProject( env );
  });

  it('there should be a large number of writes', function() {
    var text = fs.readFileSync( logPath, "utf8" );
    var match = text.match(/Wrote file/g);
    var numberOfWrites = match ? match.length : 0;
    expect(numberOfWrites).to.equal(16);
  })

  describe( 'and then running a watch', function() {
    this.timeout(15000);

    before(function(done) {
      var cwd = process.cwd();
      process.chdir( env.projectDir );
      var child = exec( "mimosa watch > log.txt", function ( err, sout, serr ) {});
      setTimeout(function(){
        child.kill("SIGINT");
        process.chdir(cwd);
        done();
      }, 3000);
    });

    it( 'should have no files built because all data coming from cache', function() {
      var text = fs.readFileSync( logPath, "utf8" );
      var match = text.match(/Wrote file/g);
      var numberOfWrites = match ? match.length : 0;
      expect(numberOfWrites).to.equal(0);
    });

    describe( 'and then removing one of the built files with mimosa shut down', function() {

      before(function(done) {
        var assetPath = path.join( env.javascriptDir, "blogger", "controllers", "post_controller.js")
        fs.unlinkSync( assetPath );
        var cwd = process.cwd();
        process.chdir( env.projectDir );
        var child = exec( "mimosa watch > log.txt", function ( err, sout, serr ) {});
        setTimeout(function(){
          child.kill("SIGINT");
          process.chdir(cwd);
          done();
        }, 3000);
      });

      it( 'should have all the files built because cache is invalid', function() {
        var text = fs.readFileSync( logPath, "utf8" );
        var match = text.match(/Wrote file/g);
        var numberOfWrites = match ? match.length : 0;
        expect(numberOfWrites).to.equal(16);
      });
    });
  });
});