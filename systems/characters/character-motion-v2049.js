/** ETRANOM V2049 — deterministic 8-way locomotion and animation state helpers. */
export const CHARACTER_MOTION_VERSION_V2049 = '2049.0.0';
export const CHARACTER_DIRECTIONS_V2049 = Object.freeze(['south','south-east','east','north-east','north','north-west','west','south-west']);
export function resolveCharacterDirectionV2049(x=0,y=0,fallback='south') {
  const dx=Number(x)||0,dy=Number(y)||0;
  if(Math.hypot(dx,dy)<0.08) return CHARACTER_DIRECTIONS_V2049.includes(fallback)?fallback:'south';
  const angle=(Math.atan2(dy,dx)+Math.PI*2)%(Math.PI*2);
  const clockwiseFromEast=['east','south-east','south','south-west','west','north-west','north','north-east'];
  return clockwiseFromEast[Math.round(angle/(Math.PI/4))%8];
}
export function resolveCharacterAnimationV2049({moving=false,running=false,interacting=false}={}) {
  if(interacting) return 'interact';
  if(!moving) return 'idle';
  return running?'run':'walk';
}
export function resolveCharacterMotionVectorV2049({stickX=0,stickY=0,keyX=0,keyY=0}={}) {
  let x=(Number(stickX)||0)+(Number(keyX)||0), y=(Number(stickY)||0)+(Number(keyY)||0);
  const length=Math.hypot(x,y);
  if(length>1){x/=length;y/=length;}
  return Object.freeze({x,y,moving:length>=0.08});
}
