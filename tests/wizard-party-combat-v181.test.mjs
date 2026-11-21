import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { listAllImplementedWizardSkills, resolveWizardSpecializationSkill } from '../systems/combat/specialization-skill-bridge.js';
import { findSharedSkill, listAvailableSharedSkills } from '../systems/combat/shared-skill-runtime.js';
const root=new URL('../',import.meta.url);
const read=(p)=>fs.readFileSync(new URL(p,root),'utf8');
const catalog=JSON.parse(read('content/combat/shared_skill_catalog_v172.json'));
const specs=['wizard_arcane_mage','wizard_elementalist','wizard_warlock','wizard_necromancer'];
const actor={id:'wizard',hp:65,maxHp:100,mp:100,maxMp:100,attack:24,magicPower:55,defense:15,necromancerProgress:{souls:5},partyMembers:[{id:'ally',hp:25,maxHp:100}]};

test('only the four designed Wizard specializations expose 40 legacy skills',()=>{
 const skills=listAllImplementedWizardSkills();
 assert.equal(skills.length,40);
 for(const spec of specs) assert.equal(skills.filter(x=>x.specializationId===spec).length,10,spec);
});

test('all 40 designed Wizard legacy skills resolve through the shared combat bridge in all three modes',()=>{
 for(const spec of specs){
  for(const skill of listAllImplementedWizardSkills().filter(x=>x.specializationId===spec)){
   for(const mode of ['solo','party','pvp']){
    const result=resolveWizardSpecializationSkill(spec,skill.id,{mode,actor:{...actor,partyMembers:[...actor.partyMembers]},targets:[{id:'dead',hp:0,maxHp:100,defense:4},{id:'enemy',hp:180,maxHp:180,defense:8}],targetId:skill.type==='permanent_recruit'?'dead':'enemy',recruitRoll:99});
    assert.equal(result.skillId,skill.id,`${spec}/${skill.id}/${mode}`);
   }
  }
 }
});

test('shared catalog lookup cannot expose shell classes, even when specialization is omitted',()=>{
 const assassin=catalog.specializations.find(x=>x.specialization_id==='assassin_1').skills[0];
 assert.equal(findSharedSkill(catalog,assassin.id),null);
 assert.equal(findSharedSkill(catalog,assassin.id,'assassin_1','assassin'),null);
 assert.equal(findSharedSkill(catalog,'arcane_bolt','wizard_arcane_mage','wizard')?.id,'arcane_bolt');
});

test('Wizard shared skill picker accepts canonical and bridge specialization identifiers only',()=>{
 const rows=listAvailableSharedSkills(catalog,{classId:'wizard',specializationId:'wizard_arcane_mage',level:50,ownedSkillIds:['arcane_bolt','assassin_1_strike']});
 assert.ok(rows.some(x=>x.id==='arcane_bolt'));
 assert.ok(!rows.some(x=>x.id==='assassin_1_strike'));
});


test('Party UI lists all ten skills for each designed Wizard specialization, not a hand-picked subset',()=>{
 const ui=read('systems/party/party-ui.js');
 for(const id of ['ARCANE_MAGE','ELEMENTALIST','WARLOCK','NECROMANCER']) assert.ok(ui.includes(`${id}.skills`));
 assert.match(ui,/const skills = \[\.\.\.PARTY_WIZARD_CORE_SKILLS, \.\.\.specializationSkills\]/);
});

