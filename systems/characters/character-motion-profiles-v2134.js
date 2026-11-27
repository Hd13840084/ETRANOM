/**
 * ETRANOM V2134 — specialization-aware map-character motion profiles.
 *
 * The existing authored atlas remains the source of each specialization's
 * identity and frame sequence. This module only tunes the very small whole-body
 * motion envelope around the existing feet anchor; it does not fabricate limb,
 * weapon, cape or attack frames that are not present in the source artwork.
 */
import { CHARACTER_IDENTITY_ROSTER_V2047 } from './character-identity-roster-v2047.js?build=2134';
import { getCharacterAnimationPoseV2131 } from './character-animation-v2131.js?v=2131';

export const CHARACTER_MOTION_PROFILE_VERSION_V2134 = '2134.0.0';

// Factors are intentionally restrained: values tune the current pose, not create
// a new animation. Lower sway on heavy gear keeps rifles, shields and plate armor
// visually stable; agile silhouettes receive a little more lateral travel.
const CLASS_PROFILES = Object.freeze({
  assassin: Object.freeze({ idle: [0.92, 1.16, 1.10, 0.98, 1.00], walk: [1.06, 1.22, 1.12, 1.02, 1.00], run: [1.08, 1.18, 1.12, 1.04, 1.00], interact: [1.04, 1.12, 1.08, 1.02, 1.00] }),
  gunner: Object.freeze({ idle: [0.88, 0.76, 0.78, 1.08, 1.08], walk: [0.86, 0.78, 0.76, 1.06, 1.12], run: [0.92, 0.84, 0.82, 1.10, 1.10], interact: [0.96, 0.82, 0.82, 1.08, 1.08] }),
  monk: Object.freeze({ idle: [0.94, 1.10, 0.96, 1.00, 1.00], walk: [1.02, 1.16, 0.98, 0.92, 1.00], run: [1.04, 1.12, 0.98, 0.96, 1.02], interact: [1.08, 1.14, 1.00, 0.92, 1.00] }),
  paladin: Object.freeze({ idle: [0.82, 0.72, 0.72, 1.14, 1.14], walk: [0.82, 0.72, 0.70, 0.94, 1.16], run: [0.86, 0.76, 0.74, 1.00, 1.15], interact: [0.90, 0.78, 0.76, 0.98, 1.14] }),
  priest: Object.freeze({ idle: [0.82, 0.84, 0.78, 0.98, 0.98], walk: [0.84, 0.84, 0.80, 0.90, 0.98], run: [0.88, 0.88, 0.82, 0.94, 1.00], interact: [1.02, 0.90, 0.86, 0.90, 0.98] }),
  ranger: Object.freeze({ idle: [0.96, 1.02, 0.98, 1.00, 1.00], walk: [1.06, 1.10, 1.04, 1.02, 1.00], run: [1.08, 1.08, 1.04, 1.04, 1.02], interact: [0.98, 1.00, 0.96, 0.98, 1.00] }),
  shaman: Object.freeze({ idle: [1.02, 1.06, 0.98, 1.00, 1.00], walk: [0.96, 1.00, 0.96, 0.96, 1.00], run: [1.00, 0.98, 0.94, 0.98, 1.02], interact: [1.10, 1.10, 1.04, 1.02, 1.02] }),
  summoner: Object.freeze({ idle: [0.92, 0.88, 0.84, 1.04, 1.04], walk: [0.90, 0.84, 0.82, 0.94, 1.06], run: [0.92, 0.86, 0.84, 0.98, 1.06], interact: [1.08, 1.06, 1.00, 0.98, 1.04] }),
  warrior: Object.freeze({ idle: [0.84, 0.74, 0.72, 1.16, 1.16], walk: [0.82, 0.76, 0.72, 1.08, 1.16], run: [0.86, 0.80, 0.76, 1.12, 1.16], interact: [0.94, 0.84, 0.80, 1.08, 1.14] }),
  wizard: Object.freeze({ idle: [0.96, 0.92, 0.84, 1.02, 1.02], walk: [0.90, 0.92, 0.84, 0.96, 1.02], run: [0.94, 0.94, 0.86, 0.98, 1.04], interact: [1.12, 1.08, 1.02, 1.04, 1.02] })
});

