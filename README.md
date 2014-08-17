mimosa-ember-module-import
===========

## Overview

This module will aid in your Ember application development by automatically building module manifest files.  As Mimosa processes your assets, it keeps track of your Controllers/Views/Routers etc, and builds either an AMD or CommonJS compliant manifest for each namedspaced app in your project.

To see this module in action, check out the [MimosaEmberSkeleton](https://github.com/dbashford/MimosaEmberSkeleton) project.

Note: this module requires mimosa-require `2.2.2` (bundled with mimosa `2.3.1`) to function properly.

## Usage

Add `'ember-module-import'` to your list of modules.  That's all!  Mimosa will install the module for you when you start `mimosa watch` or `mimosa build`.

## Functionality

This module makes using module systems together with Ember easier. Ember doesn't work with async module loaders. Ideally, when Ember is fired up it wants to have all of the various Ember object types (Controllers, Views, Routers, etc) already attached/register.

This module helps attach modules to Ember, and makes using your favorite module loaders, async or otherwise, easier. It can create module manifests for multiple namespaces in your application.

This uses an array of default folders (see `emberDirs` below), and `namespace` configurations to generate `manifest` files. Those files contain a list of `require`s for files containing Ember objects.  Once this `manifest` file is brought into your web app you can `advanceReadiness()` and fire up your app.

[MimosaEmberSkeleton](https://github.com/dbashford/MimosaEmberSkeleton) showcases this module and its use in a require.js application.

## Default Config

```javascript
emberModuleImport: {
  cacheDir: ".mimosa/emberModuleImport",
  amd: true,
  apps: [{
    namespace: null,
    additional: [],
    exclude: [],
    manifestFile: "app-modules"
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
* `apps` - an array of the different apps in the project. Each app results in an output module file. This allows you to create multiple module manifests, thereby eventually letting you bundled together multiple sub-apps from the same project.
* `apps.namespace` - the namespace of the app. namespace is the root folder relative to `watch.javascriptDir`. Everything in that `namespace` will be bundled together into a single module import file. When the `namespace` is `null`, the default, the entire application is used.
* `apps.additional` - additional files, whether ember files outside of the `namespace` (like common components), or non-ember files inside or outside the `namespace`, to include in the `namespace` `manifest` file. Paths are relative to the `namespace`. Use `../` paths to include files/folders outside the `namespace`.
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

And the output would resemble the following:

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
  require('./controllers/post_controller');
  require('./controllers/posts_controller');
  require('./routes/post_route');
  require('./routes/posts_route');
});
```

### CommonJS

```javascript
require('./controllers/post_controller');
require('./controllers/posts_controller');
require('./routes/post_route');
require('./routes/posts_route');
```

## To run tests

* `git clone` the repo
* `cd mimosa-ember-module-import`
* Run `npm install`
* Run `mimosa mod:install`
* `npm test`

You may get a `Error: ENOTEMPTY, directory not empty` error with some of the test project directories.  Haven't yet been able to track that down, but if that is the only error you get, you are in good shape.