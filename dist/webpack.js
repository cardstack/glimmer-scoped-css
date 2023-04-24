'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var path = require('path');

const virtualLoaderName = 'glimmer-scoped-css';
class GlimmerScopedCSSWebpackPlugin {
  addLoaderAlias(compiler, name, alias) {
    let {
      resolveLoader
    } = compiler.options;
    if (Array.isArray(resolveLoader.alias)) {
      resolveLoader.alias.push({
        name,
        alias
      });
    } else if (resolveLoader.alias) {
      resolveLoader.alias[name] = alias;
    } else {
      resolveLoader.alias = {
        [name]: alias
      };
    }
  }
  apply(compiler) {
    this.addLoaderAlias(compiler, virtualLoaderName, path.resolve(__dirname, './virtual-loader'));

    // compiler.hooks.normalModuleFactory.tap('glimmer-scoped-css', (nmf) => {
    //   nmf.hooks.resolve.tapAsync(
    //     { name: 'glimmer-scoped-css', stage: 0 },
    //     (state: unknown, callback: CB) => {
    //       if (!isRelevantRequest(state)) {
    //         callback(); // continue to delegate to other hooks
    //         return;
    //       }
    //     }
    //   );
    // });
  }
}

exports.GlimmerScopedCSSWebpackPlugin = GlimmerScopedCSSWebpackPlugin;
exports.virtualLoaderName = virtualLoaderName;
//# sourceMappingURL=webpack.js.map
