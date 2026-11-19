import { spawnSync } from 'node:child_process';
const result = spawnSync(process.execPath, ['tools/validate-content.mjs'], { encoding: 'utf8' });
if (result.status !== 0) {
  process.stderr.write(result.stderr || result.stdout);
  process.exit(result.status || 1);
}
if (!result.stdout.includes('Cross-references: valid.')) throw new Error('Validator did not report cross-reference validation');
console.log('Content validator smoke test passed.');
