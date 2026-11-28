import test from 'node:test';
import assert from 'node:assert/strict';
import { ETRANOM_ENTRANCE_SYSTEM_V2145, auditEntranceSystemV2145 } from '../../systems/safe-zone/entrance-system-v2145.js';
test('all 27 authored buildings have an entrance linked to their interior',()=>{const a=auditEntranceSystemV2145();assert.equal(a.ok,true);assert.equal(a.buildingCount,27);});
test('windows are non-passable and doors have thresholds',()=>{for(const d of Object.values(ETRANOM_ENTRANCE_SYSTEM_V2145)){assert.equal(d.windowsPassable,false);assert.ok(d.thresholdMaterial);assert.ok(d.entranceId);}});
test('all entrances preserve unique building identity',()=>{const ids=Object.values(ETRANOM_ENTRANCE_SYSTEM_V2145).map(x=>x.entranceId);assert.equal(new Set(ids).size,27);});
