/** Sword Ascetic authoritative pure mechanics shared by solo/party/PvP adapters. */
import SWORD_ASCETIC from '../../content/classes/warrior_sword_ascetic_v1.json' with { type: 'json' };
import { resolveCombatSkill } from './shared-skill-runtime.js?v=1906';
import { resolveCanonicalSkillDamage } from './character-stat-core.js?v=1901';

const copy = value => JSON.parse(JSON.stringify(value ?? {}));
const clamp = (value, min, max) => Math.max(min, Math.min(max, Number(value) || 0));
const n = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
// Prefer the highest populated physical-power alias. Battle snapshots can contain
// a stale/default attack=1 while the actual character power is stored elsewhere.
function resolvePhysicalAttack(actor = {}) {
  const values = [actor.attack, actor.power, actor.stats?.attack, actor.stats?.power, actor.combatStats?.attack, actor.combatStats?.power]
    .map(Number).filter(value => Number.isFinite(value) && value > 0);
  return values.length ? Math.max(...values) : 1;
}
const SKILLS = new Map(SWORD_ASCETIC.skills.map(skill => [skill.id, skill]));
const ASCENDED = new Map(SWORD_ASCETIC.ascendedSkills.map(skill => [skill.id, skill]));
const TALENTS = SWORD_ASCETIC.talentBranches.flatMap(branch => branch.talents);
const TALENT_BY_ID = new Map(TALENTS.map(talent => [talent.id, talent]));
const DOMAIN_STAGE = (level, questFlags = {}) => [...SWORD_ASCETIC.domain.stages].reverse().find(stage => n(level) >= n(stage.unlockLevel) && (!stage.requiresQuest || Boolean(questFlags.swordAsceticDomainTrial))) || null;

export const SWORD_ASCETIC_RUNTIME_VERSION = '1.3.1';
export const SWORD_ASCETIC_DATA = SWORD_ASCETIC;

export function collectSwordAsceticTalentEffects(progress = {}) {
  // The status UI's established save shape is unlockedTalents + talentRanks.
  // Older experimental saves may use `talents`; accept both without rewriting
  // or deleting either shape so existing characters remain compatible.
  const owned = progress.talents && typeof progress.talents === 'object' ? { ...progress.talents } : {};
  const ranks = progress.talentRanks && typeof progress.talentRanks === 'object' ? progress.talentRanks : {};
  for (const id of Array.isArray(progress.unlockedTalents) ? progress.unlockedTalents : []) {
    if (owned[id] == null) owned[id] = ranks[id] == null ? 1 : ranks[id];
  }
  for (const [id, rank] of Object.entries(ranks)) {
    if (owned[id] == null && TALENT_BY_ID.has(id)) owned[id] = rank;
  }
  const out = {};
  for (const [id, rawRank] of Object.entries(owned)) {
    const talent = TALENT_BY_ID.get(id);
    const rank = clamp(Math.floor(n(rawRank)), 0, 1);
    if (!talent || !rank) continue;
    for (const [key, value] of Object.entries(talent.effect || {})) out[key] = n(out[key]) + n(value) * rank;
  }
  return Object.freeze(out);
}

