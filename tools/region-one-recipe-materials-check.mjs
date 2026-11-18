import fs from 'node:fs';
import assert from 'node:assert/strict';
const source=fs.readFileSync(new URL('../game.js',import.meta.url),'utf8');
const encounterLine=source.split('\n').find(x=>x.includes('const FIRST_REGION_ENCOUNTERS='));
assert.ok(encounterLine,'FIRST_REGION_ENCOUNTERS missing');
const encounters=JSON.parse(encounterLine.slice(encounterLine.indexOf('=')+1,encounterLine.lastIndexOf(';')));
const zonesBlock=source.match(/const ETRANOM_REGION_CONTENT=\[([\s\S]*?)\n  \];/);
assert.ok(zonesBlock,'ETRANOM_REGION_CONTENT missing');
const zones=[...zonesBlock[1].matchAll(/\{id:"([^"]+)"[^\n]*?mats:\[([^\]]+)\][^\n]*?\}/g)].map(m=>({id:m[1],mats:[...m[2].matchAll(/"([^"]+)"/g)].map(x=>x[1])}));
assert.equal(zones.length,6,'expected six Region 1 zones');
for(const z of zones){
  const group=encounters.filter(e=>e.regionId===z.id);
  assert.ok(group.length>=6,`${z.id}: missing encounters`);
  for(const e of group){
    const ids=e.materialIds||[e.materialId].filter(Boolean);
    const expected=['boss','area_boss'].includes(e.kind)?3:e.kind==='miniboss'?2:1;
    assert.equal(ids.length,expected,`${e.id}: expected ${expected} material types, got ${ids.length}`);
    assert.ok(ids.every(id=>z.mats.includes(id)),`${e.id}: material outside its own zone`);
  }
  const produced=new Set(group.flatMap(e=>e.materialIds||[e.materialId].filter(Boolean)));
  assert.ok(z.mats.every(id=>produced.has(id)),`${z.id}: a zone material has no monster source`);
}
assert.match(source,/const materialIds=\[zone\.mats\[matIndex\],zone\.mats\[secondIndex\]\]/,'recipe materials must come from selected zone');
assert.match(source,/sourceEncounterIds=FIRST_REGION_ENCOUNTERS\.filter\(e=>e\.regionId===zone\.id/,'recipe sources must be same-zone encounters');
assert.match(source,/r\.sourceEncounterIds\.includes\(def\.id\)/,'only the material-producing monster may drop that recipe');
assert.match(source,/const dropCount=def\.kind==="area_boss"\|\|def\.kind==="boss"\?3:def\.kind==="miniboss"\?2:1/,'battle material payout count mismatch');
console.log(`PASS: ${zones.length} zones, ${encounters.length} encounters; all monster material counts and zone recipe/material source constraints are valid.`);
