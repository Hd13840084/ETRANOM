import test from 'node:test';
import assert from 'node:assert/strict';
import { NECROMANCER_LEGENDARY_COMPANIONS } from '../../systems/classes/necromancer-legendary-companions-v1991.js';
import { NECROMANCER_ALL_COMPANIONS } from '../../systems/classes/necromancer-companion-bestiary-v1991.js';
import fs from 'node:fs';
const keys=['power','speed','endurance','vitality','intellect','perception','luck','faith'];
test('Legendary roster remains 20 and all identities are unique across five ranks',()=>{
 assert.equal(NECROMANCER_LEGENDARY_COMPANIONS.length,20);
 const ids=NECROMANCER_ALL_COMPANIONS.map(x=>x.id), names=NECROMANCER_ALL_COMPANIONS.map(x=>x.nameEn.toLowerCase());
 assert.equal(new Set(ids).size,ids.length,'duplicate companion IDs');
 assert.equal(new Set(names).size,names.length,'duplicate companion names');
});
test('replacement mythic entities have distinct lore, eight stats, skills and portrait files',()=>{
 for(const id of ['gallu_underworld_bull','asto_vidatu_death_demon','sluagh_restless_host']){
  const c=NECROMANCER_LEGENDARY_COMPANIONS.find(x=>x.id===id); assert.ok(c,id);
  assert.ok(c.mythology && c.lore && c.passive.description);
  assert.deepEqual(Object.keys(c.stats).sort(),[...keys].sort());
  assert.equal(c.skills.length,3); assert.ok(fs.existsSync(new URL('../../'+c.portrait,import.meta.url)));
  assert.equal(c.rank,'legendary'); assert.equal(c.evolution.nextRank,'mythic');
 }
});
test('the former cross-rank duplicates are absent from Legendary',()=>{
 const names=NECROMANCER_LEGENDARY_COMPANIONS.map(x=>x.nameEn);
 for(const n of ['Anubis','Garmr','Draugr Lord']) assert.ok(!names.includes(n));
});
test('index loads reconciled bestiary',()=>{
 const html=fs.readFileSync(new URL('../../index.html',import.meta.url),'utf8');
 assert.match(html,/necromancer-companion-bestiary-v1994\.js\?v=1998/);
});
