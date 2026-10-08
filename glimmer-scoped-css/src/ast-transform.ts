import type {
  ASTPluginBuilder,
  ASTPluginEnvironment,
  ASTv1,
} from '@glimmer/syntax';
import type { WithJSUtils } from 'babel-plugin-ember-template-compilation';
import { md5 } from 'super-fast-md5';
import postcss from 'postcss';
import scopedStylesPlugin from './postcss-plugin';
import { existsSync, readFileSync } from 'fs';
import { basename, dirname, isAbsolute, join, relative, sep } from 'path';
import { GlimmerScopedCSSOptions } from '.';
import { encodeCSS } from './encoding';

type Env = WithJSUtils<ASTPluginEnvironment> & {
  filename: string;
  contents: string;
  strict?: boolean;
  locals?: string[];
};

interface PackageRoot {
  dir: string;
  name: string;
}

// Nearest named package.json above each directory looked up, or null when
// there is none. Every directory a lookup passes through is recorded, so a
// sibling file's lookup stops at the first shared ancestor.
const packageRoots = new Map<string, PackageRoot | null>();

function packageRootOf(dir: string): PackageRoot | null {
  let visited: string[] = [];
  let root: PackageRoot | null = null;
  for (let current = dir; ; current = dirname(current)) {
    let known = packageRoots.get(current);
    if (known !== undefined) {
      root = known;
      break;
    }
    visited.push(current);
    let manifest = join(current, 'package.json');
    if (existsSync(manifest)) {
      let name: unknown;
      try {
        name = JSON.parse(readFileSync(manifest, 'utf8')).name;
      } catch {
        name = undefined;
      }
      if (typeof name === 'string' && name.length > 0) {
        root = { dir: current, name };
        break;
      }
    }
    if (dirname(current) === current) {
      break;
    }
  }
  for (let entry of visited) {
    packageRoots.set(entry, root);
  }
  return root;
}

// `<package name>/<path inside the package>` for a file on disk inside a
// named package, or undefined for anything else. Undefined also when `fs` is
// unavailable, as in a bundle that stubs it out.
function packageRelativeId(filename: string): string | undefined {
  if (
    typeof existsSync !== 'function' ||
    typeof readFileSync !== 'function' ||
    !isAbsolute(filename) ||
    !existsSync(filename)
  ) {
    return undefined;
  }
  let root = packageRootOf(dirname(filename));
  if (!root) {
    return undefined;
  }
  let inside = relative(root.dir, filename).split(sep).join('/');
  return `${root.name}/${inside}`;
}

// The scope prefix for a template's file. It must be the same for the same
// source on every machine: prerendered HTML carries the prefixes of the build
// that rendered it, and a build at another path must still style it. So a
// file inside a package is identified by its package name and its path
// inside the package, not by its absolute path. Any other filename, such as a
// synthetic path that does not exist on disk, is used as given.
export function uniqueIdentifier(filename: string): string {
  return md5(packageRelativeId(filename) ?? filename).slice(0, 10);
}

export function generateScopedCSSPlugin(
  options: GlimmerScopedCSSOptions
): ASTPluginBuilder<Env> {
  return (env) => {
    let dataAttributePrefix = `data-scopedcss-${uniqueIdentifier(
      env.filename
    )}`;
    let currentTemplateStyleHash: string;

    let {
      syntax: { builders },
      meta: { jsutils },
    } = env;

    return {
      name: 'glimmer-scoped-css',

      visitor: {
        Template(node) {
          let styleTag = node.body.find(
            (n) => n.type === 'ElementNode' && n.tag === 'style'
          );

          if (styleTag) {
            currentTemplateStyleHash = md5(
              textContent(styleTag as ASTv1.ElementNode)
            ).slice(0, 10);
          }

          return node;
        },
        ElementNode(node, walker) {
          let dataAttribute = `${dataAttributePrefix}-${currentTemplateStyleHash}`;

          if (node.tag === 'style') {
            let inputCSS = textContent(node);
            let outputCSS;

            if (hasScopedAttribute(node)) {
              if (walker.parent?.node.type !== 'Template') {
                throw new Error(
                  '<style> tags must be at the root of the template, they cannot be nested'
                );
              }

              outputCSS = postcss([
                scopedStylesPlugin({ id: dataAttribute, ...options }),
              ]).process(inputCSS).css;
            } else {
              return;
            }

            // TODO: hard coding the loader chain means we ignore the other
            // prevailing rules (and we're even assuming these loaders are
            // available)
            let encodedCss = encodeCSS(outputCSS);

            jsutils.importForSideEffect(
              `./${basename(env.filename)}.${encodedCss}.glimmer-scoped.css`
            );

            return null;
          } else {
            if (node.tag.startsWith(':')) {
              return node;
            } else {
              if (currentTemplateStyleHash) {
                node.attributes.push(
                  builders.attr(dataAttribute, builders.text(''))
                );
              }
            }
          }
        },
      },
    };
  };
}

const scopedCSSTransform: ASTPluginBuilder<Env> = generateScopedCSSPlugin({
  noGlobal: false,
});

export default scopedCSSTransform;

function textContent(node: ASTv1.ElementNode): string {
  let textChildren = node.children.filter(
    (c) => c.type === 'TextNode'
  ) as ASTv1.TextNode[];
  return textChildren.map((c) => c.chars).join('');
}

const SCOPED_ATTRIBUTE_NAME = 'scoped';

function hasScopedAttribute(node: ASTv1.ElementNode): boolean {
  return node.attributes.some(
    (attribute) => attribute.name === SCOPED_ATTRIBUTE_NAME
  );
}
