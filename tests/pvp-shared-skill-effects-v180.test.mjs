import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const sql = fs.readFileSync(new URL('../database/combat_pvp_shared_skill_effects_v180.sql', import.meta.url), 'utf8');

test('PvP timed effects tick on the active player turn and apply DOT before the action', () => {
  assert.match(sql, /Advance only the active combatant's timed effects at the start of their turn/);
  assert.match(sql, /dot_damage:=least\(hp,greatest\(1,floor\(actor_maxhp\*least\(50/);
  assert.match(sql, /'damage_over_time'/);
});

test('PvP timed effect durations are decremented and expired effects removed server-side', () => {
  assert.match(sql, /actor_effects:=actor_effects-effect_key/);
  assert.match(sql, /jsonb_set\(effect_json,'\{turns\}'/);
  assert.match(sql, /actor_summons:=coalesce\(ab->'summons'/);
  assert.match(sql, /ab:=case when coalesce\(\(effect_json->>'turns'\)::integer,0\)<=0 then ab-'shield'/);
});

test('PvP outgoing attack and incoming defense use active soft-debuff modifiers', () => {
  assert.match(sql, /into attack_reduction from jsonb_each/);
  assert.match(sql, /value->'effects'->>'attackPct'/);
  assert.match(sql, /into defense_reduction from jsonb_each/);
  assert.match(sql, /value->'effects'->>'defensePct'/);
  assert.match(sql, /atk:=greatest\(1,atk\*\(1-attack_reduction\/100\)\)/);
  assert.match(sql, /\(1-defense_reduction\/100\)/);
});

test('PvP migration keeps the RPC authenticated-only', () => {
  assert.match(sql, /revoke all on function public\.etranom_pvp_skill_action\(uuid,text,uuid\) from public,anon/i);
  assert.match(sql, /grant execute on function public\.etranom_pvp_skill_action\(uuid,text,uuid\) to authenticated/i);
});

test('PvP migration stays below the Supabase SQL editor size limit', () => {
  assert.ok(Buffer.byteLength(sql, 'utf8') < 30 * 1024);
});
