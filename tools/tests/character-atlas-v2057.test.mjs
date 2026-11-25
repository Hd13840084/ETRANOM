import test from 'node:test';
import assert from 'node:assert/strict';
import { getCharacterAtlasFrameV2055, getCharacterAtlasLoadStatusV2055, clearCharacterAtlasImageCacheV2055 } from '../../systems/characters/character-atlas-v2055.js';

test('atlas descriptors explicitly identify procedural artwork as prototype quality', () => {
  const descriptor = getCharacterAtlasFrameV2055('warrior_iron_bastion','walk','north-east',2);
  assert.equal(descriptor.artQuality, 'multi_frame_directional_prototype');
  assert.equal(descriptor.generatedPrototype, true);
  assert.equal(descriptor.authoredAssetRequired, false);
});

test('atlas load status reports unrequested and failed states safely', () => {
  clearCharacterAtlasImageCacheV2055();
  assert.equal(getCharacterAtlasLoadStatusV2055('./not-requested.png'), 'not_requested');
});