function normalizeSkillForCore(skill, rank, domainActive, talentFx) {
  const ranked = { ...skill };
  const rankBonus = 1 + Math.max(0, rank - 1) * 0.08;
  ranked.damagePct = Math.floor(n(skill.powerPct) * rankBonus);
  ranked.scalingStat = 'attack';
  ranked.manaCost = 0;
  ranked.cooldownTurns = Math.max(0, n(skill.cooldownTurns));
  if (skill.type === 'reflect_next') ranked.type = 'self_buff';
  else if (skill.type === 'multi_hit') ranked.type = 'single_damage';
  else if (skill.type === 'all_damage_execute') ranked.type = 'all_damage';
  if (skill.type === 'self_buff' || skill.type === 'evasion_counter' || skill.type === 'reflect_next') {
    ranked.type = 'self_buff';
    ranked.durationTurns = skill.id === 'absolute_instinct' ? 3 : skill.id === 'body_sword_unity' ? 3 : 1;
    ranked.effects = {};
  }
  const skillDamageBonus = n(talentFx.swordSkillDamagePct);
  const namedSkillBonus = skill.id === 'soul_blade' ? n(talentFx.soulBladePct) : skill.id === 'silent_finale' ? n(talentFx.silentFinalePct) : 0;
  ranked.damagePct = Math.floor(n(ranked.damagePct) * (1 + clamp(skillDamageBonus + namedSkillBonus, 0, 100) / 100));
  if (skill.id === 'black_crescent' || skill.id === 'soul_blade' || skill.id === 'mountain_river_cleave' || skill.id === 'mind_blade') {
    ranked.defenseReductionPct = clamp(n(talentFx.defensePenetrationPct) + (skill.id === 'black_crescent' ? 18 : skill.id === 'soul_blade' ? 25 : 0), 0, 75);
  }
  if (skill.id === 'silent_finale') ranked.maxTargets = 12;
  // Bleed-enhancing talents are applied to the skill that can inflict bleeding.
  if (skill.id === 'crimson_blossom') ranked.bleedDamagePct = n(talentFx.bleedDamagePct);
  return ranked;
}

function checkDomainAndAscension(skillId, actor, progress) {
  const domain = progress.domain && typeof progress.domain === 'object' ? progress.domain : {};
  const active = domain.active === true;
  if (ASCENDED.has(skillId)) {
    if (!active) throw new Error('sword_ascetic_ascension_requires_domain');
    if (domain.ascendedUsed) throw new Error('sword_ascetic_only_one_ascension_per_domain');
    const asc = ASCENDED.get(skillId);
    const stage = DOMAIN_STAGE(n(actor.level, 1));
    if (!stage) throw new Error('sword_ascetic_domain_locked');
    if (String(asc.skillId) !== String(domain.selectedBaseSkillId || asc.skillId)) {
      // Selection may be made at cast time; only one ascended skill is permitted.
    }
    return { active, domain, asc };
  }
  return { active, domain, asc: null };
}

/** Apply persistent passive talent bonuses to a combat snapshot exactly once. */
export function applySwordAsceticPassiveStats(actor = {}) {
  const a = copy(actor);
  const progress = copy(a.classProgress?.warrior_sword_ascetic || a.swordAsceticProgress || {});
  const fx = collectSwordAsceticTalentEffects(progress);
  const pct = (value) => 1 + clamp(n(value), 0, 100) / 100;
  if (!a._swordAsceticPassivesApplied) {
    a.defense = Math.max(0, n(a.defense) * pct(fx.defensePct));
    a.maxHp = Math.max(1, n(a.maxHp, 1) * pct(fx.maxHpPct));
    a.hp = Math.min(a.maxHp, n(a.hp, a.maxHp));
    a.accuracy = clamp(n(a.accuracy, 100) + n(fx.accuracyPct), 0, 100);
    a.critChance = clamp(n(a.critChance) + n(fx.critChancePct) + n(fx.swordCritPct), 0, 100);
    a._swordAsceticPassivesApplied = true;
  }
  return Object.freeze({ actor: a, effects: fx });
}

export function activateSwordAsceticDomain(actor = {}, { level = actor.level, questFlags = {} } = {}) {
  const a = copy(actor);
  const progress = copy(a.classProgress?.warrior_sword_ascetic || a.swordAsceticProgress || {});
  if (n(level, 1) < n(SWORD_ASCETIC.domain.unlockLevel)) throw new Error('sword_ascetic_domain_locked');
  const hasDomainTrial = Boolean(questFlags.swordAsceticDomainTrial || progress.domainQuest?.complete);
  const stage = DOMAIN_STAGE(level, { ...questFlags, swordAsceticDomainTrial: hasDomainTrial });
  if (!stage) throw new Error(n(level) >= 50 ? 'sword_ascetic_domain_trial_required' : 'sword_ascetic_domain_locked');
  if (progress.domain?.usedThisBattle) throw new Error('sword_ascetic_domain_already_used');
  const duration = n(stage.durationPlayerTurns, 5);
  progress.domain = { active: true, stage: stage.stage, stageId: stage.id, turnsRemaining: duration, duration, usedThisBattle: true, ascendedUsed: false, ascendedSkillId: null, attackPct: [0,15,25,35,45][stage.stage] || 15, accuracyPct: [0,10,15,20,25][stage.stage] || 10, waveCounter: 0 };
  a.classProgress = { ...(a.classProgress || {}), warrior_sword_ascetic: progress };
  a.swordAsceticProgress = progress;
  return Object.freeze({ actor: a, domain: copy(progress.domain), log: [{ type: 'sword_domain_activated', stage: stage.stage, turns: duration }] });
}

