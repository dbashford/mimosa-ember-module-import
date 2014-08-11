var fs = require( 'fs' )
  , path = require( 'path' )
  , exec = require('child_process').exec
  , utils = require( './util' )
  , projectName = "alternate-cache"
  , env = utils.setupProjectData( "alternate-cache" )
  ;

utils.setupModuleData( env, path.join(".mimosa", "someOtherDirectory"), "blogger" );

describe('When configured to write to different cache folder', function() {
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

  it( 'it will write to a different cache folder', function() {
    var cacheFileJSON = require( env.cacheFile );
    expect(Object.keys(cacheFileJSON).length).to.equal(1);
    expect(cacheFileJSON[Object.keys(cacheFileJSON)[0]].length).to.equal(4);
    expect(Object.keys(cacheFileJSON)[0]).to.equal(env.manifest);
  });
});