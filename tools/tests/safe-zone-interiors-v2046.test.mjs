import test from 'node:test';
import assert from 'node:assert/strict';
import {SAFE_ZONE_INTERIOR_IDS_V2035} from '../../systems/safe-zone/interior-catalog-v2035.js';
import {SAFE_ZONE_INTERIOR_DESIGNS_V2046,getSafeZoneInteriorDesignV2046} from '../../systems/safe-zone/interior-designs-v2046.js';
import {interiorObstaclesV2036,renderIsometricInteriorV2036} from '../../systems/safe-zone/interior-renderer-v2036.js';
test('all 27 buildings have individually authored room plans',()=>{
 assert.equal(SAFE_ZONE_INTERIOR_IDS_V2035.length,27);
 assert.equal(Object.keys(SAFE_ZONE_INTERIOR_DESIGNS_V2046).length,27);
 for(const id of SAFE_ZONE_INTERIOR_IDS_V2035){const d=getSafeZoneInteriorDesignV2046(id);assert.ok(d?.accent,id);assert.equal(d.spots.length,6,id);}
});
test('each room plan has unique furnishing arrangement',()=>{
 const signatures=SAFE_ZONE_INTERIOR_IDS_V2035.map(id=>getSafeZoneInteriorDesignV2046(id).spots.map(p=>`${p.x},${p.y}`).join('|'));
 assert.equal(new Set(signatures).size,27);
});
test('all furniture coordinates are unique and inside the room',()=>{
 for(const id of SAFE_ZONE_INTERIOR_IDS_V2035){const spots=interiorObstaclesV2036(id);assert.equal(new Set(spots.map(p=>`${p.x},${p.y}`)).size,spots.length,id);for(const p of spots){assert.ok(p.x>=0&&p.x<11&&p.y>=0&&p.y<9,id);}}
});
test('each building renders its own themed furniture and room identity',()=>{
 for(const id of SAFE_ZONE_INTERIOR_IDS_V2035){const d=getSafeZoneInteriorDesignV2046(id);const html=renderIsometricInteriorV2036({buildingId:id,title:id,room:'room',props:['A','B','C','D','E','F']});assert.ok(html.includes(`prop-${d.accent}`),id);assert.ok(html.includes('iso-wall-emblem'),id);assert.equal((html.match(/data-furniture-index=/g)||[]).length,6,id);}
});
