/** ETRANOM V1999 — Region One Necromancer Summon Seal I drop rules. */
export function getRegionOneSummonSealDropChanceV1999(encounter={}, regions=[]) {
  const regionId=String(encounter.regionId||encounter.region_id||'');
  if(!regionId || !regions.some(region=>String(region.id)===regionId)) return null;
  const kind=String(encounter.kind||'normal').toLowerCase();
  if(kind==='area_boss'||kind==='boss') return 35;
  if(kind==='mini_boss'||kind==='miniboss') return 25;
  return 30;
}
