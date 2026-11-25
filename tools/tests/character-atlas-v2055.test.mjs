import test from 'node:test';
import assert from 'node:assert/strict';
import { CHARACTER_ATLAS_DIRECTIONS_V2055, CHARACTER_ATLAS_STATES_V2055, CHARACTER_ATLAS_EXPECTED_ASSET_COUNT_V2055, getCharacterAtlasFrameV2055, normalizeCharacterAtlasDirectionV2055, auditCharacterAtlasContractV2055 } from '../../systems/characters/character-atlas-v2055.js';

test('atlas contract covers 40 specializations x 8 directions x 4 states', () => {
  const audit = auditCharacterAtlasContractV2055();
  assert.equal(audit.complete, true, audit.errors.join(', '));
  assert.equal(audit.specializationCount, 40);
  assert.equal(audit.directionCount, 8);
  assert.equal(audit.stateCount, 4);
  assert.equal(audit.expectedAssetCount, 1280);
  assert.equal(CHARACTER_ATLAS_EXPECTED_ASSET_COUNT_V2055, 1280);
});

test('all direction-state combinations resolve to unique authored PNG paths', () => {
  const ids = ['wizard_arcane_mage','warrior_sword_ascetic','assassin_1'];
  const paths = new Set();
  for (const id of ids) for (const state of Object.keys(CHARACTER_ATLAS_STATES_V2055)) for (const direction of CHARACTER_ATLAS_DIRECTIONS_V2055) {
    const d = getCharacterAtlasFrameV2055(id,state,direction,999);
    assert.ok(d.url.endsWith(`/${state}_${direction}.png`));
    assert.equal(d.frameIndex,d.frameCount-1);
    assert.equal(d.expectedWidth,d.frameWidth*d.frameCount);
    paths.add(d.url);
  }
  assert.equal(paths.size,96);
});

test('unknown specialization and invalid direction fail safely', () => {
  assert.equal(getCharacterAtlasFrameV2055('unknown','idle','side').url,null);
  assert.equal(normalizeCharacterAtlasDirectionV2055('side'),'south');
  assert.equal(normalizeCharacterAtlasDirectionV2055('north_west'),'north-west');
});

test('animation clips declare deterministic frame timing and loop policy', () => {
  assert.deepEqual(Object.keys(CHARACTER_ATLAS_STATES_V2055),['idle','walk','run','interact']);
  assert.equal(CHARACTER_ATLAS_STATES_V2055.idle.loop,true);
  assert.equal(CHARACTER_ATLAS_STATES_V2055.walk.loop,true);
  assert.equal(CHARACTER_ATLAS_STATES_V2055.run.loop,true);
  assert.equal(CHARACTER_ATLAS_STATES_V2055.interact.loop,false);
});
