import { describe, expect, it, vi } from 'vitest';
import { AhrefsApiError, createAhrefsClient } from '../src/server.js';

describe('Ahrefs keyword adapter', () => {
  it('builds a bounded BYOK request and normalizes nullable metrics', async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(
      Response.json({
        keywords: [{ keyword: 'seo toolkit', volume: 120, difficulty: null }],
      }),
    );
    const client = createAhrefsClient({ apiKey: 'test-key', fetcher });
    expect(
      await client.keywordOverview({
        keywords: ['seo toolkit'],
        country: 'US',
      }),
    ).toEqual([{ keyword: 'seo toolkit', volume: 120, difficulty: null }]);
    const [url, options] = fetcher.mock.calls[0] ?? [];
    expect(String(url)).toContain('select=keyword%2Cvolume%2Cdifficulty');
    expect(String(url)).toContain('country=us');
    expect(options?.headers).toMatchObject({
      Authorization: 'Bearer test-key',
    });
    expect(options?.cache).toBe('no-store');
  });

  it('rejects invalid input before a paid request and exposes rate-limit status', async () => {
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValue(
        new Response('', { status: 429, headers: { 'Retry-After': '60' } }),
      );
    const client = createAhrefsClient({ apiKey: 'test-key', fetcher });
    await expect(
      client.keywordOverview({ keywords: ['a,b'], country: 'US' }),
    ).rejects.toThrow();
    expect(fetcher).not.toHaveBeenCalled();
    const failure = await client
      .keywordOverview({ keywords: ['seo'], country: 'US' })
      .catch((error: unknown) => error);
    expect(failure).toBeInstanceOf(AhrefsApiError);
    expect(failure).toMatchObject({ status: 429, retryAfter: '60' });
  });
});