export function tickSwordAsceticDomain(actor = {}, targets = []) {
  const a = copy(actor), progress = copy(a.classProgress?.warrior_sword_ascetic || a.swordAsceticProgress || {}), domain = progress.domain;
  if (!domain?.active) return Object.freeze({ actor: a, targets: copy(targets), log: [] });
  domain.turnsRemaining = Math.max(0, n(domain.turnsRemaining) - 1);
  domain.waveCounter = n(domain.waveCounter) + 1;
  const nextTargets = copy(targets), log = [];
  if (domain.waveCounter % (domain.stage === 1 ? 2 : 1) === 0) {
    const wavePct = (domain.stage >= 3 ? 12 : domain.stage === 2 ? 9 : 6) * (1 + clamp(n(collectSwordAsceticTalentEffects(progress).domainEffectPct), 0, 50) / 100);
    for (const target of nextTargets.filter(x => n(x.hp) > 0)) {
      const amount = Math.max(1, Math.floor(n(a.attack) * wavePct / 100));
      target.hp = Math.max(0, n(target.hp) - amount);
      log.push({ type: 'sword_domain_wave', target: target.id, amount });
    }
  }
  if (domain.turnsRemaining <= 0) {
    if (n(domain.stage) >= 4) {
      for (const target of nextTargets.filter(x => n(x.hp) > 0)) {
        const boss = /boss/i.test(String(target.rank || target.type || target.category || '')) || target.isBoss === true || target.isMiniboss === true;
        const amount = Math.max(1, Math.floor(n(a.attack) * (boss ? 0.8 : 2.2)));
        target.hp = Math.max(0, n(target.hp) - amount);
        log.push({ type: 'sword_domain_final_burst', target: target.id, amount, bossLimited: boss });
      }
    }
    domain.active = false; domain.ascendedUsed = false; domain.ascendedSkillId = null; log.push({ type: 'sword_domain_ended' });
  }
  progress.domain = domain; a.classProgress = { ...(a.classProgress || {}), warrior_sword_ascetic: progress }; a.swordAsceticProgress = progress;
  return Object.freeze({ actor: a, targets: nextTargets, log });
}

