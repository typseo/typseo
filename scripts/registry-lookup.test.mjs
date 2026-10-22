import { describe, expect, it, vi } from 'vitest';
import { isPublishedOnNpm } from './registry-lookup.mjs';

const name = '@typseo/core';
const version = '0.1.0-beta.0';

describe('npm registry lookup', () => {
  it('recognizes an existing package version', async () => {
    const runView = vi.fn().mockReturnValue(JSON.stringify({ name, version }));
    expect(await isPublishedOnNpm(name, version, { runView })).toBe(true);
    expect(runView).toHaveBeenCalledWith('@typseo/core@0.1.0-beta.0');
  });

  it('treats E404 as an unpublished version without retrying', async () => {
    const runView = vi.fn(() => {
      throw { stdout: JSON.stringify({ error: { code: 'E404' } }) };
    });
    expect(await isPublishedOnNpm(name, version, { runView })).toBe(false);
    expect(runView).toHaveBeenCalledTimes(1);
  });

  it('retries a transport error and a server error', async () => {
    const runView = vi
      .fn()
      .mockImplementationOnce(() => {
        throw new Error('temporary timeout');
      })
      .mockImplementationOnce(() => {
        throw { stdout: JSON.stringify({ error: { code: 'E500' } }) };
      })
      .mockReturnValue(JSON.stringify({ name, version }));
    const sleep = vi.fn();
    expect(await isPublishedOnNpm(name, version, { runView, sleep })).toBe(
      true,
    );
    expect(runView).toHaveBeenCalledTimes(3);
    expect(sleep.mock.calls).toEqual([[1_000], [2_000]]);
  });

  it('fails closed after repeated network errors', async () => {
    const runView = vi.fn(() => {
      throw new Error('network down');
    });
    await expect(
      isPublishedOnNpm(name, version, { runView, sleep: vi.fn() }),
    ).rejects.toThrow('lookup failed after 3 attempts');
    expect(runView).toHaveBeenCalledTimes(3);
  });

  it('does not retry an invalid identity or authorization error', async () => {
    const runView = vi
      .fn()
      .mockReturnValueOnce(JSON.stringify({ name, version: '0.1.0-beta.1' }));
    await expect(isPublishedOnNpm(name, version, { runView })).rejects.toThrow(
      'unexpected registry response',
    );
    expect(runView).toHaveBeenCalledTimes(1);

    runView.mockImplementation(() => {
      throw { stdout: JSON.stringify({ error: { code: 'E403' } }) };
    });
    await expect(isPublishedOnNpm(name, version, { runView })).rejects.toThrow(
      'npm registry returned E403',
    );
    expect(runView).toHaveBeenCalledTimes(2);
  });
});
