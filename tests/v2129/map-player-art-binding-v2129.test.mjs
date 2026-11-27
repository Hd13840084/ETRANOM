import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { CHARACTER_IDENTITY_ROSTER_V2047 } from '../../systems/characters/character-identity-roster-v2047.js?build=2081';
import { resolveMapSpecializationV2066 } from '../../systems/characters/character-map-binding-v2066.js?v=2129';
import { getCharacterAtlasFrameV2055 } from '../../systems/characters/character-atlas-v2055.js?build=2081';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const readJson = (file) => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));

test('all 40 specialization IDs resolve to their unique canonical map-art identity', () => {
  assert.equal(CHARACTER_IDENTITY_ROSTER_V2047.length, 40);
  const ids = CHARACTER_IDENTITY_ROSTER_V2047.map((entry) => entry.specializationId);
  assert.equal(new Set(ids).size, 40);
  for (const id of ids) {
    assert.equal(resolveMapSpecializationV2066({ specialization_id: id }), id);
    assert.ok(fs.existsSync(path.join(root, 'assets/characters/v2067-map-art', `${id}.png`)));
  }
});

test('legacy catalog IDs and localized specialization names resolve to the correct art', () => {
  const directory = path.join(root, 'content/specializations/catalog');
  const files = fs.readdirSync(directory).filter((name) => name.endsWith('.json'));
  assert.equal(files.length, 40);
  for (const file of files) {
    const spec = JSON.parse(fs.readFileSync(path.join(directory, file), 'utf8'));
    const expected = ({
      warrior_1: 'warrior_sword_ascetic', warrior_2: 'warrior_iron_bastion',
      warrior_3: 'warrior_chaos', warrior_4: 'warrior_apocalypse_harbinger',
      wizard_1: 'wizard_arcane_mage', wizard_2: 'wizard_elementalist',
      wizard_3: 'wizard_warlock', wizard_4: 'wizard_necromancer'
    })[spec.id] || spec.id;
    assert.equal(resolveMapSpecializationV2066({ specialization_id: spec.id }), expected, `${spec.id} legacy ID`);
    assert.equal(resolveMapSpecializationV2066({ specialization: spec.name_fa, class_id: spec.class_id }), expected, `${spec.id} Persian name`);
  }
});

test('every specialization has map art plus all directional/state atlas paths', () => {
  const directions = ['south','south-east','east','north-east','north','north-west','west','south-west'];
  const states = ['idle','walk','run','interact'];
  let count = 0;
  for (const { specializationId } of CHARACTER_IDENTITY_ROSTER_V2047) {
    for (const state of states) for (const direction of directions) {
      const descriptor = getCharacterAtlasFrameV2055(specializationId, state, direction, 0);
      assert.ok(descriptor.url, `${specializationId}/${state}/${direction} should resolve a path`);
      assert.ok(fs.existsSync(path.join(root, descriptor.url.replace(/^\.\//, ''))), descriptor.url);
      count++;
    }
  }
  assert.equal(count, 1280);
});

test('moving local and remote map avatars use the same resolver and canonical presence ID', () => {
  const game = fs.readFileSync(path.join(root, 'game.js'), 'utf8');
  const index = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  assert.ok(game.includes('resolveMapSpecializationV2066(state.character || {})'));
  assert.ok(game.includes('resolveMapSpecializationV2066(other)'));
  assert.ok(game.includes("'./assets/characters/v2067-map-art/' + id + '.png'"));
  assert.ok(game.includes('specialization_id: resolveMapSpecializationV2066(cp)'));
  assert.ok(game.includes('specialization_id: own.specialization_id'));
  assert.ok(index.includes('game.js?v=2166-stage24-world-validation&build=20261127'));
  assert.ok(game.includes("window.__ETRANOM_GAME_BUILD__ = '2166-stage24-world-validation'"));
});
