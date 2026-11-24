/**
 * ETRANOM V1914 — Wizard shared-engine shadow integration.
 *
 * The legacy wizard resolver remains authoritative for gameplay in this phase.
 * The shared SkillEngine is run in PREPARE/validation-only shadow mode so that
 * differences can be audited without charging resources, starting cooldowns,
 * changing effects, or changing combat outcomes. This is an intentional
 * compatibility bridge, not the final live cutover.
 */
import { createSpecializationRegistry } from '../specialization-registry.js';
import { normalizeSpecializationSkillRecord } from '../specialization-contract-runtime.js?v=1901';
import { IMPLEMENTED_SPECIALIZATIONS } from '../specialization-skill-bridge.js?v=1900';
import {
  SkillEngine, StatEngine, CombatResultEngine, ENGINE_VERSION
} from './shared-engine-runtime-v1913.js';

const manifest = {
  combat_modes: ['solo', 'party', 'pvp'],
  classes: [
    { id: 'wizard', status: 'implemented', specializations: [
      { id: 'wizard_arcane_mage', status: 'implemented' },
      { id: 'wizard_elementalist', status: 'implemented' },
      { id: 'wizard_warlock', status: 'implemented' },
      { id: 'wizard_necromancer', status: 'implemented' }
    ]},
    { id: 'warrior', status: 'implemented', specializations: [
      { id: 'warrior_sword_ascetic', status: 'implemented' },
      { id: 'warrior_iron_bastion', status: 'implemented' },
      { id: 'warrior_chaos', status: 'implemented', aliases: ['warrior_chaos_warrior'] },
      { id: 'warrior_apocalypse_harbinger', status: 'implemented' }
    ]},
    ...['gunner','assassin','monk','paladin','priest','ranger','shaman','summoner'].map(id => ({
      id, status: 'reserved', specializations: [1,2,3,4].map(n => ({ id: `${id}_${n}`, status: 'reserved' }))
    }))
  ]
};

export const sharedEngineRegistryV1914 = createSpecializationRegistry(manifest);
const wizardSkillResolver = (specializationId, skillId) => {
  const raw = IMPLEMENTED_SPECIALIZATIONS[specializationId]?.skills?.find(s => String(s.id) === String(skillId));
  return raw ? normalizeSpecializationSkillRecord(raw, specializationId) : null;
};
const shadowSkillEngine = new SkillEngine({ registry: sharedEngineRegistryV1914, skillResolver: wizardSkillResolver });
let lastAudit = null;

const safeStats = actor => ({
  hp: actor?.hp, maxHp: actor?.maxHp ?? actor?.max_hp,
  mp: actor?.mp, maxMp: actor?.maxMp ?? actor?.max_mp,
  attack: actor?.attack ?? actor?.power, defense: actor?.defense,
  speed: actor?.speed, level: actor?.level
});

export function resolveWizardSkillThroughSharedEngine({ mode, specializationId, skillId, payload = {}, legacyResolver } = {}) {
  if (!['solo','party','pvp'].includes(String(mode))) throw new TypeError(`unsupported_combat_mode:${mode}`);
  const canonicalId = sharedEngineRegistryV1914.resolveCanonicalId(specializationId);
  if (!canonicalId || !canonicalId.startsWith('wizard_') || !sharedEngineRegistryV1914.isPlayable(canonicalId)) {
    throw new Error('wizard_specialization_not_registered_or_playable');
  }
  if (typeof legacyResolver !== 'function') throw new TypeError('legacy_resolver_required');

  const actor = payload.actor || {};
  const stats = StatEngine.buildSnapshot(safeStats(actor));
  let preflight = { ok: false, skipped: true, reason: 'skill_definition_not_found' };
  try {
    const prepared = shadowSkillEngine.prepare({
      mode, actorId: actor.id, specializationId: canonicalId, skillId,
      targetId: payload.targetId, requestId: payload.requestId || `shadow:${mode}:${canonicalId}:${skillId}`
    }, actor, { resource: 'mana' });
    preflight = { ok: true, skipped: false, resource: prepared.resource, cost: prepared.cost,
      cooldownTurns: Number(prepared.skill.cooldownTurns) || 0, contractType: prepared.skill.contractType };
  } catch (error) {
    // Shadow diagnostics must never block the proven legacy gameplay path.
    preflight = { ok: false, skipped: false, reason: String(error?.message || error) };
  }

  const result = legacyResolver(canonicalId, skillId, { ...payload, mode });
  const envelope = CombatResultEngine.create({
    mode, actor: result?.actor || actor, targets: result?.targets || payload.targets || [],
    events: result?.log || [], turnId: payload.turnId || '', requestId: payload.requestId || ''
  });
  lastAudit = Object.freeze({
    engineVersion: ENGINE_VERSION, mode, specializationId: canonicalId, skillId: String(skillId),
    preflight, statSnapshot: stats.stats, result: envelope.result,
    legacyResultPreserved: true, timestamp: Date.now()
  });
  return result;
}

export function getSharedEngineIntegrationAuditV1914() { return lastAudit; }
