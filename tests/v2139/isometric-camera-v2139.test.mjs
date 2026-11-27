import test from 'node:test';
import assert from 'node:assert/strict';
import { createIsometricCameraV2139, ISOMETRIC_CAMERA_V2139, auditIsometricCameraV2139 } from '../../systems/world/isometric-camera-v2139.js';

const bounds = { minX: -900, minY: 0, maxX: 8280, maxY: 6250 };

test('camera contract preserves fixed isometric projection and viewport', () => {
  assert.equal(auditIsometricCameraV2139().ok, true);
  assert.deepEqual(ISOMETRIC_CAMERA_V2139.viewport, { width: 720, height: 650 });
  assert.equal(ISOMETRIC_CAMERA_V2139.zoom, 1);
  assert.equal(ISOMETRIC_CAMERA_V2139.rotationRadians, 0);
});

test('camera snaps to the initial target and then follows smoothly', () => {
  const camera = createIsometricCameraV2139({ x: 100, y: 200 }, { bounds });
  assert.deepEqual(camera.update({ x: 1000, y: 1200 }, 0.016), { x: 1000, y: 1200 });
  const next = camera.update({ x: 1200, y: 1400 }, 0.016);
  assert.ok(next.x > 1000 && next.x < 1200);
  assert.ok(next.y > 1200 && next.y < 1400);
});

test('camera respects legacy edge bounds and remains finite for invalid input', () => {
  const camera = createIsometricCameraV2139({ x: 0, y: 0 }, { bounds });
  const edge = camera.update({ x: 99999, y: -99999 }, 0.016);
  assert.deepEqual(edge, { x: 8640, y: 325 });
  const safe = camera.update({ x: NaN, y: Infinity }, 0.016);
  assert.ok(Number.isFinite(safe.x) && Number.isFinite(safe.y));
});
