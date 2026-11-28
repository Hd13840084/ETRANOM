/** ETRANOM V2135 — one canonical portrait binding for all 40 specializations. */
import { CHARACTER_IDENTITY_ROSTER_V2047 } from './character-identity-roster-v2047.js?build=2135';
import { resolveMapSpecializationV2066 } from './character-map-binding-v2066.js?v=2135';

const SPECIAL_PORTRAITS = Object.freeze({
  wizard_arcane_mage: './assets/classes/arcane_mage_portrait.webp',
  wizard_elementalist: './assets/classes/elementalist_portrait.webp',
  wizard_warlock: './assets/classes/warlock_portrait.webp',
  wizard_necromancer: './assets/classes/necromancer_portrait.webp',
  warrior_sword_ascetic: './assets/classes/sword_ascetic_portrait.webp',
  warrior_iron_bastion: './assets/classes/iron_bastion_portrait.webp',
  warrior_chaos: './assets/classes/chaos_warrior_portrait.webp',
  warrior_apocalypse_harbinger: './assets/classes/apocalypse_harbinger_portrait.webp'
});
const portraitById = new Map(CHARACTER_IDENTITY_ROSTER_V2047.map(entry => [
  entry.specializationId,
  SPECIAL_PORTRAITS[entry.specializationId] || `./assets/characters/v2063-fullbody/${entry.specializationId}.webp`
]));
const norm = value => String(value ?? '').trim().toLowerCase().replace(/[\s\-‐‑–—]+/g, '_');
const nameToId = new Map();
for (const entry of CHARACTER_IDENTITY_ROSTER_V2047) {
  nameToId.set(norm(entry.specializationNameFa), entry.specializationId);
  nameToId.set(norm(entry.specializationId), entry.specializationId);
}
// Catalog names and older save/display aliases; all resolve to the same canonical art ID.
const ALIASES = Object.freeze({
  'آرکین میج':'wizard_arcane_mage','عنصرگرا':'wizard_elementalist','المنتالیست':'wizard_elementalist','وارلاک':'wizard_warlock','نکرومنسر':'wizard_necromancer',
  'شمشیرزن':'warrior_sword_ascetic','زاهد شمشیر':'warrior_sword_ascetic','دژ آهنین':'warrior_iron_bastion','دژ پولادین':'warrior_iron_bastion','جنگجوی آشوب':'warrior_chaos','آشوب':'warrior_chaos','منادی آخرالزمان':'warrior_apocalypse_harbinger','شوالیه ویرانی':'warrior_apocalypse_harbinger','آورنده آخرالزمان':'warrior_apocalypse_harbinger',
  'سایه رو':'assassin_1','سایه‌رو':'assassin_1','قاتل حرفه ای':'assassin_2','قاتل حرفه‌ای':'assassin_2','تیغ روح خوار':'assassin_3','تیغ روح‌خوار':'assassin_3','شبح مرگ':'assassin_4',
  'تک تیرانداز':'gunner_1','تک‌تیرانداز':'gunner_1','تیرانداز سریع':'gunner_2','تفنگدار عالم اموات':'gunner_3','تفنگدار جهنمی':'gunner_4',
  'راهب رزمی':'monk_1','راهب چی':'monk_2','راهب اهریمنی':'monk_3','راهب خون نوش':'monk_4','راهب خون‌نوش':'monk_4',
  'نگهبان مقدس':'paladin_1','شوالیه نور':'paladin_2','پالادین سقوط کرده':'paladin_3','پالادین سقوط‌کرده':'paladin_3','شوالیه دوزخ':'paladin_4',
  'روحانی مقدس':'priest_1','شفادهنده':'priest_2','کشیش نفرین':'priest_3','پیام آور مرگ':'priest_4','پیام‌آور مرگ':'priest_4',
  'شکارچی':'ranger_1','تیرانداز طبیعت':'ranger_2','شکارچی کابوس':'ranger_3','نگهبان جنگل سیاه':'ranger_4',
  'شمن طبیعت':'shaman_1','شمن ارواح':'shaman_2','شمن ابیس':'shaman_3','شمن تباهی':'shaman_4',
  'احضارگر موجودات':'summoner_1','احضارگر عناصر':'summoner_2','احضارگر شیاطین':'summoner_3','احضارگر باستانی':'summoner_4'
});
for (const [name, id] of Object.entries(ALIASES)) nameToId.set(norm(name), id);

export function getCharacterPortraitV2135(specializationId) {
  return portraitById.get(String(specializationId || '').trim()) || null;
}
export function getCharacterPortraitForNameV2135(name) {
  const id = nameToId.get(norm(name));
  return id ? getCharacterPortraitV2135(id) : null;
}
export function getCharacterPortraitForPlayerV2135(player = {}) {
  const id = resolveMapSpecializationV2066(player);
  return getCharacterPortraitV2135(id);
}
export function auditCharacterPortraitBindingsV2135() {
  const ids = [...portraitById.keys()];
  const missing = CHARACTER_IDENTITY_ROSTER_V2047.filter(entry => !portraitById.has(entry.specializationId)).map(entry => entry.specializationId);
  const missingName = CHARACTER_IDENTITY_ROSTER_V2047.filter(entry => !nameToId.has(norm(entry.specializationNameFa))).map(entry => entry.specializationId);
  return Object.freeze({ specializationCount: ids.length, uniqueIds: new Set(ids).size, missing: Object.freeze(missing), missingName, complete: ids.length === 40 && new Set(ids).size === 40 && missing.length === 0 && missingName.length === 0 });
}
