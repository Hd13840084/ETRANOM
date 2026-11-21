import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const root=new URL('../',import.meta.url);
const read=p=>fs.readFileSync(new URL(p,root),'utf8');

test('v183 Party RPC is installed as ordered sub-30KB fragments and validates specialization choices server-side',()=>{
  const names=[1,2,3,4,5,6].map(i=>`database/party_wizard_combat_final_v183_part${i}.sql`);
  const parts=names.map(read);
  for(const [i,p] of parts.entries()) assert.ok(Buffer.byteLength(p,'utf8')<30*1024,`fragment ${i+1} exceeds Supabase editor limit`);
  const joined=parts.map((p,i)=>p.match(new RegExp(`values \\(${i+1},\\$v183_${i+1}\\$(.*?)\\$v183_${i+1}\\$\\) on conflict`,'s'))?.[1]||'').join('');
  assert.ok(joined.startsWith('create or replace function public.etranom_party_battle_act'));
  assert.ok(joined.includes("split_part(v_action_arg,'|',1)"));
  assert.ok(joined.includes("raise exception 'party_skill_choice_invalid'"));
  assert.ok(joined.includes("array['classProgress',v_spec_key]"));
  assert.ok(joined.includes("'{testamentActive}'"));
  assert.ok(joined.includes("'{souls}'"));
  assert.ok(joined.includes('Active Necromancer legion members attack once per owner action'));
  assert.ok(joined.includes('partyBattleSessionId'));
  assert.ok(joined.includes('v_wizard_progress_loaded:=true'));
  assert.ok(joined.includes('nextSkillManaReductionPct'));
  assert.ok(joined.includes('party_revive_armed'));
  assert.match(read('database/party_wizard_combat_final_v183_finalize.sql'),/etranom_v183_rpc_staging/);
});

test('Party UI requests explicit choices for all six multi-mode Wizard skills',()=>{
  const ui=read('systems/party/party-ui.js');
  for(const id of ['court_of_nameless','true_name_shatter','final_covenant','assembly_of_souls','death_memory','soul_domination']) assert.ok(ui.includes(`${id}: { title:`),id);
  assert.match(ui,/skill:\$\{skillId\}.*\|\$\{choice\}/s);
  assert.match(ui,/actSkill\(skillId, targetIndex, choice \|\| null\)/);
});

test('Party skill action validates and forwards a safe optional choice token',()=>{
  const code=read('systems/party/party-combat.js');
  assert.match(code,/async actSkill\(skillId, targetIndex = null, choice = null\)/);
  assert.match(code,/party_skill_choice_invalid/);
  assert.match(code,/safeChoice \? `\|\$\{safeChoice\}`/);
});
