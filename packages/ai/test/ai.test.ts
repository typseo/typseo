import { describe, expect, it, vi } from 'vitest';
import { validateAiEditRequest } from '../src/index.js';
import { createOpenAiCompatibleProvider } from '../src/server.js';

describe('AI request and provider', () => {
  it('validates command, bounds, and optional context', () => {
    expect(
      validateAiEditRequest({ command: 'clarity', text: 'A passage' }),
    ).toEqual({ command: 'clarity', text: 'A passage' });
    expect(() =>
      validateAiEditRequest({ command: 'other', text: 'A' }),
    ).toThrow();
    expect(() => validateAiEditRequest({ command: 'seo', text: '' })).toThrow();
    expect(() =>
      validateAiEditRequest({ command: 'seo', text: 'x'.repeat(10_001) }),
    ).toThrow();
    expect(() =>
      validateAiEditRequest({ command: 'custom', text: 'A' }),
    ).toThrow();
    expect(() =>
      validateAiEditRequest({
        command: 'clarity',
        text: 'A',
        context: { title: 5 },
      }),
    ).toThrow();
  });

  it('sends a server-side request through an injected transport', async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(
        JSON.stringify({
          choices: [{ message: { content: ' Better passage. ' } }],
        }),
        { status: 200 },
      ),
    );
    const provider = createOpenAiCompatibleProvider({
      apiKey: 'test-only',
      model: 'test-model',
      fetcher,
    });
    const result = await provider.generateEdit({
      command: 'clarity',
      text: 'A passage',
    });
    expect(result).toEqual({ replacement: 'Better passage.' });
    const options = fetcher.mock.calls[0]?.[1];
    expect(options?.method).toBe('POST');
    expect(options?.cache).toBe('no-store');
    expect(String(options?.body)).toContain('test-model');
    expect(() =>
      createOpenAiCompatibleProvider({
        apiKey: 'x',
        model: 'm',
        endpoint: 'http://example.com',
      }),
    ).toThrow('HTTPS');
  });

  it('rejects failed and malformed provider responses', async () => {
    const failed = createOpenAiCompatibleProvider({
      apiKey: 'x',
      model: 'm',
      fetcher: vi.fn().mockResolvedValue(new Response('', { status: 429 })),
    });
    await expect(
      failed.generateEdit({ command: 'seo', text: 'A' }),
    ).rejects.toThrow('429');
    const malformed = createOpenAiCompatibleProvider({
      apiKey: 'x',
      model: 'm',
      fetcher: vi.fn().mockResolvedValue(Response.json({ choices: [] })),
    });
    await expect(
      malformed.generateEdit({ command: 'seo', text: 'A' }),
    ).rejects.toThrow('invalid text');
  });
});
