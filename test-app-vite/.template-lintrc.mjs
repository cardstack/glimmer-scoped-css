export default {
  extends: 'recommended',
  // Copies of test-app files, linted there; scripts/check-vite-app-copies.mjs
  // keeps them identical.
  ignore: ['app/components/**', 'app/templates/application.hbs'],
};
