/**
 * Shared ETRANOM combat presentation primitives.
 * These components intentionally contain presentation only; authoritative combat
 * calculations remain on the server for online modes and in game.js for solo PvE.
 */
export const escapeCombatHtml = value => String(value !== null && value !== void 0 ? value : '').replace(/[&<>"']/g, ch => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
}[ch]));
const finite = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
export function normalizeCombatant(source = {}) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3, _4, _5, _6, _7, _8, _9, _10, _11, _12;
    const snapshot = source.save_snapshot || source.saveSnapshot || {};
    const character = snapshot.character || source.character || {};
    const battle = source.battle || source.combat || {};
    const maxHp = Math.max(1, finite((_f = (_e = (_d = (_c = (_b = (_a = battle.max_hp) !== null && _a !== void 0 ? _a : battle.maxHp) !== null && _b !== void 0 ? _b : source.max_hp) !== null && _c !== void 0 ? _c : source.maxHp) !== null && _d !== void 0 ? _d : character.maxHp) !== null && _e !== void 0 ? _e : character.max_hp) !== null && _f !== void 0 ? _f : character.hp, 1));
    const hp = clamp(finite((_h = (_g = battle.hp) !== null && _g !== void 0 ? _g : source.hp) !== null && _h !== void 0 ? _h : character.hp, maxHp), 0, maxHp);
    const maxMp = Math.max(0, finite((_p = (_o = (_m = (_l = (_k = (_j = battle.max_mp) !== null && _j !== void 0 ? _j : battle.maxMp) !== null && _k !== void 0 ? _k : source.max_mp) !== null && _l !== void 0 ? _l : source.maxMp) !== null && _m !== void 0 ? _m : character.maxMp) !== null && _o !== void 0 ? _o : character.max_mp) !== null && _p !== void 0 ? _p : character.mp, 0));
    const mp = clamp(finite((_r = (_q = battle.mp) !== null && _q !== void 0 ? _q : source.mp) !== null && _r !== void 0 ? _r : character.mp, maxMp), 0, maxMp);
    const maxStamina = Math.max(0, finite((_v = (_u = (_t = (_s = battle.max_stamina) !== null && _s !== void 0 ? _s : source.max_stamina) !== null && _t !== void 0 ? _t : source.maxStamina) !== null && _u !== void 0 ? _u : character.maxStamina) !== null && _v !== void 0 ? _v : character.max_stamina, 0));
    const stamina = clamp(finite((_x = (_w = battle.stamina) !== null && _w !== void 0 ? _w : source.stamina) !== null && _x !== void 0 ? _x : character.stamina, maxStamina), 0, maxStamina);
    return {
        id: String((_z = (_y = source.user_id) !== null && _y !== void 0 ? _y : source.id) !== null && _z !== void 0 ? _z : ''),
        name: String((_2 = (_1 = (_0 = source.name) !== null && _0 !== void 0 ? _0 : source.display_name) !== null && _1 !== void 0 ? _1 : character.name) !== null && _2 !== void 0 ? _2 : 'ماجراجو'),
        className: String((_7 = (_6 = (_5 = (_4 = (_3 = source.player_class) !== null && _3 !== void 0 ? _3 : source.class) !== null && _4 !== void 0 ? _4 : source.archetype) !== null && _5 !== void 0 ? _5 : character.player_class) !== null && _6 !== void 0 ? _6 : character.archetype) !== null && _7 !== void 0 ? _7 : 'ماجراجو'),
        specialization: String((_9 = (_8 = source.specialization) !== null && _8 !== void 0 ? _8 : character.specialization) !== null && _9 !== void 0 ? _9 : ''),
        level: Math.max(1, finite((_10 = source.level) !== null && _10 !== void 0 ? _10 : character.level, 1)),
        hp, maxHp, mp, maxMp, stamina, maxStamina,
        portrait: String((_12 = (_11 = source.portrait) !== null && _11 !== void 0 ? _11 : character.portrait) !== null && _12 !== void 0 ? _12 : ''),
        alive: hp > 0
    };
}
function meter(label, value, max, kind) {
    if (max <= 0)
        return '';
    const percent = clamp(value / max * 100, 0, 100);
    return `<div class="battle-resource-line ${kind}" dir="rtl"><span class="battle-resource-label">${label}</span><div class="battle-meter ${kind}" role="meter" aria-label="${label}" aria-valuemin="0" aria-valuemax="${Math.ceil(max)}" aria-valuenow="${Math.ceil(value)}"><i style="width:${percent.toFixed(2)}%"></i></div><b class="battle-resource-value" dir="ltr">${Math.ceil(value)} / ${Math.ceil(max)}</b></div>`;
}
export function renderCombatPlayerCard(source, options = {}) {
    const actor = normalizeCombatant(source);
    const role = escapeCombatHtml(options.role || 'قهرمان');
    const className = escapeCombatHtml(options.className || 'etr-battle-card player');
    const stateLabel = (options.stateLabel || source.stateLabel) ? `<div class="etr-combatant-state">${escapeCombatHtml(options.stateLabel || source.stateLabel)}</div>` : '';
    const turnLabel = options.isTurn ? '<small class="etr-combat-turn">نوبت اقدام</small>' : '';
    const portrait = options.portrait || actor.portrait;
    const safePortrait = portrait && !/^(?:javascript:|data:)/i.test(portrait) ? escapeCombatHtml(portrait) : '';
    const avatar = safePortrait
        ? `<img src="${safePortrait}" alt="پرتره ${escapeCombatHtml(actor.className)}" loading="lazy">`
        : '<span aria-hidden="true">🛡️</span>';
    const identity = `${escapeCombatHtml(actor.className)}${actor.specialization ? ` • ${escapeCombatHtml(actor.specialization)}` : ''} • سطح ${actor.level}`;
    return `<article class="${className}${options.isTurn ? ' is-active-turn' : ''}" aria-label="${escapeCombatHtml(actor.name)}">
    <div class="battle-card-top"><span class="battle-role">${role}</span>
      <div class="battle-identity"><b>${escapeCombatHtml(actor.name)}</b><small>${identity}</small></div>
      <div class="battle-avatar">${avatar}</div>${turnLabel}</div>
    ${meter('سلامتی', actor.hp, actor.maxHp, 'hp')}
    ${meter('مانا', actor.mp, actor.maxMp, 'mp')}
    ${meter('استقامت', actor.stamina, actor.maxStamina, 'stamina')}
    ${stateLabel}
  </article>`;
}
export function renderCombatLog(entries = [], limit = 14) {
    const rows = Array.isArray(entries) ? entries.slice(-limit).reverse() : [];
    if (!rows.length)
        return '<p>هنوز رویدادی ثبت نشده است.</p>';
    return rows.map(entry => `<p class="etr-combat-log-entry">${escapeCombatHtml(entry.text || entry.type || 'رویداد')} <small>${entry.at ? escapeCombatHtml(new Date(entry.at).toLocaleTimeString('fa-IR')) : ''}</small></p>`).join('');
}
/** One canonical four-button combat control bar used by solo, party and PvP.
 * Adapters keep their own data attribute so existing server/local handlers remain authoritative.
 */
export function renderCombatActionBar({ attribute = 'data-combat-action', disabled = {}, counts = {}, labels = {}, actionValues = {} } = {}) {
    const actions = [
        { id: 'attack', icon: '⚔️', label: 'حمله عادی', cls: 'attack' },
        { id: 'skill', icon: '✦', label: 'مهارت‌ها', cls: 'skill' },
        { id: 'items', icon: '🎒', label: 'آیتم‌ها', cls: 'items' },
        { id: 'guard', icon: '🛡️', label: 'دفاع / جاخالی', cls: 'guard' }
    ];
    return `<div class="battle-actions etr-shared-combat-actions">${actions.map(a => {
        const isDisabled = Boolean(disabled[a.id]);
        const count = counts[a.id];
        const title = labels[a.id] || a.label;
        return `<button type="button" class="${a.cls}" ${attribute}="${actionValues[a.id] || a.value || a.id}" ${isDisabled ? 'disabled aria-disabled="true"' : ''}><span>${a.icon}</span><b>${title}</b>${count !== undefined && count !== null ? `<small>${escapeCombatHtml(count)}</small>` : ''}</button>`;
    }).join('')}</div>`;
}
