import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

function git(args, encoding = 'utf8') {
  return execFileSync('git', args, { encoding, maxBuffer: 20 * 1024 * 1024 });
}

const prohibitedSegments = new Set([
  'agents.md',
  'claude.md',
  '.claude',
  '.codex',
  '.cursor',
  'local_only_do_not_commit',
]);
const credentialNames = new Set(['credentials.json', 'secrets.json']);

export function isProhibitedPath(path) {
  const segments = path.replaceAll('\\', '/').toLowerCase().split('/');
  const name = segments.at(-1) ?? '';
  if (
    segments.some(
      (segment) =>
        prohibitedSegments.has(segment) || segment.startsWith('.aider'),
    )
  )
    return true;
  if (
    name === '.env' ||
    (name.startsWith('.env.') &&
      !['.env.example', '.env.sample', '.env.template'].includes(name))
  )
    return true;
  if (credentialNames.has(name) || /\.(?:pem|p12|pfx)$/.test(name)) return true;
  if (/^id_(?:rsa|ed25519)/.test(name)) return true;
  return false;
}

export function hasLikelySecret(text) {
  const patterns = [
    /-----BEGIN (?:OPENSSH|RSA|EC|DSA) PRIVATE KEY-----/,
    /gh[pousr]_[A-Za-z0-9_]{30,}/,
    /github_pat_[A-Za-z0-9_]{30,}/,
    /sk-[A-Za-z0-9_-]{30,}/,
    /(?:api[_-]?key|access[_-]?token|client[_-]?secret|password)\s*[:=]\s*['"]?[A-Za-z0-9_\/+=.-]{20,}/i,
  ];
  return patterns.some((pattern) => pattern.test(text));
}

function main(mode) {
  if (!['--staged', '--tracked'].includes(mode)) {
    console.error(
      'Usage: node scripts/check-git-safety.mjs --staged|--tracked',
    );
    process.exitCode = 2;
    return;
  }
  const rawPaths =
    mode === '--staged'
      ? git(['diff', '--cached', '--name-only', '-z', '--diff-filter=ACMR'])
      : git(['ls-files', '-z']);
  const paths = rawPaths.split('\0').filter(Boolean);
  const failures = [];
  for (const path of paths) {
    if (isProhibitedPath(path)) {
      failures.push(`${path}: prohibited path`);
      continue;
    }
    const bytes =
      mode === '--staged'
        ? git(['show', `:${path}`], 'buffer')
        : readFileSync(path);
    if (bytes.includes(0)) continue;
    if (hasLikelySecret(bytes.toString('utf8')))
      failures.push(`${path}: possible secret`);
  }
  if (failures.length) {
    console.error(
      'Git safety check failed:\n' +
        failures.map((item) => `- ${item}`).join('\n'),
    );
    process.exitCode = 1;
    return;
  }
  console.log(
    `Git safety check passed (${paths.length} ${mode === '--staged' ? 'staged' : 'tracked'} files).`,
  );
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href)
  main(process.argv[2]);
