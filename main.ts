import { defineExtension, defineProvider, ExtensionError, type Entry } from 'azot';

const getFilename = (url: string) =>
  new URL(url).pathname
    .split('/')
    .pop()
    ?.replace(/\.mpd$/, '');

const findDashManifestUrl = (html: string) =>
  html.split(/['"]/).find((value) => value.startsWith('https://') && value.endsWith('.mpd'));

export default defineExtension({
  title: 'Azot Extension Example',
  icon: 'https://bitmovin.com/wp-content/uploads/2023/11/bitmovin_favicon.svg',
  bitmovin: defineProvider({
    matches: ['https://*.bitmovin.com/*'],

    async list({ url }) {
      const response = await fetch(url);
      if (!response.ok) {
        throw new ExtensionError({
          code: 'MEDIA_UNAVAILABLE',
          message: `Bitmovin page returned ${response.status} ${response.statusText}`,
        });
      }
      const html = await response.text();
      const manifestUrl = findDashManifestUrl(html);
      if (!manifestUrl) return [];

      return [
        {
          title: getFilename(manifestUrl) || 'Bitmovin Stream Test',
          kind: 'video',
          pageUrl: url,
          source: { url: manifestUrl, format: 'dash' },
        },
      ] satisfies Entry[];
    },
  }),
});
