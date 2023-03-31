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

  // TODO add error handling when expected parameters are not present

  let cssSource = atob(cssFileAndId.get('file')!);
  let result = postcss([scopedStylesPlugin(cssFileAndId.get('id')!)]).process(
    cssSource
  );

  return result.css;
}
