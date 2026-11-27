// ETRANOM V2164 — canonical gameplay metric scale.
// This is a chosen art/gameplay calibration contract, not a geodetic survey.
// The 22-unit player collision diameter is assigned a 0.55 m human traversal width.
export const ETRANOM_WORLD_SCALE_V2164 = Object.freeze({
  version: 2164,
  stage: 22,
  logicalUnitsPerMeter: 40,
  metersPerLogicalUnit: 1 / 40,
  reference: Object.freeze({
    playerCollisionDiameterUnits: 22,
    playerCollisionDiameterMeters: 0.55,
    nominalCharacterHeightUnits: 72,
    nominalCharacterHeightMeters: 1.8,
    source: 'authored-gameplay-reference; not field-measured'
  }),
  conversions: Object.freeze({
    toMeters: units => Number(units) / 40,
    toLogicalUnits: meters => Number(meters) * 40
  }),
  status: 'gameplay-calibrated-v1'
});

export function worldUnitsToMetersV2164(units) {
  const value = Number(units);
  return Number.isFinite(value) ? value / ETRANOM_WORLD_SCALE_V2164.logicalUnitsPerMeter : null;
}
export function metersToWorldUnitsV2164(meters) {
  const value = Number(meters);
  return Number.isFinite(value) ? value * ETRANOM_WORLD_SCALE_V2164.logicalUnitsPerMeter : null;
}
export function auditWorldScaleV2164() {
  const s = ETRANOM_WORLD_SCALE_V2164;
  const roundTrip = metersToWorldUnitsV2164(worldUnitsToMetersV2164(100));
  const errors = [];
  if (s.logicalUnitsPerMeter !== 40) errors.push('unexpected-units-per-metre');
  if (Math.abs(roundTrip - 100) > 1e-9) errors.push('conversion-roundtrip');
  if (Math.abs(worldUnitsToMetersV2164(22) - .55) > 1e-9) errors.push('player-width-reference');
  return Object.freeze({ ok: errors.length === 0, version: 2164, stage: 22, unitsPerMeter: s.logicalUnitsPerMeter,
    playerWidthMeters: worldUnitsToMetersV2164(22), nominalCharacterHeightMeters: worldUnitsToMetersV2164(72),
    calibrationKind: 'gameplay-reference-not-survey', errors: Object.freeze(errors) });
}
