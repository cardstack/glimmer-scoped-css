import { LoaderContext } from 'webpack';
import postcss from 'postcss';
import scopedStylesPlugin from './postcss-plugin';

export default function virtualLoader(this: LoaderContext<unknown>) {
  let cssFileAndIdString = this.loaders[this.loaderIndex]?.options;

  if (typeof cssFileAndIdString !== 'string') {
    throw new Error(
      `glimmer-scoped-css/src/virtual-loader received unexpected request: ${cssFileAndIdString}`
    );
  }

  let cssFileAndId = new URLSearchParams(cssFileAndIdString);

  let cssFile = cssFileAndId.get('file');

  if (!cssFile) {
    throw new Error(
      `glimmer-scoped-css/src/virtual-loader missing file parameter: ${cssFileAndIdString}`
    );
  }

  let cssSelector = cssFileAndId.get('id');

  if (!cssSelector) {
    throw new Error(
      `glimmer-scoped-css/src/virtual-loader missing selector parameter: ${cssFileAndIdString}`
    );
  }

  let cssSource = atob(cssFile);
  let result = postcss([scopedStylesPlugin(cssSelector)]).process(cssSource);

  return result.css;
}
