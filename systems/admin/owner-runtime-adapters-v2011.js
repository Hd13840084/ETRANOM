/* ETRANOM V2011 — typed runtime adapters for the eight owner workstreams.
 * This module never writes player/economy/social state. It only validates and exposes
 * published configuration. Mutations remain behind dedicated authenticated RPCs. */
const TYPES = new Set([
  'class','specialization','class_balance','monster_ai','economy_rule','guild_config',
  'party_config','pvp_config','progression_rule','ban_policy','dialogue','world_event',
  'world_setting','shop','event','npc','quest'
]);
const OBJECT = v => !!v && typeof v === 'object' && !Array.isArray(v);
const clone = v => typeof structuredClone === 'function' ? structuredClone(v) : JSON.parse(JSON.stringify(v));
export function normalizeOwnerRuntimeRows(rows=[]) {
  const out = Object.create(null);
  for (const row of rows) {
    if (!TYPES.has(row?.content_type) || !OBJECT(row.payload)) continue;
    const id = String(row.content_id || row.payload.id || '').trim();
    if (!id || id.length > 120 || String(row.payload.id || id) !== id) continue;
    (out[row.content_type] ||= []).push({ ...clone(row.payload), id, _adminVersion: Number(row.version || 0) });
  }
  return out;
}
export function applyOwnerRuntimeAdapters(pack, rows=[]) {
  const catalog = normalizeOwnerRuntimeRows(rows);
  const arrayMap = { class:'classes', specialization:'specializations', npc:'npcs', quest:'quests',
    shop:'shops', event:'events', world_setting:'worldSettings', dialogue:'dialogues' };
  for (const [type,key] of Object.entries(arrayMap)) {
    if (!catalog[type]?.length) continue;
    if (!Array.isArray(pack[key])) pack[key] = [];
    for (const record of catalog[type]) {
      const i = pack[key].findIndex(x => String(x.id) === record.id);
      if (i < 0) pack[key].push(record); else pack[key][i] = { ...pack[key][i], ...record };
    }
  }
  // AI and tuning records are attached by stable monster/class ids; no guessed combat formula.
  const aiByMonster = new Map((catalog.monster_ai || []).map(x => [x.monster_id || x.target_id || x.id, x]));
  for (const monster of (pack.monsters || [])) {
    const ai = aiByMonster.get(monster.id); if (ai) monster.ai = { ...(monster.ai || {}), ...ai };
  }
  const balanceByClass = new Map((catalog.class_balance || []).map(x => [x.class_id || x.target_id || x.id, x]));
  for (const cls of (pack.classes || [])) {
    const balance = balanceByClass.get(cls.id); if (balance) cls.admin_balance = balance;
  }
  return { pack, catalog };
}
export function getOwnerRuntimeConfig(type, id=null) {
  const catalog = globalThis.ETRANOM_OWNER_RUNTIME_CONFIG || {};
  const rows = Array.isArray(catalog[type]) ? catalog[type] : [];
  return id == null ? clone(rows) : clone(rows.find(x => String(x.id) === String(id)) || null);
}
export function publishOwnerRuntimeConfig(catalog) {
  globalThis.ETRANOM_OWNER_RUNTIME_CONFIG = OBJECT(catalog) ? clone(catalog) : {};
  return globalThis.ETRANOM_OWNER_RUNTIME_CONFIG;
}


/* V2012 typed policy accessors. Values are bounded before game code consumes them. */
const finite = (v, fallback) => Number.isFinite(Number(v)) ? Number(v) : fallback;
const bounded = (v, fallback, min, max) => Math.max(min, Math.min(max, finite(v, fallback)));
export function resolveMonsterAiPolicyV2012(monster = {}) {
  const ai = OBJECT(monster.ai) ? monster.ai : {};
  return Object.freeze({
    skillChance: bounded(ai.skill_chance ?? ai.skillChance, 0.32, 0, 1),
    secondarySkillChance: bounded(ai.secondary_skill_chance ?? ai.secondarySkillChance, 0.25, 0, 1),
    minimumMp: bounded(ai.minimum_mp ?? ai.minimumMp, 10, 0, 100000),
    aggressiveBelowHpPct: bounded(ai.aggressive_below_hp_pct ?? ai.aggressiveBelowHpPct, 0, 0, 100),
    targetPriority: Array.isArray(ai.target_priority) ? ai.target_priority.slice(0, 8).map(String) : []
  });
}
export function getOwnerRuntimePolicyV2012(type, id = null) {
  const rows = getOwnerRuntimeConfig(type);
  return id == null ? rows : rows.find(row => String(row.id) === String(id)) || null;
}
export function resolveOwnerRuntimePoliciesV2012() {
  const types = ['economy_rule','guild_config','party_config','pvp_config','progression_rule','ban_policy','world_event','world_setting','dialogue'];
  return Object.freeze(Object.fromEntries(types.map(type => [type, getOwnerRuntimeConfig(type)])));
}


