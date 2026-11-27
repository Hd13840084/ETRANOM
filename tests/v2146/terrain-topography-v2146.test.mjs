import test from 'node:test';
import assert from 'node:assert/strict';
import { ETRANOM_TERRAIN_TOPOGRAPHY_V2146, sampleTerrainElevationV2146, sampleTerrainGradientV2146, resolveTerrainSurfaceV2146, auditTerrainTopographyV2146 } from '../../systems/world/terrain-topography-v2146.js';
test('V2146 defines detailed biome landforms and water features',()=>{assert.equal(ETRANOM_TERRAIN_TOPOGRAPHY_V2146.landforms.length,8);assert.equal(ETRANOM_TERRAIN_TOPOGRAPHY_V2146.waterLevels.length,4);});
test('elevation sampling is deterministic and finite',()=>{const a=sampleTerrainElevationV2146(1775,760);assert.equal(a,sampleTerrainElevationV2146(1775,760));assert.ok(Number.isFinite(a));});
test('gradient and surface resolution expose slope/material semantics',()=>{const g=sampleTerrainGradientV2146(2100,1900);const s=resolveTerrainSurfaceV2146(2100,1900);assert.ok(g.slopeClass);assert.ok(s.material);assert.ok(Number.isFinite(s.elevation));});
test('V2146 audit passes without claiming physical collision',()=>{const a=auditTerrainTopographyV2146();assert.equal(a.ok,true);assert.equal(a.physicalColliders,false);assert.equal(a.navmeshIntegration,false);});
