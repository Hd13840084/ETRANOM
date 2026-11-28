// ETRANOM V2170 — Stage 28: settlement-wide world scale calibration.
// Logical metric contract: 40 world units = 1 metre; player reference = 1.8m.
// These are authored gameplay dimensions, not a real-world survey.
export const ETRANOM_WORLD_SCALE_CALIBRATION_V2170 = Object.freeze({
  version: 2170,
  logicalUnitsPerMeter: 40,
  player: Object.freeze({ heightMeters: 1.8, heightUnits: 72, renderFramePx: Object.freeze({ width: 48, height: 64 }), collisionDiameterMeters: 0.55, collisionDiameterUnits: 22 }),
  door: Object.freeze({ clearWidthMeters: 0.90, clearHeightMeters: 2.10, clearWidthUnits: 36, clearHeightUnits: 84 }),
  camera: Object.freeze({ zoom: 2.8, framing: 'close three-quarter follow; target one to two nearby buildings', projection: 'fixed-orthographic-overhead-three-quarter' }),
  settlements: Object.freeze(['ashen_city', 'farmland', 'rootwood', 'ironstone']),
  spriteScale: Object.freeze({
    vehicle: Object.freeze({ handcart_empty: 0.55, covered_merchant_wagon: 0.55, enclosed_coach: 0.58, mine_ore_cart: 0.58, farm_hay_wagon: 0.55, river_cargo_boat: 0.70, market_cart: 0.55, grain_cart: 0.55 }),
    prop: Object.freeze({ market_cart: 0.55, grain_cart: 0.55, stone_bridge: 0.90, lantern_post: 0.72, direction_sign: 0.72, notice_board: 0.72, wayside_shrine: 0.72, roofed_well: 0.72, rain_barrel: 0.68, stone_water_trough: 0.68, firewood_rack: 0.68, root_stump: 0.72, wildflower_patch: 0.68 }),
    environment: Object.freeze({ cart: 0.55, farm: 0.75, storage: 0.75, utility: 0.68, landmark: 0.72, debris: 0.72, vegetation: 0.85, flora: 0.72, rock: 0.78, ore: 0.78, mine: 0.78 })
  }),
  npc: Object.freeze({ ambientWorkerScale: 1.5, spriteResidentScale: 1.2 }),
  yardPropScale: 0.70,
  status: 'gameplay-calibrated-v1; visual QA required on target device'
});

export function worldUnitsToMetersV2170(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n / ETRANOM_WORLD_SCALE_CALIBRATION_V2170.logicalUnitsPerMeter : null;
}
export function resolveVehicleSpriteScaleV2170(assetId) {
  return ETRANOM_WORLD_SCALE_CALIBRATION_V2170.spriteScale.vehicle[String(assetId)] ?? 1;
}
export function resolvePropSpriteScaleV2170(assetId) {
  const id = String(assetId || '').replace(/\.png$/i, '');
  return ETRANOM_WORLD_SCALE_CALIBRATION_V2170.spriteScale.prop[id] ?? 1;
}
export function resolveEnvironmentSpriteScaleV2170(category, asset = '') {
  const file = String(asset || '').split('/').pop().replace(/\.png$/i, '');
  const explicit = ETRANOM_WORLD_SCALE_CALIBRATION_V2170.spriteScale.prop[file];
  return explicit ?? ETRANOM_WORLD_SCALE_CALIBRATION_V2170.spriteScale.environment[String(category)] ?? 1;
}
export function auditWorldScaleCalibrationV2170() {
  const c = ETRANOM_WORLD_SCALE_CALIBRATION_V2170;
  const errors = [];
  if (c.logicalUnitsPerMeter !== 40) errors.push('units-per-meter-mismatch');
  if (c.player.heightUnits !== 72 || c.player.renderFramePx.height !== 64) errors.push('player-reference-mismatch');
  if (c.door.clearWidthUnits < c.player.collisionDiameterUnits) errors.push('door-clear-width-too-small');
  if (c.camera.zoom < 1.7 || c.camera.zoom > 3.0) errors.push('camera-zoom-out-of-range');
  for (const [id, scale] of Object.entries(c.spriteScale.vehicle)) if (!(scale >= 0.5 && scale <= 0.75)) errors.push(`vehicle-scale-out-of-range:${id}`);
  return Object.freeze({ ok: errors.length === 0, version: 2170, unitsPerMeter: c.logicalUnitsPerMeter, playerHeightMeters: worldUnitsToMetersV2170(c.player.heightUnits), doorClearWidthMeters: worldUnitsToMetersV2170(c.door.clearWidthUnits), doorClearHeightMeters: worldUnitsToMetersV2170(c.door.clearHeightUnits), vehicleProfiles: Object.keys(c.spriteScale.vehicle).length, settlements: c.settlements.length, errors: Object.freeze(errors) });
}
if (typeof window !== 'undefined') {
  window.ETRANOM_WORLD_SCALE_CALIBRATION_V2170 = ETRANOM_WORLD_SCALE_CALIBRATION_V2170;
  window.ETRANOM_WORLD_SCALE_CALIBRATION_AUDIT_V2170 = auditWorldScaleCalibrationV2170();
}
