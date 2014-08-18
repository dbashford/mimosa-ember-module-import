mimosa-ember-module-import
===========

## Overview

This module will aid in your Ember application development by automatically building module manifest files.  As Mimosa processes your assets, it keeps track of your Controllers/Views/Routers etc, and builds either an AMD or CommonJS compliant manifest for each namedspaced app in your project.

To see this module in action, check out the [MimosaEmberSkeleton](https://github.com/dbashford/MimosaEmberSkeleton) project.

Note: this module requires mimosa-require `2.2.2` (bundled with mimosa `2.3.1`) to function properly.

## Usage

Add `'ember-module-import'` to your list of modules.  That's all!  Mimosa will install the module for you when you start `mimosa watch` or `mimosa build`.

## Functionality

This module makes using module systems together with Ember easier. Ember doesn't work with async module loaders. Ideally, when Ember is fired up it wants to have all of the various Ember object types (Controllers, Views, Routers, etc) already attached/registered.

This module helps attach modules to Ember, and makes using your favorite module loaders, async or otherwise, easier. It can create module manifests for multiple namespaces in your application.

This uses an array of default folders (see `emberDirs` below), and `namespace` configurations to generate `manifest` files. Those files contain a list of `require`s for files containing Ember objects. Then, in the manifest, an object is created using the exported values from the `require`d files as values, and the file names as the keys. If a file name is `search_results_controller.js`, then the key would be `SearchResultController`, which matches what Ember would like to see.

See some example outputs below.

[MimosaEmberSkeleton](https://github.com/dbashford/MimosaEmberSkeleton) showcases this module and its use in a require.js application.

## Default Config

```javascript
emberModuleImport: {
  cacheDir: ".mimosa/emberModuleImport",
  amd: true,
  fileSep: "_"
  apps: [{
    namespace: null,
    additional: ["router"],
    exclude: [],
    manifestFile: "modules"
  }],
  emberDirs: [
    "adapters",
    "components",
    "controllers",
    "helpers",
    "initializers",
    "mixins",
    "models",
    "routes",
    "serializers",
    "transforms",
    "utils",
    "views"
  ]
}
```

* `cacheDir` - location this module will place its cache information.
* `amd` - whether the output is in AMD or CommonJS format.  If set to `false`, the output will be CommonJS style.
* `fileSep` - Character/String used for separating portions of  file name. Ex: tag_editor_controller.js
* `apps` - an array of the different apps in the project. Each app results in an output module file. This allows you to create multiple module manifests, thereby eventually letting you bundled together multiple sub-apps from the same project.
* `apps.namespace` - the namespace of the app. namespace is the root folder relative to `watch.javascriptDir`. Everything in that `namespace` will be bundled together into a single module import file. When the `namespace` is `null`, the default, the entire application is used.
* `apps.additional` - additional files, whether ember files outside of the `namespace` (like common components), or non-ember files inside or outside the `namespace`, to include in the `namespace` `manifest` file. Paths are relative to the `namespace`. Use `../` paths to include files/folders outside the `namespace`.  In the default config, `router` is an additional file.  This would pick up a `router.js` sitting in the root of your `namespace`.
* `apps.exclude` - array of strings or regexes that match files to not include in this `manifest`. Strings are paths that can be relative to the `namespace` or absolute.
* `apps.manifestFile` - The name of the manifest file to output. `.js` is assumed. Path is relative to `namespace`.
* `emberDirs` - Ember directories that contain files to include in a manifest file. Any files in these directories or in subdirectories of these directories within a `namespace` will be `require`d in the `manifest` file.

## Example Config

```javascript
emberModuleImport: {
  apps: [
    {
      namespace: "user-app",
      additional: ["../common/components"],
      manifestFile: "user-modules"
    },
    {
      namespace: "search-app",
      additional: ["../common/components"],
      manifestFile: "search-modules"
    }
  ]
}
```

In this config two applications, namespaced at `user-app` and `search-app`, exist in the same project, and they both share some common components at `../common/components`.  Each has a manifest file (required) that will be deposited at the root of the `namespace`.  Give the above config, the expected project layout would resemble the below.

```
/assets
  /javascripts
    /common
      /components
    /user-app
      /components
      /views
      ...
    /search-app
      /components
      /views
      ...
```

And the output file structure would resemble the following:

```
/public
  /javascripts
    /common
      /components
    /user-app
      /components
      /views
      ...
      user-modules.js
    /search-app
      /components
      /views
      ...
      search-modules.js
```

## Example Manifest File

### AMD

```javascript
define( function( require ) {
  var _0 = require('./controllers/post_controller');
  var _1 = require('./helpers/helpers');
  var _2 = require('./routes/post_route');
  var _3 = require('./routes/posts_route');

  var modules = {
    PostController: _0 && (_0['default'] || _0),
    Helpers: _1 && (_1['default'] || _1),
    PostRoute: _2 && (_2['default'] || _2),
    PostsRoute: _3 && (_3['default'] || _3)
  };
  return modules;
});
```

### CommonJS

```javascript
var _0 = require('./controllers/post_controller');
var _1 = require('./helpers/helpers');
var _2 = require('./routes/post_route');
var _3 = require('./routes/posts_route');

var modules = {
  PostController: _0 && (_0['default'] || _0),
  Helpers: _1 && (_1['default'] || _1),
  PostRoute: _2 && (_2['default'] || _2),
  PostsRoute: _3 && (_3['default'] || _3)
};

module.exports = modules;
```

## To run tests

* `git clone` the repo
* `cd mimosa-ember-module-import`
* Run `npm install`
* Run `mimosa mod:install`
* `npm test`

You may get a `Error: ENOTEMPTY, directory not empty` error with some of the test project directories.  Haven't yet been able to track that down, but if that is the only error you get, you are in good shape.  But you should run the tests until you get an all clear.