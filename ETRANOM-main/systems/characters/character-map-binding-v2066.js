import { CHARACTER_IDENTITY_ROSTER_V2047 } from './character-identity-roster-v2047.js?build=2081';
const byId = new Map(CHARACTER_IDENTITY_ROSTER_V2047.map(entry => [entry.specializationId, entry]));
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
/** Resolve every local/remote player to one of the 40 canonical specialization IDs. */
export function resolveMapSpecializationV2066(player = {}) {
    var _a, _b, _c, _d;
    const candidates = [player.specializationId, player.specialization_id, player.specialization, player.specializationNameFa, player.specialization_name];
    for (const candidate of candidates) {
        const value = norm(candidate);
        if (byId.has(value))
            return value;
        const match = CHARACTER_IDENTITY_ROSTER_V2047.find(entry => norm(entry.specializationNameFa) === value);
        if (match)
            return match.specializationId;
    }
    const rawClass = norm((_d = (_c = (_b = (_a = player.classId) !== null && _a !== void 0 ? _a : player.class_id) !== null && _b !== void 0 ? _b : player.player_class) !== null && _c !== void 0 ? _c : player.archetype) !== null && _d !== void 0 ? _d : player.class);
    const classId = classAliases[rawClass] || rawClass;
    return classDefaults[classId] || 'warrior_sword_ascetic';
}
export function getMapCharacterArtStatusV2066() {
    return Object.freeze({ specializationCount: byId.size, complete: byId.size === 40, ids: Object.freeze([...byId.keys()]) });
}
