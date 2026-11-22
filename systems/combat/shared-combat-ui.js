/**
 * Shared ETRANOM combat presentation primitives.
 * These components intentionally contain presentation only; authoritative combat
 * calculations remain on the server for online modes and in game.js for solo PvE.
 */
export const escapeCombatHtml = value => String(value ?? '').replace(/[&<>"']/g, ch => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
}[ch]));

const finite = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

export function normalizeCombatant(source = {}) {
  const snapshot = source.save_snapshot || source.saveSnapshot || {};
  const character = snapshot.character || source.character || {};
  const battle = source.battle || source.combat || {};
  const maxHp = Math.max(1, finite(battle.max_hp ?? battle.maxHp ?? source.max_hp ?? source.maxHp ?? character.maxHp ?? character.max_hp ?? character.hp, 1));
  const hp = clamp(finite(battle.hp ?? source.hp ?? character.hp, maxHp), 0, maxHp);
  const maxMp = Math.max(0, finite(battle.max_mp ?? battle.maxMp ?? source.max_mp ?? source.maxMp ?? character.maxMp ?? character.max_mp ?? character.mp, 0));
  const mp = clamp(finite(battle.mp ?? source.mp ?? character.mp, maxMp), 0, maxMp);
  const maxStamina = Math.max(0, finite(battle.max_stamina ?? source.max_stamina ?? source.maxStamina ?? character.maxStamina ?? character.max_stamina, 0));
  const stamina = clamp(finite(battle.stamina ?? source.stamina ?? character.stamina, maxStamina), 0, maxStamina);
  return {
    id: String(source.user_id ?? source.id ?? ''),
    name: String(source.name ?? source.display_name ?? character.name ?? 'ماجراجو'),
    className: String(source.player_class ?? source.class ?? source.archetype ?? character.player_class ?? character.archetype ?? 'ماجراجو'),
    specialization: String(source.specialization ?? character.specialization ?? ''),
    level: Math.max(1, finite(source.level ?? character.level, 1)),
    hp, maxHp, mp, maxMp, stamina, maxStamina,
    portrait: String(source.portrait ?? character.portrait ?? ''),
    alive: hp > 0
  };
}

function meter(label, value, max, kind) {
  if (max <= 0) return '';
  const percent = clamp(value / max * 100, 0, 100);
  return `<div class="battle-resource-line ${kind}" dir="rtl"><span class="battle-resource-label">${label}</span><div class="battle-meter ${kind}" role="meter" aria-label="${label}" aria-valuemin="0" aria-valuemax="${Math.ceil(max)}" aria-valuenow="${Math.ceil(value)}"><i style="width:${percent.toFixed(2)}%"></i></div><b class="battle-resource-value" dir="ltr">${Math.ceil(value)} / ${Math.ceil(max)}</b></div>`;
}

export function renderCombatPlayerCard(source, options = {}) {
  const actor = normalizeCombatant(source);
  const role = escapeCombatHtml(options.role || 'قهرمان');
  const className = escapeCombatHtml(options.className || 'etr-battle-card player');
  const stateLabel = options.stateLabel ? `<div class="etr-combatant-state">${escapeCombatHtml(options.stateLabel)}</div>` : '';
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
  if (!rows.length) return '<p>هنوز رویدادی ثبت نشده است.</p>';
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
    { id: 'guard', value: 'guard', icon: '🛡️', label: 'دفاع / جاخالی', cls: 'defend' }
  ];
  return `<div class="battle-actions etr-shared-combat-actions">${actions.map(a => {
    const isDisabled = Boolean(disabled[a.id]);
    const count = counts[a.id];
    const title = labels[a.id] || a.label;
    return `<button type="button" class="${a.cls}" ${attribute}="${actionValues[a.id] || a.value || a.id}" ${isDisabled ? 'disabled aria-disabled="true"' : ''}><span>${a.icon}</span><b>${title}</b>${count !== undefined && count !== null ? `<small>${escapeCombatHtml(count)}</small>` : ''}</button>`;
  }).join('')}</div>`;
}