test('Party Wizard SQL migration contains three safe payload fragments and the complete Wizard catalog only',()=>{
 const files=[1,2,3].map(i=>read(`database/party_wizard_shared_combat_rpc_v181_1_part${i}.sql`));
 for(const [i,file] of files.entries()) assert.ok(Buffer.byteLength(file,'utf8')<30*1024,`RPC part ${i+1} exceeds 30KB`);
 const fn=files.map((file,i)=>file.match(new RegExp(`values \\(${i+1},\\$v181part\\$(.*?)\\$v181part\\$\\) on conflict`,'s'))?.[1]||'').join('');
 assert.ok(fn.includes('create or replace function public.etranom_party_battle_act'));
 assert.ok(fn.includes("'true_name_debuff'"));
 assert.ok(fn.includes("'single_damage_drain'"));
 assert.ok(fn.includes("'single_damage_cleanse'"));
 assert.ok(fn.includes("'createdRound',st.round_no"));
 const legacyTypes=new Set(listAllImplementedWizardSkills().map(x=>x.type));
 const handled=new Set(['single_damage','shield','all_damage','evasion_counter','all_control_damage','all_damage_control','all_damage_debuff','dual_element_combo','multi_target_damage','repeat_last_spell','all_dot_control','self_buff','ultimate_all_damage','damage','permanent_recruit','debuff_choice','legion_defense_buff','soul_command','life_steal','legion_offense_buff','self_revive','control_choice','ultimate_form','single_damage_cleanse','single_damage_drain','self_heal_cleanse','ultimate_choice','control','stance','empower','choice_control','link','purge','summon_resource','true_name_debuff']);
 for(const type of legacyTypes) assert.ok(handled.has(type),`Party SQL has no handler category for ${type}`);
 const catalogSql=[1,2,3,4,5,6,7].map(i=>read(`database/party_wizard_skill_catalog_v181_part${i}.sql`)).join('\n');
 assert.doesNotMatch(catalogSql,/\('(?:assassin|warrior|priest|monk|ranger|gunner|paladin|druid|bard)_/);
 for(const spec of ['wizard_arcane_mage','wizard_elementalist','wizard_warlock','wizard_necromancer']) assert.ok(catalogSql.includes(spec));
 const seeded=Object.fromEntries(['wizard_arcane_mage','wizard_elementalist','wizard_warlock','wizard_necromancer'].map(spec=>[spec,new Set([...catalogSql.matchAll(new RegExp(`^\\('${spec}','([^']+)'`,'gm'))].map(m=>m[1]))]));
 for(const spec of Object.keys(seeded)){ assert.equal(seeded[spec].size,13,`${spec} should have 10 spec skills + 3 class skills`); }
 assert.match(catalogSql,/set enabled=false where specialization_key not in \('wizard_arcane_mage','wizard_elementalist','wizard_warlock','wizard_necromancer'\)/);
});


test('Warlock pact toggles, accrues bounded debt, and cashes it into credit',()=>{
 const activate=resolveWizardSpecializationSkill('wizard_warlock','demons_testament',{mode:'solo',actor:{...actor,warlockProgress:{}},targets:[]});
 assert.equal(activate.actor.warlockProgress.testamentActive,true);
 const cast=resolveWizardSpecializationSkill('wizard_warlock','forbidden_signature',{mode:'solo',actor:activate.actor,targets:[{id:'e',hp:500,maxHp:500,defense:0}],targetId:'e'});
 assert.equal(cast.actor.warlockProgress.pactDebt,1);
 const cancel=resolveWizardSpecializationSkill('wizard_warlock','demons_testament',{mode:'solo',actor:cast.actor,targets:[]});
 assert.equal(cancel.actor.warlockProgress.testamentActive,false);
 assert.equal(cancel.actor.warlockProgress.pactCredit,0);
});

test('Warlock reversal of sacrifice consumes bounded HP and empowers exactly the next skill',()=>{
 const armed=resolveWizardSpecializationSkill('wizard_warlock','reversal_of_sacrifice',{mode:'solo',actor:{...actor,hp:80,warlockProgress:{}},targets:[]});
 assert.equal(armed.actor.warlockProgress.reversalArmed,true);
 const used=resolveWizardSpecializationSkill('wizard_warlock','forbidden_signature',{mode:'solo',actor:armed.actor,targets:[{id:'e',hp:500,maxHp:500,defense:0}],targetId:'e'});
 assert.ok(used.actor.hp>=1&&used.actor.hp<80);
 assert.equal(used.log.find(x=>x.type==='warlock_sacrifice_paid')?.amount,8);
 assert.equal(used.actor.warlockProgress.reversalArmed,false);
});

test('Warlock named choices and Necromancer soul commands persist in specialization state',()=>{
 const court=resolveWizardSpecializationSkill('wizard_warlock','court_of_nameless',{mode:'solo',actor:{...actor,warlockProgress:{}},targets:[{id:'e',hp:200,maxHp:200}],targetId:'e',choice:'refund'});
 assert.equal(court.actor.warlockProgress.courtMode,'refund');
 const necro=resolveWizardSpecializationSkill('wizard_necromancer','assembly_of_souls',{mode:'solo',actor:{...actor,necromancerProgress:{souls:4}},targets:[{id:'e',hp:200,maxHp:200}],choice:'hunt'});
 assert.equal(necro.actor.necromancerProgress.souls,0);
 assert.ok(necro.log.some(x=>x.type==='necromancer_soul_command'));
});
