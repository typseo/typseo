import { describe, expect, it } from 'vitest';
import {
  checkPackedDependencies,
  orderReleasePackages,
} from './release-plan.mjs';

function manifest(name, dependencies = {}) {
  return {
    name,
    version: '0.1.0-beta.1',
    publishConfig: { access: 'public', tag: 'beta' },
    dependencies,
  };
}

describe('release ordering', () => {
  it('stages internal dependencies before dependents', () => {
    const packages = [
      manifest('@typseo/ui', {
        '@typseo/ai': 'workspace:*',
        '@typseo/core': 'workspace:*',
        '@typseo/react': 'workspace:*',
      }),
      manifest('@typseo/react'),
      manifest('@typseo/ai'),
      manifest('@typseo/core'),
    ];
    const names = orderReleasePackages(packages).map(({ name }) => name);
    expect(names.at(-1)).toBe('@typseo/ui');
    expect(names.slice(0, -1).sort()).toEqual([
      '@typseo/ai',
      '@typseo/core',
      '@typseo/react',
    ]);
  });

  it('rejects missing dependencies and cycles', () => {
    expect(() =>
      orderReleasePackages([
        manifest('@typseo/ui', { '@typseo/core': 'workspace:*' }),
      ]),
    ).toThrow('Missing workspace package');
    expect(() =>
      orderReleasePackages([
        manifest('@typseo/core', { '@typseo/ui': 'workspace:*' }),
        manifest('@typseo/ui', { '@typseo/core': 'workspace:*' }),
      ]),
    ).toThrow('Circular dependency');
  });
});

describe('packed release dependencies', () => {
  const packages = [manifest('@typseo/core'), manifest('@typseo/next')];

  it('accepts exact published workspace versions', () => {
    expect(() =>
      checkPackedDependencies(
        {
          name: '@typseo/next',
          dependencies: { '@typseo/core': '0.1.0-beta.1' },
        },
        packages,
      ),
    ).not.toThrow();
  });

  it.each(['workspace:*', '0.1.0-beta.0'])('rejects %s', (range) => {
    expect(() =>
      checkPackedDependencies(
        { name: '@typseo/next', dependencies: { '@typseo/core': range } },
        packages,
      ),
    ).toThrow();
  });
});
