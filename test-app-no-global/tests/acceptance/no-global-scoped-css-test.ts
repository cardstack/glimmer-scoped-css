import { module, test } from 'qunit';
import { visit } from '@ember/test-helpers';
import { setupApplicationTest } from 'test-app-no-global/tests/helpers';

module('Acceptance | scoped css with no global', function (hooks) {
  setupApplicationTest(hooks);

  test('selectors with :global are not processed', async function (assert) {
    await visit('/');

    assert.dom('[data-test-global-p]').hasStyle({
      'font-style': 'normal',
    });
  });
});
