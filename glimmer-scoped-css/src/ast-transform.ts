import type {
  ASTPluginBuilder,
  ASTPluginEnvironment,
  ASTv1,
} from '@glimmer/syntax';
import type { WithJSUtils } from 'babel-plugin-ember-template-compilation';
import { md5 } from 'super-fast-md5';
import postcss from 'postcss';
import scopedStylesPlugin from './postcss-plugin';
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
          if (hasUnscopedAttribute(node)) {
            return removeUnscopedAttribute(node);
          }

          if (walker.parent?.node.type !== 'Template') {
            throw new Error(
              '<style> tags must be at the root of the template, they cannot be nested'
            );
          }
          let inputCSS = textContent(node);
          let outputCSS = postcss([scopedStylesPlugin(dataAttribute)]).process(
            inputCSS
          ).css;

          // TODO: hard coding the loader chain means we ignore the other
          // prevailing rules (and we're even assuming these loaders are
          // available)
          let encodedCss = encodeURIComponent(btoa(outputCSS));

          jsutils.importForSideEffect(
            `./${basename(env.filename)}.${encodedCss}.glimmer-scoped.css`
          );
          // Return an empty <style> stub so Glimmer still has something to remove during teardown.
          // Without this stub, the runtime-inserted <style> lives in <head> and Ember will throw
          // when it later tries to remove the original node. The stub also carries the unique
          // scoped attribute value so the runtime script can detect which stylesheet to update.
          node.attributes = [
            builders.attr(
              'data-boxel-scoped-css-stub',
              builders.text(dataAttribute)
            ),
          ];
          node.children = [];

          return node;
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

function textContent(node: ASTv1.ElementNode): string {
  let textChildren = node.children.filter(
    (c) => c.type === 'TextNode'
  ) as ASTv1.TextNode[];
  return textChildren.map((c) => c.chars).join('');
}

const UNSCOPED_ATTRIBUTE_NAME = 'unscoped';

function hasUnscopedAttribute(node: ASTv1.ElementNode): boolean {
  return node.attributes.some(
    (attribute) => attribute.name === UNSCOPED_ATTRIBUTE_NAME
  );
}

function removeUnscopedAttribute(node: ASTv1.ElementNode): ASTv1.ElementNode {
  node.attributes = node.attributes.filter(
    (attribute) => attribute.name !== UNSCOPED_ATTRIBUTE_NAME
  );
  return node;
}
