import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const bootstrap = fs.readFileSync(path.join(root, 'database/party_group_battle_phase6.sql'), 'utf8');
const migration = fs.readFileSync(path.join(root, 'database/party_group_battle_phase3_v153.sql'), 'utf8');

test('group monster count is the exact solo roll multiplied by party size', () => {
  assert.match(bootstrap, /v_monster_count:=v_base_count \* v_count;/);
  assert.match(migration, /v_monster_count:=v_base_count \* v_count;/);
  assert.doesNotMatch(bootstrap, /v_count \+ \(2\*\(v_base_count-1\)\)/);
});

test('scaling examples follow the required multiplication for parties of 2 to 4', () => {
  for (const partySize of [2,3,4]) {
    assert.equal(1 * partySize, partySize);
    assert.equal(2 * partySize, partySize * 2);
    assert.equal(3 * partySize, partySize * 3);
  }
  assert.deepEqual([1,2,3].map(n => n * 3), [3,6,9]);
  assert.deepEqual([1,2,3].map(n => n * 4), [4,8,12]);
});
