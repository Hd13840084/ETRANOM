/**
 * Versioned encounter-flow adapters for the shared combat experience.
 * These adapters describe progression only; damage, turns, rewards, drops,
 * persistence and failure handling remain owned by their existing systems.
 */
export const COMBAT_CONTENT_FLOW_VERSION_V1964 = '1964.0.0';
export const DUNGEON_NORMAL_WAVES_V1964 = 5;
export const DUNGEON_BOSS_WAVE_V1964 = 6;
export const TOWER_FLOOR_COUNT_V1964 = 20;
const asInt = (v, fallback = 0) => Number.isFinite(Number(v)) ? Math.floor(Number(v)) : fallback;
export function getDungeonFlowPlanV1964(dungeon, run = {}) {
    var _a, _b, _c;
    if (!dungeon || !dungeon.id)
        throw new TypeError('invalid_dungeon_definition');
    const normalWaves = asInt((_a = dungeon.normalWaves) !== null && _a !== void 0 ? _a : dungeon.normal_waves, DUNGEON_NORMAL_WAVES_V1964);
    const bossWave = asInt((_b = dungeon.bossWave) !== null && _b !== void 0 ? _b : dungeon.boss_wave, normalWaves + 1);
    if (normalWaves !== DUNGEON_NORMAL_WAVES_V1964 || bossWave !== DUNGEON_BOSS_WAVE_V1964) {
        throw new RangeError('unsupported_dungeon_progression_contract');
    }
    const wave = Math.max(1, asInt(run.wave, 1));
    const isBoss = run.stage === 'boss' || wave > normalWaves;
    return Object.freeze({
        version: COMBAT_CONTENT_FLOW_VERSION_V1964,
        mode: run.mode === 'party' ? 'party' : 'solo',
        encounterType: 'dungeon',
        dungeonId: String(dungeon.id),
        stage: isBoss ? 'boss' : 'wave',
        wave: isBoss ? bossWave : Math.min(normalWaves, wave),
        normalWaves,
        bossWave,
        totalCombatEncounters: bossWave,
        title: String(dungeon.name || 'دانجن'),
        enemyPoolRegionIds: [...(dungeon.poolRegions || dungeon.pool_region_ids || [])],
        bossEncounterId: String(dungeon.bossId || ((_c = dungeon.boss) === null || _c === void 0 ? void 0 : _c.id) || `dungeon_boss_${dungeon.id}`)
    });
}
export function getTowerFloorPlanV1964(tower, floorNumber) {
    var _a;
    if (!tower || !tower.id)
        throw new TypeError('invalid_tower_definition');
    const floorCount = asInt((_a = tower.floor_count) !== null && _a !== void 0 ? _a : tower.floorCount, TOWER_FLOOR_COUNT_V1964);
    if (floorCount !== TOWER_FLOOR_COUNT_V1964)
        throw new RangeError('unsupported_tower_floor_count');
    const floor = asInt(floorNumber, 0);
    if (floor < 1 || floor > TOWER_FLOOR_COUNT_V1964)
        throw new RangeError('tower_floor_out_of_range');
    const data = (tower.floors || []).find(x => asInt(x.floor) === floor);
    if (!data)
        throw new Error(`tower_floor_definition_missing:${floor}`);
    const ids = [...(data.encounter_ids || data.encounterIds || [])].map(String);
    if (!ids.length)
        throw new Error(`tower_floor_encounters_missing:${floor}`);
    const expectedType = floor % 4 === 0 ? 'boss' : (floor % 4 === 2 || floor % 4 === 3 ? 'miniboss' : 'normal');
    const normalizedType = data.type === 'mini_boss' ? 'miniboss' : data.type;
    if (normalizedType !== expectedType)
        throw new Error(`tower_floor_pattern_mismatch:${floor}`);
    return Object.freeze({
        version: COMBAT_CONTENT_FLOW_VERSION_V1964,
        mode: 'solo',
        encounterType: 'tower',
        towerId: String(tower.id),
        floor,
        floorCount,
        level: asInt(data.level, 1),
        type: normalizedType,
        encounterIds: Object.freeze(ids),
        reward: Object.freeze({ ...(data.reward || {}) }),
        bossRecipeDropChancePercent: Number(data.boss_recipe_drop_chance_percent || 0),
        title: `${tower.name || 'برج'} • طبقه ${floor} از ${floorCount}`
    });
}
export function validateCombatContentProgressionV1964({ dungeons = [], tower = null } = {}) {
    var _a;
    const errors = [];
    for (const d of dungeons) {
        try {
            getDungeonFlowPlanV1964(d, { wave: 1, stage: 'wave' });
        }
        catch (e) {
            errors.push(`${(d === null || d === void 0 ? void 0 : d.id) || 'unknown_dungeon'}:${e.message}`);
        }
    }
    if (tower) {
        if (asInt((_a = tower.floor_count) !== null && _a !== void 0 ? _a : tower.floorCount) !== TOWER_FLOOR_COUNT_V1964)
            errors.push('tower:floor_count_must_be_20');
        for (let floor = 1; floor <= TOWER_FLOOR_COUNT_V1964; floor++) {
            try {
                getTowerFloorPlanV1964(tower, floor);
            }
            catch (e) {
                errors.push(e.message);
            }
        }
    }
    return Object.freeze({ ok: errors.length === 0, errors: Object.freeze(errors), dungeonCount: dungeons.length, towerFloorsChecked: tower ? TOWER_FLOOR_COUNT_V1964 : 0 });
}
