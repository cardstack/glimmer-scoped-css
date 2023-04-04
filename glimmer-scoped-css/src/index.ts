import plugin from './ast-transform';

export function installScopedCSS(registry: any) {
  registry.add('htmlbars-ast-plugin', buildASTPlugin());
}

export function buildASTPlugin() {
  return {
    name: 'glimmer-scoped-css',
    plugin,
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
