import { defineExtension, type MediaEntry } from 'azot';

const getFilename = (url: string) => url.split('/').pop()?.replace('.mpd', '');

const findDashManifestUrl = (html: string) =>
  html.split(/['"]/).find((value) => value.startsWith('https://') && value.endsWith('.mpd'));

export default defineExtension({
  async getEntries({ url }): Promise<MediaEntry[]> {
    // https://bitmovin.com/demos/stream-test?format=dash
    const response = await fetch(url);
    const html = await response.text();

    // https://cdn.bitmovin.com/content/assets/art-of-motion-dash-hls-progressive/mpds/f08e80da-bf1d-4e3d-8899-f0f6155f6efa.mpd
    const manifestUrl = findDashManifestUrl(html);
    if (!manifestUrl) return [];

    return [
      {
        title: getFilename(manifestUrl) ?? 'Bitmovin Stream Test',
        source: { url: manifestUrl },
      },
    ];
  },
});
