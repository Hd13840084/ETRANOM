// ETRANOM V2169 — Stage 27: close-follow isometric camera calibration.
// 2.8x framing is intentionally tight: typically one or two nearby buildings are visible.
// Keeps the existing affine projection and authored sprite-plane contract intact.

export const ISOMETRIC_CAMERA_V2139 = Object.freeze({
  version: 2169,
  mode: 'fixed-orthographic-isometric',
  projection: 'affine-isometric-2.5d',
  viewport: Object.freeze({ width: 720, height: 650 }),
  anchor: Object.freeze({ x: 360, y: 325 }),
  zoom: 2.8,
  rotationRadians: 0,
  follow: Object.freeze({ smoothing: 10, maxDeltaSeconds: 0.08 }),
  boundsPolicy: 'legacy-camera-bounds-preserved',
  spritePlanePolicy: 'authored-isometric-assets-are-not-double-skewed'
});

const finite = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

export function createIsometricCameraV2139(initial = { x: 0, y: 0 }, options = {}) {
  const bounds = options.bounds || { minX: -900, minY: 0, maxX: 8280, maxY: 6250 };
  const anchor = options.anchor || ISOMETRIC_CAMERA_V2139.anchor;
  const smoothing = Math.max(0, finite(options.smoothing, ISOMETRIC_CAMERA_V2139.follow.smoothing));
  const camera = { x: finite(initial.x), y: finite(initial.y), initialized: false };

  function resolveTarget(target) {
    const tx = finite(target?.x, camera.x), ty = finite(target?.y, camera.y);
    // Bounds are expressed in the same legacy top-left camera-origin convention.
    return {
      x: clamp(tx - anchor.x, bounds.minX, bounds.maxX) + anchor.x,
      y: clamp(ty - anchor.y, bounds.minY, bounds.maxY) + anchor.y
    };
  }

  function update(target, deltaSeconds = 0) {
    const desired = resolveTarget(target);
    if (!camera.initialized) {
      camera.x = desired.x;
      camera.y = desired.y;
      camera.initialized = true;
      return { x: camera.x, y: camera.y };
    }
    const dt = clamp(finite(deltaSeconds), 0, ISOMETRIC_CAMERA_V2139.follow.maxDeltaSeconds);
    const alpha = smoothing === 0 ? 1 : 1 - Math.exp(-smoothing * dt);
    camera.x += (desired.x - camera.x) * alpha;
    camera.y += (desired.y - camera.y) * alpha;
    // Eliminate sub-pixel asymptotic drift once the camera is effectively settled.
    if (Math.abs(desired.x - camera.x) < 0.01) camera.x = desired.x;
    if (Math.abs(desired.y - camera.y) < 0.01) camera.y = desired.y;
    return { x: camera.x, y: camera.y };
  }

  function snapshot() { return { x: camera.x, y: camera.y, initialized: camera.initialized }; }
  return Object.freeze({ update, snapshot });
}

export function auditIsometricCameraV2139() {
  const issues = [];
  if (ISOMETRIC_CAMERA_V2139.mode !== 'fixed-orthographic-isometric') issues.push('camera_mode_mismatch');
  if (ISOMETRIC_CAMERA_V2139.viewport.width <= 0 || ISOMETRIC_CAMERA_V2139.viewport.height <= 0) issues.push('invalid_viewport');
  if (!(ISOMETRIC_CAMERA_V2139.zoom >= 2.6 && ISOMETRIC_CAMERA_V2139.zoom <= 3.0)) issues.push('camera_zoom_out_of_calibration_range');
  if (ISOMETRIC_CAMERA_V2139.follow.smoothing < 0) issues.push('invalid_smoothing');
  return Object.freeze({ ok: issues.length === 0, version: 2169, mode: ISOMETRIC_CAMERA_V2139.mode, issues: Object.freeze(issues) });
}

if (typeof window !== 'undefined') {
  window.ETRANOM_ISOMETRIC_CAMERA_V2139 = ISOMETRIC_CAMERA_V2139;
  window.ETRANOM_ISOMETRIC_CAMERA_AUDIT_V2139 = auditIsometricCameraV2139();
}
