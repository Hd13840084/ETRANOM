import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const sql = fs.readFileSync(new URL('../database/combat_pvp_shared_skill_effects_v179.sql', import.meta.url), 'utf8');
test('PvP migration routes debuffs to the opponent state, not the caster', () => {
  assert.match(sql, /target_statuses:=coalesce\(tb->'active_skill_effects'/);
  assert.match(sql, /tb:=jsonb_set\(tb,'\{active_skill_effects\}'/);
  assert.doesNotMatch(sql, /ab:=jsonb_set\(ab,array\['active_skill_effects',p_skill_id\],jsonb_build_object\('type',skill_type/);
});
test('PvP migration persists soft control and rejects hard control', () => {
  assert.match(sql, /'hardControl',false/);
  assert.match(sql, /elsif skill_type in \('debuff','control'\)/);
});
test('PvP migration persists buffs, shields and summons server-side', () => {
  assert.match(sql, /'reductionPct'/);
  assert.match(sql, /elsif skill_type in \('evasion_counter','self_buff'\)/);
  assert.match(sql, /jsonb_set\(ab,'\{summons\}'/);
});
test('PvP RPC remains authenticated-only', () => {
  assert.match(sql, /revoke all on function public\.etranom_pvp_skill_action\(uuid,text,uuid\) from public,anon/i);
  assert.match(sql, /grant execute on function public\.etranom_pvp_skill_action\(uuid,text,uuid\) to authenticated/i);
});
