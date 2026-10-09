'use strict';

// Runs against the built addon, as consumers load it. `pnpm build` first.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { mkdtempSync, mkdirSync, writeFileSync, rmSync } = require('node:fs');
const { tmpdir } = require('node:os');
const { join } = require('node:path');
const { md5 } = require('super-fast-md5');
const { uniqueIdentifier } = require('../dist/ast-transform.js');

// Writes a checkout with an app package and a component file in a sibling
// package under a fresh temporary root, and returns their absolute paths.
function makeCheckout() {
  let root = mkdtempSync(join(tmpdir(), 'glimmer-scoped-css-'));
  let appDir = join(root, 'checkout', 'packages', 'app');
  let componentDir = join(
    root,
    'checkout',
    'packages',
    'ui',
    'src',
    'components',
    'pill'
  );
  mkdirSync(appDir, { recursive: true });
  mkdirSync(componentDir, { recursive: true });
  let file = join(componentDir, 'index.gts');
  writeFileSync(file, '<template><style scoped>.a {}</style></template>');
  return { root, appDir, file };
}

// Calls uniqueIdentifier with `dir` as the working directory.
function identifierFrom(dir, filename) {
  let original = process.cwd();
  process.chdir(dir);
  try {
    return uniqueIdentifier(filename);
  } finally {
    process.chdir(original);
  }
}

test('the same file in two checkouts at different paths gets the same prefix', (t) => {
  let a = makeCheckout();
  let b = makeCheckout();
  t.after(() => {
    rmSync(a.root, { recursive: true, force: true });
    rmSync(b.root, { recursive: true, force: true });
  });

  assert.notEqual(a.file, b.file);
  assert.equal(identifierFrom(a.appDir, a.file), identifierFrom(b.appDir, b.file));
  assert.equal(
    identifierFrom(a.appDir, a.file),
    md5('../ui/src/components/pill/index.gts').slice(0, 10)
  );
});

test('builds from different working directories get different prefixes', (t) => {
  let a = makeCheckout();
  t.after(() => rmSync(a.root, { recursive: true, force: true }));

  assert.notEqual(
    identifierFrom(a.appDir, a.file),
    identifierFrom(a.root, a.file)
  );
});

test('a filename that does not exist on disk is used as given', () => {
  // The synthetic module paths a realm-style transpiler passes.
  assert.equal(uniqueIdentifier('/spec.gts'), md5('/spec.gts').slice(0, 10));
  let missing = join(tmpdir(), 'glimmer-scoped-css-missing', 'x.gts');
  assert.equal(uniqueIdentifier(missing), md5(missing).slice(0, 10));
});
