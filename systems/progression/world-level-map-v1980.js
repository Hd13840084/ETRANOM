/** ETRANOM V1980 canonical 10-region / 60-zone level coverage. */
export const WORLD_LEVEL_MAP_VERSION_V1980 = '1980.0.0';
export const WORLD_LEVEL_CAP_V1980 = 100;
export const REGIONS_COUNT_V1980 = 10;
export const ZONES_PER_REGION_V1980 = 6;
const ZONE_OFFSETS = Object.freeze([[0,1],[2,3],[4,5],[6,7],[8,8],[9,9]]);
export function getRegionLevelRangeV1980(regionNumber) {
  const n = Math.floor(Number(regionNumber));
  if (!Number.isInteger(n) || n < 1 || n > REGIONS_COUNT_V1980) throw new RangeError('invalid_region_number');
  return { levelMin: (n - 1) * 10 + 1, levelMax: n * 10 };
}
export function getZoneLevelRangeV1980(regionNumber, zoneNumber) {
  const region = getRegionLevelRangeV1980(regionNumber);
  const z = Math.floor(Number(zoneNumber));
  if (!Number.isInteger(z) || z < 1 || z > ZONES_PER_REGION_V1980) throw new RangeError('invalid_zone_number');
  const [a,b] = ZONE_OFFSETS[z - 1];
  return { levelMin: region.levelMin + a, levelMax: region.levelMin + b, recommendedLevel: region.levelMin + a };
}
export function validateRegionZonesV1980(zones, regionNumber = 1) {
  const errors = [];
  if (!Array.isArray(zones) || zones.length !== ZONES_PER_REGION_V1980) return { valid:false, errors:['region_must_have_exactly_six_zones'] };
  zones.forEach((zone, index) => {
    const expected = getZoneLevelRangeV1980(regionNumber, index + 1);
    if (Number(zone.level_min) !== expected.levelMin || Number(zone.level_max) !== expected.levelMax) errors.push(`${zone.id || index}:zone_level_range_mismatch`);
  });
  return { valid: errors.length === 0, errors };
}