export function resolveSwordAsceticSkill(skillId, payload = {}) {
  const baseSkill = SKILLS.get(String(skillId));
  const ascSkill = ASCENDED.get(String(skillId));
  if (!baseSkill && !ascSkill) throw new Error('specialization_skill_not_found');
  const passiveSnapshot = applySwordAsceticPassiveStats(payload.actor || {});
  const actor = copy(passiveSnapshot.actor);
  // Normalize physical power for this specialization only. Some live snapshots
  // contain a stale/default attack value (often 1) while the real power is stored
  // in power, stats.power, or combatStats.power. The shared core reads attack only.
  actor.attack = resolvePhysicalAttack(actor);
  const progress = copy(actor.classProgress?.warrior_sword_ascetic || actor.swordAsceticProgress || {});
  const skill = baseSkill || SKILLS.get(ascSkill.skillId);
  const level = n(actor.level, 1);
  if (level < n(skill.unlockLevel, 1)) throw new Error('sword_ascetic_skill_locked');
  const ranks = progress.skillRanks || {};
  const rank = clamp(Math.floor(n(ranks[skill.id], 1)), 1, 7);
  const talentFx = collectSwordAsceticTalentEffects(progress);
  const domainState = checkDomainAndAscension(String(skillId), actor, progress);
  const staminaReduction = clamp(n(talentFx.staminaCostReductionPct) + n(talentFx.swordStaminaCostReductionPct), 0, 50);
  const staminaCost = Math.max(0, Math.ceil(n(skill.staminaCost) * (1 - staminaReduction / 100)));
  const stamina = n(actor.stamina, n(actor.maxStamina, 100));
  if (stamina < staminaCost) throw new Error('insufficient_stamina');
  actor.stamina = Math.max(0, stamina - staminaCost);
  const domainActive = domainState.active ? progress.domain : null;
  const normalized = normalizeSkillForCore(skill, rank, domainActive, talentFx);
  if (ascSkill) {
    normalized.damagePct = Math.floor(n(normalized.damagePct) * 1.65);
    if (skill.id === 'crimson_blossom') normalized.damagePct *= 1.5;
    if (skill.id === 'silent_finale') normalized.damagePct = Math.floor(n(normalized.damagePct) * 1.25);
  }
  const preparedTargets = copy(payload.targets || []);
  if (n(normalized.defenseReductionPct) > 0) { for (const target of preparedTargets.filter(t => n(t.hp) > 0)) target.statuses = { ...(target.statuses || {}), sword_ascetic_penetration: { turns: 1, defenseReductionPct: n(normalized.defenseReductionPct), hardControl: false } }; }
  const corePayload = { ...payload, actor, targets: preparedTargets, skill: normalized, mode: payload.mode || 'solo', effects: { ...(payload.effects || {}), damagePct: n(payload.effects?.damagePct) + n(talentFx.swordDamagePct) + (ascSkill ? n(talentFx.ascendedSkillPct) : 0) + (domainActive ? n(domainActive.attackPct) : 0), defenseReductionPct: n(payload.effects?.defenseReductionPct) + n(talentFx.defensePenetrationPct), accuracyPct: n(payload.effects?.accuracyPct) + n(talentFx.accuracyPct), critChancePct: n(payload.effects?.critChancePct) + n(talentFx.swordCritPct) } };
  for (const t of preparedTargets) if (t.id == null && t.encounterId != null) t.id = String(t.encounterId);
  const primaryTarget = preparedTargets.find(t => String(t.id ?? t.encounterId) === String(payload.targetId)) || preparedTargets.find(t => n(t.hp) > 0);
  const attackSkill = n(normalized.damagePct) > 0 && !['self_buff','shield','heal'].includes(normalized.type);
  const hitChance = clamp(n(actor.accuracy, 100) - n(primaryTarget?.evasionPct ?? primaryTarget?.evasion), 5, 100);
  const hasHitRoll = Number.isFinite(Number(payload.rolls?.hit));
  const missed = attackSkill && primaryTarget && hasHitRoll && n(payload.rolls.hit) >= hitChance;
  if (missed) {
    return Object.freeze({ mode: payload.mode || 'solo', actor, targets: preparedTargets, summons: copy(actor.summons || []),
      log: [{ type: 'sword_ascetic_miss', target: primaryTarget.id, hitChance }], skillId });
  }
  const core = resolveCombatSkill(corePayload);
  const out = { ...core, actor: copy(core.actor), targets: copy(core.targets), log: [...(core.log || [])] };
  // Black Crescent is an actual damaging strike, not a cosmetic/status-only action.
  // Legacy encounter snapshots sometimes expose HP under hp but omit a usable id/defense;
  // resolve against the selected live target and persist the resulting HP delta explicitly.
  if (skill.id === 'black_crescent' && primaryTarget) {
    const resolvedTarget = out.targets.find(t => String(t.id) === String(primaryTarget.id)) || out.targets.find(t => n(t.hp) > 0);
    if (resolvedTarget) {
      const logged = out.log.filter(x => x.type === 'damage' && String(x.target) === String(resolvedTarget.id));
      const loggedDamage = logged.reduce((sum, x) => sum + Math.max(0, n(x.amount)), 0);
      // The shared core may already have applied damage. If it used a stale/empty
      // attack stat, top up only the missing difference to the authoritative hit.
      const defenseReductionPct = Object.values(resolvedTarget.statuses || {}).reduce((sum, status) => sum + n(status?.defenseReductionPct), 0);
      const expectedDamage = resolveCanonicalSkillDamage({ attackPower: actor.attack, damagePct: n(normalized.damagePct, 280), targetDefense: resolvedTarget.defense ?? resolvedTarget.enemyDefense, defenseReductionPct, targetDamageReductionPct: n(resolvedTarget.damageReductionPct) }).damage;
      const extra = Math.max(0, expectedDamage - loggedDamage);
      if (extra > 0) {
        resolvedTarget.hp = Math.max(0, n(resolvedTarget.hp) - extra);
        out.log.push({ type: 'damage', target: resolvedTarget.id, amount: extra, skillId: 'black_crescent', source: 'black_crescent_damage_bridge' });
      }
      // Ensure the report attributes the hit to the named specialization skill.
      for (const entry of logged) entry.skillId = 'black_crescent';
    }
  }
  // Target-tagged armor bonus is applied after shared-core damage so the common
  // damage formula and all other classes remain untouched.
  // Accuracy and critical talents are consumed only from trusted server rolls.
  // With no roll supplied, the shared resolver remains deterministic and unchanged.
  const critChance = clamp(n(actor.critChance), 0, 75);
  if (attackSkill && primaryTarget && Number.isFinite(Number(payload.rolls?.crit)) && n(payload.rolls.crit) < critChance) {
    for (const target of out.targets) {
      const baseDamage = (out.log || []).filter(x => x.type === 'damage' && String(x.target) === String(target.id)).reduce((sum, x) => sum + n(x.amount), 0);
      const bonus = Math.floor(baseDamage * 0.5);
      if (bonus > 0) { target.hp = Math.max(0, n(target.hp) - bonus); out.log.push({ type: 'sword_ascetic_critical_bonus', target: target.id, amount: bonus }); }
    }
  }
  const armoredBonus = clamp(n(talentFx.armoredDamagePct), 0, 30);
  if (armoredBonus > 0 && n(normalized.damagePct) > 0) {
    for (const target of out.targets) {
      const armored = target.isArmored === true || target.armored === true ||
        /armou?r|heavy|plate/i.test(String(target.armorType || target.armorClass || target.tags || ''));
      if (!armored) continue;
      const baseDamage = (out.log || []).filter(x => x.type === 'damage' && String(x.target) === String(target.id)).reduce((sum, x) => sum + n(x.amount), 0);
      const bonus = Math.floor(baseDamage * armoredBonus / 100);
      if (bonus > 0) { target.hp = Math.max(0, n(target.hp) - bonus); out.log.push({ type: 'sword_ascetic_armored_bonus', target: target.id, amount: bonus }); }
    }
  }
  if (skill.id === 'crimson_blossom') {
    const chance = clamp(n(talentFx.bleedChancePct), 0, 50);
    const roll = n(payload.rolls?.bleed ?? payload.bleedRoll, 100);
    const target = out.targets.find(t => String(t.id) === String(payload.targetId)) || out.targets.find(t => n(t.hp) > 0);
    if (target && chance > 0 && roll < chance) {
      target.statuses = { ...(target.statuses || {}), bleed: { turns: 2, dotPct: 5 * (1 + clamp(n(talentFx.bleedDamagePct), 0, 100) / 100), source: 'sword_ascetic' } };
      out.log.push({ type: 'sword_ascetic_bleed_applied', target: target.id, turns: 2, damagePct: target.statuses.bleed.dotPct });
    }
  }
  out.actor.stamina = actor.stamina;
  out.actor.classProgress = { ...(out.actor.classProgress || {}), warrior_sword_ascetic: progress };
  if (skill.id === 'mist_step' || skill.id === 'absolute_instinct') {
    out.actor.swordAsceticStates = { ...(out.actor.swordAsceticStates || {}), evasionPct: skill.id === 'mist_step' ? 75 : 45, counterDamagePct: (skill.id === 'mist_step' ? 130 : 115), turns: skill.id === 'mist_step' ? 1 : 3 };
    out.log.push({ type: 'sword_ascetic_evasion_armed', skillId: skill.id });
  }
  if (skill.id === 'echo') {
    out.actor.swordAsceticStates = { ...(out.actor.swordAsceticStates || {}), reflectPct: ascSkill ? 65 : 40, reflectHits: 1 };
    out.log.push({ type: 'sword_ascetic_reflect_armed', reflectPct: out.actor.swordAsceticStates.reflectPct });
  }
  if (skill.id === 'crimson_blossom') {
    const target = out.targets.find(t => String(t.id) === String(payload.targetId)) || out.targets.find(t => n(t.hp) > 0);
    if (target) {
      const perHitPct = n(normalized.damagePct) / 3;
      const hits = ascSkill ? 5 : 3;
      let total = 0;
      for (let i = 1; i < hits; i++) { const defenseReductionPct = Object.values(target.statuses || {}).reduce((sum, status) => sum + n(status?.defenseReductionPct), 0); const amount = resolveCanonicalSkillDamage({ attackPower: n(out.actor.attack), damagePct: perHitPct, targetDefense: target.defense, defenseReductionPct, targetDamageReductionPct: n(target.damageReductionPct) }).damage; target.hp = Math.max(0, n(target.hp) - amount); total += amount; out.log.push({ type: 'sword_multi_hit', target: target.id, hit: i + 1, amount }); }
      if (total) out.log.push({ type: 'sword_multi_hit_total', target: target.id, amount: total });
    }
  }
  if (skill.id === 'body_sword_unity') {
    out.actor.combatEffects = { ...(out.actor.combatEffects || {}), attackPct: n(out.actor.combatEffects?.attackPct) + (ascSkill ? 35 : 18), accuracyPct: n(out.actor.combatEffects?.accuracyPct) + 10, speedPct: n(out.actor.combatEffects?.speedPct) + 10, attackPct: n(out.actor.combatEffects?.attackPct) + n(talentFx.unityEffectPct) };
  }
  if (skill.id === 'silent_finale') {
    for (const target of out.targets.filter(t => n(t.hp) > 0)) {
      const isBoss = /boss/i.test(String(target.rank || target.type || target.category || '')) || target.isBoss === true || target.isMiniboss === true;
      if (!isBoss && n(target.hp) <= 0) out.log.push({ type: 'sword_silent_split', target: target.id });
    }
  }
  if (ascSkill) {
    progress.domain.ascendedUsed = true;
    progress.domain.ascendedSkillId = ascSkill.id;
    progress.domain.lastAscendedBaseSkillId = skill.id;
    out.log.push({ type: 'sword_ascended_skill_used', ascendedSkillId: ascSkill.id, baseSkillId: skill.id });
  }
  progress.skillRanks = { ...(progress.skillRanks || {}), [skill.id]: rank };
  out.actor.classProgress = { ...(out.actor.classProgress || {}), warrior_sword_ascetic: progress };
  out.actor.swordAsceticProgress = progress;
  out.skillId = skillId;
  return Object.freeze(out);
}