/* V2013 policy normalization: safe defaults preserve current live-game behavior. */
const firstEnabledPolicy = type => getOwnerRuntimeConfig(type).find(row => row && row.enabled !== false && (row.id === 'default' || row.is_default === true)) || getOwnerRuntimeConfig(type).find(row => row && row.enabled !== false) || {};
const policyNumber = (value, fallback, min, max) => bounded(value, fallback, min, max);
export function resolveProgressionPolicyV2013() {
  const p = firstEnabledPolicy('progression_rule');
  return Object.freeze({
    xpMultiplier: policyNumber(p.xp_multiplier ?? p.xpMultiplier, 1, 0, 5),
    deathXpLossPct: policyNumber(p.death_xp_loss_pct ?? p.deathXpLossPct, 3, 0, 50),
    deathGoldLossPct: policyNumber(p.death_gold_loss_pct ?? p.deathGoldLossPct, 1, 0, 50)
  });
}
export function resolveClassBalancePolicyV2013(classId) {
  const row = getOwnerRuntimeConfig('class_balance').find(x => String(x.class_id || x.target_id || '') === String(classId));
  if (!row) return Object.freeze({ hpScale: 1, mpScale: 1, attackScale: 1, defenseScale: 1 });
  return Object.freeze({
    hpScale: policyNumber(row.hp_scale ?? row.hpScale, 1, 0.5, 2),
    mpScale: policyNumber(row.mp_scale ?? row.mpScale, 1, 0.5, 2),
    attackScale: policyNumber(row.attack_scale ?? row.attackScale, 1, 0.5, 2),
    defenseScale: policyNumber(row.defense_scale ?? row.defenseScale, 1, 0.5, 2)
  });
}
export function resolveEconomyPolicyV2013() {
  const p = firstEnabledPolicy('economy_rule');
  return Object.freeze({
    marketFeePct: policyNumber(p.market_fee_pct ?? p.marketFeePct, 0, 0, 25),
    priceFloorMultiplier: policyNumber(p.price_floor_multiplier ?? p.priceFloorMultiplier, 0, 0, 1000000),
    priceCeilingMultiplier: policyNumber(p.price_ceiling_multiplier ?? p.priceCeilingMultiplier, 0, 0, 1000000),
    tradingEnabled: p.trading_enabled !== false
  });
}
export function resolveGuildPolicyV2013() {
  const p = firstEnabledPolicy('guild_config');
  return Object.freeze({ maxMembers: Math.floor(policyNumber(p.max_members ?? p.maxMembers, 50, 2, 500)), creationCost: Math.floor(policyNumber(p.creation_cost ?? p.creationCost, 1000, 0, 1000000000)), creationEnabled: p.creation_enabled !== false });
}
export function resolvePartyPolicyV2013() {
  const p = firstEnabledPolicy('party_config');
  return Object.freeze({ maxMembers: Math.floor(policyNumber(p.max_members ?? p.maxMembers, 4, 2, 20)), invitesEnabled: p.invites_enabled !== false });
}
export function resolvePvpPolicyV2013() {
  const p = firstEnabledPolicy('pvp_config');
  return Object.freeze({ enabled: (p.pvp_enabled ?? p.pvpEnabled ?? true) !== false, entryCost: Math.floor(policyNumber(p.entry_cost ?? p.entryCost, 0, 0, 1000000000)), ratingEnabled: p.rating_enabled !== false });
}


/* V2014 runtime policy bridge: these are gameplay tuning values, never an auth boundary. */
export function resolveOwnerRuntimePolicyV2014(type, fallback = {}) {
  const row = firstEnabledPolicy(type);
  return Object.freeze({ ...fallback, ...(OBJECT(row) ? clone(row) : {}) });
}
export function resolvePartyCapacityV2014() {
  const p = resolvePartyPolicyV2013();
  return Object.freeze({ maxMembers: Math.floor(bounded(p.maxMembers, 4, 2, 20)), invitesEnabled: p.invitesEnabled });
}
export function resolvePvpAvailabilityV2014() {
  const p = resolvePvpPolicyV2013();
  return Object.freeze({ enabled: p.enabled !== false, entryCost: Math.floor(bounded(p.entryCost, 0, 0, 1000000000)), ratingEnabled: p.ratingEnabled !== false });
}
