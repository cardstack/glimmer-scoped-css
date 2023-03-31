import { LoaderContext } from 'webpack';
import postcss from 'postcss';
import scopedStylesPlugin from './postcss-plugin';

export default function virtualLoader(this: LoaderContext<unknown>) {
  let cssFileAndSelectorString = this.loaders[this.loaderIndex]?.options;

  if (typeof cssFileAndSelectorString !== 'string') {
    throw new Error(
      `glimmer-scoped-css/src/virtual-loader received unexpected request: ${cssFileAndSelectorString}`
    );
  }

  let cssFileAndSelector = new URLSearchParams(cssFileAndSelectorString);

  let cssFile = cssFileAndSelector.get('file');

  if (!cssFile) {
    throw new Error(
      `glimmer-scoped-css/src/virtual-loader missing file parameter: ${cssFileAndSelectorString}`
    );
  }

  let cssSelector = cssFileAndSelector.get('selector');

  if (!cssSelector) {
    throw new Error(
      `glimmer-scoped-css/src/virtual-loader missing selector parameter: ${cssFileAndSelectorString}`
    );
  }

  let cssSource = atob(cssFile);
  let result = postcss([scopedStylesPlugin(cssSelector)]).process(cssSource);

  return result.css;
}
