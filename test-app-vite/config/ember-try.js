'use strict';

const getChannelURL = require('ember-source-channel-url');

// Ember 7 builds only with Embroider 4 and Vite, so its channels run in this
// app. test-app covers the Ember versions that Embroider 3 builds.
module.exports = async function () {
  return {
    packageManager: 'pnpm',
    command: 'pnpm test',
    scenarios: [
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
    ],
  };
};
