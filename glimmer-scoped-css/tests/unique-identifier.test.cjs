'use strict';

// Runs against the built addon, as consumers load it. `pnpm build` first.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { mkdtempSync, mkdirSync, writeFileSync, rmSync } = require('node:fs');
const { tmpdir } = require('node:os');
const { join } = require('node:path');
const { md5 } = require('super-fast-md5');
const { uniqueIdentifier } = require('../dist/ast-transform.js');

// Writes a package with one component file under a fresh temporary root and
// returns the component's absolute path.
function makePackage(name, relativeFile, { manifest } = {}) {
  let root = mkdtempSync(join(tmpdir(), 'glimmer-scoped-css-'));
  let packageDir = join(root, 'checkout', 'packages', 'pkg');
  mkdirSync(join(packageDir, ...relativeFile.split('/').slice(0, -1)), {
    recursive: true,
  });
  writeFileSync(
    join(packageDir, 'package.json'),
    JSON.stringify(manifest ?? { name })
  );
  let file = join(packageDir, ...relativeFile.split('/'));
  writeFileSync(file, '<template><style scoped>.a {}</style></template>');
  return { root, packageDir, file };
}

test('the same file in two checkouts at different paths gets the same prefix', (t) => {
  let a = makePackage('@scope/ui', 'src/components/pill/index.gts');
  let b = makePackage('@scope/ui', 'src/components/pill/index.gts');
  t.after(() => {
    rmSync(a.root, { recursive: true, force: true });
    rmSync(b.root, { recursive: true, force: true });
  });

  assert.notEqual(a.file, b.file);
  assert.equal(uniqueIdentifier(a.file), uniqueIdentifier(b.file));
  assert.equal(
    uniqueIdentifier(a.file),
    md5('@scope/ui/src/components/pill/index.gts').slice(0, 10)
  );
});

test('the same path inside two different packages gets different prefixes', (t) => {
  let a = makePackage('@scope/ui', 'src/components/pill/index.gts');
  let b = makePackage('@scope/other', 'src/components/pill/index.gts');
  t.after(() => {
    rmSync(a.root, { recursive: true, force: true });
    rmSync(b.root, { recursive: true, force: true });
  });

  assert.notEqual(uniqueIdentifier(a.file), uniqueIdentifier(b.file));
});

test('a package.json without a name is skipped for the nearest named one', (t) => {
  let a = makePackage('@scope/ui', 'src/components/pill/index.gts');
  t.after(() => rmSync(a.root, { recursive: true, force: true }));
  let nested = join(a.packageDir, 'src', 'components');
  writeFileSync(
    join(nested, 'package.json'),
    JSON.stringify({ type: 'module' })
  );

  // A file in a fresh directory, so no earlier lookup is cached for it.
  let fresh = join(nested, 'badge');
  mkdirSync(fresh);
  let file = join(fresh, 'index.gts');
  writeFileSync(file, '');

  assert.equal(
    uniqueIdentifier(file),
    md5('@scope/ui/src/components/badge/index.gts').slice(0, 10)
  );
});

test('a filename that does not exist on disk is used as given', () => {
  // The synthetic module paths a realm-style transpiler passes.
  assert.equal(uniqueIdentifier('/spec.gts'), md5('/spec.gts').slice(0, 10));
  let missing = join(tmpdir(), 'glimmer-scoped-css-missing', 'x.gts');
  assert.equal(uniqueIdentifier(missing), md5(missing).slice(0, 10));
});

test('a file in no named package keeps its absolute path', (t) => {
  let root = mkdtempSync(join(tmpdir(), 'glimmer-scoped-css-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  let file = join(root, 'loose.gts');
  writeFileSync(file, '');

  // Only meaningful when nothing above the temporary directory is a named
  // package, which holds for the system temporary directory.
  assert.equal(uniqueIdentifier(file), md5(file).slice(0, 10));
});
