import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const root = process.cwd();
const scanRoots = ['src', 'supabase'].filter((directory) => existsSync(join(root, directory)));
const patterns = [
  /sk_live_[A-Za-z0-9]{8,}/,
  /sk_test_[A-Za-z0-9]{8,}/,
  /pk_live_[A-Za-z0-9]{8,}/,
  /AKIA[0-9A-Z]{16}/,
  /SG\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}/,
  /sk-[A-Za-z0-9]{20,}/,
  /AIza[0-9A-Za-z_-]{35}/,
  /xox[baprs]-[0-9A-Za-z-]{10,}/,
  /postgres:\/\/[^\s"']+:[^\s"']+@/,
  /mongodb(\+srv)?:\/\/[^\s"']+:[^\s"']+@/,
  /mysql:\/\/[^\s"']+:[^\s"']+@/,
  /service_role/,
  /JWT_SECRET\s*=\s*["'][^"' ]{8,}/,
];

const files = (directory) => readdirSync(directory).flatMap((entry) => {
  const path = join(directory, entry);
  return statSync(path).isDirectory() ? files(path) : [path];
});

const violations = [];
scanRoots.flatMap((directory) => files(join(root, directory))).forEach((file) => {
  const content = readFileSync(file, 'utf8');
  patterns.forEach((pattern) => {
    const match = content.match(pattern);
    if (match) violations.push(`${relative(root, file)}: ${pattern}`);
  });
});

if (violations.length) {
  console.error('[secrets-scan] potential secrets found:\n' + violations.join('\n'));
  process.exit(1);
}

console.log('[secrets-scan] OK — no hardcoded secrets detected.');
