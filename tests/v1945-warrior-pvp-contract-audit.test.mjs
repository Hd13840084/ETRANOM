import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
const root = process.cwd();
const db = path.join(root, 'database');
const catalogFiles = fs.readdirSync(db).filter(x => /^party_warrior_skill_catalog_v1907_part\d+\.sql$/.test(x));
const rows = [];
for (const file of catalogFiles) {
  const text = fs.readFileSync(path.join(db,file),'utf8');
  const re = /\('([^']+)','([^']+)','((?:[^']|'')*)'::jsonb,(true|false)\)/gs;
  for (const m of text.matchAll(re)) {
    const data = JSON.parse(m[3].replace(/''/g,"'"));
    rows.push({spec:m[1],id:m[2],type:data.type,enabled:m[4]==='true'});
  }
}
const pvp = fs.readFileSync(path.join(db,'wizard_pvp_live_bridge_v1921.sql'),'utf8');
test('V1945: exactly 40 Warrior catalog skills, 10 per specialization', () => {
  assert.equal(rows.length,40);
  for (const spec of ['warrior_sword_ascetic','warrior_iron_bastion','warrior_chaos_warrior','warrior_apocalypse_harbinger'])
    assert.equal(rows.filter(x=>x.spec===spec).length,10);
});
test('V1945: DB disabled rows match repository seed (do not auto-enable)', () => {
  const disabled = rows.filter(x=>!x.enabled).map(x=>`${x.spec}:${x.id}`).sort();
  assert.deepEqual(disabled,['warrior_chaos_warrior:incompatible_vessel','warrior_sword_ascetic:echo']);
});
test('V1945: PvP RPC still has no Warrior routes or stamina guard', () => {
  assert.equal(pvp.includes('warrior_sword_ascetic'),false);
  assert.equal(pvp.includes('warrior_iron_bastion'),false);
  assert.equal(pvp.includes('warrior_apocalypse_harbinger'),false);
  assert.equal(pvp.includes('insufficient_stamina'),false);
});
test('V1945: active Warrior-only types without explicit generic PvP branch are identified', () => {
  const branches = new Set();
  for (const m of pvp.matchAll(/skill_type in \(([^)]*)\)/g)) for (const x of m[1].matchAll(/'([^']+)'/g)) branches.add(x[1]);
  const unsupported = [...new Set(rows.filter(x=>x.enabled && !branches.has(x.type) && !pvp.includes(`skill_type='${x.type}'`)).map(x=>x.type))].sort();
  assert.deepEqual(unsupported,['mark','multi_hit','self_guard','team_guard','ultimate_aoe']);
});
test('V1945: detail SQL is read-only', () => {
  const sql=fs.readFileSync(path.join(db,'ETRANOM_V1945_WARRIOR_PVP_PREFLIGHT_DETAIL_READONLY.sql'),'utf8').toLowerCase();
  assert.match(sql,/pg_get_functiondef/);
  assert.match(sql,/from public\.party_battle_skill_catalog/);
  assert.doesNotMatch(sql,/\b(insert|update|delete|alter|drop|create)\s+(into|table|function|or|public)/);
});
