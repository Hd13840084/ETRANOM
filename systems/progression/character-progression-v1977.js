/** ETRANOM V1977 — canonical level/XP/death progression rules. Pure and deterministic. */
export const CHARACTER_PROGRESSION_VERSION_V1977 = '1977.0.0';
export const LEVEL_CAP_V1977 = 50;
export const XP_TO_NEXT_LEVEL_V1977 = Object.freeze({
    1: 100, 2: 2300, 3: 3800, 4: 5700, 5: 25000, 6: 28000, 7: 31360, 8: 35123, 9: 39337, 10: 44058,
    11: 49345, 12: 55267, 13: 61899, 14: 69327, 15: 77646, 16: 86964, 17: 97399, 18: 109087,
    19: 122177, 20: 136839, 21: 153260, 22: 171651, 23: 192248, 24: 215319, 25: 241157,
    26: 270096, 27: 302508, 28: 338808, 29: 379465, 30: 425001, 31: 476001, 32: 533122,
    33: 597096, 34: 668748, 35: 748998, 36: 838877, 37: 939543, 38: 1052288, 39: 1178563,
    40: 1319990, 41: 1478389, 42: 1655796, 43: 1854491, 44: 2077030, 45: 2326274,
    46: 2605427, 47: 2918078, 48: 3268248, 49: 9863200
});
const num = (v, d = 0) => Number.isFinite(Number(v)) ? Number(v) : d;
const int = (v, d = 0) => Math.max(0, Math.floor(num(v, d)));
const clone = v => structuredClone(v);
export function xpRequiredForNextLevelV1977(level) { var _a; const l = Math.max(1, Math.min(LEVEL_CAP_V1977, Math.floor(num(level, 1)))); return l >= LEVEL_CAP_V1977 ? 0 : ((_a = XP_TO_NEXT_LEVEL_V1977[l]) !== null && _a !== void 0 ? _a : 0); }
export function normalizeProgressionStateV1977(input = {}) {
    var _a, _b, _c, _d;
    const s = clone(input || {});
    s.level = Math.max(1, Math.min(LEVEL_CAP_V1977, Math.floor(num(s.level, 1))));
    s.xp = int((_a = s.xp) !== null && _a !== void 0 ? _a : s.experience);
    s.skillPoints = int(s.skillPoints);
    s.attributePoints = int(s.attributePoints);
    s.unspentSkillPoints = int(s.unspentSkillPoints, s.skillPoints);
    s.unspentAttributePoints = int(s.unspentAttributePoints, s.attributePoints);
    s.maxHp = Math.max(1, num((_b = s.maxHp) !== null && _b !== void 0 ? _b : s.max_hp, 100));
    s.maxMp = Math.max(0, num((_c = s.maxMp) !== null && _c !== void 0 ? _c : s.max_mp, 50));
    s.maxStamina = Math.max(0, num((_d = s.maxStamina) !== null && _d !== void 0 ? _d : s.max_stamina, 100));
    s.hp = Math.max(0, Math.min(s.maxHp, num(s.hp, s.maxHp)));
    s.mp = Math.max(0, Math.min(s.maxMp, num(s.mp, s.maxMp)));
    s.stamina = Math.max(0, Math.min(s.maxStamina, num(s.stamina, s.maxStamina)));
    s.gold = int(s.gold);
    return s;
}
/** XP is stored as total lifetime XP; unspent XP carries across level thresholds. */
export function grantCharacterXpV1977(input = {}, amount = 0) {
    const s = normalizeProgressionStateV1977(input), grant = int(amount);
    s.xp += grant;
    let levelsGained = 0, levelRewards = [];
    while (s.level < LEVEL_CAP_V1977) {
        const threshold = xpRequiredForNextLevelV1977(s.level);
        const totalAtCurrentLevel = Object.entries(XP_TO_NEXT_LEVEL_V1977).filter(([l]) => Number(l) < s.level).reduce((a, [, v]) => a + v, 0);
        const currentLevelXp = s.xp - totalAtCurrentLevel;
        if (currentLevelXp < threshold)
            break;
        s.level++;
        levelsGained++;
        s.skillPoints += 2;
        s.attributePoints += 5;
        s.unspentSkillPoints += 2;
        s.unspentAttributePoints += 5;
        s.maxHp += 12;
        s.maxMp += 5;
        s.maxStamina += 4;
        s.hp = s.maxHp;
        s.mp = s.maxMp;
        s.stamina = s.maxStamina;
        levelRewards.push({ level: s.level, skillPoints: 2, attributePoints: 5, maxHp: 12, maxMp: 5, maxStamina: 4 });
    }
    return { state: s, grantedXp: grant, levelsGained, levelRewards, xpToNext: xpRequiredForNextLevelV1977(s.level), atLevelCap: s.level >= LEVEL_CAP_V1977 };
}
/** Death removes 3% of XP accumulated toward the current level and 1% of carried gold; never de-levels. */
export function applyDeathPenaltyV1977(input = {}) {
    const s = normalizeProgressionStateV1977(input), thresholdTotal = Object.entries(XP_TO_NEXT_LEVEL_V1977).filter(([l]) => Number(l) < s.level).reduce((a, [, v]) => a + v, 0);
    const currentLevelXp = Math.max(0, s.xp - thresholdTotal), xpLoss = Math.floor(currentLevelXp * 0.03), goldLoss = Math.floor(s.gold * 0.01);
    s.xp = Math.max(thresholdTotal, s.xp - xpLoss);
    s.gold = Math.max(0, s.gold - goldLoss);
    return { state: s, xpLost: xpLoss, goldLost: goldLoss, levelPreserved: true };
}
export function spendProgressionPointsV1977(input = {}, kind, amount = 1) { const s = normalizeProgressionStateV1977(input), n = int(amount); if (!['skill', 'attribute'].includes(kind))
    throw new Error('unsupported_progression_point_kind'); const key = kind === 'skill' ? 'unspentSkillPoints' : 'unspentAttributePoints'; if (n < 1)
    throw new Error('invalid_point_amount'); if (s[key] < n)
    throw new Error('insufficient_progression_points'); s[key] -= n; return s; }
