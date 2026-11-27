import test from 'node:test';
import assert from 'node:assert/strict';
import { CHARACTER_IDENTITY_ROSTER_V2047 } from '../../systems/characters/character-identity-roster-v2047.js';
import { resolveMapSpecializationV2066, getMapCharacterArtStatusV2066 } from '../../systems/characters/character-map-binding-v2066.js';

test('map renderer resolves all 40 canonical specializations', () => {
  assert.equal(getMapCharacterArtStatusV2066().complete, true);
  assert.equal(getMapCharacterArtStatusV2066().specializationCount, 40);
  for (const item of CHARACTER_IDENTITY_ROSTER_V2047) {
    assert.equal(resolveMapSpecializationV2066({ specialization_id: item.specializationId }), item.specializationId);
  }
});
test('map renderer resolves class fallbacks and Persian labels', () => {
  const cases = [
    [{ archetype:'جادوگر' }, 'wizard_arcane_mage'], [{ class_id:'warrior' }, 'warrior_sword_ascetic'],
    [{ player_class:'assassin' }, 'assassin_1'], [{ class:'gunner' }, 'gunner_1'],
    [{ archetype:'راهب' }, 'monk_1'], [{ archetype:'paladin' }, 'paladin_1'],
    [{ archetype:'کشیش' }, 'priest_1'], [{ archetype:'ranger' }, 'ranger_1'],
    [{ archetype:'شمن' }, 'shaman_1'], [{ archetype:'summoner' }, 'summoner_1'],
    [{ specialization:'نکرومنسر' }, 'wizard_necromancer']
  ];
  for (const [input, expected] of cases) assert.equal(resolveMapSpecializationV2066(input), expected);
});
