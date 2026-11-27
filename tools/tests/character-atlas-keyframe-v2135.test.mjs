import assert from 'node:assert/strict';
import { CHARACTER_IDENTITY_ROSTER_V2047 } from '../../systems/characters/character-identity-roster-v2047.js';
import { CHARACTER_ATLAS_DIRECTIONS_V2055, CHARACTER_ATLAS_STATES_V2055, getCharacterAtlasFrameV2055 } from '../../systems/characters/character-atlas-v2055.js';
import { getCharacterAtlasPlaybackProfileV2135, resolveCharacterAtlasProfileFrameV2135, auditCharacterAtlasPlaybackV2135 } from '../../systems/characters/character-atlas-playback-v2135.js';
import { getAtlasDrawCommandV2059 } from '../../systems/characters/character-atlas-runtime-v2059.js';

const roster = CHARACTER_IDENTITY_ROSTER_V2047;
assert.equal(roster.length, 40, '40 specializations must exist');
assert.equal(new Set(roster.map(x => x.specializationId)).size, 40, 'specialization IDs must be unique');
assert.equal(CHARACTER_ATLAS_DIRECTIONS_V2055.length, 8);
assert.equal(Object.keys(CHARACTER_ATLAS_STATES_V2055).length, 4);

const audit = auditCharacterAtlasPlaybackV2135();
assert.equal(audit.valid, true, JSON.stringify(audit.errors));
assert.equal(audit.profileCount, 1064);

let profileCount = 0;
for (const entry of roster) {
  for (const state of Object.keys(CHARACTER_ATLAS_STATES_V2055)) {
    for (const direction of CHARACTER_ATLAS_DIRECTIONS_V2055) {
      const profile = getCharacterAtlasPlaybackProfileV2135(entry.specializationId, state, direction);
      if (profile) {
        profileCount++;
        assert.equal(profile.frames.length, profile.durations.length);
        assert.ok(profile.durationMs > 0);
        for (const frame of profile.frames) assert.ok(frame >= 0 && frame < CHARACTER_ATLAS_STATES_V2055[state].frames);
        const first = resolveCharacterAtlasProfileFrameV2135(profile, 0, state !== 'interact');
        assert.equal(first, profile.frames[0]);
        const cmd = getAtlasDrawCommandV2059({ specializationId: entry.specializationId, state, direction, elapsedMs: 0 });
        assert.equal(cmd.frameIndex, first);
        const authored = ['warrior_apocalypse_harbinger','wizard_arcane_mage','wizard_elementalist','wizard_necromancer','wizard_warlock'].includes(entry.specializationId);
        const expectedRoot = entry.specializationId === 'warrior_apocalypse_harbinger' ? 'v2060-authored' : 'v2061-authored';
        assert.equal(cmd.descriptor.url, authored ? `./assets/characters/${expectedRoot}/${entry.specializationId}/${state}_${direction}.png` : `./assets/characters/v2055/${entry.specializationId}/${state}_${direction}.png`);
      }
    }
  }
}
assert.equal(profileCount, 1064);

// Periodic gait strips are reduced to one exact authored cycle while preserving clip duration.
const walk = getCharacterAtlasPlaybackProfileV2135('assassin_1', 'walk', 'south');
assert.equal(walk.kind, 'periodic_cycle');
assert.deepEqual(walk.frames, [0,1,2,3]);
assert.equal(walk.durationMs, 666.6667);
// Held idle/interact frames keep their intentional timing weights.
const idle = getCharacterAtlasPlaybackProfileV2135('assassin_1', 'idle', 'south');
assert.equal(idle.kind, 'held_keyframes');
assert.deepEqual(idle.durations, [1,2,1,2]);
const interact = getCharacterAtlasPlaybackProfileV2135('assassin_1', 'interact', 'south');
assert.equal(interact.kind, 'held_keyframes');
assert.deepEqual(interact.durations, [1,1,4,1,1]);

console.log(JSON.stringify({specializations: roster.length, directions: 8, states: 4, profileCount, audit}, null, 2));
