/**
 * ETRANOM V2131 — state-aware 8-way character animation clock.
 *
 * The v2055 atlases are existing 6/8-frame directional strips. This controller
 * makes their playback deterministic per actor, restarts clips on state changes,
 * keeps one-shot interaction poses from starting at the end of page uptime, and
 * prevents moving remote coordinates from continuously changing animation phase.
 */
import { CHARACTER_ATLAS_DIRECTIONS_V2055, CHARACTER_ATLAS_STATES_V2055 } from './character-atlas-v2055.js?build=2131';

const DIRECTIONS = CHARACTER_ATLAS_DIRECTIONS_V2055;
const STATES = Object.freeze(Object.keys(CHARACTER_ATLAS_STATES_V2055));
const DEFAULT_INTERACT_HOLD_MS = 1050;
const MAX_CLOCKS = 180;

export function resolveCharacterDirectionV2131(dx = 0, dy = 0, fallback = 'south') {
  const x = Number(dx) || 0;
  const y = Number(dy) || 0;
  if (Math.hypot(x, y) < 0.12) return DIRECTIONS.includes(fallback) ? fallback : 'south';
  const angle = (Math.atan2(x, y) + Math.PI * 2) % (Math.PI * 2);
  return DIRECTIONS[Math.round(angle / (Math.PI / 4)) % 8];
}

export function resolveCharacterAnimationV2131({ moving = false, running = false, interacting = false, forcedState = null } = {}) {
  if (STATES.includes(forcedState)) return forcedState;
  if (interacting) return 'interact';
  if (!moving) return 'idle';
  return running ? 'run' : 'walk';
}

export function createCharacterAnimationClockV2131() {
  return new Map();
}

