import assert from 'node:assert/strict';
import { ARCANE_MAGE } from '../systems/classes/arcane-mage.js';
import { ELEMENTALIST } from '../systems/classes/elementalist.js';
import { WARLOCK } from '../systems/classes/warlock.js';
import { NECROMANCER } from '../systems/classes/necromancer.js';
import { collectTalentEffects, normalizeWizardCombatProgress, resolveSkillAtRank, runLegionActions } from '../systems/classes/wizard-combat-runtime.js';
import { activateNecromancerDomain, endNecromancerDomain } from '../systems/classes/necromancer.js';
for (const spec of [ARCANE_MAGE,ELEMENTALIST,WARLOCK,NECROMANCER]) {
  assert.equal(spec.skills.length,10,`${spec.id}: ten skills`);
  assert.equal(spec.skills.reduce((n,s)=>n+(s.upgrades?.length||0),0),60,`${spec.id}: sixty upgrades`);
  assert.equal(spec.talentBranches.length,4,`${spec.id}: four talent branches`);
}
for (const spec of [WARLOCK,NECROMANCER]) {
  const progress=normalizeWizardCombatProgress({unlockedTalents:spec.talents.map(t=>t.id)});
  assert.ok(Object.keys(collectTalentEffects(spec,progress)).length>=30,`${spec.id}: talent effect mapping`);
}
assert.equal(collectTalentEffects(NECROMANCER,normalizeWizardCombatProgress({talentRanks:{undead_legion_04:5}})).legionDamagePct,15);
assert.equal(collectTalentEffects(WARLOCK,normalizeWizardCombatProgress({unlockedTalents:['sovereign_signature']})).contractSkillDamagePct,6);
assert.equal(resolveSkillAtRank(ARCANE_MAGE.skills[0],7).damagePct,210);
const combat={enemies:[{enemy:'dummy',hp:1000,maxHp:1000}]};
const testLegion=[1,2,3,4].map((_,i)=>({id:`member${i}`,name:`member${i}`,attack:5}));
assert.equal(runLegionActions(combat,{level:5},{legion:testLegion,activeLegionIds:testLegion.map(x=>x.id)}).length,3);
assert.deepEqual(runLegionActions({enemies:[]},{level:5},{legion:testLegion,activeLegionIds:testLegion.map(x=>x.id)}),[],'empty encounter must not throw');
assert.deepEqual(runLegionActions({enemies:[{enemy:'dead',hp:0}]},{level:5},{legion:testLegion,activeLegionIds:testLegion.map(x=>x.id)}),[],'all-defeated encounter must not throw');
assert.equal(WARLOCK.skills[0].type,'single_damage');
assert.equal(WARLOCK.skills[0].damagePct,170);
assert.equal(resolveSkillAtRank(WARLOCK.skills[0],1).damagePct,170);
const member={id:'wolf',speciesId:'wolf',name:'Wolf'};
const p={legion:[member],domainUsesThisBattle:0};
const activated=activateNecromancerDomain(p,25);
assert.equal(activated.ok,true);assert.equal(activated.progress.legion[0].deathForm.formId,'wolf_death_form');
assert.equal(endNecromancerDomain(activated.progress).legion[0].deathForm,null);
console.log('Wizard combat tests passed.');
