import type { Compiler, Module } from 'webpack';
import { resolve } from 'path';

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

type CB = (err?: null | Error, result?: Module | undefined) => void;

function isRelevantRequest(state: any): state is { request: string } {
  return typeof state.request === 'string';
}
