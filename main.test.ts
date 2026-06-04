import { afterEach, expect, test, vi } from 'vitest';
import extension from './main';

afterEach(() => {
  vi.unstubAllGlobals();
});

test('getEntries returns Bitmovin DASH entry', async () => {
  const manifestUrl =
    'https://cdn.bitmovin.com/content/assets/art-of-motion-dash-hls-progressive/mpds/f08e80da-bf1d-4e3d-8899-f0f6155f6efa.mpd';
  const fetchMock = vi.fn<typeof fetch>(async () => new Response(`player.load('${manifestUrl}')`));
  vi.stubGlobal('fetch', fetchMock);

  const url = 'https://bitmovin.com/demos/stream-test?format=dash';
  const entries = await extension.getEntries({ url, options: {} });

  expect(fetchMock).toHaveBeenCalledWith(url);
  expect(entries).toEqual([
    {
      title: 'f08e80da-bf1d-4e3d-8899-f0f6155f6efa',
      source: { url: manifestUrl },
    },
  ]);
});
