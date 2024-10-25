import { decodeScopedCSSRequest, isScopedCSSRequest } from './index';
import { createHash } from 'crypto';
import { Plugin } from 'rollup';
import path from 'path';

export function scopedCSS(): Plugin {
  return {
    name: 'scoped-css',
    resolveId(source, importer) {
      if (!isScopedCSSRequest(source) || !importer) {
        return null;
      }
      let hash = createHash('md5');
      hash.update(source);
      let cssFileName = hash.digest('hex').slice(0, 10) + '.css';
      let { css } = decodeScopedCSSRequest(source);
      return {
        id: path.resolve(path.dirname(importer), cssFileName),
        meta: {
          'scoped-css': {
            css,
          },
        },
      };
    },
    load(id: string) {
      let meta = this.getModuleInfo(id)?.meta?.['scoped-css'];
      if (meta) {
        return meta.css;
      }
    },
  };
}
