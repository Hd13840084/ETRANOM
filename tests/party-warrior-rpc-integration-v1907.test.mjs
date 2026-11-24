import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const sql=fs.readFileSync(path.join(root,'database/party_warrior_rpc_integration_v1907.sql'),'utf8');
const catalog=[1,2,3,4].map(i=>fs.readFileSync(path.join(root,`database/party_warrior_skill_catalog_v1907_part${i}.sql`),'utf8')).join('\n');
const allSql=sql+'\n'+catalog;
const keys=['warrior_sword_ascetic','warrior_iron_bastion','warrior_chaos_warrior','warrior_apocalypse_harbinger'];
const skills=['black_crescent','ironcleave','disorder_rend','apoc_strike'];
test('V1907 installs all four Warrior skill catalogs without replacing Wizard rows',()=>{
 for(const key of keys) assert.match(allSql,new RegExp(key));
 for(const skill of skills) assert.match(allSql,new RegExp(skill));
 assert.match(catalog,/on conflict\(specialization_key,skill_id\) do update set skill_data=excluded\.skill_data,enabled=excluded\.enabled/i);
 assert.match(catalog,/\('warrior_sword_ascetic','echo'.*?'::jsonb,false\)/s);
 assert.match(catalog,/\('warrior_chaos_warrior','incompatible_vessel'.*?'::jsonb,false\)/s);
});
test('V1907 routes Warrior physical scaling and Stamina validation server-side',()=>{
 assert.match(sql,/v_skill_power:=greatest\(1,attack_power\)/);
 assert.match(sql,/v_ally_profile:=coalesce\(profiles->/);
 assert.match(sql,/if v_stamina<v_stamina_cost then raise exception 'insufficient_stamina'/);
 assert.match(sql,/profile:=jsonb_set\(profile,'\{stamina\}',to_jsonb\(v_stamina\),true\)/);
});
test('V1907 preserves Wizard Mana/Pact branch and supports canonical powerPct',()=>{
 assert.match(sql,/wizard_warlock/);
 assert.match(sql,/nextSkillManaReductionPct/);
 assert.match(sql,/\(v_skill->>'powerPct'\)::numeric/);
});
test('V1907 supports shared physical damage, guard, and stance skill families',()=>{
 for(const type of ['multi_hit','all_damage_execute','line_damage','area_damage','ultimate_aoe','self_guard','team_guard','stance']) assert.match(sql,new RegExp(type));
});
