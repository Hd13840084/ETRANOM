import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { CHARACTER_ATLAS_DIRECTIONS_V2055, getCharacterAtlasFrameV2055 } from '../../systems/characters/character-atlas-v2055.js';
import { getAtlasDrawCommandV2059 } from '../../systems/characters/character-atlas-runtime-v2059.js';

const root = process.cwd();
const id = 'warrior_apocalypse_harbinger';
const wizardIds = ['wizard_arcane_mage','wizard_elementalist','wizard_warlock','wizard_necromancer'];
const states = ['idle','walk','run','interact'];

test('V2064 provides a valid multi-frame PNG atlas for every state and direction', () => {
  for (const state of states) for (const direction of CHARACTER_ATLAS_DIRECTIONS_V2055) {
    const descriptor = getCharacterAtlasFrameV2055(id, state, direction, 5);
    assert.equal(descriptor.artQuality, 'multi_frame_directional_prototype');
    assert.equal(descriptor.generatedPrototype, true);
    assert.equal(descriptor.frameCount, state === 'idle' ? 6 : 8);
    assert.equal(descriptor.expectedWidth, 128 * descriptor.frameCount);
    assert.equal(descriptor.expectedHeight, 160);
    assert.ok(existsSync(resolve(root, descriptor.url.replace('./',''))), descriptor.url);
  }
});

test('V2064 animation runtime clamps source frame geometry within the atlas', () => {
  const command = getAtlasDrawCommandV2059({ specializationId:id, state:'run', direction:'north-west', elapsedMs:999999 });
  assert.ok(command.sourceX >= 0);
  assert.equal(command.sourceWidth, 128);
  assert.ok(command.frameIndex >= 0 && command.frameIndex < 8);
});

test('all four wizard specializations have multi-frame directional atlases', () => {
  for (const specializationId of wizardIds) for (const state of states) for (const direction of CHARACTER_ATLAS_DIRECTIONS_V2055) {
    const descriptor = getCharacterAtlasFrameV2055(specializationId,state,direction,7);
    assert.equal(descriptor.artQuality, 'multi_frame_directional_prototype');
    assert.equal(descriptor.generatedPrototype, true);
    assert.equal(descriptor.frameCount, state === 'idle' ? 6 : 8);
    assert.ok(existsSync(resolve(root, descriptor.url.replace('./',''))), descriptor.url);
  }
});

test('other specializations retain their existing multi-frame prototype contract', () => {
  const descriptor = getCharacterAtlasFrameV2055('warrior_iron_bastion','walk','east',3);
  assert.equal(descriptor.generatedPrototype, true);
  assert.equal(descriptor.frameCount, 8);
  assert.equal(descriptor.expectedWidth, 1024);
});

test('the original authored concept manifest records its single-frame limitation honestly', () => {
  const manifest = JSON.parse(readFileSync(resolve(root, 'assets/characters/v2060-authored/warrior_apocalypse_harbinger/manifest.json'),'utf8'));
  assert.equal(manifest.frameCountPerPose, 1);
  assert.match(manifest.limitations, /not multi-frame/i);
});
