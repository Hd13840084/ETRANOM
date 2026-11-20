import { ARCANE_MAGE } from '../systems/classes/arcane-mage.js';
import { ELEMENTALIST } from '../systems/classes/elementalist.js';
import { WARLOCK } from '../systems/classes/warlock.js';
import { NECROMANCER } from '../systems/classes/necromancer.js';
import { normalizeWizardCombatProgress, resolveSkillAtRank, collectTalentEffects, completeWizardDomainTrial, resetWizardBattleProgress } from '../systems/classes/wizard-combat-runtime.js';
import assert from 'node:assert/strict';
const specs=[ARCANE_MAGE,ELEMENTALIST,WARLOCK,NECROMANCER];
for(const d of specs){assert.equal(d.skills.length,10,`${d.specialization}: skills`);for(const s of d.skills)assert.equal(s.upgrades?.length,6,`${d.specialization}/${s.id}`);const b=d.talentBranches||[];assert.equal(b.length,4);assert.equal(b.reduce((n,x)=>n+(x.talents||x.talentIds||[]).length,0),32);}
assert.ok(resolveSkillAtRank(ELEMENTALIST.skills[0],7));
assert.equal(collectTalentEffects(ELEMENTALIST,{unlockedTalents:['flame_affinity'],talentRanks:{flame_affinity:1}}).fireDamagePct,5);
assert.equal(collectTalentEffects(ARCANE_MAGE,{unlockedTalents:['arcane_force'],talentRanks:{arcane_force:1}}).magicPowerPct,5);
assert.ok(completeWizardDomainTrial(normalizeWizardCombatProgress({}),3).domainQuest.completedStages.includes(3));
assert.equal(resetWizardBattleProgress({domainUsesThisBattle:1}).domainUsesThisBattle,0);
console.log('PASS: 4 specs, 40 skills, 240 upgrades, 128 talents, runtime smoke checks');
