import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const json=p=>JSON.parse(read(p));
test('Sword Ascetic combat buttons dispatch to its real runtime',()=>{
 const game=read('game.js'),index=read('index.html');
 assert.match(game,/function swordAsceticUseSkill\(id\)/);
 assert.match(game,/data-use-sword-skill/);
 assert.match(game,/swordAsceticUseSkill\(b\.dataset\.useSwordSkill\)/);
 assert.match(index,/sword-ascetic-runtime\.js\?v=1937/);
});
test('all warrior specialization books use their correct portrait assets',()=>{
 const game=read('game.js');
 for(const asset of ['sword_ascetic_portrait.webp','iron_bastion_portrait.webp','chaos_warrior_portrait.webp']) assert.ok(game.includes(asset),asset);
});
test('Iron Bastion first skill is a high-power signature attack',()=>{
 const d=json('content/classes/warrior_iron_bastion_v1.json'),s=d.skills[0];
 assert.equal(s.id,'ironcleave'); assert.equal(s.type,'single_damage');
 assert.ok(s.powerPct>=280); assert.ok(s.staminaCost>=10); assert.ok(s.cooldownTurns>=1);
 assert.match(s.description,/۲۸۵٪/);
});
test('Chaos Warrior first and second skills are swapped in active runtime source',()=>{
 const d=json('content/classes/warrior_chaos_v1.json');
 assert.equal(d.skills[0].id,'chaos_rend');
 assert.equal(d.skills[1].id,'primordial_rage');
});
