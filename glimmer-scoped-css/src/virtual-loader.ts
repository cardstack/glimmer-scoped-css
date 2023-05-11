import { LoaderContext } from 'webpack';
import postcss from 'postcss';
import scopedStylesPlugin from './postcss-plugin';

export default function virtualLoader(this: LoaderContext<unknown>) {
  let encodedCssAndSelectorString = this.loaders[this.loaderIndex]?.options;

  if (typeof encodedCssAndSelectorString !== 'string') {
    throw new Error(
      `glimmer-scoped-css/src/virtual-loader received unexpected request: ${encodedCssAndSelectorString}`
    );
  }

  let encodedCssAndSelector = new URLSearchParams(encodedCssAndSelectorString);

  let encodedCss = encodedCssAndSelector.get('file');

  if (!encodedCss) {
    throw new Error(
      `glimmer-scoped-css/src/virtual-loader missing file parameter: ${encodedCssAndSelectorString}`
    );
  }

  let cssSelector = encodedCssAndSelector.get('selector');

  if (!cssSelector) {
    throw new Error(
      `glimmer-scoped-css/src/virtual-loader missing selector parameter: ${encodedCssAndSelectorString}`
    );
  }

  let cssSource = atob(decodeURIComponent(encodedCss));
  let result = postcss([scopedStylesPlugin(cssSelector)]).process(cssSource);

  return result.css;
}
