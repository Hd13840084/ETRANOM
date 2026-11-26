import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { CHARACTER_SPRITE_ASSETS_V2048, auditCharacterSpriteAssetsV2048, getCharacterSpriteAssetV2048 } from '../../systems/characters/character-sprite-assets-v2048.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

test('V2048 provides exactly 40 unique specialization sprite bindings', () => {
  const result = auditCharacterSpriteAssetsV2048();
  assert.equal(result.complete, true, result.errors.join(', '));
  assert.equal(CHARACTER_SPRITE_ASSETS_V2048.length, 40);
  assert.equal(new Set(CHARACTER_SPRITE_ASSETS_V2048.map(x => x.specializationId)).size, 40);
});

test('all 40 SVG files exist and contain valid SVG roots and viewBoxes', () => {
  for (const asset of CHARACTER_SPRITE_ASSETS_V2048) {
    const file = path.join(root, asset.spriteUrl.replace(/^\.\//, ''));
    assert.equal(fs.existsSync(file), true, `${asset.specializationId} missing`);
    const svg = fs.readFileSync(file, 'utf8');
    assert.match(svg, /^<svg\s/);
    assert.match(svg, /viewBox="0 0 96 128"/);
    assert.match(svg, /<title>/);
  }
});

test('sprite resolver returns exact identity and safely rejects unknown IDs', () => {
  assert.equal(getCharacterSpriteAssetV2048('wizard_necromancer').specializationNameFa, 'نکرومنسر');
  assert.equal(getCharacterSpriteAssetV2048('not_a_real_specialization'), null);
});

test('sprite metadata remains presentation-only', () => {
  assert.equal(CHARACTER_SPRITE_ASSETS_V2048.every(x => x.gameplayMutation === false), true);
  assert.equal(CHARACTER_SPRITE_ASSETS_V2048.every(x => x.width === 96 && x.height === 128), true);
});
