import type {
  ASTPluginBuilder,
  ASTPluginEnvironment,
  ASTv1,
} from '@glimmer/syntax';
import type { WithJSUtils } from 'babel-plugin-ember-template-compilation';
import { md5 } from 'super-fast-md5';
import postcss from 'postcss';
import scopedStylesPlugin from './postcss-plugin';
import { existsSync, realpathSync } from 'fs';
import { basename, isAbsolute, relative, sep } from 'path';
import { GlimmerScopedCSSOptions } from '.';
import { encodeCSS } from './encoding';

type Env = WithJSUtils<ASTPluginEnvironment> & {
  filename: string;
  contents: string;
  strict?: boolean;
  locals?: string[];
};

// The path of a file on disk relative to the build's working directory, or
// undefined for anything else. Undefined also when `fs` or `process` is
// unavailable, as in a bundle that stubs them out. Both paths are resolved
// through symlinks first: `process.cwd()` is always resolved, and a filename
// reached through a symlink would otherwise give a path up to the root and
// back down, which holds the absolute path again.
function cwdRelativeId(filename: string): string | undefined {
  if (
    typeof existsSync !== 'function' ||
    typeof realpathSync !== 'function' ||
    typeof process === 'undefined' ||
    typeof process.cwd !== 'function' ||
    !isAbsolute(filename) ||
    !existsSync(filename)
  ) {
    return undefined;
  }
  return relative(realpathSync(process.cwd()), realpathSync(filename))
    .split(sep)
    .join('/');
}

// The scope prefix for a template's file. It must be the same for the same
// source on every machine: prerendered HTML carries the prefixes of the build
// that rendered it, and a build at another path must still style it. So a
// file on disk is identified by its path relative to the build's working
// directory, not by its absolute path. Any other filename, such as a synthetic
// path that does not exist on disk, is used as given.
export function uniqueIdentifier(filename: string): string {
  return md5(cwdRelativeId(filename) ?? filename).slice(0, 10);
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
