/** ETRANOM V2064 — unified directional animation controller. */
import { CHARACTER_ATLAS_DIRECTIONS_V2055, CHARACTER_ATLAS_STATES_V2055 } from './character-atlas-v2055.js';

const DIRS = CHARACTER_ATLAS_DIRECTIONS_V2055;
const STATES = Object.freeze(Object.keys(CHARACTER_ATLAS_STATES_V2055));
export function resolveCharacterDirectionV2064(dx=0,dy=0,fallback='south') {
  const x=Number(dx)||0, y=Number(dy)||0;
  if(Math.hypot(x,y)<0.12) return DIRS.includes(fallback)?fallback:'south';
  // Canvas/world coordinates: positive Y points south.
  const angle=(Math.atan2(x,y)+Math.PI*2)%(Math.PI*2);
  const index=Math.round(angle/(Math.PI/4))%8;
  return DIRS[index];
}
export function resolveCharacterAnimationV2064({moving=false,running=false,interacting=false,forcedState=null}={}) {
  if(STATES.includes(forcedState)) return forcedState;
  if(interacting) return 'interact';
  if(!moving) return 'idle';
  return running?'run':'walk';
}
export function getCharacterAnimationFrameV2064(state='idle',elapsedMs=0,phaseMs=0) {
  const key=STATES.includes(state)?state:'idle';
  const clip=CHARACTER_ATLAS_STATES_V2055[key];
  const elapsed=Math.max(0,Number(elapsedMs)||0)+Math.max(0,Number(phaseMs)||0);
  const raw=Math.floor(elapsed*clip.fps/1000);
  const frame=clip.loop?raw%clip.frames:Math.min(clip.frames-1,raw);
  return Object.freeze({state:key,frame,frameCount:clip.frames,fps:clip.fps,loop:clip.loop,complete:!clip.loop&&raw>=clip.frames});
}
export function getCharacterAnimationPoseV2064(state='idle',elapsedMs=0,phaseMs=0) {
  const clip=getCharacterAnimationFrameV2064(state,elapsedMs,phaseMs);
  const t=Math.max(0,Number(elapsedMs)||0)+Math.max(0,Number(phaseMs)||0);
  const phase=t/1000, wave=Math.sin(phase*Math.PI*2), step=Math.sin(phase*Math.PI*2);
  let bob=0,scaleX=1,scaleY=1,tilt=0,lean=0;
  if(clip.state==='idle'){
    // Subtle breathing and weight shift; keep the feet planted.
    bob=Math.sin(phase*2.4)*.65;
    scaleX=1+Math.sin(phase*2.4)*.006;
    scaleY=1+Math.sin(phase*2.4+Math.PI/2)*.012;
    tilt=Math.sin(phase*1.2)*.012;
  }
  if(clip.state==='walk'){
    // The source strips are pose prototypes, so add a more legible locomotion cadence
    // around the feet anchor rather than pretending the source frames are hand-animated.
    bob=(1-Math.cos(phase*12))*1.65;
    scaleX=1+Math.cos(phase*12)*.035;
    scaleY=1-Math.cos(phase*12)*.018;
    tilt=Math.sin(phase*6)*.045;
    lean=.07;
  }
  if(clip.state==='run'){
    bob=(1-Math.cos(phase*19))*2.2;
    scaleX=1+Math.cos(phase*19)*.055;
    scaleY=1-Math.cos(phase*19)*.028;
    tilt=Math.sin(phase*9.5)*.065;
    lean=.14;
  }
  if(clip.state==='interact'){
    const p=Math.min(1,(t%720)/720), reach=Math.sin(p*Math.PI);
    bob=-reach*2.2;
    scaleX=1+reach*.025;
    scaleY=1-reach*.018;
    tilt=-reach*.055;
    lean=reach*.11;
  }
  return Object.freeze({...clip,bob,scaleX,scaleY,tilt,lean});
}
export function auditCharacterAnimationV2064(){return Object.freeze({directions:DIRS.length,states:STATES.length,valid:DIRS.length===8&&STATES.join(',')==='idle,walk,run,interact'});}
