import pluginGenerator from './ast-transform';

export function installScopedCSS(registry: any, cssLoaders?: string) {
  registry.add('htmlbars-ast-plugin', buildASTPlugin(cssLoaders));
}

export function buildASTPlugin(cssLoaders?: string) {
  return {
    name: 'glimmer-scoped-css',
    plugin: pluginGenerator(cssLoaders),
    baseDir: function () {
      return __dirname;
    },
    parallelBabel: {
      requireFile: __filename,
      buildUsing: 'buildASTPlugin',
      params: {},
    },
  };
}
