import test from 'node:test'; import assert from 'node:assert/strict';
import { NECROMANCER_LEGENDARY_COMPANIONS, chooseLegendaryCompanionIntent } from '../../systems/classes/necromancer-legendary-companions-v1988.js';
test('20 legendary mythic-undead companions have unique ids, 8 stats, portraits and skills',()=>{
 assert.equal(NECROMANCER_LEGENDARY_COMPANIONS.length,20);
 assert.equal(new Set(NECROMANCER_LEGENDARY_COMPANIONS.map(x=>x.id)).size,20);
 for(const c of NECROMANCER_LEGENDARY_COMPANIONS){assert.equal(Object.keys(c.stats).length,8);assert.equal(c.skills.length,3);assert.ok(c.portrait);assert.equal(c.rank,'legendary');}
});
test('legendary AI returns a valid action',()=>{const c=NECROMANCER_LEGENDARY_COMPANIONS[0];const a=chooseLegendaryCompanionIntent(c,{enemies:[{id:'e',hp:10,maxHp:100}],allies:[]});assert.ok(a);});
