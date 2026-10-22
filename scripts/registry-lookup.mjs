import { execFileSync } from 'node:child_process';

function runNpmView(spec) {
  return execFileSync(
    'npm',
    [
      'view',
      spec,
      'name',
      'version',
      '--json',
      '--registry=https://registry.npmjs.org/',
      '--fetch-retries=1',
      '--fetch-timeout=30000',
    ],
    {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
      timeout: 45_000,
      shell: process.platform === 'win32',
    },
  );
}

export async function isPublishedOnNpm(
  name,
  version,
  {
    runView = runNpmView,
    sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
    attempts = 3,
  } = {},
) {
  const spec = `${name}@${version}`;

  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      const result = JSON.parse(runView(spec));
      if (result.name !== name || result.version !== version) {
        throw new Error(`${spec}: unexpected registry response`);
      }
      return true;
    } catch (error) {
      if (error.message?.startsWith(`${spec}:`)) throw error;
      let registryError;
      try {
        registryError = JSON.parse(error.stdout?.toString() ?? '{}').error;
      } catch {
        // A transport error may not have JSON output.
      }
      if (registryError?.code === 'E404') return false;
      if (registryError?.code === 'E403' || registryError?.code === 'E401') {
        throw new Error(`${spec}: npm registry returned ${registryError.code}`);
      }
      if (attempt === attempts) {
        throw new Error(
          `${spec}: npm registry lookup failed after ${attempts} attempts${registryError?.code ? ` (${registryError.code})` : ''}`,
        );
      }
    }
    await sleep(1_000 * 2 ** (attempt - 1));
  }
}