/** Apply a server-calculated incoming hit to Sword Ascetic defensive states. */
export function resolveSwordAsceticIncomingHit(actor = {}, attacker = {}, incomingDamage = 0, options = {}) {
  const nextActor = copy(actor), states = copy(nextActor.swordAsceticStates || {});
  const progress = copy(nextActor.classProgress?.warrior_sword_ascetic || nextActor.swordAsceticProgress || {});
  const talentFx = collectSwordAsceticTalentEffects(progress);
  const ambushReduction = options.isAmbush ? clamp(n(talentFx.ambushResistancePct), 0, 50) : 0;
  let damage = Math.max(0, Math.floor(n(incomingDamage)
    * (1 - clamp(n(talentFx.guardDamageReductionPct), 0, 60) / 100)
    * (1 - ambushReduction / 100))), reflected = 0, dodged = false, counterDamage = 0;
  const evasionChance = clamp(n(states.evasionPct) + n(talentFx.evasionPct) + n(talentFx.absolutePerceptionEvasionPct), 0, 85);
  if (n(states.turns) > 0 || evasionChance > 0) {
    const roll = n(options.evasionRoll, 99.999);
    if (roll < evasionChance) {
      damage = 0; dodged = true;
      const restorePct = clamp(n(talentFx.evadeStaminaRestorePct), 0, 25);
      if (restorePct > 0) {
        const maxStamina = Math.max(0, n(nextActor.maxStamina, 100));
        nextActor.stamina = Math.min(maxStamina, n(nextActor.stamina) + Math.max(1, Math.floor(maxStamina * restorePct / 100)));
      }
      counterDamage = Math.max(0, Math.floor(n(nextActor.attack) * (n(states.counterDamagePct) + n(talentFx.counterDamagePct) + n(talentFx.mistCounterPct)) / 100));
    }
  }
  if (!dodged && n(states.reflectHits) > 0 && n(states.reflectPct) > 0) {
    reflected = Math.max(0, Math.floor(damage * clamp(n(states.reflectPct) + n(talentFx.echoReflectPct), 0, 80) / 100));
    const hits = Math.max(0, n(states.reflectHits) - 1);
    states.reflectHits = hits;
    if (!hits) states.reflectPct = 0;
  }
  nextActor.swordAsceticStates = states;
  nextActor.hp = Math.max(0, n(nextActor.hp) - damage);
  const nextAttacker = copy(attacker);
  if (reflected > 0 || counterDamage > 0) nextAttacker.hp = Math.max(0, n(nextAttacker.hp) - reflected - counterDamage);
  return Object.freeze({ actor: nextActor, attacker: nextAttacker, damageTaken: damage, reflected, counterDamage, dodged,
    log: [{ type: dodged ? 'sword_ascetic_dodge' : 'incoming_damage', amount: damage },
      ...(counterDamage ? [{ type: 'sword_ascetic_counter', amount: counterDamage }] : []),
      ...(reflected ? [{ type: 'sword_ascetic_reflect', amount: reflected }] : [])] });
}

