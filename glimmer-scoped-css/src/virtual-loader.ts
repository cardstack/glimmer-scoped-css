import { LoaderContext } from 'webpack';

export default function virtualLoader(this: LoaderContext<unknown>) {
  let encodedCSS = this.loaders[this.loaderIndex]?.options;

  if (typeof encodedCSS === 'string') {
    return atob(encodedCSS);
  }
  throw new Error(
    `glimmer-scoped-css/src/virtual-loader received unexpected request: ${encodedCSS}`
  );
}
