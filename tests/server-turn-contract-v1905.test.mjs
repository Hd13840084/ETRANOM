import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const root=new URL('../',import.meta.url);
const read=p=>fs.readFileSync(new URL(p,root),'utf8');

test('Party v183 action is server-authoritative and enforces one action per member per round',()=>{
  const parts=[1,2,3,4,5,6].map(i=>read(`database/party_wizard_combat_final_v183_part${i}.sql`));
  const fn=parts.map((p,i)=>p.match(new RegExp(`values \\(${i+1},\\$v183_${i+1}\\$(.*?)\\$v183_${i+1}\\$\\) on conflict`,'s'))?.[1]||'').join('');
  assert.ok(fn.includes('auth.uid()'));
  assert.match(fn,/for update/i);
  assert.match(fn,/party_battle_actions[\s\S]*round_no=st\.round_no[\s\S]*user_id=uid/);
  assert.match(fn,/party_skill_cooldowns/);
  assert.match(fn,/party_skill_cooldown/);
});

test('Party v183 implementation currently maps only the four Wizard specializations',()=>{
  const parts=[1,2,3,4,5,6].map(i=>read(`database/party_wizard_combat_final_v183_part${i}.sql`));
  const fn=parts.join('\n');
  for(const id of ['wizard_arcane_mage','wizard_elementalist','wizard_warlock','wizard_necromancer']) assert.ok(fn.includes(id));
  for(const id of ['sword_ascetic','iron_bastion','chaos_warrior','apocalypse_harbinger']) assert.ok(!fn.includes(id),`unexpected Party RPC specialization route: ${id}`);
});

test('PvP skill RPC owns turn validation and persists per-actor cooldown state',()=>{
  const sql=read('database/combat_pvp_shared_skill_effects_v180.sql');
  assert.match(sql,/m\.turn_player<>uid/);
  assert.match(sql,/for update/);
  assert.match(sql,/skill_cooldowns/);
  assert.match(sql,/m\.turn_no\+cd\+1/);
  assert.match(sql,/turn_no=turn_no\+1/);
  assert.match(sql,/revoke all on function public\.etranom_pvp_skill_action\(uuid,text,uuid\) from public,anon/i);
});

test('client Party adapter sends actions to RPC without applying local cooldown ticks',()=>{
  const code=read('systems/party/party.js')+read('systems/party/party-combat.js');
  assert.match(code,/etranom_party_battle_act_v1969/);
  assert.match(code,/battleAction: \(sessionId, action, targetIndex = null, requestId = null\) => call\("etranom_party_battle_act_v1969"/);
  assert.doesNotMatch(code,/tickCombatStatuses\(/);
});
