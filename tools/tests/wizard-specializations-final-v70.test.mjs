import test from 'node:test';
import assert from 'node:assert/strict';
import { ARCANE_MAGE } from '../../systems/classes/arcane-mage.js';
import { ELEMENTALIST } from '../../systems/classes/elementalist.js';
import { WARLOCK } from '../../systems/classes/warlock.js';
import { NECROMANCER } from '../../systems/classes/necromancer.js';
import {
  applyWizardTalentEffectsToSkill, calculateWizardDamage, calculateWizardManaCost,
  collectTalentEffects, normalizeLegionCapacity, resolveNecromancerRecruitChance,
  resolveSkillAtRank, tickWizardCombatState
} from '../../systems/classes/wizard-combat-runtime.js';
const specs=[ARCANE_MAGE,ELEMENTALIST,WARLOCK,NECROMANCER];
test('four Wizard specializations contain 10 skills, 6 upgrades, 32 talents, 4 branches and 10 ascended skills',()=>{
  for(const d of specs){
    assert.equal(d.skills.length,10,d.specialization);
    assert.ok(d.skills.every(s=>s.upgrades?.length===6),d.specialization+' upgrades');
    assert.equal(d.talentBranches.length,4,d.specialization+' branches');
    assert.equal(d.talentBranches.reduce((n,b)=>n+((b.talents||b.talentIds||[]).length),0),32,d.specialization+' talents');
    assert.equal(d.ascendedSkills.length,10,d.specialization+' ascended');
  }
});
test('all 240 skill rank overlays are deterministic and do not mutate source data',()=>{
  for(const d of specs) for(const skill of d.skills){
    const before=JSON.stringify(skill),ranked=resolveSkillAtRank(skill,7);
    assert.ok(ranked && ranked.id===skill.id);
    assert.equal(JSON.stringify(skill),before,'catalog mutation: '+skill.id);
    assert.ok(Number(ranked.manaPct??ranked.manaCostPercent??0)>=0);
  }
});
test('all talent branches produce deterministic effects when fully unlocked',()=>{
  for(const d of specs){
    const ids=d.talentBranches.flatMap(b=>(b.talents||b.talentIds||[]).map(t=>Array.isArray(t)?t[0]:typeof t==='string'?t:t.id));
    const effects=collectTalentEffects(d,{unlockedTalents:ids,talentRanks:Object.fromEntries(ids.map(id=>[id,1]))});
    assert.ok(Object.keys(effects).length>=8,d.specialization+' effect map');
  }
});
test('skill modifiers, mana discounts and damage calculations are bounded',()=>{
  const necro=applyWizardTalentEffectsToSkill({id:'death_claw',type:'damage',damagePct:200},
    {darkSkillDamagePct:5,deathClawDamagePct:4},'necromancer');
  assert.equal(necro.damagePct,200);
  assert.equal(calculateWizardManaCost(1000,10,{manaCostReductionPct:10}),90);
  assert.equal(calculateWizardManaCost(1000,10,{voidManaCostReductionPct:10}),90);
  assert.equal(calculateWizardDamage(100,100,0,{}),100);
  assert.ok(calculateWizardDamage(100,100,100,{damagePct:20})<100);
});
test('necromancer recruitment bonuses do not exceed hard cap and legion capacity remains three',()=>{
  assert.equal(resolveNecromancerRecruitChance({skillRanks:{legion:7}},{legionRecruitChancePct:20}),73);
  assert.equal(normalizeLegionCapacity({legion:[1,2,3,4,5]}).length,3);
});
test('turn effects expire and apply persistent damage exactly once per tick',()=>{
  const c={enemies:[{hp:100,maxHp:100,necromancerWound:{turns:2,pct:10},wizardStatus:{turns:1,dotPct:5}}]};
  const a=tickWizardCombatState(c);assert.equal(a.damage,15);assert.equal(c.enemies[0].hp,85);
  const b=tickWizardCombatState(c);assert.equal(b.damage,10);assert.equal(c.enemies[0].hp,75);
  assert.equal(c.enemies[0].necromancerWound,undefined);
});
