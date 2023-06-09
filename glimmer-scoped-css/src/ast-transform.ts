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
  let dataAttribute = `data-scopedcss-${uniqueIdentifier(env.filename)}`;

  let {
    syntax: { builders },
    meta: { jsutils },
  } = env;

  return {
    name: 'glimmer-scoped-css',

    visitor: {
      ElementNode(node) {
        if (node.tag === 'style') {
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
          return null;
        } else {
          if (node.tag.startsWith(':')) {
            return node;
          } else {
            node.attributes.push(
              builders.attr(dataAttribute, builders.text(''))
            );
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
