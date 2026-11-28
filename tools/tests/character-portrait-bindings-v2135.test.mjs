import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { CHARACTER_IDENTITY_ROSTER_V2047 } from '../../systems/characters/character-identity-roster-v2047.js';
import { getCharacterPortraitV2135, getCharacterPortraitForNameV2135, getCharacterPortraitForPlayerV2135, auditCharacterPortraitBindingsV2135 } from '../../systems/characters/character-portrait-bindings-v2135.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

test('all 40 specialization identities have one canonical portrait path', () => {
  const audit = auditCharacterPortraitBindingsV2135();
  assert.equal(audit.complete, true, JSON.stringify(audit));
  assert.equal(audit.specializationCount, 40);
  assert.equal(audit.uniqueIds, 40);
  for (const entry of CHARACTER_IDENTITY_ROSTER_V2047) {
    const src = getCharacterPortraitV2135(entry.specializationId);
    assert.ok(src, entry.specializationId);
    assert.ok(fs.existsSync(path.join(root, src.replace(/^\.\//, ''))), src);
    assert.equal(getCharacterPortraitForNameV2135(entry.specializationNameFa), src);
  }
});

test('the eight Warrior/Wizard identities use their dedicated painted portraits', () => {
  const expected = {
    wizard_arcane_mage:'arcane_mage_portrait.webp', wizard_elementalist:'elementalist_portrait.webp',
    wizard_warlock:'warlock_portrait.webp', wizard_necromancer:'necromancer_portrait.webp',
    warrior_sword_ascetic:'sword_ascetic_portrait.webp', warrior_iron_bastion:'iron_bastion_portrait.webp',
    warrior_chaos:'chaos_warrior_portrait.webp', warrior_apocalypse_harbinger:'apocalypse_harbinger_portrait.webp'
  };
  for (const [id, file] of Object.entries(expected)) assert.ok(getCharacterPortraitV2135(id).endsWith(file));
});

test('other 32 specializations use their dedicated full-body artwork', () => {
  const special = new Set(['wizard_arcane_mage','wizard_elementalist','wizard_warlock','wizard_necromancer','warrior_sword_ascetic','warrior_iron_bastion','warrior_chaos','warrior_apocalypse_harbinger']);
  const remaining = CHARACTER_IDENTITY_ROSTER_V2047.filter(x => !special.has(x.specializationId));
  assert.equal(remaining.length, 32);
  for (const entry of remaining) assert.equal(getCharacterPortraitV2135(entry.specializationId), `./assets/characters/v2063-fullbody/${entry.specializationId}.webp`);
});

test('player payloads and old display-name aliases resolve to the same canonical portrait', () => {
  assert.equal(getCharacterPortraitForPlayerV2135({ specialization_id:'assassin_3', player_class:'آدمکش' }), getCharacterPortraitV2135('assassin_3'));
  assert.equal(getCharacterPortraitForNameV2135('شوالیه ویرانی'), getCharacterPortraitV2135('warrior_apocalypse_harbinger'));
  assert.equal(getCharacterPortraitForNameV2135('قاتل حرفه‌ای'), getCharacterPortraitV2135('assassin_2'));
});

test('character creation, profile, battle and party UI consume the shared portrait bindings', () => {
  const game = fs.readFileSync(path.join(root,'game.js'),'utf8');
  const party = fs.readFileSync(path.join(root,'systems/party/party-ui.js'),'utf8');
  assert.match(game,/getCharacterPortraitForNameV2135\(name\)/);
  assert.match(game,/function playerClassPortrait\(\).*getCharacterPortraitV2135/);
  assert.match(game,/const portraitSrc = playerClassPortrait\(\)/);
  assert.match(party,/getCharacterPortraitForPlayerV2135/);
  assert.match(party,/etr-party-member-portrait/);
  assert.match(party,/etr-party-ally-portrait/);
});
