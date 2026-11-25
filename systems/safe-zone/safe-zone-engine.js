/**
 * ETRANOM Safe Zone Contract — V1961
 * Safe zone is intentionally content-light during redesign. Only map/location
 * information and basic NPC/steward dialogue remain active.
 */
const ENTITY_TYPES = new Set(['npc', 'building', 'landmark']);
const SECTIONS = Object.freeze([
    { id: 'overview', label: 'معرفی', icon: '▤' },
    { id: 'dialogue', label: 'گفتگو', icon: '💬' },
    { id: 'location', label: 'موقعیت', icon: '⌖' }
]);
const STEWARD_BY_BUILDING = Object.freeze({
    online_player_market: 'merchant_ren', pvp_hall: 'captain_arden', inn: 'innkeeper_ella',
    smith: 'smith_bram', guild: 'guildmaster_toren', alchemy: 'alchemist_liora',
    enchanter_shop: 'priest_amon', clinic: 'healer_nara', guardhouse: 'captain_arden',
    fire_temple: 'elder_sena', stable: 'guard_mira', granary: 'elder_sena',
    grain_mill: 'grain_miller_omid', grain_bakery: 'grain_baker_tala', grain_farmstead: 'grain_headman_varo', grain_herbgarden: 'grain_herbalist_vesa', grain_livestock: 'grain_headman_varo',
    rootwood_sawmill: 'rootwood_sawyer_daran', rootwood_carpenter: 'rootwood_carpenter_nima', rootwood_herbalist: 'rootwood_herbalist_vesa', rootwood_hunters: 'rootwood_hunter_sorin', rootwood_apiary: 'rootwood_herbalist_vesa',
    iron_mine: 'iron_miner_kaveh', iron_smelter: 'iron_smelter_roha', iron_stonecutter: 'iron_stonecutter_boran', iron_hall: 'iron_miner_kaveh', iron_cartwright: 'iron_stonecutter_boran'
});
const SAFE_ZONE_RETIRED_ITEM_IDS = new Set([
    'bread', 'flour', 'water', 'wood_resin', 'stone', 'grain', 'honey', 'leather', 'iron_ore', 'timber',
    'wooden_plank', 'game_meat', 'beeswax', 'coal', 'cut_stone', 'iron_ingot', 'iron_tool', 'iron_pickaxe',
    'river_fish', 'white_apple', 'healing_herb', 'potion', 'arcane_ink', 'sigil_chalk', 'focus_stone',
    'scroll_fireball', 'scroll_tempest', 'scroll_sky_lightning', 'scroll_ice_spear', 'scroll_arcane_blast',
    'scroll_magic_shield', 'scroll_ice_wall', 'scroll_stone_skin', 'scroll_spell_reflection', 'scroll_heaven_guard',
    'scroll_life_mending', 'scroll_mana_spring', 'scroll_ancient_force', 'scroll_mind_focus', 'scroll_arcane_haste',
    'scroll_shadow_chains', 'scroll_seal_silence', 'scroll_summon_guardian', 'scroll_curse_purge', 'scroll_soul_return'
]);
const SAFE_ZONE_NPC_IDS = new Set(['captain_arden', 'guard_mira', 'elder_sena', 'merchant_ren', 'alchemist_liora', 'smith_bram', 'innkeeper_ella', 'guildmaster_toren', 'healer_nara', 'priest_amon']);
const SAFE_ZONE_LEGACY_SAVE_KEYS = Object.freeze([
    'quest', 'personalQuests', 'dailyRequest', 'regionQuest', 'lanternQuest', 'oreLedgerQuest',
    'landmarkDiscoveries', 'safeActivityDays', 'safeRegionRewardClaimed', 'resourceGathered',
    'guardPatrols', 'mountUntilDay', 'interiorDiscoveries', 'safeClues', 'safeClueReward'
]);
export function resetLegacySafeZoneProgress(save) {
    if (!save || typeof save !== 'object')
        return { ok: false, changed: false, removed: [] };
    if (save._safeZoneContentResetV1961 === true)
        return { ok: true, changed: false, removed: [] };
    const removed = [];
    for (const key of SAFE_ZONE_LEGACY_SAVE_KEYS) {
        if (Object.prototype.hasOwnProperty.call(save, key)) {
            delete save[key];
            removed.push(key);
        }
    }
    if (save.flags && typeof save.flags === 'object') {
        let changed = false;
        for (const key of ['guardKnown', 'strangerMet', 'wolfDefeated', 'ruinsSeen']) {
            if (Object.prototype.hasOwnProperty.call(save.flags, key)) {
                delete save.flags[key];
                changed = true;
            }
        }
        if (changed)
            removed.push('flags:retired-safe-zone-story');
        if (!Object.keys(save.flags).length)
            delete save.flags;
    }
    if (Array.isArray(save.inventory)) {
        const before = save.inventory.length;
        save.inventory = save.inventory.filter(item => !SAFE_ZONE_RETIRED_ITEM_IDS.has(String(typeof item === 'string' ? item : ((item === null || item === void 0 ? void 0 : item.id) || (item === null || item === void 0 ? void 0 : item.itemId) || (item === null || item === void 0 ? void 0 : item.materialId) || ''))));
        if (save.inventory.length !== before)
            removed.push('inventory:retired-safe-zone-items');
    }
    const retiredLocalText = /پیمان چهار آبادی|فانوس خاموش شمال|دفتر گمشده معدن|مأموریت شخصی|درخواست روزانه|فعالیت‌های منطقه امن|اکتشافات منطقه امن|پاداش اکتشاف منطقه امن|سرنخ پنهان منطقه امن|آتشگاه رهگذران|هلال شکسته|معجون درمان کوچک|فروشگاه آمون|بازار آنلاین سپیده|ماهیگیری|برداشت سیب|استراحت در مسافرخانه|استراحت کردی|خرید از بازار|خرید طومار|فروش آیتم محلی|گشت نگهبانی|کرایه اسب|کپسول زمان چهار آبادی|سنگ‌نوشته هلال سپید|باغچه چشمه خاموش|نشان راه‌های به‌هم‌رسیده/;
    for (const key of ['journal', 'messages', 'actionHistory']) {
        if (!Array.isArray(save[key]))
            continue;
        const before = save[key].length;
        save[key] = save[key].filter(entry => { const value = typeof entry === 'string' ? entry : `${(entry === null || entry === void 0 ? void 0 : entry.text) || ''} ${(entry === null || entry === void 0 ? void 0 : entry.reply) || ''} ${(entry === null || entry === void 0 ? void 0 : entry.title) || ''}`; return !retiredLocalText.test(value); });
        if (save[key].length !== before)
            removed.push(`${key}:retired-safe-zone-entries`);
    }
    if (save.npcRelations && Object.keys(save.npcRelations).length) {
        save.npcRelations = {};
        removed.push('npcRelations');
    }
    if (save.npcMemory && typeof save.npcMemory === 'object') {
        let memoryRemoved = false;
        for (const npcId of SAFE_ZONE_NPC_IDS) {
            if (Object.prototype.hasOwnProperty.call(save.npcMemory, npcId)) {
                delete save.npcMemory[npcId];
                memoryRemoved = true;
            }
        }
        if (memoryRemoved)
            removed.push('npcMemory:retired-safe-zone-dialogue');
    }
    save._safeZoneContentResetV1961 = true;
    return { ok: true, changed: true, removed };
}
function txt(v, n = 120) { return String(v !== null && v !== void 0 ? v : '').trim().slice(0, n); }
export function createSafeZoneEngine() {
    const entities = new Map();
    function registerEntity(raw, type) {
        if (!ENTITY_TYPES.has(type) || !raw || !txt(raw.id))
            return { ok: false, error: 'invalid_entity' };
        const id = txt(raw.id), stewardId = type === 'npc' ? id : (raw.stewardId || STEWARD_BY_BUILDING[id] || null);
        const entity = { ...raw, id, entityType: type, displayName: txt(raw.name) || id, stewardId,
            sections: SECTIONS.map(x => ({ ...x, supported: x.id !== 'dialogue' || !!stewardId })),
            capabilities: Object.freeze({ overview: true, dialogue: !!stewardId, location: true, commerce: false, quests: false, inventory: false, crafting: false, gathering: false, services: false }) };
        entities.set(`${type}:${id}`, entity);
        return { ok: true, entity };
    }
    function registerWorld(input = {}) {
        entities.clear();
        (input.npcs || []).forEach(x => registerEntity(x, 'npc'));
        (input.buildings || []).forEach(x => registerEntity(x, 'building'));
        (input.landmarks || []).forEach(x => registerEntity(x, 'landmark'));
        return audit();
    }
    function get(type, id) { return entities.get(`${type}:${id}`) || null; }
    function getFor(raw) { if (!raw)
        return null; const type = raw.entityType || (raw.kind === 'npc' ? 'npc' : raw.kind === 'landmark' ? 'landmark' : 'building'); return get(type, raw.id) || registerEntity(raw, type).entity || null; }
    function audit() {
        const rows = [...entities.values()], duplicates = [], missing = [], ids = new Set();
        for (const e of rows) {
            const key = `${e.entityType}:${e.id}`;
            if (ids.has(key))
                duplicates.push(key);
            ids.add(key);
            if (!e.displayName)
                missing.push(`${key}:name`);
            if (e.entityType !== 'landmark' && !e.stewardId)
                missing.push(`${key}:steward`);
            if (e.sections.length !== 3)
                missing.push(`${key}:sections`);
            if (Object.entries(e.capabilities).some(([k, v]) => ['commerce', 'quests', 'inventory', 'crafting', 'gathering', 'services'].includes(k) && v))
                missing.push(`${key}:retired_capability_enabled`);
        }
        return { ok: !duplicates.length && !missing.length, counts: { npcs: rows.filter(x => x.entityType === 'npc').length, buildings: rows.filter(x => x.entityType === 'building').length, landmarks: rows.filter(x => x.entityType === 'landmark').length, total: rows.length }, duplicates, missing, sectionIds: SECTIONS.map(x => x.id), activeLocalMechanics: ['overview', 'dialogue', 'location'] };
    }
    function renderSharedPanel(raw, options = {}) {
        const e = getFor(raw);
        if (!e)
            return '';
        const esc = options.escape || (v => String(v !== null && v !== void 0 ? v : '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])));
        const actions = e.stewardId ? '<button type="button" data-hub-common-action="talk">💬 گفتگو</button><button type="button" data-hub-common-action="ask">❖ پرسش</button>' : '<button type="button" disabled>گفتگو در این مکان وجود ندارد</button>';
        return `<section class="etr-hub-common-panel" data-hub-entity="${esc(e.entityType)}:${esc(e.id)}"><b>تعامل پایه منطقه امن • ${esc(e.displayName)}</b><nav>${actions}</nav><p>فروشگاه، کالا، مواد، مأموریت و خدمات محلی در این نسخه حذف شده‌اند و بعداً با ساختار یکپارچه بازطراحی می‌شوند.</p></section>`;
    }
    return Object.freeze({ registerEntity, registerWorld, get, getFor, audit, renderSharedPanel, sections: SECTIONS, stewardByBuilding: STEWARD_BY_BUILDING, resetLegacySafeZoneProgress, retiredItemIds: SAFE_ZONE_RETIRED_ITEM_IDS });
}
export const ETRANOMSafeZoneEngine = createSafeZoneEngine();
if (typeof window !== 'undefined')
    window.ETRANOM_SAFE_ZONE_ENGINE = ETRANOMSafeZoneEngine;
if (typeof document !== 'undefined' && !document.getElementById('etr-v1961-safe-zone-style')) {
    const style = document.createElement('style');
    style.id = 'etr-v1961-safe-zone-style';
    style.textContent = '.etr-hub-common-panel{padding:12px;margin:10px 0;border:1px solid #92754d;border-radius:12px;background:#201b26;color:#eee}.etr-hub-common-panel nav{display:flex;gap:8px;margin:10px 0}.etr-hub-common-panel button{flex:1;padding:9px;border:1px solid #705b45;border-radius:8px;background:#302638;color:#f0dfc2;font:700 11px Tahoma}.etr-hub-common-panel p{font:10px/1.8 Tahoma;color:#b8a88e}';
    document.head.appendChild(style);
}
