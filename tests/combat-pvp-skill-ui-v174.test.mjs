import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const ui=fs.readFileSync(new URL('../systems/pvp/pvp-ui.js',import.meta.url),'utf8');
const html=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');
const sql=fs.readFileSync(new URL('../database/combat_shared_skills_pvp_fix_v174.sql',import.meta.url),'utf8');
test('PvP UI loads the shared skill catalog and exposes the authenticated server skill action',()=>{
 assert.match(ui,/loadSharedSkillCatalog/); assert.match(ui,/data-pvp-cast-skill/); assert.match(ui,/performSkill\(/);
 assert.match(html,/pvpSkillAction:async/); assert.match(html,/etranom_pvp_skill_action/);
});
test('PvP skill action does not accept client-calculated combat values',()=>{
 const method=html.match(/pvpSkillAction:async\(id,skillId\)=>\{[\s\S]*?\},/);
 assert.ok(method); assert.match(method[0],/p_match:id/); assert.match(method[0],/p_skill_id:skillId/);
 assert.doesNotMatch(method[0],/damage|heal|mana|hp:/i);
});
test('v174 keeps actor and target HP in separate variables for damage-heal',()=>{
 assert.match(sql,/actor_hp numeric/); assert.match(sql,/target_hp numeric/);
 assert.match(sql,/target_hp:=greatest\(0,coalesce\(\(tb->>'hp'\)::numeric,1\)-dmg\)/);
 assert.match(sql,/least\(maxhp,actor_hp\+heal\)/);
 assert.doesNotMatch(sql,/\bhp:=greatest\(0,coalesce\(\(tb->>'hp'\)::numeric,1\)-dmg\)/);
});
test('v174 retains authenticated-only RPC execution and validates explicit target identity',()=>{
 assert.match(sql,/p_target_id<>target_id/);
 assert.match(sql,/revoke all on function public\.etranom_pvp_skill_action\(uuid,text,uuid\) from public,anon/i);
 assert.match(sql,/grant execute on function public\.etranom_pvp_skill_action\(uuid,text,uuid\) to authenticated/i);
});
