import { module, test } from 'qunit';
import { find, visit, currentURL } from '@ember/test-helpers';
import { setupApplicationTest } from 'test-app/tests/helpers';

module('Acceptance | scoped css', function (hooks) {
  setupApplicationTest(hooks);

  test('component elements have scoped CSS selectors when their templates have style tags', async function (assert) {
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

    assert.notOk(
      innerComponentScopedCssSelector,
      'expected [data-test-inner-second-p] to not have scoping attribute'
    );

    assert
      .dom('[data-test-inner-first-p]')
      .hasAttribute(
        outerComponentScopedCssSelector,
        '',
        'expected splattributes element within nested component to have its parent component’s scoped CSS selector'
      );
  });

  test('component elements have styles from component template CSS', async function (assert) {
    await visit('/');

    assert.dom('[data-test-outer-p]').hasStyle({
      color: 'rgb(0, 0, 255)',
    });

    assert.dom('[data-test-inner-first-p]').hasStyle({
      color: 'rgb(0, 0, 255)',
    });

    assert.dom('[data-test-inner-second-p]').doesNotHaveStyle({
      color: 'rgb(0, 0, 255)',
    });

    assert.dom('[data-test-multiple-inner]').hasStyle({
      'font-weight': '700',
    });

    assert.dom('[data-test-multiple-outer]').hasStyle({
      'font-style': 'italic',
      'font-weight': '900',
    });
  });

  test('unscoped style elements are passed through without the unscoped attribute', async function (assert) {
    await visit('/');

    assert
      .dom('[data-test-unscoped-root-style]')
      .exists()
      .doesNotHaveAttribute('unscoped');

    assert.dom('style[unscoped]').doesNotExist();

    assert.dom('[data-test-global-p]').hasStyle({
      'text-align': 'end',
      'text-transform': 'uppercase',
    });
  });

  test('a block can be made non-scoped with the :global pseudo-class', async function (assert) {
    await visit('/');

    assert.dom('[data-test-global-p]').hasStyle({
      color: 'rgb(255, 0, 0)',
    });
  });

  test('the scope attribute can be attached to the penultimate element with the :deep pseudo-class', async function (assert) {
    await visit('/');

    assert.dom('[data-test-inner-pre]').hasStyle({
      color: 'rgb(0, 128, 0)',
    });
  });

  test('scoped css can @import another css file', async function (assert) {
    await visit('/');

    assert.dom('[data-test-uses-an-import]').hasStyle({
      color: 'rgb(0, 250, 0)',
    });
  });

  test('an addon can use scoped styles', async function (assert) {
    await visit('/');

    assert.dom('[data-scoped-underline-addon-component]').hasStyle({
      textDecoration: 'underline solid rgb(0, 0, 0)',
    });

    assert
      .dom('[data-test-underline-component-outside-addon]')
      .doesNotHaveStyle({
        textDecoration: 'underline solid rgb(0, 0, 0)',
      });
  });
});
