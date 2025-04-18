# glimmer-scoped-css

`glimmer-scoped-css` is an Ember addon that lets you embed `<style>` tags in component templates that will be scoped to only apply within those components:

If you have `app/components/something.hbs`:

```html
<style scoped>
  p {
    color: blue;
  }
</style>

<h1>An h1</h1>

<p>A p.</p>
```

you get this generated HTML:

```html
<h1 data-scopedcss-58ccb4dfe0-e9125e9996>An h1</h1>

<p data-scopedcss-58ccb4dfe0-e9125e9996>A p.</p>
```

and this generated CSS:

```css
p[data-scopedcss-58ccb4dfe0-e9125e9996] {
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

**If your environment does not support global styles, you can cause them to be ignored [in an application](#in-an-ember-application).**

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

- it assumes a Webpack build
- it hardcodes Webpack CSS loaders
  - this works fine when you have the default loaders configured by `@embroider/webpack`
- the styles are in a `style` element in `index.html`, not linked
- scoped styles cannot use interpolation: `{{whatever}}` will be duplicated unprocessed in the stylesheet
- there is log noise about source maps like this:
  ```
  unexpectedly found "<style>\n  p { color: blue" when slicing source, but expected "data-scopedcss-53259f1da9-58ccb4dfe0"
  ```

## Compatibility

- Ember.js v3.28 or above
- Embroider v3.0.0 or above

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

   If you want to block use of `:global`:

   ```js
     setupPreprocessorRegistry(type, registry) {
       if (type === 'parent') {
         installScopedCSS(registry, { noGlobal: true });
       }
     }
   ```

### In an Ember addon

#### v2 with Rollup

2. Install the plugin in the addon’s Rollup config `rollup.config.mjs`:

   ```diff
    import { Addon } from '@embroider/addon-dev/rollup';
    import { babel } from '@rollup/plugin-babel';
    import copy from 'rollup-plugin-copy';
   +import { scopedCSS } from 'glimmer-scoped-css/rollup';

    const addon = new Addon({
      srcDir: 'src',
      destDir: 'dist',
    });

    export default {
      output: addon.output(),

      plugins: [
   +    scopedCSS('src'),
        …
   ```

3. Add the AST transform in `babel.config.json`:

   ```diff
    ["babel-plugin-ember-template-compilation", {
      "targetFormat": "hbs",
   -  "transforms": []
   +  "transforms": ["glimmer-scoped-css/ast-transform"]
    }],
   ```

#### v1

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

Add a top-level `<style scoped>` element in your component `.hbs` file and it will be scoped to elements in that component only. It also works in [`<template>` in `.gjs`/`.gts` files](https://github.com/ember-template-imports/ember-template-imports).

Nested `<style scoped>` elements cannot be processed for scoping. Use `<style>` directly if you need a nested element, it will not receive scoping attributes and will be passed through to output.

## Architecture

glimmer-scoped-css consists of two parts. The first part is an AST transform that takes as input your `<style>` tags inside handlebars and emits as output specially crafted import statements that account for that scoped CSS.

The second part is a plugin for your current environment (by default, webpack) that satisfies the specially-crafted import statements by turning them into CSS. To implement a new plugin, you should use `import { isScopedCSSRequest, decodeScopedCSSRequest } from 'glimmer-scoped-css'` to identify these imports and turn them back into CSS, respectively.

## Troubleshooting

### `node/no-missing-require` lint errors

```
Error:    6:51  error  "glimmer-scoped-css/webpack" is not found         node/no-missing-require
```

The `eslint-plugin-node` package that produces this error doesn’t understand the `exports` structure supported by newer Node versions and is unmaintained. Ember CLI has [moved](https://github.com/ember-cli/ember-cli/issues/10055) to using `eslint-plugin-n` as a drop-in replacement as of 4.10.

Changing to `eslint-plugin-n` and [updating the lint configuration](https://github.com/ember-cli/ember-cli/pull/10060/files#diff-042c163c37338253d4a1cc6bf038fb8b4b45eebef94ebbd439a81c38b158dcb6) fixes these errors.

## Contributing

See the [Contributing](CONTRIBUTING.md) guide for details.

## License

This project is licensed under the [MIT License](LICENSE.md).
