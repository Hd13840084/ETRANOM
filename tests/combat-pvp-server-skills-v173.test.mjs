import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const sql=fs.readFileSync(new URL('../database/combat_shared_skills_pvp_secure_v173.sql',import.meta.url),'utf8');
const catalog=JSON.parse(fs.readFileSync(new URL('../content/combat/shared_skill_catalog_v172.json',import.meta.url),'utf8'));
test('trusted server mirror contains every canonical catalog skill',()=>{
 const expected=catalog.class_core_skills.length+catalog.specializations.reduce((n,s)=>n+s.skills.length,0);
 assert.equal(expected,230); assert.equal((sql.match(/insert into public\.etranom_shared_skill_catalog\(/g)||[]).length,expected);
});
test('PvP skill RPC validates identity, turn, class/spec, ownership, level, mana and cooldown server-side',()=>{
 for(const token of ['auth.uid()','m.turn_player<>uid','skill_class_mismatch','skill_specialization_mismatch','skill_not_owned','skill_locked','insufficient_mana','skill_on_cooldown','etranom_shared_skill_catalog']) assert.ok(sql.includes(token),`missing ${token}`);
});
test('PvP soft control explicitly prevents hard control',()=>assert.match(sql,/hardControl',false/));
test('RPC execute is restricted to authenticated users',()=>{assert.match(sql,/revoke all on function public\.etranom_pvp_skill_action\(uuid,text,uuid\) from public,anon/i);assert.match(sql,/grant execute on function public\.etranom_pvp_skill_action\(uuid,text,uuid\) to authenticated/i);});
