'use strict';

var postcss = require('postcss');
var selectorParser = require('postcss-selector-parser');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var postcss__default = /*#__PURE__*/_interopDefaultLegacy(postcss);
var selectorParser__default = /*#__PURE__*/_interopDefaultLegacy(selectorParser);

/* eslint-disable */
const animationNameRE = /^(-\w+-)?animation-name$/;
const animationRE = /^(-\w+-)?animation$/;
function warn(message) {
  console.warn(message);
}
const scopedPlugin = (id = '') => {
  const keyframes = Object.create(null);
  const shortId = id.replace(/^data-v-/, '');
  return {
    postcssPlugin: 'vue-sfc-scoped',
    Rule(rule) {
      processRule(id, rule);
    },
    AtRule(node) {
      if (/-?keyframes$/.test(node.name) && !node.params.endsWith(`-${shortId}`)) {
        // register keyframes
        keyframes[node.params] = node.params = node.params + '-' + shortId;
      }
    },
    OnceExit(root) {
      if (Object.keys(keyframes).length) {
        // If keyframes are found in this <style>, find and rewrite animation names
        // in declarations.
        // Caveat: this only works for keyframes and animation rules in the same
        // <style> element.
        // individual animation-name declaration
        root.walkDecls(decl => {
          if (animationNameRE.test(decl.prop)) {
            decl.value = decl.value.split(',').map(v => keyframes[v.trim()] || v.trim()).join(',');
          }
          // shorthand
          if (animationRE.test(decl.prop)) {
            decl.value = decl.value.split(',').map(v => {
              const vals = v.trim().split(/\s+/);
              const i = vals.findIndex(val => keyframes[val]);
              if (i !== -1) {
                vals.splice(i, 1, keyframes[vals[i]]);
                return vals.join(' ');
              } else {
                return v;
              }
            }).join(',');
          }
        });
      }
    }
  };
};
const processedRules = new WeakSet();
function processRule(id, rule) {
  if (processedRules.has(rule) || rule.parent && rule.parent.type === 'atrule' && /-?keyframes$/.test(rule.parent.name)) {
    return;
  }
  processedRules.add(rule);
  rule.selector = selectorParser__default["default"](selectorRoot => {
    selectorRoot.each(selector => {
      rewriteSelector(id, selector, selectorRoot);
    });
  }).processSync(rule.selector);
}
function rewriteSelector(id, selector, selectorRoot, slotted = false) {
  let node = null;
  let shouldInject = true;
  // find the last child node to insert attribute selector
  selector.each(n => {
    // DEPRECATED ">>>" and "/deep/" combinator
    if (n.type === 'combinator' && (n.value === '>>>' || n.value === '/deep/')) {
      n.value = ' ';
      n.spaces.before = n.spaces.after = '';
      warn(`the >>> and /deep/ combinators have been deprecated. ` + `Use :deep() instead.`);
      return false;
    }
    if (n.type === 'pseudo') {
      const {
        value
      } = n;
      // deep: inject [id] attribute at the node before the ::v-deep
      // combinator.
      if (value === ':deep' || value === '::v-deep') {
        if (n.nodes.length) {
          // .foo ::v-deep(.bar) -> .foo[xxxxxxx] .bar
          // replace the current node with ::v-deep's inner selector
          let last = n;
          n.nodes[0].each(ss => {
            selector.insertAfter(last, ss);
            last = ss;
          });
          // insert a space combinator before if it doesn't already have one
          const prev = selector.at(selector.index(n) - 1);
          if (!prev || !isSpaceCombinator(prev)) {
            selector.insertAfter(n, selectorParser__default["default"].combinator({
              value: ' '
            }));
          }
          selector.removeChild(n);
        } else {
          // DEPRECATED usage
          // .foo ::v-deep .bar -> .foo[xxxxxxx] .bar
          warn(`::v-deep usage as a combinator has ` + `been deprecated. Use :deep(<inner-selector>) instead.`);
          const prev = selector.at(selector.index(n) - 1);
          if (prev && isSpaceCombinator(prev)) {
            selector.removeChild(prev);
          }
          selector.removeChild(n);
        }
        return false;
      }

      // slot: use selector inside `::v-slotted` and inject [id + '-s']
      // instead.
      // ::v-slotted(.foo) -> .foo[xxxxxxx-s]
      if (value === ':slotted' || value === '::v-slotted') {
        rewriteSelector(id, n.nodes[0], selectorRoot, true /* slotted */);
        let last = n;
        n.nodes[0].each(ss => {
          selector.insertAfter(last, ss);
          last = ss;
        });
        // selector.insertAfter(n, n.nodes[0])
        selector.removeChild(n);
        // since slotted attribute already scopes the selector there's no
        // need for the non-slot attribute.
        shouldInject = false;
        return false;
      }

      // global: replace with inner selector and do not inject [id].
      // ::v-global(.foo) -> .foo
      if (value === ':global' || value === '::v-global') {
        selectorRoot.insertAfter(selector, n.nodes[0]);
        selectorRoot.removeChild(selector);
        return false;
      }
    }
    if (n.type !== 'pseudo' && n.type !== 'combinator') {
      node = n;
    }
  });
  if (node) {
    node.spaces.after = '';
  } else {
    // For deep selectors & standalone pseudo selectors,
    // the attribute selectors are prepended rather than appended.
    // So all leading spaces must be eliminated to avoid problems.
    selector.first.spaces.before = '';
  }
  if (shouldInject) {
    const idToAdd = slotted ? id + '-s' : id;
    selector.insertAfter(
    // If node is null it means we need to inject [id] at the start
    // insertAfter can handle `null` here
    node, selectorParser__default["default"].attribute({
      attribute: idToAdd,
      value: idToAdd,
      raws: {},
      quoteMark: `"`
    }));
  }
}
function isSpaceCombinator(node) {
  return node.type === 'combinator' && /^\s+$/.test(node.value);
}
scopedPlugin.postcss = true;

function virtualLoader() {
  let cssFileAndSelectorString = this.loaders[this.loaderIndex]?.options;
  if (typeof cssFileAndSelectorString !== 'string') {
    throw new Error(`glimmer-scoped-css/src/virtual-loader received unexpected request: ${cssFileAndSelectorString}`);
  }
  let cssFileAndSelector = new URLSearchParams(cssFileAndSelectorString);
  let cssFile = cssFileAndSelector.get('file');
  if (!cssFile) {
    throw new Error(`glimmer-scoped-css/src/virtual-loader missing file parameter: ${cssFileAndSelectorString}`);
  }
  let cssSelector = cssFileAndSelector.get('selector');
  if (!cssSelector) {
    throw new Error(`glimmer-scoped-css/src/virtual-loader missing selector parameter: ${cssFileAndSelectorString}`);
  }
  let cssSource = atob(cssFile);
  let result = postcss__default["default"]([scopedPlugin(cssSelector)]).process(cssSource);
  return result.css;
}

module.exports = virtualLoader;
//# sourceMappingURL=virtual-loader.js.map
