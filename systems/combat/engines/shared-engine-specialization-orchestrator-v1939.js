/**
 * ETRANOM V1939 — Universal shared-engine orchestration (shadow-safe).
 * Connects all eight implemented specializations to canonical stat, skill,
 * talent, upgrade, resource, cooldown, status, domain, ascension, lifecycle and
 * result engines. Existing specialization resolvers remain authoritative until
 * differential parity and server-side transaction guarantees are proven.
 */
import { ARCANE_MAGE } from '../../classes/arcane-mage.js';
import { ELEMENTALIST } from '../../classes/elementalist.js';
import { WARLOCK } from '../../classes/warlock.js';
import { NECROMANCER } from '../../classes/necromancer.js';
import { SWORD_ASCETIC_DATA } from '../sword-ascetic-runtime.js?v=1937';
import { IRON_BASTION_DATA } from '../iron-bastion-runtime.js?v=1937';
import { CHAOS_WARRIOR_DATA } from '../chaos-warrior-runtime.js?v=1901';
import { APOCALYPSE_HARBINGER_DATA } from '../apocalypse-harbinger-runtime.js?v=1908';
import { resolveSpecializationCombatActor } from '../character-stat-core.js?v=1901';
import { normalizeSpecializationSkillRecord } from '../specialization-contract-runtime.js?v=1901';
import { createSpecializationRegistry } from '../specialization-registry.js';
import {
  ENGINE_VERSION, ResourceEngine, CooldownEngine, StatusEngine, SpecialEffectEngine,
  ReactionEngine, MultiHitEngine, SummonEngine, SkillUpgradeEngine, TalentEngine,
  DomainEngine, AscensionEngine, StatEngine, SkillEngine, CombatLifecycleEngine, CombatResultEngine
} from './shared-engine-runtime-v1913.js';
import { DomainAscensionEngineV1923 } from './domain-ascension-engine-v1923.js';
import { buildSharedExecutionPlanV1940 } from './shared-engine-differential-audit-v1940.js';

export const SHARED_ORCHESTRATOR_VERSION_V1939 = '1939.0.0';
export const IMPLEMENTED_SPECIALIZATION_DATA_V1939 = Object.freeze({
  wizard_arcane_mage: ARCANE_MAGE,
  wizard_elementalist: ELEMENTALIST,
  wizard_warlock: WARLOCK,
  wizard_necromancer: NECROMANCER,
  warrior_sword_ascetic: SWORD_ASCETIC_DATA,
  warrior_iron_bastion: IRON_BASTION_DATA,
  warrior_chaos: CHAOS_WARRIOR_DATA,
  warrior_apocalypse_harbinger: APOCALYPSE_HARBINGER_DATA
});
const ids = Object.keys(IMPLEMENTED_SPECIALIZATION_DATA_V1939);
const manifest = {
  combat_modes: ['solo', 'party', 'pvp'],
  classes: [
    { id: 'wizard', status: 'implemented', specializations: ids.filter(x => x.startsWith('wizard_')).map(id => ({ id, status: 'implemented' })) },
    { id: 'warrior', status: 'implemented', specializations: ids.filter(x => x.startsWith('warrior_')).map(id => ({ id, status: 'implemented', aliases: id === 'warrior_chaos' ? ['warrior_chaos_warrior'] : [] })) },
    ...['gunner','assassin','monk','paladin','priest','ranger','shaman','summoner'].map(id => ({ id, status: 'reserved', specializations: [1,2,3,4].map(n => ({ id: `${id}_${n}`, status: 'reserved' })) }))
  ]
};
export const sharedSpecializationRegistryV1939 = createSpecializationRegistry(manifest);
const dataFor = id => IMPLEMENTED_SPECIALIZATION_DATA_V1939[sharedSpecializationRegistryV1939.resolveCanonicalId(id)];
const obj = v => v && typeof v === 'object' && !Array.isArray(v) ? v : {};
const arr = v => Array.isArray(v) ? v : [];
const num = (v, d = 0) => Number.isFinite(Number(v)) ? Number(v) : d;
const clone = v => structuredClone(v ?? {});
const progressKey = {
  wizard_arcane_mage: ['arcaneMageProgress','arcaneMage'], wizard_elementalist: ['elementalistProgress','elementalist'],
  wizard_warlock: ['warlockProgress','warlock'], wizard_necromancer: ['necromancerProgress','necromancer'],
  warrior_sword_ascetic: ['swordAsceticProgress','warrior_sword_ascetic'], warrior_iron_bastion: ['ironBastionProgress','warrior_iron_bastion'],
  warrior_chaos: ['chaosWarriorProgress','warrior_chaos'], warrior_apocalypse_harbinger: ['apocalypseProgress','warrior_apocalypse_harbinger']
};
function progressFor(actor, id) {
  const [legacy, canonical] = progressKey[id] || [];
  return obj(actor?.[legacy] || actor?.classProgress?.[canonical] || actor?.classProgress?.[id] || actor?.specializationProgress);
}
function normalizeCooldowns(actor, progress) {
  return { ...obj(actor.cooldowns), ...obj(actor.skillCooldowns), ...obj(progress.cooldowns), ...obj(progress.skillCooldowns) };
}
function talentProjection(spec, progress) {
  const all = new Map(arr(spec.talents).filter(t => t && typeof t === 'object').map(t => [String(t.id), t]));
  const branches = arr(spec.talentBranches).map(branch => {
    const raw = arr(branch.talentIds).length ? branch.talentIds.map(id => all.get(String(id))).filter(Boolean) : arr(branch.talents);
    const talents = raw.map(item => {
      if (typeof item === 'string') return all.get(item) || { id: item };
      if (Array.isArray(item)) return { id: String(item[0] || ''), name: item[1], description: item[2], effects: obj(item[3]), requires: item[4] ? [String(item[4])] : [] };
      return { ...obj(item), effects: obj(item?.effects || item?.effect), requires: Array.isArray(item?.requires) ? item.requires : (item?.requires ? [item.requires] : (item?.prerequisite ? [item.prerequisite] : [])) };
    });
    return { ...branch, talents };
  });
  const selected = [...new Set([...arr(progress.unlockedTalents), ...arr(progress.selectedTalents)])];
  const collected = TalentEngine.collectModifiers({ branches }, selected);
  // Rank-based legacy talent effects remain visible as diagnostics; do not rewrite them.
  const ranks = obj(progress.talentRanks);
  const rankTrace = [];
  for (const branch of branches) for (const talent of arr(branch.talents)) {
    const rank = Math.max(0, num(ranks[talent.id], selected.includes(String(talent.id)) ? 1 : 0));
    if (rank > 1) rankTrace.push({ talentId: String(talent.id), rank });
  }
  return { selected, modifiers: collected.modifiers, sources: collected.sources, rankTrace };
}
function resolveDomainForm(spec, progress, skill) {
  const domainActive = progress.domainActive === true || progress.domain?.active === true;
  if (!domainActive) return { skill, active: false, selectedAscensionId: null, ascension: null };
  const selectedId = String(progress.domain?.ascensionId || progress.ascendedSkillId || '').trim();
  if (!selectedId) return { skill, active: true, selectedAscensionId: null, ascension: null };
  try {
    const selected = DomainAscensionEngineV1923.resolveSkill(spec, progress, skill.id);
    const ascension = arr(spec.ascendedSkills).find(x => String(x.id) === selectedId) || null;
    return { skill: selected || skill, active: true, selectedAscensionId: selectedId, ascension };
  } catch (error) {
    return { skill, active: true, selectedAscensionId: selectedId, ascension: null, error: String(error?.message || error) };
  }
}

