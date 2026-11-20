/** Canonical region IDs shared with ETRANOM_REGION_CONTENT and database/party.sql. */
export const PARTY_CONFIG = Object.freeze({
  MAX_MEMBERS: 4,
  MIN_MEMBERS_TO_START: 2,
  REGIONS: Object.freeze([
    { id: "burnt_forest", name: "جنگل سوخته", minLevel: 1, maxLevel: 1 },
    { id: "thorn_grove", name: "بیشه خارزار", minLevel: 2, maxLevel: 2 },
    { id: "ash_hills", name: "تپه‌های خاکستر", minLevel: 3, maxLevel: 3 },
    { id: "vardash_river", name: "رود ورداش", minLevel: 4, maxLevel: 4 },
    { id: "southern_plains", name: "دشت جنوبی", minLevel: 5, maxLevel: 5 },
    { id: "rootbound_ruins", name: "ویرانه‌های ریشه‌پوش", minLevel: 5, maxLevel: 5 }
  ])
});
export function getPartyRegion(id) { return PARTY_CONFIG.REGIONS.find(region => region.id === id) || null; }
