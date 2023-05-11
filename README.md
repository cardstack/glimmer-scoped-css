# glimmer-scoped-css

`glimmer-scoped-css` is an Ember addon that lets you embed `<style>` tags in component templates that will be scoped to only apply within those components:

If you have `app/components/something.hbs`:

```html
<style>
  p {
    color: blue;
  }
</style>

<h1>An h1</h1>

<p>A p.</p>
```

you get this generated HTML:

```html
<h1 data-scopedcss-58ccb4dfe0>An h1</h1>

<p data-scopedcss-58ccb4dfe0>A p.</p>
```

and this generated CSS:

```css
p[data-scopedcss-53259f1da9] {
  color: blue;
}
```

Nested components only have the parent component’s styles on elements with `...attributes`. You can see this in action in `test-app`.

## Additional features

The implementation is adapted from a [Vue PostCSS plugin](https://github.com/vuejs/core/blob/c346af2b6aa1c2796818405b4a960fc5c571594e/packages/compiler-sfc/src/stylePluginScoped.ts). It also supports these pseudo-elements:

### `:global`

If you want to use CSS in your component but want a selector to not be scoped, you can use `:global`:

```css
:global(.red) {
  color: red;
}
```

The generated CSS will look like this:

```css
.red {
  color: red;
}
```

### `:deep`

Using `:deep` on a selector will attach the scoping attribute to the element selector before it.

```css
.a :deep(.b) {
  color: pink;
}
```

The generated CSS will look like this:

```css
.a[data-scopedcss-3afb00313e] .b {
  color: pink;
}
```

## :rotating_light: Limitations

This is a pre-1.0 release with several limitations:

- it requires an unstable Embroider build (at least `2.1.1-unstable.72d5a8e`)
- it assumes a Webpack build
- it hardcodes Webpack CSS loaders
  - this works fine when you have the default loaders configured by `@embroider/webpack`
- the styles are in a `style` element in `index.html`, not linked
- there is log noise about source maps like this:
  ```
  unexpectedly found "<style>\n  p { color: blue" when slicing source, but expected "data-scopedcss-53259f1da9"
  ```

## Compatibility

- Ember.js v3.28 or above
- Embroider

## Installation

```
ember install glimmer-scoped-css
```

1. Include in `ember-cli-build.js`:

   ```diff
    const { Webpack } = require('@embroider/webpack');
   +const { GlimmerScopedCSSWebpackPlugin } = require('glimmer-scoped-css/webpack');
    return require('@embroider/compat').compatBuild(app, Webpack, {
   +  packagerOptions: {
   +    webpackConfig: {
   +      plugins: [new GlimmerScopedCSSWebpackPlugin()],
   +      resolveLoader: {
   +        alias: {
   +          'glimmer-scoped-css/virtual-loader': require.resolve(
   +            'glimmer-scoped-css/virtual-loader'
   +          ),
   +        },
   +      },
   +    },
   +  },
    });
   ```

### In an Ember application

2. Add an in-repo addon to install the Handlebars preprocessor:

   In `package.json`:

   ```diff
    "ember": {
      "edition": "octane"
   +},
   +"ember-addon": {
   +  "paths": [
   +    "lib/setup-ast-transforms"
   +  ]
    }
   ```

   Add `lib/setup-ast-transforms/package.json`:

   ```
   {
     "name": "setup-ast-transforms",
     "keywords": [
       "ember-addon"
     ],
     "dependencies": {
       "glimmer-scoped-css": "*"
     }
   }
   ```

   Add `lib/setup-ast-transforms/index.js`:

   ```
    'use strict';

    const { installScopedCSS } = require('glimmer-scoped-css');

    module.exports = {
      name: require('./package').name,
      setupPreprocessorRegistry(type, registry) {
        if (type === 'parent') {
          installScopedCSS(registry);
        }
      },
    };
   ```

### In an Ember addon

2. Install the preprocessor directly in the addon’s `index.js`:

   ```diff
    'use strict'
   +const { installScopedCSS } = require('glimmer-scoped-css');

    module.exports = {
      name: require('./package').name,
      isDevelopingAddon() {
        return true;
      },
   +  setupPreprocessorRegistry(type, registry) {
   +    if (type === 'self') {
   +      installScopedCSS(registry);
   +    }
   +  },
    };
   ```


## Usage

Add a `<style>` element in your component `.hbs` file and it will be scoped to elements in that component only. It also works in [`<template>` in `.gjs`/`.gts` files](https://github.com/ember-template-imports/ember-template-imports).

## Contributing

See the [Contributing](CONTRIBUTING.md) guide for details.

## License

This project is licensed under the [MIT License](LICENSE.md).
