import { createWizardEffectHandlersV1917, auditWizardEffectHandlerCoverageV1917 } from './wizard-effect-handlers-v1917.js';
/**
 * ETRANOM V1918 — specialization extension handlers for all four Wizard specs.
 * These handlers are deterministic, opt-in, and consume only trusted server
 * inputs from effectProvider. They do not switch the live combat resolver.
 */
export const WIZARD_SPECIALIZATION_EXTENSION_VERSION = '1918.0.0';
const clone = v => structuredClone(v ?? {});
const obj = v => v && typeof v === 'object' && !Array.isArray(v) ? v : {};
const num = (v, d = 0) => Number.isFinite(Number(v)) ? Number(v) : d;
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, num(v)));
const arr = v => Array.isArray(v) ? v : [];
const getInput = (step, state, context) => {
  if (typeof context.effectProvider !== 'function') throw new Error('trusted_effect_provider_required');
  const value = context.effectProvider(Object.freeze({ step, state: clone(state), plan: context.plan, mode: context.mode }));
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new TypeError(`invalid_extension_input:${step.handlerId}`);
  return value;
};
const getActor = state => (state.actor = obj(state.actor));
const getTargets = (state, context, includeDead = false) => {
  const list = arr(state.targets);
  const ids = arr(context.selectedTargetIds).map(String);
  if (ids.length) return ids.map(id => list.find(t => String(t.id) === id)).filter(t => t && (includeDead || num(t.hp) > 0));
  const id = context.selectedTargetId == null ? '' : String(context.selectedTargetId);
  if (id) return list.filter(t => String(t.id) === id && (includeDead || num(t.hp) > 0)).slice(0, 1);
  return list.filter(t => includeDead || num(t.hp) > 0);
};
const progress = (actor, key, legacyKey) => {
  actor.classProgress = obj(actor.classProgress);
  const p = clone(actor[legacyKey] || actor.classProgress[key] || {});
  actor[legacyKey] = p;
  actor.classProgress[key] = p;
  return p;
};
const log = (state, type, data = {}) => { state.effectLog = arr(state.effectLog); state.effectLog.push({ type, ...data }); };
function setStatus(target, id, value) {
  if (Array.isArray(target.statuses)) target.statuses = [...target.statuses.filter(s => s?.id !== id), { id, ...value }];
  else target.statuses = { ...obj(target.statuses), [id]: clone(value) };
}
function extension(handlerId, fn) { return [handlerId, (state, step, context) => fn(state, step, context, getInput(step, state, context))]; }

