import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const game = readFileSync(new URL('../game.js', import.meta.url), 'utf8');

test('V1852 sharply raises level 5+ XP requirements while preserving levels 1-4', () => {
  const match = game.match(/const LEVEL_XP_REQUIREMENTS=\[([^\]]+)\]/);
  assert.ok(match, 'XP table exists');
  const values = match[1].split(',').map(Number);
  assert.equal(values.length, 99, 'V1979 extends the curve through level 100');
  assert.deepEqual(values.slice(0, 4), [100, 2300, 3800, 5700]);
  assert.equal(values[4], 25000, 'level 5 to 6 requires 25,000 XP');
  assert.equal(values[5], 28000, 'level 6 to 7 requires 28,000 XP');
  assert.ok(values[5] > values[4] && values[5] / values[4] > 1.11);
  assert.ok(values[49] > values[48]);
  assert.ok(values[98] > values[97]);
});

test('V1853 keeps region-one XP at 2 percent from level 5 onward instead of disabling it', () => {
  assert.match(game, /if\(isRegionOneEnemy&&\(Number\(state\?\.character\?\.level\)\|\|1\)>=5\)return Math\.max\(1,Math\.floor\(baseXp\*0\.02\)\)/);
});

test('V1852 preserves the player-first opening combat state', () => {
  assert.match(game, /turn:1,phase:"player",playerActionsTaken:0,enemyTurnPending:false,openingPlayerTurn:true/);
});

test('V1852 shows the last five combat events so misses are not hidden by enemy replies', () => {
  assert.match(game, /state\.scene==="combat"\?state\.messages\.slice\(-5\):state\.messages\.slice\(-1\)/);
  assert.match(game, /حمله خطا رفت؛ ضربه به/);
});

test('V1852 logs the actual target and applied damage', () => {
  assert.match(game, /applied=Math\.min\(before,[\s\S]{0,220}msg\(label\+" به «"\+t\.enemy/);
});

test('V1852 restores HP, MP and stamina again after victory cleanup', () => {
  assert.match(game, /const finalBattleResources=restoreAllResources\(\);report\.hp=finalBattleResources\.hp;report\.maxHp=finalBattleResources\.hp;report\.mp=finalBattleResources\.mp;report\.maxMp=finalBattleResources\.mp;report\.stamina=finalBattleResources\.stamina/);
});

test('V1853 SQL helper keeps region-one party XP at 2 percent from level 5 onward', () => {
  const sql = readFileSync(new URL('../database/party_region_one_xp_scaling_v1853.sql', import.meta.url), 'utf8');
  assert.match(sql, /v_player_level >= 5 and v_region_id in/);
  assert.match(sql, /floor\(greatest\(1,v_hp\)\/15\)::integer/);
  assert.match(sql, /floor\(v_base_xp\*0\.02\)::integer/);
  assert.doesNotMatch(sql, /return 0;/);
});
