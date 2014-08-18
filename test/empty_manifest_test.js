var fs = require( 'fs' )
  , exec = require('child_process').exec
  , utils = require( './util' )
  , env = utils.setupProjectData( "defaults")

utils.setupModuleData( env );

describe('When there are no ember files', function() {
  this.timeout(15000);

  var standardOut;
  before(function(done){
    utils.cleanProject( env );
    utils.setupProject( env, "empty" );

    var cwd = process.cwd();
    process.chdir( env.projectDir );
    exec( "mimosa build", function ( err, sout, serr ) {
      standardOut = sout;
      process.chdir(cwd);
      done();
    });
  });

  after(function() {
    utils.cleanProject( env );
  });

  it( 'the module should notify the user.', function() {
    var indexOfMessage = standardOut.indexOf("ember-module-import: \u001b[36mpublic/javascripts/modules.js\u001b[0m is an empty file.");
    expect( indexOfMessage ).to.be.above( 1000 );
  });

  it( 'the manifest file should exist', function() {
    expect( fs.existsSync( env.manifest ) ).to.be.true;
  });

  it( 'the manifest file should be empty', function() {
    var expected = "define( function( require ) {\n\n" +
      "  var modules = {\n" +
      "  };\n" +
      "  return modules;\n" +
      "});";
    expect( fs.readFileSync( env.manifest, "utf8" ) ).to.equal(expected);
  });
});