import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(new URL('../..', import.meta.url).pathname);
const manifestPath = path.join(root, 'assets/necromancer/companions/manifest.json');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const game = fs.readFileSync(path.join(root, 'game.js'), 'utf8');

test('Common companion manifest contains 20 unique portrait entries', () => {
  assert.equal(manifest.rank, 'common');
  assert.equal(manifest.portraits.length, 20);
  assert.equal(new Set(manifest.portraits.map(x => x.id)).size, 20);
});

test('Every manifest portrait points to a non-empty WebP file', () => {
  for (const entry of manifest.portraits) {
    const file = path.join(root, entry.path);
    assert.ok(fs.existsSync(file), `missing ${entry.path}`);
    assert.ok(fs.statSync(file).size > 1000, `empty ${entry.path}`);
    assert.equal(fs.readFileSync(file).subarray(0, 4).toString('ascii'), 'RIFF');
  }
});

test('Same portrait resolver is wired into battle and collection/profile UI', () => {
  assert.match(game, /function necromancerCompanionPortrait\(member\)/);
  assert.match(game, /const portrait=necromancerCompanionPortrait\(m\)\|\|m\.portrait/);
  assert.match(game, /const companionPortrait=necromancerCompanionPortrait\(m\)\|\|m\.portrait/);
});
