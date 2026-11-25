import assert from 'node:assert/strict';
import {CHAOS_WARRIOR_DATA as d,createChaosWarriorProgress,resolveChaosSkill,activateChaosDomain,selectChaosAscension} from '../systems/combat/chaos-warrior-runtime.js';
assert.equal(d.skills.length,10);assert.deepEqual(d.talentBranches.map(x=>x.talents.length),[8,8,8,8]);assert.equal(d.ascendedSkills.length,10);assert.equal(d.domain.stages.length,4);
const actor={level:50,attack:100,stamina:100,skillPoints:20,classProgress:{warrior_chaos:createChaosWarriorProgress()}};
const hit=resolveChaosSkill('chaos_rend',{actor,targets:[{encounterId:'enemy-1',hp:1000}],targetId:'enemy-1'});assert.ok(hit.targets[0].hp<1000);
const domain=activateChaosDomain(actor,{level:50});const chosen=selectChaosAscension(domain.actor,'chaos_asc_1');assert.equal(chosen.progress.domain.ascendedSkillId,'chaos_asc_1');
console.log('Chaos Warrior V1876 tests passed.');
