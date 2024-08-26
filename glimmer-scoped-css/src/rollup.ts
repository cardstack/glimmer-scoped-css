import { decodeScopedCSSRequest, isScopedCSSRequest } from './index';
import { createHash } from 'crypto';
import { Plugin } from 'rollup';
import path from 'path';

export function scopedCSS(srcDir: string): Plugin {
  return {
    name: 'scoped-css',
    resolveId(source, importer) {
      if (!isScopedCSSRequest(source) || !importer) {
        return null;
      }
      let hash = createHash('md5');
      let fullSrcDir = path.resolve(srcDir);
      let localPath = path.relative(fullSrcDir, importer);
      hash.update(source);
      let cssFileName = hash.digest('hex').slice(0, 10) + '.css';
      let dir = path.dirname(localPath);
      let cssAndFile = decodeScopedCSSRequest(source);
      return {
        id: path.resolve(path.dirname(importer), cssFileName),
        meta: {
          'scoped-css': {
            css: cssAndFile.css,
            fileName: path.join(dir, cssFileName),
          },
        },
        external: 'relative',
      };
    },
    generateBundle() {
      for (const moduleId of this.getModuleIds()) {
        let info = this.getModuleInfo(moduleId);
        if (info?.meta['scoped-css']) {
          this.emitFile({
            type: 'asset',
            fileName: info.meta['scoped-css'].fileName,
            source: info.meta['scoped-css'].css,
          });
        }
      }
    },
  };
}
