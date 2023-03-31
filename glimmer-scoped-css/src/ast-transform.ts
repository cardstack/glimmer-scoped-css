import type {
  ASTPluginBuilder,
  ASTPluginEnvironment,
  ASTv1,
} from '@glimmer/syntax';
import type { WithJSUtils } from 'babel-plugin-ember-template-compilation';
import jsStringEscape from 'js-string-escape';
import { basename } from 'path';
import crypto from 'node:crypto';

type Env = WithJSUtils<ASTPluginEnvironment> & {
  filename: string;
  contents: string;
  strict?: boolean;
  locals?: string[];
};

function uniqueIdentifier(filename: string): string {
  let hash = crypto.createHash('sha1');
  hash.update(filename);
  return hash.digest('hex').slice(0, 10);
}

const scopedCSSTransform: ASTPluginBuilder<Env> = (env) => {
  let {
    syntax: { builders },
    meta: { jsutils },
  } = env;

  return {
    name: 'glimmer-scoped-css',

    visitor: {
      ElementNode(node, path) {
        if (node.tag === 'style') {
          // TODO: hard coding the loader chain means we ignore the other
          // prevailing rules (and we're even assuming these loaders are
          // available)
          jsutils.importForSideEffect(
            `style-loader!css-loader!glimmer-scoped-css/virtual-loader?${btoa(textContent(node))}!`
          );
          return null;
        } else {
          node.attributes.push(
            builders.attr(`data-scopedcss-${uniqueIdentifier(env.filename)}`, builders.text(''))
          );
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
