'use strict';

const getChannelURL = require('ember-source-channel-url');
const { embroiderSafe, embroiderOptimized } = require('@embroider/test-setup');

// Ember 3.28 needs the ember-cli and test packages that still support it. The
// app's own versions start at Ember 4 (ember-cli-htmlbars) or 5
// (ember-load-initializers), so a 3.28 scenario installs these instead.
const ember328DevDependencies = {
  '@ember/test-helpers': '^2.9.6',
  '@glimmer/component': '^1.1.2',
  'ember-cli': '~4.12.3',
  'ember-cli-htmlbars': '^6.3.0',
  'ember-load-initializers': '^2.1.2',
  'ember-page-title': '^7.0.0',
  'ember-qunit': '^6.2.0',
  'ember-resolver': '^10.1.1',
  'ember-source': '~3.28.12',
};


module.exports = async function () {
  return {
    packageManager: 'pnpm',
    scenarios: [
      {
        name: 'ember-lts-3.28',
        npm: {
          devDependencies: ember328DevDependencies,
        },
      },
      {
        name: 'ember-lts-4.12',
        npm: {
          devDependencies: {
            'ember-source': '~4.12.4',
          },
        },
      },
      {
        name: 'ember-lts-5.12',
        npm: {
          devDependencies: {
            'ember-source': '~5.12.0',
          },
        },
      },
      {
        name: 'ember-lts-6.12',
        npm: {
          devDependencies: {
            'ember-source': '~6.12.0',
          },
        },
      },
      {
        name: 'ember-release',
        npm: {
          devDependencies: {
            'ember-source': await getChannelURL('release'),
          },
        },
      },
      {
        name: 'ember-beta',
        npm: {
          devDependencies: {
            'ember-source': await getChannelURL('beta'),
          },
        },
      },
      {
        name: 'ember-canary',
        npm: {
          devDependencies: {
            'ember-source': await getChannelURL('canary'),
          },
        },
      },
      {
        name: 'ember-classic',
        env: {
          EMBER_OPTIONAL_FEATURES: JSON.stringify({
            'application-template-wrapper': true,
            'default-async-observers': false,
            'template-only-glimmer-components': false,
          }),
        },
        npm: {
          devDependencies: ember328DevDependencies,
          ember: {
            edition: 'classic',
          },
        },
      },
      embroiderSafe(),
      embroiderOptimized(),
    ],
  };
};
