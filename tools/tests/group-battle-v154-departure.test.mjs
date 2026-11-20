import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const sql = fs.readFileSync(path.join(root, 'database/party_group_battle_phase4_v154.sql'), 'utf8');
const ui = fs.readFileSync(path.join(root, 'systems/party/party-ui.js'), 'utf8');

test('turn barrier counts only living members still in the party', () => {
  assert.match(sql, /from public\.party_members pm\s+where pm\.party_id=v_party\s+and coalesce\(\(hpmap->>pm\.user_id::text\)::integer,0\)>0/i);
});

test('departed members cannot block round completion through old action rows', () => {
  assert.match(sql, /exists\(select 1 from public\.party_members pm\s+where pm\.party_id=v_party and pm\.user_id=a\.user_id\)/i);
});

test('remaining members still receive the enemy phase and battle continues', () => {
  assert.match(sql, /elsif done_count>=alive_count and alive_count>0 then/i);
  assert.match(sql, /for m in select pm\.user_id from public\.party_members pm where pm\.party_id=v_party loop/i);
});

test('group UI keeps member-target selection and action submission', () => {
  assert.match(ui, /data-party-target/);
  assert.match(ui, /combat\.act\(button\.dataset\.battleAction, this\.selectedMonsterIndex\)/);
});
