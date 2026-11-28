// ETRANOM V2173 — preserve upright authored sprites on the new orthographic world plane.
// Cancel only the world projection around image quads and upright vector actors.
const WORLD_PROJECTION = Object.freeze({ a: 0.96, b: 0, c: 0, d: 0.82 });
const DET = WORLD_PROJECTION.a * WORLD_PROJECTION.d - WORLD_PROJECTION.b * WORLD_PROJECTION.c;
const INV_WORLD = Object.freeze({
  a: WORLD_PROJECTION.d / DET,
  b: -WORLD_PROJECTION.b / DET,
  c: -WORLD_PROJECTION.c / DET,
  d: WORLD_PROJECTION.a / DET
});
const INSTALLED = new WeakMap();

function multiply2(A, B) {
  return {
    a: A.a * B.a + A.c * B.b,
    b: A.b * B.a + A.d * B.b,
    c: A.a * B.c + A.c * B.d,
    d: A.b * B.c + A.d * B.d
  };
}
function inverse2(M) {
  const det = M.a * M.d - M.b * M.c;
  if (!Number.isFinite(det) || Math.abs(det) < 1e-8) return null;
  return { a: M.d / det, b: -M.b / det, c: -M.c / det, d: M.a / det };
}
function destinationRect(args) {
  const image = args[0];
  if (args.length >= 9) return { x: Number(args[5]), y: Number(args[6]), w: Number(args[7]), h: Number(args[8]) };
  if (args.length >= 5) return { x: Number(args[1]), y: Number(args[2]), w: Number(args[3]), h: Number(args[4]) };
  const w = Number(image?.naturalWidth || image?.videoWidth || image?.width || 0);
  const h = Number(image?.naturalHeight || image?.videoHeight || image?.height || 0);
  return { x: Number(args[1]), y: Number(args[2]), w, h };
}
function compensationFor(ctx) {
  if (typeof ctx.getTransform !== 'function') return INV_WORLD;
  const m = ctx.getTransform();
  const current = { a: m.a, b: m.b, c: m.c, d: m.d };
  // M = worldProjection * localTransform. Cancel the world projection but
  // retain the caller's local rotation, scale and mirroring.
  const local = multiply2(INV_WORLD, current);
  const invLocal = inverse2(local);
  if (!invLocal) return INV_WORLD;
  return multiply2(multiply2(invLocal, INV_WORLD), local);
}

export function activateIsometricSpritePlaneV2127(ctx) {
  if (!ctx || typeof ctx.drawImage !== 'function') return () => {};
  let state = INSTALLED.get(ctx);
  if (!state) {
    const nativeDrawImage = ctx.drawImage.bind(ctx);
    state = { active: false, nativeDrawImage };
    const wrappedDrawImage = function (...args) {
      if (!state.active) return state.nativeDrawImage(...args);
      const rect = destinationRect(args);
      if (!Number.isFinite(rect.x) || !Number.isFinite(rect.y) || !Number.isFinite(rect.w) || !Number.isFinite(rect.h) || !rect.w || !rect.h) {
        return state.nativeDrawImage(...args);
      }
      const C = compensationFor(ctx);
      const cx = rect.x + rect.w / 2;
      const cy = rect.y + rect.h / 2;
      ctx.save();
      try {
        ctx.translate(cx, cy);
        ctx.transform(C.a, C.b, C.c, C.d, 0, 0);
        ctx.translate(-cx, -cy);
        state.nativeDrawImage(...args);
      } finally {
        ctx.restore();
      }
    };
    try {
      Object.defineProperty(ctx, 'drawImage', { configurable: true, writable: true, value: wrappedDrawImage });
    } catch (error) {
      try { ctx.drawImage = wrappedDrawImage; }
      catch (_) { return () => {}; }
    }
    INSTALLED.set(ctx, state);
  }
  state.active = true;
  let released = false;
  return () => {
    if (released) return;
    released = true;
    state.active = false;
  };
}

export const ISOMETRIC_SPRITE_PLANE_V2127 = Object.freeze({
  projection: WORLD_PROJECTION,
  imageQuadCompensation: true,
  localTransformsPreserved: true
});

// Counter-project vector actors/text that are authored in screen-pixel units
// but positioned with world coordinates. Ground shadows/terrain should remain
// projected; call this only around a character or a floating label.
export function pushUprightWorldPlaneV2127(ctx,x,y){
  if(!ctx||typeof ctx.save!=='function')return ()=>{};
  ctx.save();
  ctx.translate(Number(x)||0,Number(y)||0);
  ctx.transform(INV_WORLD.a,INV_WORLD.b,INV_WORLD.c,INV_WORLD.d,0,0);
  ctx.translate(-(Number(x)||0),-(Number(y)||0));
  let released=false;
  return ()=>{if(released)return;released=true;ctx.restore();};
}
