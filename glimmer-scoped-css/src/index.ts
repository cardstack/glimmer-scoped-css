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

export function isScopedCSSRequest(request: string): boolean {
  return request.endsWith('.glimmer-scoped.css');
}

const pattern = /^(.*)\.([^.]*)\.glimmer-scoped.css$/;

export function decodeScopedCSSRequest(request: string): {
  css: string;
  fromFile: string;
} {
  let m = pattern.exec(request);
  if (!m) {
    throw new Error(`not a scoped CSS request: ${request}`);
  }
  return { fromFile: m[1]!, css: atob(decodeURIComponent(m[2]!)) };
}
