import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const game = fs.readFileSync(path.join(root, 'game.js'), 'utf8');
const runtime = fs.readFileSync(path.join(root, 'systems/content/region-one-runtime.js'), 'utf8');
const sql = fs.readFileSync(path.join(root, 'database/party_monster_xp_by_hp_v1647.sql'), 'utf8');
const monsters = JSON.parse(fs.readFileSync(path.join(root, 'content/packs/region_one_master_v2/monsters/monsters.json'), 'utf8'));
const tower = JSON.parse(fs.readFileSync(path.join(root, 'content/packs/region_one_master_v2/tower/tower_encounters.json'), 'utf8'));

const match = game.match(/function monsterXpFromHp\(definition, combatEnemy\)\s*\{([\s\S]*?)\n  \}/);
assert.ok(match, 'central solo-battle XP helper exists');
const xpFromHp = new Function('definition', 'combatEnemy', 'state', 'ETRANOM_REGION_CONTENT', match[1]);
const regionOneZones = ['burnt_forest','thorn_grove','ash_hills','southern_plains','vardash_river','rootbound_ruins'].map(id => ({id}));

assert.equal(xpFromHp({}, { maxHp: 15 }, {character:{level:1}}, regionOneZones), 1, '15 HP gives 1 XP before the region-one level gate');
assert.equal(xpFromHp({}, { maxHp: 30 }, {character:{level:1}}, regionOneZones), 2, '30 HP gives 2 XP');
assert.equal(xpFromHp({}, { maxHp: 14 }, {character:{level:1}}, regionOneZones), 1, 'every eligible monster gives at least 1 XP');
assert.equal(xpFromHp({ hp: 270 }, { maxHp: 400 }, {character:{level:1}}, regionOneZones), 26, 'scaled encounter max HP is authoritative');
assert.equal(xpFromHp({ stats: { hp: 150 } }, {}, {character:{level:1}}, regionOneZones), 10, 'definition stats HP is a fallback');
assert.equal(xpFromHp({regionId:'burnt_forest',hp:150}, {maxHp:150}, {character:{level:5}}, regionOneZones), 1, 'region-one enemies retain the 1 XP minimum at level 5+');
assert.equal(xpFromHp({regionId:'thorn_grove',hp:1500}, {maxHp:1500}, {character:{level:5}}, regionOneZones), 2, 'all region-one zones retain only 2 percent XP at level 5+');
assert.equal(xpFromHp({regionId:'region_two_zone_1',hp:150}, {maxHp:150}, {character:{level:5}}, regionOneZones), 10, 'future regions still grant HP-derived XP');
assert.match(game, /xp\+=monsterXpFromHp\(def,e\)/, 'solo victory rewards use the HP formula');
assert.match(game, /e\.xp=monsterXpFromHp\(e,e\)/, 'tower floor encounter XP is also normalized');
assert.match(runtime, /xp: Math\.max\(1, Math\.floor\(Math\.max\(1, Number\(stats\.hp \|\| monster\.hp \|\| 15\)\) \/ 15\)\)/, 'runtime monster catalog exposes HP-derived XP');
assert.match(runtime, /xp: Math\.max\(1, Math\.floor\(Math\.max\(1, hp\) \/ 15\)\)/, 'runtime tower monsters expose HP-derived XP');

for (const monster of [...monsters, ...tower]) {
  const hp = Number(monster.stats?.hp || monster.hp || monster.maxHp || 15);
  assert.equal(Number(monster.xp), Math.max(1, Math.floor(hp / 15)), `${monster.id} catalog XP matches max HP`);
}

const regionOne = monsters.filter(m => m.region_id === 'burnt_forest' && m.kind === 'normal');
const regionTwo = monsters.filter(m => m.region_id === 'thorn_grove' && m.kind === 'normal');
const regionThree = monsters.filter(m => m.region_id === 'ash_hills' && m.kind === 'normal');
assert.ok(Math.min(...regionTwo.map(m => m.xp)) > Math.min(...regionOne.map(m => m.xp)), 'region 2 normal mobs outscale region 1 by HP');
assert.ok(Math.min(...regionThree.map(m => m.xp)) > Math.min(...regionTwo.map(m => m.xp)), 'region 3 normal mobs outscale region 2 by HP');

assert.match(sql, /etranom_monster_xp_from_hp\(monster\)/, 'group battle uses the shared HP rule');
assert.match(sql, /nullif\(p_monster->>'max_hp',''\)::numeric/, 'group battle prefers max_hp');
assert.match(sql, /floor\(greatest\(1, coalesce\([\s\S]*?\) \/ 15\)::integer/, 'group battle base reward applies 1 XP per 15 HP');
const currentPartyXpSql = fs.readFileSync(path.join(root, 'database/party_region_one_xp_scaling_v1853.sql'), 'utf8');
assert.match(currentPartyXpSql, /floor\(v_base_xp\*0\.02\)::integer/, 'group battle reduces region-one XP to 2 percent at level 5+');
assert.doesNotMatch(currentPartyXpSql, /return 0;/, 'group battle never disables region-one XP entirely');
assert.match(sql, /on conflict\(session_id,monster_index\) do nothing/, 'group reward idempotency remains intact');
assert.match(sql, /party_battle_retreats/, 'group retreat support remains intact');

console.log('PASS: monster XP-by-HP and level-5 region scaling checks');
