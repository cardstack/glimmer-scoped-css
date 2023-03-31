'use strict';

const EmberApp = require('ember-cli/lib/broccoli/ember-app');
const { GlimmerScopedCSSWebpackPlugin } = require('glimmer-scoped-css/webpack');

const webpackConfig = {
  plugins: [new GlimmerScopedCSSWebpackPlugin()],
  module: {
    rules: [
      {
        test(filename) {
          console.log(`testing ${filename}`);
          return filename.startsWith('glimmer-scoped-css/');
        },
        use: [
          {
            loader: 'style-loader',
            options: {},
          },
          {
            loader: 'glimmer-scoped-css/virtual-loader',
          },
        ],
      },
    ],
  },
};

module.exports = function (defaults) {
  let app = new EmberApp(defaults, {
    autoImport: {
      watchDependencies: ['glimmer-scoped-css'],
      webpack: webpackConfig,
    },
  });

  const { maybeEmbroider } = require('@embroider/test-setup');
  return maybeEmbroider(app, {
    packagerOptions: {
      webpackConfig,
    },
  });
};