/** Apply end-of-player-turn stamina recovery from trained breath. */
export function applySwordAsceticTurnRecovery(actor = {}, baseRecovery = 0) {
  const next = copy(actor);
  const progress = next.classProgress?.warrior_sword_ascetic || next.swordAsceticProgress || {};
  const fx = collectSwordAsceticTalentEffects(progress);
  const max = Math.max(0, n(next.maxStamina, 100));
  const recovery = Math.max(0, Math.floor(n(baseRecovery) * (1 + clamp(n(fx.staminaRegenPct), 0, 100) / 100)));
  next.stamina = Math.min(max, n(next.stamina) + recovery);
  return Object.freeze({ actor: next, recovered: next.stamina - n(actor.stamina) });
}

/** Reduce a control/interrupt duration using the matching learned passive. */
export function resolveSwordAsceticControlDuration(actor = {}, duration = 1, kind = 'control') {
  const progress = actor.classProgress?.warrior_sword_ascetic || actor.swordAsceticProgress || {};
  const fx = collectSwordAsceticTalentEffects(progress);
  const key = kind === 'interrupt' ? 'interruptResistancePct' : 'controlResistancePct';
  const resistance = clamp(n(fx[key]), 0, 80);
  return Math.max(0, Math.ceil(Math.max(0, n(duration)) * (1 - resistance / 100)));
}

export function findSwordAsceticSkill(skillId) { return SKILLS.get(String(skillId)) || null; }

export function listSwordAsceticSkills({ level = 1, ownedSkillIds = null } = {}) {
  const owned = ownedSkillIds ? new Set(ownedSkillIds.map(String)) : null;
  return SWORD_ASCETIC.skills.filter(skill => n(skill.unlockLevel) <= n(level) && (!owned || owned.has(skill.id))).map(skill => ({ ...skill, classId: 'warrior', specializationId: 'warrior_sword_ascetic' }));
}
