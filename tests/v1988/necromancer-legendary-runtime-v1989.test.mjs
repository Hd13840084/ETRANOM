import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { NECROMANCER_ALL_COMPANIONS, chooseNecromancerCompanionIntent } from '../../systems/classes/necromancer-companion-bestiary-v1991.js';
import { resolveCompanionSkillV1984 } from '../../systems/classes/necromancer-underworld-gate-v1984.js';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
test('Bestiary V1991 exposes 100 unique species across five ranks',()=>{
 assert.equal(NECROMANCER_ALL_COMPANIONS.length,100);
 assert.equal(new Set(NECROMANCER_ALL_COMPANIONS.map(x=>x.id)).size,100);
 assert.equal(new Set(NECROMANCER_ALL_COMPANIONS.map(x=>x.nameEn.toLowerCase())).size,100);
 for(const c of NECROMANCER_ALL_COMPANIONS){assert.deepEqual(Object.keys(c.stats).sort(),['endurance','faith','intellect','luck','perception','power','speed','vitality'].sort());assert.equal(c.skills.length,3);assert.ok(fs.existsSync(path.join(root,c.portrait)),`missing ${c.portrait}`);}
});
test('every Legendary skill resolves through live companion effect resolver',()=>{
 const legendary=NECROMANCER_ALL_COMPANIONS.filter(x=>x.rank==='legendary'); assert.equal(legendary.length,20);
 for(const c of legendary) for(const skill of c.skills){
  const member={id:'m',level:10,hp:100,maxHp:100,stats:c.stats};
  const ally={id:'a',hp:20,maxHp:100};
  const e1={encounterId:'e1',hp:500,maxHp:500,enemyDefense:0},e2={encounterId:'e2',hp:450,maxHp:500,enemyDefense:0};
  const result=resolveCompanionSkillV1984({member,skill,combat:{targetId:'e1',enemies:[e1,e2]},allies:[member,ally],turn:2,targetId:'e2'});
  assert.equal(result.ok,true,`${c.id}/${skill.id}`);
  if(skill.target==='single' && skill.powerPct>0) assert.ok(e2.hp<450,`${c.id}/${skill.id} ignored AI target`);
 }
});
test('Legendary AI chooses authored actions and runtime entry is versioned',()=>{
 const legendary=NECROMANCER_ALL_COMPANIONS.filter(x=>x.rank==='legendary');
 for(const c of legendary){const intent=chooseNecromancerCompanionIntent(c,{enemies:[{id:'e',hp:40,maxHp:100}],allies:[],cooldowns:{}});assert.ok(intent, c.id);}
 const html=fs.readFileSync(path.join(root,'index.html'),'utf8');assert.match(html,/necromancer-companion-bestiary-v1994\.js\?v=1998/);
 const game=fs.readFileSync(path.join(root,'game.js'),'utf8');assert.match(game,/targetId:intent\?\.targetId/);
});
