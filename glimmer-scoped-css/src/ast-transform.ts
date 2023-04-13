import type {
  ASTPluginBuilder,
  ASTPluginEnvironment,
  ASTv1,
} from '@glimmer/syntax';
import type { WithJSUtils } from 'babel-plugin-ember-template-compilation';
import crypto from 'node:crypto';
import fs from 'fs';

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
  let dataAttribute = `data-scopedcss-${uniqueIdentifier(env.filename)}`;

  let {
    syntax: { builders },
    meta: { jsutils },
  } = env;

  let existingCssLoaders: string[] = [];

  return {
    name: 'glimmer-scoped-css',

    visitor: {
      ElementNode(node) {
        if (!existingCssLoaders.length) {
          try {
            fs.accessSync('css-loaders.json');
            existingCssLoaders = JSON.parse(
              fs.readFileSync('css-loaders.json').toString()
            ).join('!');
          } catch (error: any) {
            console.log('Unable to read css-loaders.json');
            throw new Error(
              'Unable to determine Webpack CSS loaders, could not read css-loaders.json'
            );
          }

          console.log(
            `Prepending this CSS loader string: ${existingCssLoaders}`
          );
        }

        if (node.tag === 'style') {
          let encodedCssFilePath = btoa(textContent(node));

          jsutils.importForSideEffect(
            `${existingCssLoaders}!glimmer-scoped-css/virtual-loader?file=${encodedCssFilePath}&selector=${dataAttribute}!`
          );
          return null;
        } else {
          node.attributes.push(builders.attr(dataAttribute, builders.text('')));
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
