import { createUnplugin } from 'unplugin';

const PREFIX = 'glimmer-scoped-css/';

export const unplugin = createUnplugin(() => {
  return {
    name: 'unplugin-glimmer-scoped-css',

    async resolveId(source, importer) {
      if (!source.startsWith(PREFIX) || !importer) {
        return null;
      }

      return {
        id: source,
        moduleSideEffects: true,
      };
    },

    load(id) {
      if (!id.startsWith(PREFIX) || !id.endsWith('.css')) {
        return null;
      }
      let content = decodeURIComponent(
        id.slice(PREFIX.length, '.css'.length * -1)
      );
      return content;
    },
  };
});
