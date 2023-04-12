import type { Compiler } from 'webpack';
import { resolve } from 'path';
import fs from 'fs';

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
    // Look for the rule that applies to CSS, currently called isCSS:
    // https://github.com/embroider-build/embroider/blob/3a9d8ade05e92b65045a01d59898f063e337fcd1/packages/webpack/src/ember-webpack.ts#L262-L263

    let cssRules = compiler.options.module.rules.find(
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      (rule) => 'test' in rule && rule.test.toString().includes('isCSS')
    );

    if (cssRules) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      let cssLoaders = cssRules.use.map(
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        (loader) => loader.loader
      );

      let filePath = 'css-loaders.json';

      // TODO what hook is most appropriate?
      compiler.hooks.afterCompile.tapAsync(
        'GlimmerScopedCSSWebpackPlugin',
        async (_compilation, callback) => {
          try {
            await fs.promises.access(filePath);
            await fs.promises.unlink(filePath);
            console.log('File deleted successfully');
          } catch (error: any) {
            console.log('Error deleting css-loaders.json', error);
          }

          await fs.promises.writeFile(
            filePath,
            JSON.stringify(cssLoaders, null, 2)
          );

          callback();
        }
      );
    }

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
