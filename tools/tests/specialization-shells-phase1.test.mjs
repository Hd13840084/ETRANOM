import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const classes=JSON.parse(fs.readFileSync('content/classes/classes.json','utf8'));
const specs=JSON.parse(fs.readFileSync('content/specializations/specializations.json','utf8'));
const registry=JSON.parse(fs.readFileSync('content/classes/SPECIALIZATION_REGISTRY_V1.json','utf8'));
test('10 class slots retain exactly four specialization slots each',()=>{
 assert.equal(classes.classes.length,10);
 assert.equal(specs.specialization_count,40);
 for(const c of classes.classes) assert.equal(c.specialization_ids.length,4);
 assert.equal(new Set(specs.specializations.map(s=>s.id)).size,40);
});
test('only Wizard and Warrior are implemented; future classes remain reserved',()=>{
 const implemented=registry.classes.filter(c=>c.status==='implemented').map(c=>c.id).sort();
 assert.deepEqual(implemented,['warrior','wizard']);
 for(const c of registry.classes.filter(c=>c.status==='reserved')){
  assert.equal(c.specializations.length,4);
  assert.ok(c.specializations.every(s=>s.status==='reserved'));
 }
});
test('Wizard and Warrior specialization IDs remain bound to the same shared registry',()=>{
 for(const id of ['wizard_arcane_mage','wizard_elementalist','wizard_warlock','wizard_necromancer','warrior_sword_ascetic','warrior_iron_bastion','warrior_chaos','warrior_apocalypse_harbinger']){
  assert.ok(registry.classes.some(c=>c.specializations.some(s=>s.id===id)),`missing implemented specialization ${id}`);
 }
});
