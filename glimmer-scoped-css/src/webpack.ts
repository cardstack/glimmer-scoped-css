import type { Compiler, Module } from 'webpack';
import { resolve, dirname } from 'path';
import { isScopedCSSRequest } from '.';

type CB = (err: null | Error, result?: Module | undefined) => void;
export const virtualLoaderName = 'glimmer-scoped-css';

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
      resolve(__dirname, './virtual-loader')
    );

    compiler.hooks.normalModuleFactory.tap('glimmer-scoped-css', (nmf) => {
      nmf.hooks.resolve.tapAsync(
        { name: 'glimmer-scoped-css' },
        (state: unknown, callback: CB) => {
          if (isRelevantRequest(state) && isScopedCSSRequest(state.request)) {
            console.log(`SAW request ${state.request}`);
            state.request = `style-loader!css-loader!glimmer-scoped-css/virtual-loader?filename=${resolve(
              dirname(state.contextInfo.issuer),
              state.request
            )}!`;
          }
          callback(null, undefined);
        }
      );
    });
  }
}

interface RelevantRequest {
  request: string;
  context: string;
  contextInfo: { issuer: string };
}

function isRelevantRequest(state: any): state is RelevantRequest {
  return (
    typeof state.request === 'string' &&
    typeof state.context === 'string' &&
    typeof state.contextInfo?.issuer === 'string' &&
    state.contextInfo.issuer !== '' &&
    !state.request.startsWith('!')
  );
}
