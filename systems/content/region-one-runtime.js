import { validateRegionZonesV1980 } from "../progression/world-level-map-v1980.js?build=2081";
import { createMonsterCombatEngineV1970, validateMonsterSkillLinksV1970 } from "../combat/monster-combat-engine-v1970.js?build=2081";
import { createMonsterRewardEngineV1971, validateMonsterRewardLinksV1971 } from "../combat/monster-reward-engine-v1971.js?build=2081";
import { applyOwnerRuntimeAdapters, publishOwnerRuntimeConfig, resolveOwnerRuntimePoliciesV2012 } from "../admin/owner-runtime-adapters-v2011.js?build=2081";
const ROOT = './content/packs/region_one_master_v2/';
const FILES = {
    manifest: 'manifest.json', regions: 'regions/regions.json', monsters: 'monsters/monsters.json',
    materials: 'materials/materials.json', skills: 'skills/monster_skills.json', items: 'items/items.json',
    recipes: 'recipes/recipes.json', quests: 'quests/quests.json', npcs: 'npcs/npcs.json',
    dungeons: 'dungeons/dungeons.json', ruins: 'ruins/ruins.json', tower: 'tower/tower.json',
    towerEncounters: 'tower/tower_encounters.json', rewards: 'rewards/reward_tables.json'
};
function withRuntimeTimeout(promise, ms, message) {
    let timer;
    const timeout = new Promise((_, reject) => {
        timer = setTimeout(() => reject(new Error(message)), ms);
    });
    return Promise.race([Promise.resolve(promise), timeout]).finally(() => clearTimeout(timer));
}
async function readJson(path) {
    const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
    let timedOut = false;
    const timer = setTimeout(() => {
        timedOut = true;
        if (controller)
            controller.abort();
    }, 12000);
    try {
        const request = fetch(ROOT + path, { cache: 'no-store', ...(controller ? { signal: controller.signal } : {}) });
        const response = await withRuntimeTimeout(request, 12000, `مهلت بارگذاری فایل منطقه اول تمام شد: ${path}`);
        if (!response.ok)
            throw new Error(`محتوای منطقه اول بارگذاری نشد: ${path} (${response.status})`);
        return await withRuntimeTimeout(response.json(), 5000, `خواندن فایل منطقه اول بیش از حد طول کشید: ${path}`);
    }
    catch (error) {
        if (timedOut)
            throw new Error(`بارگذاری فایل منطقه اول به دلیل پایان مهلت متوقف شد: ${path}`);
        throw error;
    }
    finally {
        clearTimeout(timer);
    }
}
function regionCombatMultiplier(_regionId) {
    // v139: encounter stats are balanced directly in the content pack.
    // Applying hidden x2/x3 multipliers here caused severe cross-zone imbalance.
    return 1;
}
function scaleCombatStats(stats, multiplier) {
    const scaled = { ...(stats || {}) };
    if (multiplier !== 1)
        for (const [key, value] of Object.entries(scaled)) {
            if (typeof value === 'number' && Number.isFinite(value))
                scaled[key] = Math.round(value * multiplier);
        }
    return scaled;
}
function assertUnique(list, label) {
    const ids = list.map(x => x.id);
    if (ids.some(x => !x) || new Set(ids).size !== ids.length)
        throw new Error(`شناسه تکراری یا خالی در ${label}`);
}
const ADMIN_KIND_TO_PACK_KEY = {
    region: 'regions', monster: 'monsters', material: 'materials', skill: 'skills',
    item: 'items', recipe: 'recipes', quest: 'quests', npc: 'npcs',
    dungeon: 'dungeons', ruin: 'ruins', tower_encounter: 'towerEncounters', reward_table: 'rewards'
};
function applyAdminPublishedContent(pack, rows) {
    var _a;
    const extra = {};
    for (const row of rows || []) {
        const key = ADMIN_KIND_TO_PACK_KEY[row.content_type];
        const payload = row.payload;
        if (!payload || typeof payload !== 'object' || Array.isArray(payload) || !payload.id)
            continue;
        if (!key) {
            (extra[_a = row.content_type] || (extra[_a] = [])).push({ ...payload, id: payload.id || row.content_id, _adminVersion: row.version });
            continue;
        }
        const list = pack[key];
        if (!Array.isArray(list))
            continue;
        const index = list.findIndex(x => String(x.id) === String(payload.id || row.content_id));
        const record = { ...(payload), id: payload.id || row.content_id, _adminVersion: row.version };
        if (index >= 0)
            list[index] = { ...list[index], ...record };
        else
            list.push(record);
    }
    window.ETRANOM_ADMIN_RUNTIME_CATALOG = extra;
}
async function assertOwnerPlayerAccess(supabase) {
    var _a;
    if (!((_a = supabase === null || supabase === void 0 ? void 0 : supabase.auth) === null || _a === void 0 ? void 0 : _a.getUser) || !(supabase === null || supabase === void 0 ? void 0 : supabase.rpc))
        return;
    let authResult;
    try {
        authResult = await withRuntimeTimeout(
            supabase.auth.getUser(),
            7000,
            'تأیید حساب برای بررسی دسترسی بیش از ۷ ثانیه طول کشید.'
        );
    }
    catch (cause) {
        const error = new Error(`بررسی هویت حساب انجام نشد: ${cause && cause.message ? cause.message : cause}`);
        error.code = 'ETRANOM_ACCESS_CHECK_FAILED';
        error.cause = cause;
        throw error;
    }
    const { data: { user } = {}, error: authError } = authResult || {};
    if (authError) {
        const error = new Error(`بررسی هویت حساب ناموفق بود: ${authError.message || authError}`);
        error.code = 'ETRANOM_ACCESS_CHECK_FAILED';
        error.cause = authError;
        throw error;
    }
    if (!user)
        return;
    let accessResult;
    try {
        accessResult = await withRuntimeTimeout(
            supabase.rpc('etranom_player_access_status_v1'),
            7000,
            'بررسی مجوز حساب بیش از ۷ ثانیه طول کشید.'
        );
    }
    catch (cause) {
        const error = new Error(`بررسی مجوز حساب انجام نشد: ${cause && cause.message ? cause.message : cause}`);
        error.code = 'ETRANOM_ACCESS_CHECK_FAILED';
        error.cause = cause;
        throw error;
    }
    const { data, error: accessError } = accessResult || {};
    if (accessError) {
        const error = new Error(`بررسی وضعیت دسترسی بازیکن ناموفق بود: ${accessError.message || accessError}`);
        error.code = 'ETRANOM_ACCESS_CHECK_FAILED';
        error.cause = accessError;
        throw error;
    }
    if ((data === null || data === void 0 ? void 0 : data.allowed) === false || (data === null || data === void 0 ? void 0 : data.banned) === true) {
        const error = new Error(`دسترسی این حساب مسدود است. دلیل: ${data.reason || 'بدون توضیح'}${data.expires_at ? ` | پایان محرومیت: ${data.expires_at}` : ''}`);
        error.code = 'ETRANOM_ACCESS_DENIED';
        throw error;
    }
}
async function fetchAdminPublishedContent(supabase) {
    if (!(supabase === null || supabase === void 0 ? void 0 : supabase.rpc))
        return [];
    try {
        const { data, error } = await withRuntimeTimeout(
            supabase.rpc('etranom_runtime_published_content_v1'),
            5000,
            'دریافت محتوای منتشرشده بیش از ۵ ثانیه طول کشید.'
        );
        if (error)
            throw error;
        return Array.isArray(data) ? data : [];
    }
    catch (error) {
        console.warn('[ETRANOM] Admin published content unavailable; static pack remains active:', (error === null || error === void 0 ? void 0 : error.message) || error);
        return [];
    }
}
export async function loadRegionOneRuntime({ supabase = null } = {}) {
    var _a, _b, _c;
    await assertOwnerPlayerAccess(supabase);
    const entries = await Promise.all(Object.entries(FILES).map(async ([key, path]) => [key, await readJson(path)]));
    const pack = Object.fromEntries(entries);
    const adminRows = await fetchAdminPublishedContent(supabase);
    const ownerAdapted = applyOwnerRuntimeAdapters(pack, adminRows);
    publishOwnerRuntimeConfig(ownerAdapted.catalog);
    if (adminRows.length) {
        const baseline = Object.fromEntries(['regions', 'monsters', 'materials', 'skills', 'items', 'recipes', 'quests', 'npcs', 'dungeons', 'ruins', 'towerEncounters', 'rewards'].map(k => [k, structuredClone(pack[k])]));
        applyAdminPublishedContent(pack, adminRows);
        const zoneCheck = validateRegionZonesV1980(pack.regions, 1);
        const skillCheck = validateMonsterSkillLinksV1970(pack.monsters, pack.skills);
        const rewardCheck = validateMonsterRewardLinksV1971(pack.monsters, pack.rewards, { materials: new Set(pack.materials.map(x => x.id)), items: new Set(pack.items.map(x => x.id)), recipes: new Set(pack.recipes.map(x => x.id)) });
        if (!zoneCheck.valid || !skillCheck.valid || !rewardCheck.valid) {
            for (const [key, value] of Object.entries(baseline))
                pack[key] = value;
            window.ETRANOM_ADMIN_RUNTIME_CATALOG = {};
            publishOwnerRuntimeConfig({});
            console.error('[ETRANOM] Published admin content failed runtime validation; static pack restored.', { zoneCheck, skillCheck, rewardCheck });
        }
    }
    const listKeys = ['regions', 'monsters', 'materials', 'skills', 'items', 'recipes', 'quests', 'npcs', 'dungeons', 'towerEncounters', 'rewards'];
    for (const key of listKeys) {
        if (!Array.isArray(pack[key]))
            throw new Error(`ساختار ${key} در بسته محتوایی معتبر نیست.`);
        assertUnique(pack[key], key);
    }
    if (!((_a = pack.manifest) === null || _a === void 0 ? void 0 : _a.source_of_truth) || pack.manifest.pack_id !== 'region_one_master_v2')
        throw new Error('نسخه یا مرجع بسته محتوایی منطقه اول معتبر نیست.');
    const worldLevelValidation = validateRegionZonesV1980(pack.regions, 1);
    if (!worldLevelValidation.valid)
        throw new Error(`سطح‌بندی محدوده‌های منطقه اول نامعتبر است: ${worldLevelValidation.errors.join(', ')}`);
    if (Number((_b = pack.manifest.level_range) === null || _b === void 0 ? void 0 : _b.min) !== 1 || Number((_c = pack.manifest.level_range) === null || _c === void 0 ? void 0 : _c.max) !== 10)
        throw new Error('بازه سطح بسته منطقه اول باید ۱ تا ۱۰ باشد.');
    const skillLinks = validateMonsterSkillLinksV1970(pack.monsters, pack.skills);
    if (!skillLinks.valid)
        throw new Error(`مهارت نامعتبر برای هیولا: ${skillLinks.errors.map(x => `${x.monsterId}:${x.skillId}`).join(', ')}`);
    const monsterCombatEngine = createMonsterCombatEngineV1970({ skillMap: Object.fromEntries(pack.skills.map(x => [x.id, x])) });
    const monsterRewardEngine = createMonsterRewardEngineV1971({ rewardTables: pack.rewards, names: Object.fromEntries([...pack.materials, ...pack.items].map(x => [x.id, x.name])) });
    const rewardLinks = validateMonsterRewardLinksV1971(pack.monsters, pack.rewards, { materials: new Set(pack.materials.map(x => x.id)), items: new Set(pack.items.map(x => x.id)), recipes: new Set(pack.recipes.map(x => x.id)) });
    if (!rewardLinks.valid)
        throw new Error(`پاداش نامعتبر برای هیولا: ${rewardLinks.errors.map(x => `${x.monsterId}:${x.id || x.tableId || x.reason}`).join(', ')}`);
    const materialById = new Map(pack.materials.map(x => [x.id, x]));
    const monsterById = new Map(pack.monsters.map(x => [x.id, x]));
    const regionOneIds = new Set(pack.regions.filter(region => Number(region.region_number) === 1).map(region => region.id));
    const itemById = new Map(pack.items.map(x => [x.id, x]));
    const dungeonById = new Map(pack.dungeons.map(x => [x.id, x]));
    const towerBossIds = new Set((pack.tower.floors || []).filter(f => f.type === 'boss').flatMap(f => f.encounter_ids || []));
    for (const monster of pack.monsters) {
        for (const drop of monster.drops || [])
            if (!materialById.has(drop.material_id))
                throw new Error(`ماده نامعتبر برای هیولا ${monster.id}: ${drop.material_id}`);
    }
    for (const recipe of pack.recipes) {
        if (!itemById.has(recipe.result_item_id))
            throw new Error(`آیتم خروجی دستور ${recipe.id} پیدا نشد.`);
        for (const ingredient of recipe.ingredients || [])
            if (!materialById.has(ingredient.material_id))
                throw new Error(`ماده دستور ${recipe.id} پیدا نشد: ${ingredient.material_id}`);
        for (const source of recipe.source_encounter_ids || [])
            if (!monsterById.has(source))
                throw new Error(`منبع دستور ${recipe.id} پیدا نشد: ${source}`);
        for (const source of recipe.material_source_encounter_ids || [])
            if (!monsterById.has(source))
                throw new Error(`منبع مواد دستور ${recipe.id} پیدا نشد: ${source}`);
        const sourceType = recipe.drop_source_type, sourceId = recipe.drop_source_id;
        if (sourceType === 'monster' && !monsterById.has(sourceId))
            throw new Error(`منبع هیولایی دستور ${recipe.id} معتبر نیست: ${sourceId}`);
        if (sourceType === 'dungeon_treasure' && !dungeonById.has(sourceId))
            throw new Error(`منبع گنجینه دستور ${recipe.id} معتبر نیست: ${sourceId}`);
        if (sourceType === 'dungeon_boss' && !dungeonById.has(String(sourceId || '').replace(/^dungeon_boss_/, '')))
            throw new Error(`منبع باس دانجن دستور ${recipe.id} معتبر نیست: ${sourceId}`);
        if (sourceType === 'tower_boss' && !towerBossIds.has(sourceId))
            throw new Error(`منبع باس برج دستور ${recipe.id} معتبر نیست: ${sourceId}`);
        if (!['monster', 'dungeon_treasure', 'dungeon_boss', 'tower_boss'].includes(sourceType))
            throw new Error(`نوع منبع دستور ${recipe.id} نامعتبر است: ${sourceType}`);
    }
    const regions = pack.regions.map(region => {
        var _a;
        return ({
            id: region.id, name: region.name, level: Number(region.recommended_level || region.level_min || 1),
            levelMin: Number(region.level_min || region.recommended_level || 1), levelMax: Number(region.level_max || region.recommended_level || 1),
            levelRangeLabel: region.level_range_label_fa || String(region.recommended_level || region.level_min || 1), zoneNumber: Number(region.progression_zone_number || 0),
            regionNumber: region.region_number, recipeLevel: region.recipe_level, itemLevel: region.item_level,
            material: region.material_theme, mats: [...region.material_ids], dungeon: region.dungeon_id || null,
            ruins: !!region.ruins_enabled, subarea: region.subarea, entryPoint: ((_a = region.subarea) === null || _a === void 0 ? void 0 : _a.entry_point) || null,
            encounterRules: region.encounter_rules, leaderEncounterId: region.leader_encounter_id || null
        });
    });
    const materialNames = regions.map(region => region.mats.map(id => { var _a; return ((_a = materialById.get(id)) === null || _a === void 0 ? void 0 : _a.name) || id; }));
    const encounters = pack.monsters.map(monster => {
        var _a, _b;
        const drops = monster.drops || [];
        const materialIds = drops.filter(x => !x.type || x.type === 'material').map(x => x.material_id || x.id);
        const materialNames = materialIds.map(id => { var _a; return ((_a = materialById.get(id)) === null || _a === void 0 ? void 0 : _a.name) || id; });
        const multiplier = regionCombatMultiplier(monster.region_id);
        const stats = scaleCombatStats(monster.stats, multiplier);
        // v146: authored enemy stats are passed to combat unchanged; no hidden scaling is applied.
        return {
            id: monster.id, name: monster.name, icon: '👹', kind: monster.kind === 'mini_boss' ? 'miniboss' : monster.kind === 'area_boss' ? 'boss' : monster.kind,
            regionId: monster.region_id, regionName: ((_a = regions.find(x => x.id === monster.region_id)) === null || _a === void 0 ? void 0 : _a.name) || '', level: monster.level, levelMin: monster.level, levelMax: monster.level,
            hp: Number(stats.hp || 1), maxHp: Number(stats.hp || 1), mp: Number(stats.mp || 0), maxMp: Number(stats.mp || 0),
            attack: Number(stats.attack || stats.power || 1), defense: Number(stats.defense || stats.endurance || 0),
            accuracy: Number(stats.accuracy || 80), speed: Number(stats.speed || 1), combatMultiplier: multiplier, quality: monster.quality,
            role: monster.role || '', description: monster.description_fa || '', stats, ai: monster.ai || {},
            materialId: materialIds[0] || null, materialName: materialNames[0] || '', materialIds, materialNames, dropEntries: drops.map(x => ({ ...x })), rewardEntries: [...(monster.reward_entries || ((_b = monster.rewards) === null || _b === void 0 ? void 0 : _b.entries) || [])], rewardTableIds: [...(monster.reward_table_ids || [])],
            xp: Math.max(1, Math.floor(Math.max(1, Number(stats.hp || monster.hp || 15)) / 15)), gold: Number(monster.gold || 0), skills: [...(monster.skills || [])],
            portrait: monster.portrait || null, respawnSeconds: monster.respawn_seconds || 90, sourceVersion: monster.version
        };
    });
    const recipes = pack.recipes.map(recipe => {
        const item = itemById.get(recipe.result_item_id);
        return {
            id: recipe.id, name: recipe.name, className: 'عمومی', originalClassName: recipe.original_class_name || recipe.class_name, accessScope: 'public', slot: recipe.slot, equipmentTypeLabel: recipe.equipment_type_label_fa || recipe.slot, loreDescription: recipe.lore_description_fa || '',
            regionId: recipe.region_id, regionName: recipe.region_name, recipeLevel: recipe.recipe_level,
            maxRecipeLevel: recipe.max_recipe_level, itemLevel: recipe.item_level, rarity: recipe.rarity,
            materials: (recipe.ingredients || []).map(x => { var _a; return ({ id: x.material_id, name: ((_a = materialById.get(x.material_id)) === null || _a === void 0 ? void 0 : _a.name) || x.material_id, qty: x.quantity }); }),
            sourceEncounterIds: [...(recipe.source_encounter_ids || [])], dropChance: recipe.drop_chance_percent, dropSourceType: recipe.drop_source_type || 'monster', dropSourceId: recipe.drop_source_id || (recipe.source_encounter_ids || [])[0] || null, dropSource: recipe.drop_source_label_fa || '', materialSourceEncounterIds: [...(recipe.material_source_encounter_ids || [])],
            stats: { ...((item === null || item === void 0 ? void 0 : item.stats) || {}) }, effects: [...(recipe.effects || [])], resultItemId: recipe.result_item_id
        };
    });
    const dungeons = pack.dungeons.map(d => {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
        const multiplier = regionCombatMultiplier(d.region_id);
        const boss = d.boss || {};
        return ({
            id: d.id, name: d.name, regionId: d.region_id, levelMin: Number(d.level_min || ((_a = d.boss) === null || _a === void 0 ? void 0 : _a.level) || 1), levelMax: Number(d.level_max || ((_b = d.boss) === null || _b === void 0 ? void 0 : _b.level) || 1), recommendedLevel: Number(d.recommended_level || ((_c = d.boss) === null || _c === void 0 ? void 0 : _c.level) || 1), poolRegions: [...d.pool_region_ids], waves: d.wave_count,
            normalWaves: d.normal_waves, bossWave: d.boss_wave, enemyCount: d.enemy_count || { guaranteed: 1, second_enemy_chance_percent: 60 },
            levelWeights: (d.level_weights || []).map(x => ({ level: x.level, weight: x.weight })),
            treasureChances: (((_d = d.events_after_wave) === null || _d === void 0 ? void 0 : _d.treasure_chance_percent) || []).map(x => x / 100),
            trapChances: (((_e = d.events_after_wave) === null || _e === void 0 ? void 0 : _e.trap_chance_percent) || []).map(x => x / 100),
            trapWeights: ((_f = d.events_after_wave) === null || _f === void 0 ? void 0 : _f.trap_type_weights) || [],
            boss: boss.name, bossId: boss.id, bossLevel: boss.level,
            bossHp: Math.round(Number(boss.hp || 0) * multiplier),
            bossMp: Math.round(Number(boss.mp || 0) * multiplier),
            bossAttack: Math.round(Number(boss.attack || 0) * multiplier),
            bossDefense: Math.round(Number(boss.defense || 0) * multiplier), combatMultiplier: multiplier,
            bossPortrait: (_g = d.boss) === null || _g === void 0 ? void 0 : _g.portrait, bossMaterialIds: ((_h = d.boss) === null || _h === void 0 ? void 0 : _h.material_ids) || [], skills: ((_j = d.boss) === null || _j === void 0 ? void 0 : _j.skills) || [],
            description: ((_k = d.boss) === null || _k === void 0 ? void 0 : _k.description_fa) || d.name, events: d.events_after_wave, source: d
        });
    });
    const tower = pack.tower;
    const towerFloors = (tower.floors || []).map(f => { var _a, _b; return ({ ...f, gold: ((_a = f.reward) === null || _a === void 0 ? void 0 : _a.gold) || 0, xp: ((_b = f.reward) === null || _b === void 0 ? void 0 : _b.xp) || 0 }); });
    const towerEncounters = pack.towerEncounters.map(e => {
        const multiplier = regionCombatMultiplier(tower.region_id);
        const hp = Math.round(Number(e.hp || 0) * multiplier), mp = Math.round(Number(e.mp || 0) * multiplier);
        const attack = Math.round(Number(e.attack || 0) * multiplier), defense = Math.round(Number(e.defense || 0) * multiplier);
        return ({
            id: e.id, name: e.name, icon: e.kind === 'boss' ? '👑' : e.kind === 'mini_boss' ? '☠️' : '🛡️',
            kind: e.kind === 'mini_boss' ? 'miniboss' : e.kind, regionId: tower.region_id, level: e.level,
            hp, maxHp: hp, mp, maxMp: mp, attack, defense, combatMultiplier: multiplier,
            accuracy: e.accuracy || 90, speed: e.speed || 10, skills: e.skills || [], quality: 'دشمن اختصاصی برج',
            materialIds: [...(e.material_ids || [])], materialNames: (e.material_ids || []).map(id => { var _a; return ((_a = materialById.get(id)) === null || _a === void 0 ? void 0 : _a.name) || id; }), xp: Math.max(1, Math.floor(Math.max(1, hp) / 15)), gold: 0, towerOnly: true,
            towerMini: e.kind === 'mini_boss', towerBoss: ['boss', 'area_boss'].includes(e.kind), towerFloor: Number((e.id.match(/floor(\d+)/) || [])[1]) || null,
            portrait: e.portrait, stats: { power: e.attack, speed: e.speed || 10, endurance: e.defense, vitality: Math.max(1, Math.round(e.hp / 12)),
                intellect: Math.max(0, Math.round((e.mp || 0) / 8)), perception: e.accuracy || 90, luck: 0, faith: Math.max(0, Math.round((e.mp || 0) / 10)),
                hp, mp, attack, defense, accuracy: Math.round((e.accuracy || 90) * multiplier) }
        });
    });
    const ruins = pack.ruins[0] || null;
    const npcById = new Map(pack.npcs.map(x => [x.id, x]));
    const mainQuests = pack.quests.filter(q => q.kind === 'main_chain').sort((a, b) => a.sequence - b.sequence);
    const sideQuests = pack.quests.filter(q => q.kind === 'side');
    const mainQuestChains = mainQuests.map(q => {
        var _a, _b, _c;
        return ({
            id: q.id, title: q.name, regionId: q.region_id, giver: ((_a = npcById.get(q.giver_npc_id)) === null || _a === void 0 ? void 0 : _a.name) || q.giver_npc_id,
            description: q.description_fa || '', rewardGold: Number(((_b = q.rewards) === null || _b === void 0 ? void 0 : _b.gold) || 0), rewardXp: Number(((_c = q.rewards) === null || _c === void 0 ? void 0 : _c.xp) || 0)
        });
    });
    const mainQuestSteps = mainQuests.map(q => {
        var _a;
        const defeat = q.objectives.find(x => x.type === 'defeat'), collect = q.objectives.find(x => x.type === 'collect');
        const target = monsterById.get(defeat === null || defeat === void 0 ? void 0 : defeat.target_id);
        return { regionId: q.region_id, name: ((_a = regions.find(x => x.id === q.region_id)) === null || _a === void 0 ? void 0 : _a.name) || q.region_id,
            eliteId: defeat === null || defeat === void 0 ? void 0 : defeat.target_id, eliteName: (target === null || target === void 0 ? void 0 : target.name) || (defeat === null || defeat === void 0 ? void 0 : defeat.target_id),
            materials: ((collect === null || collect === void 0 ? void 0 : collect.items) || []).map(x => { var _a; return ({ id: x.material_id, name: ((_a = materialById.get(x.material_id)) === null || _a === void 0 ? void 0 : _a.name) || x.material_id, qty: x.quantity }); }) };
    });
    const npcQuests = sideQuests.map(q => {
        var _a, _b, _c, _d;
        const kill = q.objectives.find(x => x.type === 'kill'), collect = q.objectives.find(x => x.type === 'collect'), item = (_a = collect === null || collect === void 0 ? void 0 : collect.items) === null || _a === void 0 ? void 0 : _a[0];
        const target = monsterById.get(kill === null || kill === void 0 ? void 0 : kill.target_id), material = materialById.get(item === null || item === void 0 ? void 0 : item.material_id), region = regions.find(x => x.id === q.region_id);
        return { id: q.id, npcId: q.giver_npc_id, npcName: ((_b = npcById.get(q.giver_npc_id)) === null || _b === void 0 ? void 0 : _b.name) || q.giver_npc_id, title: q.name,
            regionId: q.region_id, regionName: (region === null || region === void 0 ? void 0 : region.name) || q.region_id, monsterId: kill === null || kill === void 0 ? void 0 : kill.target_id, monsterName: (target === null || target === void 0 ? void 0 : target.name) || (kill === null || kill === void 0 ? void 0 : kill.target_id),
            killQty: Number((kill === null || kill === void 0 ? void 0 : kill.quantity) || 1), materialId: item === null || item === void 0 ? void 0 : item.material_id, materialName: (material === null || material === void 0 ? void 0 : material.name) || (item === null || item === void 0 ? void 0 : item.material_id),
            materialQty: Number((item === null || item === void 0 ? void 0 : item.quantity) || 1), rewardGold: Number(((_c = q.rewards) === null || _c === void 0 ? void 0 : _c.gold) || 0), rewardXp: Number(((_d = q.rewards) === null || _d === void 0 ? void 0 : _d.xp) || 0) };
    });
    window.ETRANOM_RUNTIME_CONTENT = {
        packId: pack.manifest.pack_id, version: pack.manifest.content_version, manifest: pack.manifest, worldLevelValidation,
        adminPublishedCount: adminRows.length, adminCatalog: window.ETRANOM_ADMIN_RUNTIME_CATALOG || {},
        ownerRuntimeConfig: ownerAdapted.catalog, ownerPolicies: resolveOwnerRuntimePoliciesV2012(),
        classes: pack.classes || [], specializations: pack.specializations || [],
        regions, materialNames, materials: pack.materials, monsters: encounters, skills: pack.skills,
        items: pack.items, recipes, quests: pack.quests, mainQuestChains, mainQuestSteps, npcQuests,
        npcs: pack.npcs, dungeons, ruins, tower, towerFloors, towerEncounters,
        monsterSkillMap: Object.fromEntries(pack.skills.map(x => [x.id, x])),
        monsterCombatEngine,
        monsterCombatEngineVersion: monsterCombatEngine.version,
        monsterRewardEngine,
        monsterRewardEngineVersion: monsterRewardEngine.version,
        rewardTables: pack.rewards,
        monsterPortraits: Object.fromEntries(pack.monsters.filter(x => x.portrait).map(x => [x.id, x.portrait]))
    };
    console.info('[ETRANOM] Region One runtime content loaded', {
        regions: regions.length, monsters: encounters.length, materials: pack.materials.length, levelRange: [Math.min(...regions.map(r => r.levelMin)), Math.max(...regions.map(r => r.levelMax))],
        recipes: recipes.length, dungeons: dungeons.length, towerFloors: towerFloors.length,
        towerEncounters: towerEncounters.length
    });
    return window.ETRANOM_RUNTIME_CONTENT;
}
