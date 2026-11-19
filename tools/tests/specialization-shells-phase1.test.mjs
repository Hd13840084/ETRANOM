import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const classes=JSON.parse(fs.readFileSync('content/classes/classes.json','utf8'));
const specs=JSON.parse(fs.readFileSync('content/specializations/specializations.json','utf8'));
test('10 classes have exactly four specialization shells each',()=>{
 assert.equal(classes.classes.length,10);
 assert.equal(specs.specialization_count,40);
 for(const c of classes.classes) assert.equal(c.specialization_ids.length,4);
 assert.equal(new Set(specs.specializations.map(s=>s.id)).size,40);
});
test('shells contain identity only and do not introduce skill or talent systems',()=>{
 for(const s of specs.specializations){
  assert.ok(s.name_fa && s.class_id && s.role_fa);
  if(s.id!=='wizard_1'){assert.deepEqual(s.skills,[]);assert.deepEqual(s.talents,[]);assert.equal(s.progression,null);}
 }
});
test('Arcane Mage remains linked to its existing implementation and portrait',()=>{
 const a=specs.specializations.find(s=>s.id==='wizard_1');
 assert.equal(a.data_module,'systems/classes/arcane-mage.js');
 assert.ok(fs.existsSync(a.data_module));
 assert.ok(fs.existsSync(a.portrait));
});
