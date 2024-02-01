import { LoaderContext } from 'webpack';
import { decodeScopedCSSRequest } from '.';
import { dirname } from 'path';

export default function virtualLoader(this: LoaderContext<unknown>) {
  let optionsString = this.loaders[this.loaderIndex]?.options;

  if (typeof optionsString !== 'string') {
    throw new Error(
      `glimmer-scoped-css/src/virtual-loader received unexpected request: ${optionsString}`
    );
  }

  let options = new URLSearchParams(optionsString);

  let filename = options.get('filename');

  if (!filename) {
    throw new Error(
      `glimmer-scoped-css/src/virtual-loader missing filename parameter: ${optionsString}`
    );
  }

  this.resourcePath = filename;
  this.context = dirname(filename);

  return decodeScopedCSSRequest(filename).css;
}
