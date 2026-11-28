import test from 'node:test';
import assert from 'node:assert/strict';
import { ETRANOM_INTERIOR_ARCHITECTURE_V2144, getInteriorArchitectureV2144, auditInteriorArchitectureV2144 } from '../../systems/safe-zone/interior-architecture-v2144.js';
import { renderIsometricInteriorV2036, interiorObstaclesV2036 } from '../../systems/safe-zone/interior-renderer-v2036.js';
import { SAFE_ZONE_INTERIOR_IDS_V2035 } from '../../systems/safe-zone/interior-catalog-v2035.js';

test('V2144 authors a complete interior plan for every existing safe-zone building',()=>{
 const audit=auditInteriorArchitectureV2144(); assert.equal(audit.ok,true,JSON.stringify(audit.errors));
 assert.equal(audit.buildingCount,27); assert.deepEqual(Object.keys(ETRANOM_INTERIOR_ARCHITECTURE_V2144).sort(),[...SAFE_ZONE_INTERIOR_IDS_V2035].sort());
});
test('each plan has room program, partition geometry and aligned entrance',()=>{
 for (const id of SAFE_ZONE_INTERIOR_IDS_V2035) { const p=getInteriorArchitectureV2144(id); assert.ok(p.rooms.length>=3); assert.ok(p.partitions.length>=1); assert.equal(p.entrance.x,5); assert.equal(p.entrance.edge,'south'); }
});
test('renderer emits building-specific rooms, internal partitions and preserved authored art',()=>{
 const html=renderIsometricInteriorV2036({buildingId:'inn',title:'Inn',room:'Inn',props:['table','hearth'],residents:[],escape:s=>String(s)});
 assert.match(html,/سالن پذیرایی/); assert.match(html,/iso-interior-partition/); assert.match(html,/interiors-v2114\/rooms\/inn\.svg/); assert.match(html,/iso-door/);
});
test('interior obstacle movement bounds remain valid and existing furniture blockers remain available',()=>{
 const obstacles=interiorObstaclesV2036('smith'); assert.ok(obstacles.length>=5); assert.ok(obstacles.every(o=>o.x>=0&&o.x<11&&o.y>=0&&o.y<9));
});
