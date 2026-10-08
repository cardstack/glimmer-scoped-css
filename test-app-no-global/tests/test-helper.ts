import Application from 'test-app-no-global/app';
import config from 'test-app-no-global/config/environment';
import * as QUnit from 'qunit';
import { setApplication } from '@ember/test-helpers';
import { setup } from 'qunit-dom';
// ember-qunit 6, which the Ember 3.28 scenarios install, has this module but no
// types for it.
// @ts-ignore
import { loadTests } from 'ember-qunit/test-loader';
import { start, setupEmberOnerrorValidation } from 'ember-qunit';

setApplication(Application.create(config.APP));

setup(QUnit.assert);
setupEmberOnerrorValidation();
loadTests();

// The tests are loaded and validated above. ember-qunit 9 does neither in
// start() and does not declare these options, but the ember-qunit 6 that the
// Ember 3.28 scenarios use would otherwise load the tests a second time.
const legacyStartOptions = {
  loadTests: false,
  setupEmberOnerrorValidation: false,
};
start(legacyStartOptions as Parameters<typeof start>[0]);