export function inspectSpecializationEngineConnectionsV1939(specializationId) {
  const id = sharedSpecializationRegistryV1939.resolveCanonicalId(specializationId);
  if (!id || !sharedSpecializationRegistryV1939.isPlayable(id)) throw new Error('specialization_not_playable');
  const spec = dataFor(id);
  return Object.freeze({ specializationId: id, classId: id.split('_')[0], skills: arr(spec.skills).length,
    talents: arr(spec.talentBranches).reduce((sum, branch) => sum + (arr(branch.talents).length || arr(branch.talentIds).length), 0), talentBranches: arr(spec.talentBranches).length,
    domainStages: arr(spec.domain?.stages).length, ascensionForms: arr(spec.ascendedSkills).length,
    engines: Object.freeze(['CharacterStatCore','StatEngine','SkillEngine','SkillUpgradeEngine','TalentEngine','ResourceEngine','CooldownEngine','StatusEngine','SpecialEffectEngine','ReactionEngine','MultiHitEngine','SummonEngine','DomainEngine','AscensionEngine','CombatLifecycleEngine','CombatResultEngine']),
    modes: sharedSpecializationRegistryV1939.combatModes });
}

export function prepareSpecializationSharedEngineShadowV1939({ mode, specializationId, skillId, payload = {} } = {}) {
  if (!['solo','party','pvp'].includes(String(mode))) throw new TypeError(`unsupported_combat_mode:${mode}`);
  const id = sharedSpecializationRegistryV1939.resolveCanonicalId(specializationId);
  if (!id || !sharedSpecializationRegistryV1939.isPlayable(id)) throw new Error('specialization_not_playable');
  const spec = dataFor(id), rawSkill = arr(spec.skills).find(s => String(s.id) === String(skillId));
  if (!rawSkill) throw new Error('skill_not_found');
  const actorInput = payload.actor || {};
  const canonicalActor = resolveSpecializationCombatActor({ ...actorInput }, id);
  const progress = progressFor(actorInput, id);
  const cooldowns = normalizeCooldowns(actorInput, progress);
  const actor = { ...canonicalActor, cooldowns, skillCooldowns: cooldowns,
    resources: { ...obj(actorInput.resources), mana: num(actorInput.resources?.mana, actorInput.mp), stamina: num(actorInput.resources?.stamina, actorInput.stamina) } };
  const talent = talentProjection(spec, progress);
  const domain = resolveDomainForm(spec, progress, rawSkill);
  const rank = Math.max(1, Math.min(7, Math.floor(num(progress.skillRanks?.[rawSkill.id], 1))));
  const normalized = normalizeSpecializationSkillRecord(domain.skill, id);
  const upgrade = arr(normalized.upgrades).length === 6
    ? SkillUpgradeEngine.resolve(normalized, rank, arr(progress.selectedUpgrades?.[rawSkill.id]))
    : { rank, modifiers: {}, appliedUpgradeIds: [] };
  const domainEffects = domain.active ? obj(progress.domain?.effects || spec.domain?.stages?.find(s => Number(s.stage) === Number(progress.domain?.stage))?.effects) : {};
  const ascensionEffects = domain.ascension ? obj(domain.ascension.effects) : {};
  const statSources = [
    { id: 'talents', effects: talent.modifiers },
    { id: 'skill_rank', effects: upgrade.modifiers },
    { id: 'domain', effects: domainEffects },
    { id: 'ascension', effects: ascensionEffects }
  ];
  const statSnapshot = StatEngine.buildSnapshot({
    ...obj(canonicalActor.canonicalCombatStats), hp: num(actor.hp), maxHp: num(actor.maxHp ?? actor.max_hp),
    mp: num(actor.mp), maxMp: num(actor.maxMp ?? actor.max_mp), attack: num(actor.attack), defense: num(actor.defense), speed: num(actor.speed),
    stamina: num(actor.stamina), maxStamina: num(actor.maxStamina)
  }, statSources);
  const reactionEngine = new ReactionEngine();
  const effectEngine = new SpecialEffectEngine();
  const lifecycleEngine = new CombatLifecycleEngine({ reactions: reactionEngine });
  const prepared = new SkillEngine({ registry: sharedSpecializationRegistryV1939, effects: effectEngine,
    skillResolver: () => normalized }).prepare({ mode, actorId: actor.id, specializationId: id, skillId: rawSkill.id,
    targetId: payload.targetId ?? payload.target?.id ?? payload.targets?.[0]?.id,
    requestId: payload.requestId || `shadow1939:${mode}:${id}:${rawSkill.id}` }, actor,
    { resource: id.startsWith('warrior_') ? 'stamina' : 'mana' });
  const statusSnapshot = Object.freeze(Object.keys(obj(actor.statuses)));
  const sharedPlan = buildSharedExecutionPlanV1940({ specializationId: id, mode, skill: prepared.skill, actor,
    targets: payload.targets || [], statSnapshot, talent, upgrade, domain });
  return Object.freeze({ ok: true, mode, specializationId: id, skillId: String(rawSkill.id),
    engineVersion: ENGINE_VERSION, orchestratorVersion: SHARED_ORCHESTRATOR_VERSION_V1939,
    prepared: Object.freeze({ resource: prepared.resource, cost: prepared.cost, cooldownTurns: num(prepared.skill.cooldownTurns), target: prepared.skill.target, contractType: prepared.skill.contractType }),
    sharedPlan,
    rank, upgrade, talent, domain: { active: domain.active, selectedAscensionId: domain.selectedAscensionId, ascensionResolved: !!domain.ascension, error: domain.error || null },
    stats: statSnapshot, cooldownReady: CooldownEngine.ready(actor, rawSkill.id), resourceBalance: ResourceEngine.balance(actor, prepared.resource),
    statuses: statusSnapshot, lifecycleEngineAvailable: typeof CombatLifecycleEngine === 'function',
    engineBindings: Object.freeze({ resource: true, cooldown: true, status: true, effects: effectEngine instanceof SpecialEffectEngine,
      reactions: lifecycleEngine.reactions === reactionEngine, multiHit: typeof MultiHitEngine.resolve === 'function',
      summons: typeof SummonEngine.summon === 'function', domain: typeof DomainEngine.activate === 'function',
      ascension: typeof AscensionEngine.select === 'function', lifecycle: lifecycleEngine instanceof CombatLifecycleEngine }),
    resultEnvelope: CombatResultEngine.create({ mode, actor, targets: payload.targets || [], events: [], turnId: payload.turnId || '', requestId: payload.requestId || '' }) });
}

export function getSharedEngineOrchestratorInventoryV1939() {
  return Object.freeze({ version: SHARED_ORCHESTRATOR_VERSION_V1939, registry: sharedSpecializationRegistryV1939.counts,
    specializations: Object.freeze(ids.map(id => inspectSpecializationEngineConnectionsV1939(id))) });
}
