'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var crypto = require('node:crypto');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var crypto__default = /*#__PURE__*/_interopDefaultLegacy(crypto);

function uniqueIdentifier(filename) {
  let hash = crypto__default["default"].createHash('sha1');
  hash.update(filename);
  return hash.digest('hex').slice(0, 10);
}
const scopedCSSTransform = env => {
  let dataAttribute = `data-scopedcss-${uniqueIdentifier(env.filename)}`;
  let {
    syntax: {
      builders
    },
    meta: {
      jsutils
    }
  } = env;
  return {
    name: 'glimmer-scoped-css',
    visitor: {
      ElementNode(node) {
        if (node.tag === 'style') {
          // TODO: hard coding the loader chain means we ignore the other
          // prevailing rules (and we're even assuming these loaders are
          // available)
          let encodedCssFilePath = btoa(textContent(node));
          jsutils.importForSideEffect(`style-loader!css-loader!glimmer-scoped-css/virtual-loader?file=${encodedCssFilePath}&selector=${dataAttribute}!`);
          return null;
        } else {
          if (node.tag.startsWith(':')) {
            return node;
          } else {
            node.attributes.push(builders.attr(dataAttribute, builders.text('')));
          }
        }
      }
    }
  };
};
function textContent(node) {
  let textChildren = node.children.filter(c => c.type === 'TextNode');
  return textChildren.map(c => c.chars).join('');
}

function installScopedCSS(registry) {
  registry.add('htmlbars-ast-plugin', buildASTPlugin());
}
function buildASTPlugin() {
  return {
    name: 'glimmer-scoped-css',
    plugin: scopedCSSTransform,
    baseDir: function () {
      return __dirname;
    },
    parallelBabel: {
      requireFile: __filename,
      buildUsing: 'buildASTPlugin',
      params: {}
    }
  };
}

exports.buildASTPlugin = buildASTPlugin;
exports.installScopedCSS = installScopedCSS;
//# sourceMappingURL=index.js.map