const handlers = [
  extension('wizard.arcane-mage.evasion_counter', (s, step, c, input) => {
    const a = getActor(s), p = progress(a, 'wizard_arcane_mage', 'arcaneMageProgress');
    p.evasion = { charges: Math.max(1, Math.floor(num(input.evasionCharges, num(input.evasionDurationTurns, 1)))), turns: Math.max(1, Math.floor(num(input.durationTurns, 2))), counterDamagePct: Math.max(0, num(input.counterDamagePct)), shieldPct: Math.max(0, num(input.shieldPct)), armed: true };
    p.nextSpellDamagePct = Math.max(0, num(input.nextSpellDamagePct));
    log(s, 'arcane_evasion_armed', { charges: p.evasion.charges });
  }),
  extension('wizard.arcane-mage.repeat_last_spell', (s, step, c, input) => {
    const a = getActor(s), p = progress(a, 'wizard_arcane_mage', 'arcaneMageProgress');
    const replay = obj(input.replay || a.lastEligibleSpell);
    const skillId = String(replay.skillId || '');
    if (!skillId || skillId === 'arcane_echo' || replay.kind === 'domain' || replay.kind === 'ascended' || replay.repeatable === false) throw new Error('arcane_echo_no_eligible_spell');
    const pct = clamp(input.repeatPct ?? step?.plan?.skillDefinition?.repeatPct ?? 40, 0, 100);
    const targets = getTargets(s, { ...c, selectedTargetIds: replay.targetIds || c.selectedTargetIds, selectedTargetId: replay.targetId || c.selectedTargetId });
    if (!targets.length) throw new Error('arcane_echo_targets_missing');
    const baseAmount = Math.max(0, num(replay.baseAmount, num(input.baseAmount)));
    if (!baseAmount) throw new Error('arcane_echo_trusted_base_amount_required');
    const amount = Math.floor(baseAmount * pct / 100);
    for (const t of targets) t.hp = Math.max(0, num(t.hp) - amount);
    if (input.repeatSideEffectsPct > 0 && Array.isArray(replay.repeatableStatuses)) {
      for (const t of targets) for (const st of replay.repeatableStatuses) setStatus(t, st.id, { ...st, repeatPct: clamp(input.repeatSideEffectsPct, 0, 100) });
    }
    p.lastEcho = { skillId, amount, targetIds: targets.map(t => t.id) };
    log(s, 'arcane_echo_replayed', { skillId, amount, targetIds: targets.map(t => t.id) });
  }),
  extension('wizard.elementalist.dual_element_combo', (s, step, c, input) => {
    const a = getActor(s), p = progress(a, 'wizard_elementalist', 'elementalistProgress');
    const allowed = new Set(['fire_wind','ice_water','lightning_earth','light_dark','fire_earth','water_wind','lightning_wind','water_dark','ice_light','earth_dark']);
    const elements = arr(input.elements).map(x => String(x).toLowerCase());
    if (elements.length !== 2 || elements[0] === elements[1]) throw new Error('elemental_fusion_requires_two_distinct_elements');
    const comboId = elements.slice().sort().join('_');
    if (!allowed.has(comboId)) throw new Error(`unsupported_element_combo:${comboId}`);
    const targets = getTargets(s, c);
    if (!targets.length) throw new Error('elemental_fusion_targets_missing');
    const amount = Math.max(0, num(input.amount));
    if (!amount) throw new Error('elemental_fusion_trusted_amount_required');
    for (const t of targets) {
      t.hp = Math.max(0, num(t.hp) - amount);
      if (input.status) setStatus(t, String(input.status.id || `elemental_${comboId}`), { ...input.status, comboId, elements });
    }
    p.lastFusion = { comboId, elements, targetIds: targets.map(t => t.id) };
    log(s, 'elemental_fusion', { comboId, amount, targetIds: targets.map(t => t.id) });
  }),
  extension('wizard.warlock.stolen_moment', (s, step, c, input) => {
    const a = getActor(s), p = progress(a, 'wizard_warlock', 'warlockProgress'), targets = getTargets(s, c);
    if (!targets.length) throw new Error('stolen_moment_target_missing');
    const t = targets[0], turns = Math.max(1, Math.floor(num(input.durationTurns, 1)));
    setStatus(t, 'stolen_moment', { turns, specialSkillLocked: true, bossWeakenPct: t.isBoss ? 20 : 0, sourceId: a.id });
    p.nextSkillDamagePct = 15; p.nextSkillManaReductionPct = 20; p.stolenMomentTurns = turns;
    if (t.isBoss || t.boss) { t.nextSkillDamageReductionPct = 20; t.nextSkillCostIncreasePct = 15; }
    log(s, 'warlock_stolen_moment', { targetId: t.id, boss: Boolean(t.isBoss || t.boss) });
  }),
  extension('wizard.warlock.pact_toggle', (s, step, c, input) => {
    const a = getActor(s), p = progress(a, 'wizard_warlock', 'warlockProgress');
    p.pactDebt = clamp(p.pactDebt, 0, 8); p.pactCredit = clamp(p.pactCredit, 0, 8);
    if (p.testamentActive) {
      const credit = Math.floor(p.pactDebt / 2); p.pactCredit = clamp(p.pactCredit + credit, 0, 8); p.pactDebt = 0; p.testamentActive = false;
      log(s, 'warlock_pact_cancelled', { credit });
    } else { p.testamentActive = true; log(s, 'warlock_pact_activated'); }
  }),
  extension('wizard.warlock.sacrifice_arm', (s, step, c, input) => {
    const a = getActor(s), p = progress(a, 'wizard_warlock', 'warlockProgress');
    p.reversalArmed = true; p.sacrificeHpPct = clamp(input.sacrificeHpPct ?? 7, 0, 100); p.sacrificeDamagePct = Math.max(0, num(input.sacrificeDamagePct, 55)); p.sacrificeRefundPct = clamp(input.sacrificeRefundPct ?? 35, 0, 100);
    log(s, 'warlock_sacrifice_armed');
  }),
  extension('wizard.warlock.court_choice', (s, step, c, input) => {
    const choice = String(input.choice || c.payload?.choice || 'silence');
    if (!['silence','refund','confiscation'].includes(choice)) throw new Error('invalid_court_of_nameless_choice');
    const a = getActor(s), p = progress(a, 'wizard_warlock', 'warlockProgress'); p.courtMode = choice; p.courtTurns = Math.max(1, Math.floor(num(input.durationTurns, 2)));
    for (const t of getTargets(s, c)) setStatus(t, 'court_of_nameless', { choice, turns: p.courtTurns, effectPct: t.isBoss || t.boss ? 50 : 100 });
    log(s, 'warlock_court', { choice, turns: p.courtTurns });
  }),
  extension('wizard.warlock.link', (s, step, c, input) => {
    const a = getActor(s), p = progress(a, 'wizard_warlock', 'warlockProgress'), t = getTargets(s, c)[0];
    if (!t) throw new Error('hostage_heart_target_missing');
    const link = { turns: Math.max(1, Math.floor(num(input.durationTurns, 3))), linkPct: clamp(input.linkPct ?? 22, 0, 100), healPct: clamp(input.healPct ?? 18, 0, 100), sourceId: a.id };
    setStatus(t, 'hostage_heart', link); p.hostageTargetId = t.id; p.hostageLink = clone(link);
    log(s, 'warlock_hostage_link', { targetId: t.id, ...link });
  }),
  extension('wizard.warlock.hunger_reservoir', (s, step, c, input) => {
    const a = getActor(s), p = progress(a, 'wizard_warlock', 'warlockProgress');
    p.hungerTurns = Math.max(1, Math.floor(num(input.durationTurns, 3)));
    p.hungerReservoir = clamp(num(p.hungerReservoir) + Math.max(0, num(input.gain, 0)), 0, 12);
    log(s, 'warlock_hunger_reservoir', { turns: p.hungerTurns, reservoir: p.hungerReservoir });
  }),
  extension('wizard.warlock.true_name_choice', (s, step, c, input) => {
    const choice = String(input.choice || c.payload?.choice || 'will');
    if (!['body','will','magic','bond'].includes(choice)) throw new Error('invalid_true_name_choice');
    const t = getTargets(s, c)[0]; if (!t) throw new Error('true_name_target_missing');
    const boss = Boolean(t.isBoss || t.boss), scale = boss ? 0.5 : 1;
    setStatus(t, 'true_name_shatter', { turns: Math.max(1, Math.floor(num(input.durationTurns, 3))), choice, attackReductionPct: choice === 'will' ? 20 * scale : 0, defenseReductionPct: choice === 'body' ? 22 * scale : 0, skillPowerReductionPct: choice === 'magic' ? 25 * scale : 0, removeBuff: choice === 'bond' });
    log(s, 'warlock_true_name', { targetId: t.id, choice, boss });
  }),
  extension('wizard.warlock.final_covenant_choice', (s, step, c, input) => {
    const choice = String(input.choice || c.payload?.choice || 'annihilation');
    if (!['annihilation','dominion','void'].includes(choice)) throw new Error('invalid_final_covenant_choice');
    const a = getActor(s), p = progress(a, 'wizard_warlock', 'warlockProgress'), debt = clamp(p.pactDebt, 0, 8);
    const bonus = 1 + Math.min(40, Math.floor(debt / 2) * 8) / 100;
    p.pactDebt = 0; p.pactCredit = 0;
    const targets = getTargets(s, c);
    if (choice === 'annihilation' || choice === 'void') {
      const amount = Math.max(0, Math.floor(num(input.amount) * bonus + 1e-9));
      for (const t of targets) { if (choice === 'void') t.buffs = {}; t.hp = Math.max(0, num(t.hp) - amount); }
      log(s, 'warlock_final_covenant_damage', { choice, amount, targetIds: targets.map(t => t.id) });
    } else {
      let heal = 0;
      for (const t of targets) { const lost = Math.max(0, num(t.maxHp, num(t.max_hp)) - num(t.hp)); heal += lost * 0.18; setStatus(t, 'final_covenant', { turns: 2, attackReductionPct: 18 * (t.isBoss || t.boss ? 0.5 : 1) }); }
      a.hp = Math.min(num(a.maxHp, num(a.max_hp, 1)), num(a.hp) + Math.floor(heal));
      log(s, 'warlock_final_covenant_dominion', { healed: Math.floor(heal) });
    }
    log(s, 'warlock_final_covenant', { choice, consumedDebt: debt });
  }),
  extension('wizard.necromancer.soul_on_kill', (s, step, c, input) => {
    const a = getActor(s), p = progress(a, 'wizard_necromancer', 'necromancerProgress'), target = getTargets(s, c, true)[0];
    if (target && num(target.hp) <= 0 && target._soulAwarded !== true) { p.souls = clamp(p.souls + 1, 0, 99); target._soulAwarded = true; log(s, 'necromancer_soul_gained', { amount: 1, targetId: target.id }); }
  }),
  extension('wizard.necromancer.permanent_recruit', (s, step, c, input) => {
    const a = getActor(s), p = progress(a, 'wizard_necromancer', 'necromancerProgress');
    p.legion = arr(p.legion); p.failedRecruitCorpses = obj(p.failedRecruitCorpses);
    const corpse = getTargets(s, c, true)[0]; if (!corpse || num(corpse.hp) > 0) throw new Error('legion_requires_selected_corpse');
    if (p.legion.length >= 10) throw new Error('legion_storage_capacity_reached');
    const corpseId = String(corpse.id); if (p.failedRecruitCorpses[corpseId] || corpse.recruitAttempted) throw new Error('legion_corpse_already_attempted');
    const base = corpse.isBoss || corpse.boss ? 7 : corpse.isMiniboss || corpse.miniboss ? 12 : 35;
    const chance = clamp(input.chancePct ?? base, 0, 100), roll = num(input.roll, NaN);
    if (!Number.isFinite(roll) || roll < 0 || roll >= 100) throw new Error('trusted_recruit_roll_required');
    corpse.recruitAttempted = true;
    if (roll < chance) {
      const member = obj(input.member || corpse.legionProfile || { id: `legion_${corpseId}`, speciesId: corpse.speciesId || corpse.monsterId || corpseId, name: corpse.name, hp: corpse.maxHp || corpse.max_hp || 1, maxHp: corpse.maxHp || corpse.max_hp || 1, active: p.legion.filter(x => x.active).length < 3 });
      if (!member.id) throw new Error('legion_member_identity_required');
      p.legion.push({ ...clone(member), active: p.legion.filter(x => x.active).length < 3 });
      log(s, 'necromancer_legion_recruited', { memberId: member.id, active: p.legion.at(-1).active });
    } else { p.failedRecruitCorpses[corpseId] = true; log(s, 'necromancer_legion_recruit_failed', { corpseId, chance }); }
  }),
  extension('wizard.necromancer.death_memory_choice', (s, step, c, input) => {
    const choice = String(input.choice || c.payload?.choice || 'war'); if (!['war','survival','magic'].includes(choice)) throw new Error('invalid_death_memory_choice');
    const t = getTargets(s, c)[0]; if (!t) throw new Error('death_memory_target_missing'); const scale = t.isBoss || t.boss ? 0.5 : 1;
    setStatus(t, 'death_memory', { turns: Math.max(1, Math.floor(num(input.durationTurns, 3))), choice, attackReductionPct: choice === 'war' ? 20 * scale : 0, defenseReductionPct: choice === 'survival' ? 20 * scale : 0, skillPowerReductionPct: choice === 'magic' ? 25 * scale : 0 });
    log(s, 'necromancer_death_memory', { targetId: t.id, choice });
  }),
  extension('wizard.necromancer.legion_defense', (s, step, c, input) => {
    const a = getActor(s), p = progress(a, 'wizard_necromancer', 'necromancerProgress'), members = arr(p.legion).filter(x => x && x.active !== false && num(x.hp, 1) > 0);
    const turns = Math.max(1, Math.floor(num(input.durationTurns, 3)));
    for (const m of members) { m.defenseBuffPct = Math.max(num(m.defenseBuffPct), num(input.defensePct, 20)); m.resistanceBuffPct = Math.max(num(m.resistanceBuffPct), num(input.resistancePct, 20)); m.boneWoundChancePct = Math.max(num(m.boneWoundChancePct), num(input.boneWoundChancePct)); m.buffTurns = Math.max(num(m.buffTurns), turns); }
    p.legionBuffs = { ...(obj(p.legionBuffs)), defensePct: num(input.defensePct, 20), resistancePct: num(input.resistancePct, 20), turns };
    log(s, 'necromancer_legion_defense', { memberIds: members.map(x => x.id), turns });
  }),
  extension('wizard.necromancer.soul_command', (s, step, c, input) => {
    const choice = String(input.choice || c.payload?.choice || 'hunt'); if (!['hunt','protect','feed'].includes(choice)) throw new Error('invalid_soul_command_choice');
    const a = getActor(s), p = progress(a, 'wizard_necromancer', 'necromancerProgress'), souls = clamp(p.souls, 0, 99);
    if (souls < 1) throw new Error('necromancer_no_souls');
    const power = Math.max(1, Math.floor(num(input.powerPerSoul, num(a.magicPower, num(a.attack, 1)) * 0.12) * souls));
    if (choice === 'hunt') { const targets = getTargets(s, c); if (!targets.length) throw new Error('soul_command_targets_missing'); for (const t of targets) t.hp = Math.max(0, num(t.hp) - power); }
    if (choice === 'protect') { a.shield = { hp: power * 2, turns: 2, reductionPct: 20 }; for (const m of arr(p.legion).filter(x => x.active !== false && num(x.hp, 1) > 0)) m.shield = num(m.shield) + power; }
    if (choice === 'feed') { a.hp = Math.min(num(a.maxHp, num(a.max_hp, 1)), num(a.hp) + power); const mpKey = 'mp' in a ? 'mp' : 'mana'; const maxMp = num(a.maxMp, num(a.max_mp, num(a.maxMana, 0))); a[mpKey] = Math.min(maxMp, num(a[mpKey]) + power); }
    p.souls = 0; log(s, 'necromancer_soul_command', { choice, spent: souls, power });
  }),
  extension('wizard.necromancer.legion_share_heal', (s, step, c, input) => {
    const a = getActor(s), p = progress(a, 'wizard_necromancer', 'necromancerProgress');
    const healed = Math.max(0, num(input.healedAmount)); if (!healed) throw new Error('trusted_heal_amount_required');
    const members = arr(p.legion).filter(x => x && x.active !== false && num(x.hp) > 0), total = Math.floor(healed * clamp(input.sharePct ?? 20, 0, 100) / 100);
    const each = members.length ? Math.floor(total / members.length) : 0;
    for (const m of members) m.hp = Math.min(num(m.maxHp, num(m.max_hp, 1)), num(m.hp) + each);
    log(s, 'necromancer_legion_shared_heal', { total, each, memberIds: members.map(x => x.id) });
  }),
  extension('wizard.necromancer.legion_offense', (s, step, c, input) => {
    const a = getActor(s), p = progress(a, 'wizard_necromancer', 'necromancerProgress'), members = arr(p.legion).filter(x => x && x.active !== false && num(x.hp, 1) > 0);
    const turns = Math.max(1, Math.floor(num(input.durationTurns, 3)));
    for (const m of members) { m.attackBuffPct = Math.max(num(m.attackBuffPct), num(input.attackPct, 20)); m.critChanceBonusPct = Math.max(num(m.critChanceBonusPct), num(input.critChancePct, 0)); m.defensePenetrationPct = Math.max(num(m.defensePenetrationPct), num(input.defensePenetrationPct, 0)); m.buffTurns = Math.max(num(m.buffTurns), turns); }
    p.legionBuffs = { ...(obj(p.legionBuffs)), attackPct: num(input.attackPct, 20), turns };
    log(s, 'necromancer_legion_offense', { memberIds: members.map(x => x.id), turns });
  }),
  extension('wizard.necromancer.soul_cost', (s, step, c, input) => {
    const a = getActor(s), p = progress(a, 'wizard_necromancer', 'necromancerProgress'), cost = Math.max(1, Math.floor(num(input.soulCost, 3)));
    if (p.reviveArmed || p.reviveUsedThisBattle) throw new Error('necromancer_revive_already_armed_or_used');
    if (num(p.souls) < cost) throw new Error('necromancer_not_enough_souls_for_revive');
    p.souls -= cost; p.reviveArmed = true; p.reviveTurns = Math.max(1, Math.floor(num(input.durationTurns, 3))); p.reviveHpPct = clamp(input.hpPct ?? 25, 1, 100); p.reviveUsedThisBattle = true;
    log(s, 'necromancer_return_threshold_armed', { soulCost: cost, turns: p.reviveTurns, hpPct: p.reviveHpPct });
  }),
  extension('wizard.necromancer.control_choice', (s, step, c, input) => {
    const choice = String(input.choice || c.payload?.choice || 'chain'); if (!['dominate','chain','silence'].includes(choice)) throw new Error('invalid_soul_domination_choice');
    const targets = getTargets(s, c); if (!targets.length) throw new Error('soul_domination_targets_missing');
    for (const t of targets) {
      const boss = Boolean(t.isBoss || t.boss), miniboss = Boolean(t.isMiniboss || t.miniboss);
      if (choice === 'dominate' && boss) throw new Error('boss_cannot_be_dominated');
      setStatus(t, 'soul_domination', { choice: choice === 'dominate' && miniboss ? 'weaken' : choice, turns: choice === 'silence' ? 1 : 2, controlled: choice === 'dominate' && !boss && !miniboss, attackReductionPct: choice === 'chain' ? 20 * (boss ? 0.35 : 1) : 0, skillPowerReductionPct: choice === 'chain' ? 15 * (boss ? 0.35 : 1) : 0, specialSkillLocked: choice === 'silence', boss });
    }
    log(s, 'necromancer_soul_domination', { choice, targetIds: targets.map(t => t.id) });
  }),
  extension('wizard.necromancer.sovereign_form', (s, step, c, input) => {
    const a = getActor(s), p = progress(a, 'wizard_necromancer', 'necromancerProgress');
    if (p.sovereignUsedThisBattle) throw new Error('necromancer_sovereign_once_per_battle');
    p.sovereignUsedThisBattle = true; p.sovereignTurns = Math.max(1, Math.floor(num(input.durationTurns, 3))); p.sovereignDamagePct = Math.max(0, num(input.damagePct, 20)); p.sovereignLegionPct = Math.max(0, num(input.legionPct, 20)); p.sovereignLifestealPct = clamp(input.lifestealPct ?? 15, 0, 100);
    for (const m of arr(p.legion).filter(x => x && x.active !== false && num(x.hp, 1) > 0)) { m.sovereignBuffPct = p.sovereignLegionPct; m.sovereignTurns = p.sovereignTurns; }
    log(s, 'necromancer_sovereign_form', { turns: p.sovereignTurns, legionCount: arr(p.legion).filter(x => x.active !== false && num(x.hp, 1) > 0).length });
  })
];

