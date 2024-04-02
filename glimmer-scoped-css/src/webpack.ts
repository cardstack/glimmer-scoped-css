import type { Compiler, Module, ResolveData } from 'webpack';
import { resolve, dirname } from 'path';
import { decodeScopedCSSRequest, isScopedCSSRequest } from '.';

type CB = (err: null | Error, result?: Module | undefined) => void;
export const virtualLoaderName = 'glimmer-scoped-css/virtual-loader';
const virtualLoaderPath = 'glimmer-scoped-css/dist/virtual-loader.js';

export class GlimmerScopedCSSWebpackPlugin {
  private addLoaderAlias(compiler: Compiler, name: string, alias: string) {
    let { resolveLoader } = compiler.options;
    if (Array.isArray(resolveLoader.alias)) {
      resolveLoader.alias.push({ name, alias });
    } else if (resolveLoader.alias) {
      resolveLoader.alias[name] = alias;
    } else {
      resolveLoader.alias = {
        [name]: alias,
      };
    }
  }

  apply(compiler: Compiler) {
    this.addLoaderAlias(
      compiler,
      virtualLoaderName,
      resolve(__dirname, './virtual-loader'),
    );

    compiler.hooks.normalModuleFactory.tap('glimmer-scoped-css', (nmf) => {
      nmf.hooks.resolve.tapAsync(
        { name: 'glimmer-scoped-css' },
        (state: ResolveData, callback: CB) => {
          if (!state.request.startsWith('!')) {
            if (!state.contextInfo.issuer) {
              // when the files emitted from our virtual-loader try to import things,
              // those requests show in webpack as having no issuer. But we can see here
              // which requests they are and adjust the issuer so they resolve things from
              // the correct logical place.
              let filename = identifyVirtualFile(state);
              if (filename) {
                state.contextInfo.issuer = filename;
                state.context = dirname(filename);
              }
            }

            if (
              state.contextInfo.issuer !== '' &&
              isScopedCSSRequest(state.request)
            ) {
              state.request = `style-loader!css-loader!glimmer-scoped-css/virtual-loader?filename=${resolve(
                dirname(state.contextInfo.issuer),
                state.request,
              )}!`;
            }
          }
          callback(null, undefined);
        },
      );
    });
  }
}

function identifyVirtualFile(state: ResolveData): string | undefined {
  for (let dep of state.dependencies) {
    let userRequest = (dep as any)._parentModule?.userRequest as
      | string
      | undefined;

    if (!userRequest?.includes(virtualLoaderPath)) {
      // early return when our loader can't appear at all
      return;
    }

    for (let part of userRequest.split('!')) {
      let url = new URL(part, 'http://not-a-real-origin');
      if (url.pathname.endsWith(virtualLoaderPath)) {
        let filename = url.searchParams.get('filename');
        if (filename && isScopedCSSRequest(filename)) {
          let { fromFile } = decodeScopedCSSRequest(filename);
          return fromFile;
        }
      }
    }
  }
}
