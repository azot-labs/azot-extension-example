import { invoke, packedManifest } from 'azot/vitest';
import { afterEach, expect, test, vi } from 'vitest';
import extension from './main.ts';

const PAGE_URL = 'https://bitmovin.com/demos/stream-test?format=dash';
const MANIFEST_URL =
  'https://cdn.bitmovin.com/content/assets/art-of-motion-dash-hls-progressive/mpds/f08e80da-bf1d-4e3d-8899-f0f6155f6efa.mpd';

afterEach(() => {
  vi.restoreAllMocks();
});

test('packs the Bitmovin provider metadata into a v3 manifest', () => {
  expect(packedManifest(extension)).toEqual({
    manifestVersion: 1,
    apiVersion: 3,
    title: 'Azot Extension Example',
    icon: 'https://bitmovin.com/wp-content/uploads/2023/11/bitmovin_favicon.svg',
    modules: {
      bitmovin: { kind: 'provider', matches: ['https://*.bitmovin.com/*'] },
    },
  });
});

test('lists a Bitmovin DASH entry with a direct source', async () => {
  const fetchSpy = vi
    .spyOn(globalThis, 'fetch')
    .mockResolvedValue(new Response(`player.load('${MANIFEST_URL}')`));

  const entries = await invoke(() => extension.bitmovin.list({ url: PAGE_URL, options: {} }));

  expect(fetchSpy).toHaveBeenCalledWith(PAGE_URL);
  expect(entries).toEqual([
    {
      title: 'f08e80da-bf1d-4e3d-8899-f0f6155f6efa',
      kind: 'video',
      pageUrl: PAGE_URL,
      source: { url: MANIFEST_URL, format: 'dash' },
    },
  ]);
});

test('lists nothing when the page has no DASH manifest', async () => {
  vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('<html>No video</html>'));

  await expect(
    invoke(() => extension.bitmovin.list({ url: PAGE_URL, options: {} })),
  ).resolves.toEqual([]);
});

test('reports an HTTP failure instead of treating it as an empty page', async () => {
  vi.spyOn(globalThis, 'fetch').mockResolvedValue(
    new Response('Unavailable', { status: 503, statusText: 'Service Unavailable' }),
  );

  await expect(
    invoke(() => extension.bitmovin.list({ url: PAGE_URL, options: {} })),
  ).rejects.toMatchObject({
    code: 'MEDIA_UNAVAILABLE',
    message: 'Bitmovin page returned 503 Service Unavailable',
  });
});

test('propagates fetch failures', async () => {
  const error = new TypeError('Network unavailable');
  vi.spyOn(globalThis, 'fetch').mockRejectedValue(error);

  await expect(invoke(() => extension.bitmovin.list({ url: PAGE_URL, options: {} }))).rejects.toBe(
    error,
  );
});
