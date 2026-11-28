/** ETRANOM V1971 — extensible monster reward resolver.
 * Supports independent material/item/recipe/key drops, weighted reward tables,
 * multiple currencies, authored quantities and externally calculated XP/gold.
 * No reward is granted here; callers apply the returned bundle exactly once.
 */
const obj = v => v && typeof v === 'object' && !Array.isArray(v) ? v : {};
const num = (v, d = 0) => Number.isFinite(Number(v)) ? Number(v) : d;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const int = (v, d = 1) => Math.max(0, Math.floor(num(v, d)));
/** Exact legacy Solo gold formula, now owned by the reward domain. */
export function calculateMonsterGoldRewardV1971(def = {}) {
    var _a, _b, _c, _d, _e;
    const level = Math.max(1, Math.min(100, Math.floor(num((_a = def.level) !== null && _a !== void 0 ? _a : def.enemyLevel, 1)))), stats = obj(def.stats), power = Math.max(0, num((_b = stats.power) !== null && _b !== void 0 ? _b : def.power, 0)), attack = Math.max(0, num((_c = def.attack) !== null && _c !== void 0 ? _c : stats.attack, 0)), defense = Math.max(0, num((_d = def.defense) !== null && _d !== void 0 ? _d : stats.defense, 0)), kind = String(def.kind || 'normal'), quality = String(def.quality || '').toLowerCase();
    const strengthIndex = Math.max(0, Math.min(79, Math.round((level - 1) * .8 + (power - 9) / 18 + (attack - 13) / 90 + (defense - 24) / 180)));
    const base = 8 + strengthIndex;
    const qualityMultiplier = /اسطوره|mythic/.test(quality) ? 2.0 : /افسانه|legendary/.test(quality) ? 1.7 : /نخبه|elite|کمیاب|rare/.test(quality) ? 1.45 : /مهارت|تقویت|enhanced/.test(quality) || ((def.skills || []).length > 0) ? 1.2 : 1;
    const kindMultiplier = (kind === 'area_boss' || kind === 'boss') ? 10 : (kind === 'miniboss' || kind === 'mini_boss') ? 4 : 1;
    const durabilityBonus = Math.min(1.5, Math.max(0, Math.log10(Math.max(1, num((_e = def.hp) !== null && _e !== void 0 ? _e : def.maxHp, 1)) / 600)) * .18);
    return Math.max(base, Math.round(base * qualityMultiplier * kindMultiplier * (1 + durabilityBonus) * 1.2));
}
/** XP remains HP-based; region one grants full XP through its new level-10 cap. */
export function calculateMonsterXpRewardV1971(def = {}, combatEnemy = {}, { playerLevel = 1, isRegionOneEnemy = false } = {}) {
    var _a;
    const rawHp = num(combatEnemy.maxHp, 0) || num(combatEnemy.hp, 0) || num(def.maxHp, 0) || num(def.hp, 0) || num((_a = def.stats) === null || _a === void 0 ? void 0 : _a.hp, 15);
    const baseXp = Math.max(1, Math.floor(Math.max(1, rawHp) / 15));
    if (isRegionOneEnemy && num(playerLevel, 1) >= 10)
        return Math.max(1, Math.floor(baseXp * .02));
    return baseXp;
}
function quantityOf(entry, random) {
    const q = obj(entry.quantity);
    if (typeof entry.quantity === 'object') {
        const min = int(q.min, 1), max = Math.max(min, int(q.max, min));
        return min + Math.floor(random() * (max - min + 1));
    }
    const min = int(entry.min_quantity, int(entry.quantity, 1));
    const max = Math.max(min, int(entry.max_quantity, min));
    return min + Math.floor(random() * (max - min + 1));
}
function pushReward(out, type, id, quantity, metadata = {}) {
    if (!id || quantity <= 0)
        return;
    const key = type === 'currency' ? 'currencies' : type === 'material' ? 'materials' : type === 'item' ? 'items' : type === 'recipe' ? 'recipes' : type === 'key' ? 'keys' : 'extras';
    const list = out[key], found = list.find(x => x.id === String(id));
    if (found)
        found.quantity += quantity;
    else
        list.push({ id: String(id), quantity, ...metadata });
}
function rollEntry(entry, out, random, context) {
    var _a;
    const type = String(entry.type || (entry.material_id ? 'material' : 'item'));
    const id = entry.id || entry.material_id || entry.item_id || entry.recipe_id || entry.key_id || entry.currency_id;
    const chance = clamp(num(entry.chance, 1), 0, 1);
    if (!id || random() >= chance)
        return;
    const quantity = quantityOf(entry, random);
    pushReward(out, type, id, quantity, { name: entry.name || ((_a = context.names) === null || _a === void 0 ? void 0 : _a[id]) || String(id), category: entry.category || null, metadata: obj(entry.metadata) });
}
function rollTable(table, out, random, context) {
    const entries = Array.isArray(table === null || table === void 0 ? void 0 : table.entries) ? table.entries : [];
    const mode = (table === null || table === void 0 ? void 0 : table.selection) || 'independent';
    if (mode === 'weighted') {
        const eligible = entries.filter(x => num(x.weight, 0) > 0);
        const total = eligible.reduce((s, x) => s + num(x.weight, 0), 0);
        if (total <= 0)
            return;
        let r = random() * total;
        for (const entry of eligible) {
            r -= num(entry.weight, 0);
            if (r < 0) {
                rollEntry({ ...entry, chance: 1 }, out, random, context);
                break;
            }
        }
        return;
    }
    for (const entry of entries)
        rollEntry(entry, out, random, context);
}
export function validateMonsterRewardLinksV1971(monsters = [], rewardTables = [], catalogs = {}) {
    var _a, _b, _c, _d, _e, _f, _g;
    const tables = new Set(rewardTables.map(x => String(x.id || '')));
    const errors = [];
    for (const table of rewardTables) {
        for (const entry of table.entries || []) {
            const type = String(entry.type || (entry.material_id ? 'material' : 'item')), id = entry.id || entry.material_id || entry.item_id || entry.recipe_id || entry.key_id || entry.currency_id;
            if (!id)
                errors.push({ tableId: table.id, reason: 'reward_entry_id_missing' });
            else if (type === 'material' && !((_a = catalogs.materials) === null || _a === void 0 ? void 0 : _a.has(String(id))))
                errors.push({ tableId: table.id, id: String(id), reason: 'material_missing' });
            else if (type === 'item' && !((_b = catalogs.items) === null || _b === void 0 ? void 0 : _b.has(String(id))))
                errors.push({ tableId: table.id, id: String(id), reason: 'item_missing' });
            else if (type === 'recipe' && catalogs.recipes && !catalogs.recipes.has(String(id)))
                errors.push({ tableId: table.id, id: String(id), reason: 'recipe_missing' });
        }
    }
    for (const monster of monsters) {
        const materialIds = [...(monster.drops || []), ...(monster.reward_entries || ((_c = monster.rewards) === null || _c === void 0 ? void 0 : _c.entries) || [])].filter(x => String(x.type || (x.material_id ? 'material' : 'item')) === 'material').map(x => x.material_id || x.id).filter(Boolean);
        const kind = String(monster.kind || 'normal'), limit = (kind === 'mini_boss' || kind === 'miniboss') ? 2 : (kind === 'area_boss' || kind === 'boss') ? 3 : 1;
        if (new Set(materialIds.map(String)).size > limit)
            errors.push({ monsterId: monster.id, reason: 'material_type_limit_exceeded', limit });
        for (const tableId of monster.reward_table_ids || [])
            if (!tables.has(String(tableId)))
                errors.push({ monsterId: monster.id, tableId: String(tableId), reason: 'missing_reward_table' });
        for (const drop of monster.drops || []) {
            const type = String(drop.type || (drop.material_id ? 'material' : 'item'));
            const id = drop.id || drop.material_id || drop.item_id || drop.recipe_id || drop.key_id;
            if (!id)
                errors.push({ monsterId: monster.id, reason: 'drop_id_missing' });
            else if (type === 'material' && !((_d = catalogs.materials) === null || _d === void 0 ? void 0 : _d.has(String(id))))
                errors.push({ monsterId: monster.id, id: String(id), reason: 'material_missing' });
            else if (type === 'item' && !((_e = catalogs.items) === null || _e === void 0 ? void 0 : _e.has(String(id))))
                errors.push({ monsterId: monster.id, id: String(id), reason: 'item_missing' });
            else if (type === 'recipe' && catalogs.recipes && !catalogs.recipes.has(String(id)))
                errors.push({ monsterId: monster.id, id: String(id), reason: 'recipe_missing' });
        }
        for (const entry of monster.reward_entries || []) {
            const type = String(entry.type || 'item'), id = entry.id || entry.material_id || entry.item_id || entry.recipe_id || entry.key_id || entry.currency_id;
            if (!id)
                errors.push({ monsterId: monster.id, reason: 'reward_entry_id_missing' });
            else if (type === 'material' && !((_f = catalogs.materials) === null || _f === void 0 ? void 0 : _f.has(String(id))))
                errors.push({ monsterId: monster.id, id: String(id), reason: 'material_missing' });
            else if (type === 'item' && !((_g = catalogs.items) === null || _g === void 0 ? void 0 : _g.has(String(id))))
                errors.push({ monsterId: monster.id, id: String(id), reason: 'item_missing' });
            else if (type === 'recipe' && catalogs.recipes && !catalogs.recipes.has(String(id)))
                errors.push({ monsterId: monster.id, id: String(id), reason: 'recipe_missing' });
        }
    }
    return { valid: errors.length === 0, errors };
}
export function resolveMonsterRewardsV1971(monster = {}, options = {}) {
    var _a, _b, _c, _d;
    const random = typeof options.random === 'function' ? options.random : Math.random;
    const tables = options.rewardTables instanceof Map ? options.rewardTables : new Map((options.rewardTables || []).map(x => [String(x.id), x]));
    const out = { monsterId: String(monster.id || ''), xp: int((_a = options.xp) !== null && _a !== void 0 ? _a : calculateMonsterXpRewardV1971(monster, options.combatEnemy || {}, options), 0), currencies: [], materials: [], items: [], recipes: [], keys: [], extras: [] };
    const gold = num((_b = options.gold) !== null && _b !== void 0 ? _b : calculateMonsterGoldRewardV1971(monster), 0);
    if (gold > 0)
        pushReward(out, 'currency', 'gold', Math.floor(gold), { name: 'سکه' });
    for (const drop of monster.drops || [])
        rollEntry(drop, out, random, options);
    for (const entry of monster.reward_entries || ((_c = monster.rewards) === null || _c === void 0 ? void 0 : _c.entries) || [])
        rollEntry(entry, out, random, options);
    for (const id of monster.reward_table_ids || []) {
        const table = tables.get(String(id));
        if (table)
            rollTable(table, out, random, options);
    }
    for (const currency of ((_d = monster.rewards) === null || _d === void 0 ? void 0 : _d.currencies) || [])
        rollEntry({ ...currency, type: 'currency' }, out, random, options);
    return out;
}
export function createMonsterRewardEngineV1971({ rewardTables = [], names = {} } = {}) {
    const map = new Map(rewardTables.map(x => [String(x.id), x]));
    return Object.freeze({ version: '1971.0.0', validate: (monsters, catalogs) => validateMonsterRewardLinksV1971(monsters, rewardTables, catalogs), resolve: (monster, options = {}) => resolveMonsterRewardsV1971(monster, { ...options, rewardTables: map, names: { ...names, ...obj(options.names) } }) });
}
