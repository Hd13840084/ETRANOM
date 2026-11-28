import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { CHARACTER_IDENTITY_ROSTER_V2047 } from '../../systems/characters/character-identity-roster-v2047.js?build=2134';
import { getCharacterMotionPoseV2134, auditCharacterMotionProfilesV2134 } from '../../systems/characters/character-motion-profiles-v2134.js?v=2134';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

test('all 40 specialization identities receive bounded profiles for all four states', () => {
  const audit = auditCharacterMotionProfilesV2134();
  assert.deepEqual({ ...audit, errors: [...audit.errors] }, { specializationCount: 40, classProfileCount: 10, stateCount: 4, valid: true, errors: [] });
  assert.equal(CHARACTER_IDENTITY_ROSTER_V2047.length, 40);
});

test('agile and armored silhouettes use visibly different but restrained gait envelopes', () => {
  const agile = getCharacterMotionPoseV2134('assassin_1', 'walk', 180, 0);
  const armored = getCharacterMotionPoseV2134('paladin_2', 'walk', 180, 0);
  assert.ok(Math.abs(agile.sway) > Math.abs(armored.sway));
  assert.ok(armored.shadowScaleX > agile.shadowScaleX);
  assert.ok(Math.abs(agile.tilt) >= Math.abs(armored.tilt));
});

test('same specialization and time always produce deterministic pose values', () => {
  const a = getCharacterMotionPoseV2134('wizard_necromancer', 'run', 345, 0);
  const b = getCharacterMotionPoseV2134('wizard_necromancer', 'run', 345, 0);
  assert.deepEqual(a, b);
});

test('unknown specialization safely retains the shared base pose', () => {
  const unknown = getCharacterMotionPoseV2134('unknown_spec', 'idle', 240, 14);
  const validFallback = getCharacterMotionPoseV2134('', 'idle', 240, 14);
  assert.equal(unknown.specializationMotionProfile, undefined);
  assert.deepEqual(unknown, validFallback);
});

test('local and remote map avatars use the same specialization-aware pose module', () => {
  const game = fs.readFileSync(path.join(root, 'game.js'), 'utf8');
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  assert.match(game, /getCharacterMotionPoseV2134\(spriteId, playerAnimation/);
  assert.match(game, /getCharacterMotionPoseV2134\(remoteSpecId, remoteAnimation/);
  assert.match(game, /2135-atlas-keyframe-completion/);
  assert.match(html, /game\.js\?v=2135-atlas-keyframe-completion/);
});
