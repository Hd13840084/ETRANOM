import { CHARACTER_IDENTITY_ROSTER_V2047 } from './character-identity-roster-v2047.js?build=2081';
const byId = new Map(CHARACTER_IDENTITY_ROSTER_V2047.map(entry => [entry.specializationId, entry]));
const legacySpecializationAliases = Object.freeze({
    // Older player saves and Supabase Presence rows store numbered specialization IDs.
    warrior_1: 'warrior_sword_ascetic', warrior_2: 'warrior_iron_bastion',
    warrior_3: 'warrior_chaos', warrior_4: 'warrior_apocalypse_harbinger',
    wizard_1: 'wizard_arcane_mage', wizard_2: 'wizard_elementalist',
    wizard_3: 'wizard_warlock', wizard_4: 'wizard_necromancer',
    // Persian display names from content/specializations/catalog/*.json. These are
    // deliberately mapped to canonical art IDs so old saves do not fall back to
    // the first specialization of a class when the player is actually a different spec.
    'سایه‌رو': 'assassin_1', 'قاتل حرفه‌ای': 'assassin_2', 'تیغ روح‌خوار': 'assassin_3', 'شبح مرگ': 'assassin_4',
    'تک‌تیرانداز': 'gunner_1', 'تیرانداز سریع': 'gunner_2', 'تفنگدار عالم اموات': 'gunner_3', 'تفنگدار جهنمی': 'gunner_4',
    'راهب رزمی': 'monk_1', 'راهب چی': 'monk_2', 'راهب اهریمنی': 'monk_3', 'راهب خون‌نوش': 'monk_4',
    'نگهبان مقدس': 'paladin_1', 'شوالیه نور': 'paladin_2', 'پالادین سقوط‌کرده': 'paladin_3', 'شوالیه دوزخ': 'paladin_4',
    'روحانی مقدس': 'priest_1', 'شفادهنده': 'priest_2', 'کشیش نفرین': 'priest_3', 'پیام‌آور مرگ': 'priest_4',
    'شکارچی': 'ranger_1', 'تیرانداز طبیعت': 'ranger_2', 'شکارچی کابوس': 'ranger_3', 'نگهبان جنگل سیاه': 'ranger_4',
    'شمن طبیعت': 'shaman_1', 'شمن ارواح': 'shaman_2', 'شمن ابیس': 'shaman_3', 'شمن تباهی': 'shaman_4',
    'احضارگر موجودات': 'summoner_1', 'احضارگر عناصر': 'summoner_2', 'احضارگر شیاطین': 'summoner_3', 'احضارگر باستانی': 'summoner_4',
    'شمشیرزن': 'warrior_sword_ascetic', 'دژ پولادین': 'warrior_iron_bastion', 'جنگجوی آشوب': 'warrior_chaos', 'شوالیه ویرانی': 'warrior_apocalypse_harbinger',
    'آرکین‌میج': 'wizard_arcane_mage', 'المنتالیست': 'wizard_elementalist', 'وارلاک': 'wizard_warlock', 'نکرومنسر': 'wizard_necromancer'
});
const classDefaults = Object.freeze({
    wizard: 'wizard_arcane_mage', warrior: 'warrior_sword_ascetic', assassin: 'assassin_1',
    gunner: 'gunner_1', monk: 'monk_1', paladin: 'paladin_1', priest: 'priest_1',
    ranger: 'ranger_1', shaman: 'shaman_1', summoner: 'summoner_1'
});
const classAliases = Object.freeze({
    'جادوگر': 'wizard', 'mage': 'wizard', 'wizard': 'wizard', 'warlock': 'wizard', 'necromancer': 'wizard',
    'جنگجو': 'warrior', 'warrior': 'warrior', 'fighter': 'warrior',
    'آدمکش': 'assassin', 'assassin': 'assassin', 'rogue': 'assassin',
    'تفنگدار': 'gunner', 'gunner': 'gunner', 'ranged': 'gunner',
    'راهب': 'monk', 'monk': 'monk', 'پالادین': 'paladin', 'paladin': 'paladin',
    'کشیش': 'priest', 'priest': 'priest', 'رنجر': 'ranger', 'ranger': 'ranger',
    'شمن': 'shaman', 'shaman': 'shaman', 'احضارگر': 'summoner', 'summoner': 'summoner'
});
const norm = value => String(value !== null && value !== void 0 ? value : '').trim().toLowerCase().replace(/[\s-]+/g, '_');
const normalizedLegacySpecializationAliases = new Map(Object.entries(legacySpecializationAliases).map(([key, value]) => [norm(key), value]));
/** Resolve every local/remote player to one of the 40 canonical specialization IDs. */
export function resolveMapSpecializationV2066(player = {}) {
    var _a, _b, _c, _d;
    const candidates = [player.specializationId, player.specialization_id, player.specialization, player.specializationNameFa, player.specialization_name, player.specialization_name_fa, player.subclassId, player.subclass_id, player.specId, player.spec_id];
    for (const candidate of candidates) {
        const value = norm(candidate);
        if (byId.has(value))
            return value;
        const legacyAlias = normalizedLegacySpecializationAliases.get(value);
        if (legacyAlias && byId.has(legacyAlias))
            return legacyAlias;
        const match = CHARACTER_IDENTITY_ROSTER_V2047.find(entry => norm(entry.specializationNameFa) === value);
        if (match)
            return match.specializationId;
    }
    const rawClass = norm((_d = (_c = (_b = (_a = player.classId) !== null && _a !== void 0 ? _a : player.class_id) !== null && _b !== void 0 ? _b : player.player_class) !== null && _c !== void 0 ? _c : player.archetype) !== null && _d !== void 0 ? _d : player.class);
    const classId = classAliases[rawClass] || rawClass;
    return classDefaults[classId] || 'warrior_sword_ascetic';
}
export function getMapCharacterArtStatusV2066() {
    return Object.freeze({ specializationCount: byId.size, complete: byId.size === 40, legacyAliasCount: Object.keys(legacySpecializationAliases).length, ids: Object.freeze([...byId.keys()]) });
}
