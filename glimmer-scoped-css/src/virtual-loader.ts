import { LoaderContext } from 'webpack';
import postcss from 'postcss';
import scopedStylesPlugin from './postcss-plugin';

export default function virtualLoader(this: LoaderContext<unknown>) {
  let optionsString = this.loaders[this.loaderIndex]?.options;

  if (typeof optionsString !== 'string') {
    throw new Error(
      `glimmer-scoped-css/src/virtual-loader received unexpected request: ${optionsString}`
    );
  }

  let options = new URLSearchParams(optionsString);

  let encodedCss = options.get('css');

  if (!encodedCss) {
    throw new Error(
      `glimmer-scoped-css/src/virtual-loader missing file parameter: ${optionsString}`
    );
  }

  let cssSelector = options.get('selector');

  if (!cssSelector) {
    throw new Error(
      `glimmer-scoped-css/src/virtual-loader missing selector parameter: ${optionsString}`
    );
  }

  let path = options.get('path');

  if (!path) {
    throw new Error(
      `glimmer-scoped-css/src/virtual-loader missing path parameter: ${optionsString}`
    );
  }

  let cssSource = atob(decodeURIComponent(encodedCss));
  let result = postcss([scopedStylesPlugin(cssSelector)]).process(cssSource);

  this.resourcePath = path;

  return result.css;
}