export function hashCharacterAnimationSeedV2131(value = '') {
  const text = String(value ?? 'etranom');
  let hash = 2166136261;
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

/**
 * Returns state-relative clip time. Looping clips get a stable per-actor phase;
 * interaction starts at frame zero and holds its final authored pose briefly
 * so remote clients can render it even with Presence's bounded update cadence.
 */
export function getCharacterAnimationTimingV2131(clockStore, actorId, requestedState = 'idle', nowMs = 0, options = {}) {
  const store = clockStore instanceof Map ? clockStore : createCharacterAnimationClockV2131();
  const actor = String(actorId || '__anonymous__');
  const requested = STATES.includes(requestedState) ? requestedState : 'idle';
  const now = Math.max(0, Number(nowMs) || 0);
  const clips = CHARACTER_ATLAS_STATES_V2055;
  const clip = clips[requested];
  let entry = store.get(actor);

  if (!entry || entry.requestedState !== requested) {
    entry = { requestedState: requested, startedAt: now, lastSeenAt: now, phaseSeed: hashCharacterAnimationSeedV2131(actor) };
    store.set(actor, entry);
  }
  entry.lastSeenAt = now;

  const rawElapsed = Math.max(0, now - entry.startedAt);
  const clipDurationMs = clip.frames * 1000 / clip.fps;
  const interactionHoldMs = Math.max(clipDurationMs, Number(options.interactionHoldMs) || DEFAULT_INTERACT_HOLD_MS);
  const interactionFinished = requested === 'interact' && rawElapsed >= interactionHoldMs;
  const phaseLimit = Math.max(1, Math.min(clipDurationMs, 1500));
  const phaseMs = requested === 'idle' ? entry.phaseSeed % phaseLimit : 0;

  let state = requested;
  let elapsedMs = rawElapsed;
  let finished = false;
  if (interactionFinished) {
    state = 'idle';
    elapsedMs = rawElapsed - interactionHoldMs;
    finished = true;
  }

  // Bound per-render actor state, especially when the map has many transient players.
  if (store.size > MAX_CLOCKS) {
    const oldest = [...store.entries()].sort((a, b) => a[1].lastSeenAt - b[1].lastSeenAt).slice(0, store.size - MAX_CLOCKS);
    for (const [key] of oldest) if (key !== actor) store.delete(key);
  }

  return Object.freeze({
    actorId: actor,
    requestedState: requested,
    state,
    elapsedMs: state === 'interact' ? Math.min(elapsedMs, Math.max(0, clipDurationMs - 1)) : elapsedMs,
    phaseMs: state === 'interact' ? 0 : phaseMs,
    clipDurationMs,
    interactionFinished: finished,
    phaseSeed: entry.phaseSeed
  });
}

export function getCharacterAnimationPoseV2131(state = 'idle', elapsedMs = 0, phaseMs = 0) {
  const key = STATES.includes(state) ? state : 'idle';
  const totalMs = Math.max(0, Number(elapsedMs) || 0) + Math.max(0, Number(phaseMs) || 0);
  const seconds = totalMs / 1000;
  let bob = 0, scaleX = 1, scaleY = 1, tilt = 0, lean = 0, sway = 0;
  let shadowScaleX = 1, shadowAlpha = 0.34;

  if (key === 'idle') {
    // Subtle breathing and weight shift keep standing characters alive without
    // making pixel-art silhouettes wobble or drift away from their ground anchor.
    const breath = Math.sin(seconds * Math.PI * 2 * 0.92);
    const weight = Math.sin(seconds * Math.PI * 2 * 0.46);
    bob = breath * 0.34;
    scaleY = 1 + breath * 0.005;
    sway = weight * 0.22;
    tilt = weight * 0.003;
    shadowScaleX = 1 - Math.abs(breath) * 0.012;
  } else if (key === 'walk') {
    // One complete gait per eight-frame strip; a restrained opposite body sway
    // and alternating lift make the existing authored strip read as locomotion.
    const gait = seconds * Math.PI * 2 * 1.5;
    const step = Math.sin(gait);
    bob = (1 - Math.cos(gait * 2)) * 0.34;
    sway = step * 0.62;
    tilt = step * 0.018;
    scaleX = 1 + Math.cos(gait) * 0.006;
    scaleY = 1 - Math.abs(step) * 0.004;
    lean = 0.035;
    shadowScaleX = 1 + Math.abs(step) * 0.055;
    shadowAlpha = 0.30;
  } else if (key === 'run') {
    const gait = seconds * Math.PI * 2 * 2.5;
    const step = Math.sin(gait);
    bob = (1 - Math.cos(gait * 2)) * 0.58;
    sway = step * 0.9;
    tilt = step * 0.032;
    scaleX = 1 + Math.cos(gait) * 0.009;
    scaleY = 1 - Math.abs(step) * 0.007;
    lean = 0.075;
    shadowScaleX = 1 + Math.abs(step) * 0.09;
    shadowAlpha = 0.27;
  } else if (key === 'interact') {
    const duration = CHARACTER_ATLAS_STATES_V2055.interact.frames * 1000 / CHARACTER_ATLAS_STATES_V2055.interact.fps;
    const progress = Math.max(0, Math.min(1, totalMs / duration));
    const reach = Math.sin(progress * Math.PI);
    bob = -reach * 1.05;
    sway = Math.sin(progress * Math.PI * 2) * 0.18;
    tilt = -reach * 0.018;
    scaleX = 1 + reach * 0.012;
    scaleY = 1 - reach * 0.008;
    lean = reach * 0.045;
    shadowScaleX = 1 + reach * 0.025;
    shadowAlpha = 0.32;
  }

  return Object.freeze({
    state: key,
    frameCount: CHARACTER_ATLAS_STATES_V2055[key].frames,
    fps: CHARACTER_ATLAS_STATES_V2055[key].fps,
    loop: CHARACTER_ATLAS_STATES_V2055[key].loop,
    elapsedMs: totalMs,
    bob, sway, scaleX, scaleY, tilt, lean, shadowScaleX, shadowAlpha
  });
}

export function auditCharacterAnimationV2131() {
  return Object.freeze({
    directions: DIRECTIONS.length,
    states: STATES.length,
    stateRelativeClock: true,
    oneShotInteraction: true,
    stableActorPhase: true,
    valid: DIRECTIONS.length === 8 && STATES.join(',') === 'idle,walk,run,interact'
  });
}
