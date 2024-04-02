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

const SCOPED_CSS_CLASS = '__GLIMMER_SCOPED_CSS_CLASS';

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
          (n) => n.type === 'ElementNode' && n.tag === 'style',
        );

        if (styleTag) {
          currentTemplateStyleHash = md5(
            textContent(styleTag as ASTv1.ElementNode),
          ).slice(0, 10);
        }

        return node;
      },
      ElementNode(node, walker) {
        let dataAttribute = `${dataAttributePrefix}-${currentTemplateStyleHash}`;

        let scopeClass = dataAttribute.replace(/^data-/, '');
        replaceScopedClassesInAttributes(node, scopeClass);

        if (node.tag === 'style') {
          if (hasUnscopedAttribute(node)) {
            return removeUnscopedAttribute(node);
          }

          if (walker.parent?.node.type !== 'Template') {
            throw new Error(
              '<style> tags must be at the root of the template, they cannot be nested',
            );
          }
          let inputCSS = textContent(node);
          let outputCSS = postcss([
            scopedStylesPlugin([dataAttribute, SCOPED_CSS_CLASS]),
          ]).process(inputCSS).css;

          // TODO: hard coding the loader chain means we ignore the other
          // prevailing rules (and we're even assuming these loaders are
          // available)
          let encodedCss = encodeURIComponent(btoa(outputCSS));

          jsutils.importForSideEffect(
            `./${basename(env.filename)}.${encodedCss}.glimmer-scoped.css`,
          );

          return null;
        } else {
          if (node.tag.startsWith(':')) {
            return node;
          } else {
            if (currentTemplateStyleHash) {
              node.attributes.push(
                builders.attr(dataAttribute, builders.text('')),
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
    (c) => c.type === 'TextNode',
  ) as ASTv1.TextNode[];
  return textChildren.map((c) => c.chars).join('');
}

const UNSCOPED_ATTRIBUTE_NAME = 'unscoped';

function hasUnscopedAttribute(node: ASTv1.ElementNode): boolean {
  return node.attributes.some(
    (attribute) => attribute.name === UNSCOPED_ATTRIBUTE_NAME,
  );
}

function removeUnscopedAttribute(node: ASTv1.ElementNode): ASTv1.ElementNode {
  node.attributes = node.attributes.filter(
    (attribute) => attribute.name !== UNSCOPED_ATTRIBUTE_NAME,
  );
  return node;
}

function replaceScopedClassesInAttributes(
  elementNode: ASTv1.ElementNode,
  replacementClass: string,
) {
  elementNode.attributes.forEach((attr) => {
    let attributeValue = attr.value;

    if (attributeValue.type === 'TextNode') {
      // example: <div class="x __GLIMMER_SCOPED_CSS">

      if (attributeValue.chars.includes(SCOPED_CSS_CLASS)) {
        attributeValue.chars = attributeValue.chars.replace(
          SCOPED_CSS_CLASS,
          replacementClass,
        );
      }
    } else if (attributeValue.type === 'MustacheStatement') {
      // example: <div class={{concat this.aClass " " "__GLIMMER_SCOPED_CSS"}}>

      attributeValue.params.forEach((expression) => {
        replaceScopedClassesInExpression(
          expression,
          SCOPED_CSS_CLASS,
          replacementClass,
        );
      });
    } else if (attributeValue.type === 'ConcatStatement') {
      attributeValue.parts.forEach((part) => {
        if (part.type === 'TextNode') {
          // example: <div class="x {{@y}} __GLIMMER_SCOPED_CSS">

          if (part.chars.includes(SCOPED_CSS_CLASS)) {
            part.chars = part.chars.replace(SCOPED_CSS_CLASS, replacementClass);
          }
        } else if (part.type === 'MustacheStatement') {
          // example: <div class="x {{concat this.aClass " " "__GLIMMER_SCOPED_CSS"}}">

          part.params.forEach((expression) => {
            replaceScopedClassesInExpression(
              expression,
              SCOPED_CSS_CLASS,
              replacementClass,
            );
          });
        }
      });
    }
  });
}

function replaceScopedClassesInExpression(
  expression: ASTv1.Expression,
  placeholderClass: string,
  replacementClass: string,
): void {
  if (expression.type === 'StringLiteral') {
    expression.value = expression.value.replace(
      placeholderClass,
      replacementClass,
    );
  } else if (expression.type === 'SubExpression') {
    expression.params.forEach((param) => {
      replaceScopedClassesInExpression(
        param,
        placeholderClass,
        replacementClass,
      );
    });
  }
}
