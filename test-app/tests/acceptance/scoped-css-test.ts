import { module, test } from 'qunit';
import { find, visit, currentURL } from '@ember/test-helpers';
import { setupApplicationTest } from 'test-app/tests/helpers';

module('Acceptance | scoped css', function (hooks) {
  setupApplicationTest(hooks);

  test('component elements have scoped CSS selectors', async function (assert) {
    await visit('/');

    assert.strictEqual(currentURL(), '/');

    const outerH1Element = find('[data-test-outer-h1]');

    if (!outerH1Element) {
      throw new Error('[data-test-outer-h1] element not found');
    }

    const outerComponentScopedCssSelector = Array.from(
      outerH1Element.attributes
    )
      .map((attribute) => attribute.localName)
      .find((attributeName) => attributeName.startsWith('data-scopedcss'));

    if (!outerComponentScopedCssSelector) {
      throw new Error('Scoped CSS selector not found on [data-test-outer-h1]');
    }

    assert
      .dom('[data-test-outer-p]')
      .hasAttribute(outerComponentScopedCssSelector);

    assert
      .dom('[data-test-inner-first-p]')
      .hasAttribute(
        outerComponentScopedCssSelector,
        '',
        'expected splattributes element within nested component to inherit scoped CSS selector'
      );
    assert
      .dom('[data-test-inner-second-p]')
      .doesNotHaveAttribute(outerComponentScopedCssSelector);

    const innerSecondParagraphElement = find('[data-test-inner-second-p]');

    if (!innerSecondParagraphElement) {
      throw new Error('[data-test-inner-second-p] element not found');
    }

    const innerComponentScopedCssSelector = Array.from(
      innerSecondParagraphElement.attributes
    )
      .map((attribute) => attribute.localName)
      .find((attributeName) => attributeName.startsWith('data-scopedcss'));

    if (!innerComponentScopedCssSelector) {
      throw new Error('Scoped CSS selector not found on [data-test-outer-h1]');
    }

    assert
      .dom('[data-test-inner-first-p]')
      .hasAttribute(
        innerComponentScopedCssSelector,
        '',
        'expected splattributes element within nested component to have its component’s scoped CSS selector'
      );
  });
});
