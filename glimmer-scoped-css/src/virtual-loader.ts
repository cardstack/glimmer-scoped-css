import { LoaderContext } from 'webpack';
import postcss from 'postcss';
import scopedStylesPlugin from './postcss-plugin';

export default function virtualLoader(this: LoaderContext<unknown>) {
  let encodedCSS = this.loaders[this.loaderIndex]?.options;

  if (typeof encodedCSS !== 'string') {
    throw new Error(
      `glimmer-scoped-css/src/virtual-loader received unexpected request: ${encodedCSS}`
    );
  }
  let cssSource = atob(encodedCSS);
  let result = postcss([scopedStylesPlugin('id')]).process(cssSource)
  return result.css;

}
