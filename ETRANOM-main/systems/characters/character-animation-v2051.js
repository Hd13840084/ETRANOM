/**
 * ETRANOM V2051 — deterministic procedural animation pose profiles.
 * This layer animates the existing 40 prototype SVG sprites without changing
 * combat, collision, movement authority, persistence, or network permissions.
 */
export const CHARACTER_ANIMATION_VERSION_V2051 = '2051.0.0';
export const CHARACTER_ANIMATION_STATES_V2051 = Object.freeze(['idle','walk','run','interact']);
export const CHARACTER_ANIMATION_DIRECTIONS_V2051 = Object.freeze([
  'south','south-east','east','north-east','north','north-west','west','south-west'
]);
export const CHARACTER_ANIMATION_CLIPS_V2051 = Object.freeze({
  idle: Object.freeze({ durationMs: 960, frames: 4, loop: true }),
  walk: Object.freeze({ durationMs: 440, frames: 6, loop: true }),
  run: Object.freeze({ durationMs: 300, frames: 6, loop: true }),
  interact: Object.freeze({ durationMs: 720, frames: 4, loop: false })
});

export function resolveCharacterAnimationFrameV2051(state='idle', timeMs=0, phase=0) {
  const key = CHARACTER_ANIMATION_STATES_V2051.includes(state) ? state : 'idle';
  const clip = CHARACTER_ANIMATION_CLIPS_V2051[key];
  const time = Math.max(0, Number(timeMs) || 0) + (Number(phase) || 0);
  const progress = clip.loop ? (time % clip.durationMs) / clip.durationMs : Math.min(1, time / clip.durationMs);
  return Object.freeze({ state:key, frame:Math.min(clip.frames-1, Math.floor(progress*clip.frames)), frameCount:clip.frames, progress, complete:!clip.loop && progress>=1 });
}

export function getCharacterAnimationPoseV2051(state='idle', timeMs=0, phase=0) {
  const frame = resolveCharacterAnimationFrameV2051(state,timeMs,phase);
  const t = Math.max(0, Number(timeMs)||0) + (Number(phase)||0);
  let bob=0, scaleX=1, scaleY=1, tilt=0;
  if(frame.state==='idle') bob=Math.sin(t/480)*0.65;
  else if(frame.state==='walk') { bob=Math.sin(t/73)*1.45; tilt=Math.sin(t/146)*0.025; }
  else if(frame.state==='run') { bob=Math.sin(t/48)*2.1; scaleY=1+Math.max(0,Math.sin(t/48))*0.035; tilt=Math.sin(t/96)*0.045; }
  else { bob=-1.35+Math.sin(t/125)*0.35; scaleX=1+Math.sin(t/125)*0.012; }
  return Object.freeze({ ...frame, bob, scaleX, scaleY, tilt });
}

export function isValidCharacterAnimationDirectionV2051(direction) {
  return CHARACTER_ANIMATION_DIRECTIONS_V2051.includes(direction);
}
