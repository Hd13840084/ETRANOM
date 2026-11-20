import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
const root = path.resolve(new URL('../..', import.meta.url).pathname);
const sql = fs.readFileSync(path.join(root,'database/party_group_battle_phase7_v157.sql'),'utf8');
const ui = fs.readFileSync(path.join(root,'systems/party/party-ui.js'),'utf8');
test('server catalog contains real skills for all four implemented Wizard specializations',()=>{
 for(const id of ['arcane_bolt','arcane_shield','ember_bolt','frozen_armor','tidal_renewal','forbidden_signature','death_claw','radiant_judgment','darkness_chains']) assert.ok(sql.includes(`'${id}'`));
 for(const spec of ['wizard_arcane_mage','wizard_elementalist','wizard_warlock','wizard_necromancer']) assert.ok(sql.includes(`'${spec}'`));
});
test('RPC validates specialization, skill id, unlock level, mana and cooldown server-side',()=>{
 for(const code of ['party_skill_specialization_unsupported','party_skill_not_available','party_skill_locked','party_skill_cooldown','insufficient_mana']) assert.ok(sql.includes(code));
 assert.match(sql,/attack_power\*5\+coalesce\(\(profile->'gear'->>'magicPower'\)::integer,0\)/);
 assert.match(sql,/v_mana_cost:=greatest\(0,ceil\(maxmp\*coalesce\(\(v_skill->>'manaPct'\)::numeric,0\)\/100\)::integer\)/);
});
test('UI sends skill id, not client-supplied damage or cost',()=>{
 assert.match(ui,/this\.submitBattleAction\(`skill:\$\{select\.value\}`/);
 assert.match(ui,/this\.partySystem\.combat\.act\(action, targetIndex\)/);
 assert.match(ui,/PARTY_WIZARD_SKILLS/);
});
test('SQL action ledger permits named skill actions while keeping the RPC signature',()=>{
 assert.match(sql,/left\(action_name,6\)='skill:'/i);
 assert.match(sql,/action like 'skill:%'/i);
 assert.match(sql,/etranom_party_battle_act\(p_session_id uuid,p_action text,p_target_index integer default null\)/i);
});
