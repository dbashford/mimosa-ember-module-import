var  exec = require('child_process').exec
, utils = require( './util' )

describe('When starting up', function() {
  this.timeout(15000);

  var env = utils.setupProjectData( "bad-config1")
  var standardErr;

  before(function(done){
    utils.cleanProject( env );
    utils.setupProject( env, "namespaced" );

    var cwd = process.cwd();
    process.chdir( env.projectDir );
    exec( "mimosa build", function ( err, sout, serr ) {
      standardErr = serr;
      done();
      process.chdir(cwd);
    });
  });

  after(function() {
    utils.cleanProject( env );
  });

  it( 'the config should pass validation 1', function() {
    var expected =
      " * emberModuleImport.amd must be a boolean.\n" +
      " * emberModuleImport.fileSep must be a string.\n" +
      " * emberModuleImport.cacheDir must be a string.\n" +
      " * emberModuleImport.apps must be an array.\n" +
      " * emberModuleImport.emberDirs configuration must be an array. \n";
    standardErr = standardErr.split("\n").splice(1).join("\n");

    expect( standardErr ).to.equal( expected );
  });
});


describe('When starting up', function() {
  this.timeout(15000);

  var env = utils.setupProjectData( "bad-config2")
  var standardErr;

  before(function(done){
    utils.cleanProject( env );
    utils.setupProject( env, "namespaced" );

    var cwd = process.cwd();
    process.chdir( env.projectDir );
    exec( "mimosa build", function ( err, sout, serr ) {
      standardErr = serr;
      done();
      process.chdir(cwd);
    });
  });

  after(function() {
    utils.cleanProject( env );
  });

  it( 'the config should pass validation 2', function() {
    var expected =
      " * emberModuleImport.cacheDir must be a string.\n" +
      " * emberModuleImport.apps must be an array of objects.\n" +
      " * emberModuleImport.emberDirs must be an array of strings. \n";

    standardErr = standardErr.split("\n").splice(1).join("\n");
    expect( standardErr ).to.equal( expected );
  });
});

describe('When starting up', function() {
  this.timeout(15000);

  var env = utils.setupProjectData( "bad-config3")
  var standardErr;

  before(function(done){
    utils.cleanProject( env );
    utils.setupProject( env, "namespaced" );

    var cwd = process.cwd();
    process.chdir( env.projectDir );
    exec( "mimosa build", function ( err, sout, serr ) {
      standardErr = serr;
      done();
      process.chdir(cwd);
    });
  });

  after(function() {
    utils.cleanProject( env );
  });

  it( 'the config should pass validation 3', function() {
    var expected =
      " * emberModuleImport.cacheDir must be a string.\n" +
      " * emberModuleImport.apps.manifestFile must be a string.\n" +
      " * emberModuleImport.apps.additional must be an array.\n" +
      " * emberModuleImport.apps.exclude must be an array\n" +
      " * emberModuleImport.emberDirs must be an array of strings. \n";

    standardErr = standardErr.split("\n").splice(1).join("\n");
    expect( standardErr ).to.equal( expected );
  });
});


describe('When starting up', function() {
  this.timeout(15000);

  var env = utils.setupProjectData( "bad-config4")
  var standardErr;

  before(function(done){
    utils.cleanProject( env );
    utils.setupProject( env, "namespaced" );

    var cwd = process.cwd();
    process.chdir( env.projectDir );
    exec( "mimosa build", function ( err, sout, serr ) {
      standardErr = serr;
      done();
      process.chdir(cwd);
    });
  });

  after(function() {
    utils.cleanProject( env );
  });

  it( 'the config should pass validation 4', function() {
    var expected =
      " * emberModuleImport.apps.additional must be an array of strings.\n" +
      " * emberModuleImport.apps.exclude must be an array of strings and/or regexes. \n";

    standardErr = standardErr.split("\n").splice(1).join("\n");
    expect( standardErr ).to.equal( expected );
  });
});