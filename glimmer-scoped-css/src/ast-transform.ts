import type {
  ASTPluginBuilder,
  ASTPluginEnvironment,
  ASTv1,
} from '@glimmer/syntax';
import type { WithJSUtils } from 'babel-plugin-ember-template-compilation';
import { md5 } from 'super-fast-md5';
import postcss from 'postcss';
import scopedStylesPlugin from './postcss-plugin';
import noGlobalScopedStylesPlugin from './no-global-postcss-plugin';
import { basename } from 'path';

type Env = WithJSUtils<ASTPluginEnvironment> & {
  filename: string;
  contents: string;
  strict?: boolean;
  locals?: string[];
};

function uniqueIdentifier(filename: string): string {
  return md5(filename).slice(0, 10);
}

const scopedCSSTransform: ASTPluginBuilder<Env> = (env) => {
  let dataAttributePrefix = `data-scopedcss-${uniqueIdentifier(env.filename)}`;
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

            outputCSS = postcss([scopedStylesPlugin(dataAttribute)]).process(
              inputCSS
            ).css;
          } else {
            return;
          }

          // TODO: hard coding the loader chain means we ignore the other
          // prevailing rules (and we're even assuming these loaders are
          // available)
          let encodedCss = encodeURIComponent(btoa(outputCSS));

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

const noGlobalScopedCSSTransform: ASTPluginBuilder<Env> = (env) => {
  let dataAttributePrefix = `data-scopedcss-${uniqueIdentifier(env.filename)}`;
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
              noGlobalScopedStylesPlugin(dataAttribute),
            ]).process(inputCSS).css;
          } else {
            return;
          }

          // TODO: hard coding the loader chain means we ignore the other
          // prevailing rules (and we're even assuming these loaders are
          // available)
          let encodedCss = encodeURIComponent(btoa(outputCSS));

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

export default scopedCSSTransform;
export { noGlobalScopedCSSTransform };

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
