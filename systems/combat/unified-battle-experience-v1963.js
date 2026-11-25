import { escapeCombatHtml, normalizeCombatant, renderCombatPlayerCard, renderCombatLog, renderCombatActionBar } from './shared-combat-ui.js?build=2081';
import { getCombatCapabilities } from './combat-contract.js?build=2081';
export const UNIFIED_BATTLE_EXPERIENCE_VERSION_V1963 = '1963.0.0';
export const UNIFIED_BATTLE_MODES_V1963 = Object.freeze(['solo', 'party', 'pvp']);
export const UNIFIED_ENCOUNTER_TYPES_V1963 = Object.freeze([
    'field', 'pvp_match', 'party_field', 'dungeon', 'tower', 'ruin_battle', 'event_battle', 'future_encounter'
]);
const finite = (v, d = 0) => Number.isFinite(Number(v)) ? Number(v) : d;
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const safeArray = v => Array.isArray(v) ? v : [];
/** Mode (who is fighting) and encounter type (where/why) are deliberately orthogonal. */
export function createUnifiedBattleDescriptorV1963(input = {}) {
    const mode = String(input.mode || '').toLowerCase();
    const encounterType = String(input.encounterType || '').toLowerCase();
    if (!UNIFIED_BATTLE_MODES_V1963.includes(mode))
        throw new TypeError('unsupported_unified_battle_mode');
    if (!UNIFIED_ENCOUNTER_TYPES_V1963.includes(encounterType))
        throw new TypeError('unsupported_unified_encounter_type');
    if (mode === 'pvp' && encounterType !== 'pvp_match')
        throw new TypeError('pvp_requires_pvp_match_encounter');
    if (mode === 'party' && !['party_field', 'dungeon', 'tower', 'event_battle', 'future_encounter'].includes(encounterType))
        throw new TypeError('invalid_party_encounter_type');
    if (mode === 'solo' && !['field', 'dungeon', 'tower', 'ruin_battle', 'event_battle', 'future_encounter'].includes(encounterType))
        throw new TypeError('invalid_solo_encounter_type');
    return Object.freeze({
        version: UNIFIED_BATTLE_EXPERIENCE_VERSION_V1963,
        mode,
        encounterType,
        encounterId: String(input.encounterId || ''),
        title: String(input.title || 'نبرد'),
        subtitle: String(input.subtitle || ''),
        turn: Math.max(0, Math.floor(finite(input.turn, 0))),
        requestId: input.requestId == null ? null : String(input.requestId)
    });
}
function renderEnemyCard(enemy = {}, index = 0, selectedId = '') {
    var _a, _b, _c;
    const maxHp = Math.max(1, finite((_a = enemy.maxHp) !== null && _a !== void 0 ? _a : enemy.max_hp, 1));
    const hp = clamp(finite(enemy.hp, maxHp), 0, maxHp);
    const maxMp = Math.max(0, finite((_b = enemy.maxMp) !== null && _b !== void 0 ? _b : enemy.max_mp, 0));
    const mp = clamp(finite(enemy.mp, maxMp), 0, maxMp);
    const portrait = String(enemy.portrait || enemy.image || '');
    const safePortrait = portrait && !/^(?:javascript:|data:)/i.test(portrait) ? escapeCombatHtml(portrait) : '';
    const hpPct = (hp / maxHp * 100).toFixed(2);
    const mpPct = maxMp > 0 ? (mp / maxMp * 100).toFixed(2) : '0';
    const id = String((_c = enemy.id) !== null && _c !== void 0 ? _c : `enemy-${index + 1}`);
    return `<button type="button" class="ubv1963-enemy-card${id === String(selectedId) ? ' is-selected' : ''}${hp <= 0 ? ' is-defeated' : ''}" data-unified-target="${escapeCombatHtml(id)}" ${hp <= 0 ? 'disabled' : ''} aria-pressed="${id === String(selectedId) ? 'true' : 'false'}">
    <div class="ubv1963-enemy-level">سطح ${Math.max(1, Math.floor(finite(enemy.level, 1)))}</div>
    <div class="ubv1963-enemy-portrait">${safePortrait ? `<img src="${safePortrait}" alt="${escapeCombatHtml(enemy.name || 'دشمن')}" loading="lazy">` : '<span aria-hidden="true">👹</span>'}</div>
    <b class="ubv1963-enemy-name">${escapeCombatHtml(enemy.name || 'دشمن')}</b>
    <div class="ubv1963-enemy-meter hp"><i style="width:${hpPct}%"></i></div><small>${Math.ceil(hp)} / ${Math.ceil(maxHp)}</small>
    ${maxMp > 0 ? `<div class="ubv1963-enemy-meter mp"><i style="width:${mpPct}%"></i></div><small>${Math.ceil(mp)} / ${Math.ceil(maxMp)} مانا</small>` : ''}
  </button>`;
}
/** Single canonical battle page for solo, party, PvP, dungeons, tower and future combat encounters. */
export function renderUnifiedBattleScreenV1963({ descriptor, player = {}, allies = [], opponents = [], enemies = [], log = [], selectedTargetId = '', actions = {}, labels = {}, disabled = {}, meta = {}, actionAttribute = 'data-unified-combat-action', extraContent = '', enemyCardsHtml = null } = {}) {
    var _a;
    const d = (descriptor === null || descriptor === void 0 ? void 0 : descriptor.version) === UNIFIED_BATTLE_EXPERIENCE_VERSION_V1963
        ? descriptor : createUnifiedBattleDescriptorV1963(descriptor || {});
    const capabilities = new Set(getCombatCapabilities(d.mode).map(x => x.id));
    const actionDisabled = { attack: Boolean(disabled.attack) || !capabilities.has('attack'), skill: Boolean(disabled.skill) || !capabilities.has('skill'), items: Boolean((_a = disabled.items) !== null && _a !== void 0 ? _a : disabled.item) || !capabilities.has('item'), guard: Boolean(disabled.guard) || !capabilities.has('guard') };
    const actionBar = renderCombatActionBar({ attribute: actionAttribute, disabled: actionDisabled, labels, actionValues: actions });
    const allyCards = safeArray(allies).map(ally => renderCombatPlayerCard(ally, { role: 'هم‌گروهی', className: 'etr-battle-card ally', stateLabel: ally.stateLabel || '' })).join('');
    const opponentCards = safeArray(opponents).map(opponent => renderCombatPlayerCard(opponent, { role: 'حریف', className: 'etr-battle-card player etr-pvp-combatant-card' })).join('');
    const enemyCards = enemyCardsHtml == null ? safeArray(enemies).map((enemy, index) => renderEnemyCard(enemy, index, selectedTargetId)).join('') : String(enemyCardsHtml);
    const encounterLabel = ({ field: 'محدوده خطر', pvp_match: 'نبرد بازیکن با بازیکن', party_field: 'نبرد گروهی', dungeon: 'دانجن', tower: 'برج', ruin_battle: 'نبرد خرابه', event_battle: 'نبرد رویداد', future_encounter: 'رویارویی' })[d.encounterType];
    return `<main class="ubv1963-battle-screen" data-unified-battle="${d.mode}" data-encounter-type="${d.encounterType}" dir="rtl">
    <header class="ubv1963-battle-header"><div><small>${escapeCombatHtml(encounterLabel)}</small><h2>${escapeCombatHtml(d.title)}</h2>${d.subtitle ? `<p>${escapeCombatHtml(d.subtitle)}</p>` : ''}</div><div class="ubv1963-turn">${d.turn ? `نوبت ${d.turn}` : 'آماده نبرد'}</div></header>
    <section class="ubv1963-side player-side">${renderCombatPlayerCard(player, { role: 'قهرمان', className: 'etr-battle-card player' })}${allyCards}</section>
    ${opponentCards ? `<section class="ubv1963-side ubv1963-opponents" aria-label="حریفان">${opponentCards}</section>` : ''}
    <div class="ubv1963-vs"><span>VS</span></div>
    <section class="ubv1963-enemy-grid" aria-label="دشمنان">${enemyCards || '<p class="ubv1963-empty">هنوز دشمنی وارد نبرد نشده است.</p>'}</section>
    <section class="ubv1963-battle-log" aria-live="polite"><h3>گزارش نبرد</h3><div>${renderCombatLog(log, 12)}</div></section>
    ${actionBar}${extraContent || ''}
    <footer class="ubv1963-battle-footer">${escapeCombatHtml(meta.footer || 'تمام حالت‌های نبرد از رابط و قرارداد مشترک استفاده می‌کنند.')}</footer>
  </main>`;
}
export function getUnifiedBattleCapabilitiesV1963(mode) {
    if (!UNIFIED_BATTLE_MODES_V1963.includes(String(mode || '').toLowerCase()))
        throw new TypeError('unsupported_unified_battle_mode');
    return Object.freeze(getCombatCapabilities(String(mode).toLowerCase()).map(x => Object.freeze({ ...x })));
}
