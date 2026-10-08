// test-app-vite runs test-app's components and acceptance test under an
// Embroider 4 and Vite build. It holds copies, because Vite resolves a
// symlinked file to its real path, outside the app. This fails when a copy
// differs from test-app's file.
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = new URL('..', import.meta.url).pathname;
const pairs = [
  ...readdirSync(join(root, 'test-app/app/components'))
    .filter((name) => name !== '.gitkeep')
    .map((name) => `app/components/${name}`),
  'app/templates/application.hbs',
  'tests/acceptance/scoped-css-test.ts',
];

// The acceptance test imports the app's own test helpers by module name.
const normalize = (text) =>
  text.replaceAll("'test-app-vite/tests/", "'test-app/tests/");

let differing = pairs.filter((path) => {
  let original = readFileSync(join(root, 'test-app', path), 'utf8');
  let copy;
  try {
    copy = readFileSync(join(root, 'test-app-vite', path), 'utf8');
  } catch {
    return true;
  }
  return normalize(copy) !== original;
});

if (differing.length > 0) {
  console.error(
    `test-app-vite differs from test-app in:\n${differing
      .map((path) => `  ${path}`)
      .join('\n')}\nCopy test-app's version of each file.`,
  );
  process.exit(1);
}
console.log(`test-app-vite matches test-app (${pairs.length} files)`);