export function createWizardSpecializationExtensionsV1918() {
  return Object.freeze(Object.fromEntries(handlers));
}
export function getWizardSpecializationExtensionIdsV1918() {
  return Object.freeze(handlers.map(([id]) => id));
}
export function auditWizardSpecializationExtensionsV1918(plans = [], registered = createWizardSpecializationExtensionsV1918()) {
  const missing = [];
  for (const plan of plans) for (const step of plan.steps || []) if (!step.standard && typeof registered[step.handlerId] !== 'function') missing.push({ specializationId: plan.specializationId, skillId: plan.skillId, handlerId: step.handlerId });
  return Object.freeze({ version: WIZARD_SPECIALIZATION_EXTENSION_VERSION, registeredExtensionCount: Object.keys(registered).length, missingExtensionCount: missing.length, missing: Object.freeze(missing), completeForWizardPlanCatalog: missing.length === 0, liveCutoverReady: false });
}

export function createWizardCompleteEffectHandlersV1918() {
  return createWizardEffectHandlersV1917({ extensionHandlers: createWizardSpecializationExtensionsV1918() });
}
export function auditWizardCompleteEffectCoverageV1918(plans = []) {
  const handlers = createWizardCompleteEffectHandlersV1918();
  const base = auditWizardEffectHandlerCoverageV1917(plans, handlers);
  return Object.freeze({ ...base, version: WIZARD_SPECIALIZATION_EXTENSION_VERSION, completeWizardPlanCoverage: base.missingHandlerCount === 0, liveCutoverReady: false });
}