const rosterById = new Map(CHARACTER_IDENTITY_ROSTER_V2047.map(entry => [entry.specializationId, entry]));
const variationById = new Map();
const familyCounters = new Map();
for (const entry of CHARACTER_IDENTITY_ROSTER_V2047) {
  const index = familyCounters.get(entry.classId) || 0;
  familyCounters.set(entry.classId, index + 1);
  variationById.set(entry.specializationId, [0.985, 1.000, 1.015, 1.030][index % 4]);
}

const clamp = (value, min, max) => Math.max(min, Math.min(max, Number.isFinite(value) ? value : 0));

/** Returns the existing base pose with a bounded, class-aware motion envelope. */
export function getCharacterMotionPoseV2134(specializationId, state = 'idle', elapsedMs = 0, phaseMs = 0) {
  const id = String(specializationId || '').trim();
  const identity = rosterById.get(id);
  const base = getCharacterAnimationPoseV2131(state, elapsedMs, phaseMs);
  if (!identity) return base;

  const group = CLASS_PROFILES[identity.classId];
  const row = group?.[base.state];
  if (!row) return base;
  const variation = variationById.get(id) || 1;
  const [bobFactor, swayFactor, tiltFactor, leanFactor, shadowFactor] = row;
  const apply = (value, factor) => value * factor * variation;

  return Object.freeze({
    ...base,
    bob: clamp(apply(base.bob, bobFactor), -2.4, 2.4),
    sway: clamp(apply(base.sway, swayFactor), -1.7, 1.7),
    tilt: clamp(apply(base.tilt, tiltFactor), -0.045, 0.045),
    lean: clamp(apply(base.lean, leanFactor), -0.12, 0.12),
    scaleX: clamp(1 + (base.scaleX - 1) * variation, 0.985, 1.015),
    scaleY: clamp(1 + (base.scaleY - 1) * bobFactor * variation, 0.985, 1.015),
    shadowScaleX: clamp(1 + (base.shadowScaleX - 1) * shadowFactor * variation, 0.80, 1.25),
    specializationMotionProfile: identity.classId
  });
}

export function auditCharacterMotionProfilesV2134() {
  const errors = [];
  for (const entry of CHARACTER_IDENTITY_ROSTER_V2047) {
    if (!CLASS_PROFILES[entry.classId]) errors.push(`missing_class_profile:${entry.specializationId}`);
    if (!variationById.has(entry.specializationId)) errors.push(`missing_variation:${entry.specializationId}`);
    for (const state of ['idle', 'walk', 'run', 'interact']) {
      const pose = getCharacterMotionPoseV2134(entry.specializationId, state, 237, 31);
      if (![pose.bob, pose.sway, pose.tilt, pose.lean, pose.scaleX, pose.scaleY, pose.shadowScaleX].every(Number.isFinite)) {
        errors.push(`non_finite_pose:${entry.specializationId}/${state}`);
      }
      if (Math.abs(pose.tilt) > 0.045 || Math.abs(pose.sway) > 1.7 || pose.scaleX < 0.985 || pose.scaleX > 1.015 || pose.scaleY < 0.985 || pose.scaleY > 1.015 || pose.shadowScaleX < 0.80 || pose.shadowScaleX > 1.25) {
        errors.push(`pose_out_of_bounds:${entry.specializationId}/${state}`);
      }
    }
  }
  return Object.freeze({ specializationCount: CHARACTER_IDENTITY_ROSTER_V2047.length, classProfileCount: Object.keys(CLASS_PROFILES).length, stateCount: 4, valid: errors.length === 0, errors: Object.freeze(errors) });
}
