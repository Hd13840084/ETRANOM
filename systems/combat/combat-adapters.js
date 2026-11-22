/** Compatibility boundary for the three existing execution paths.
 * All damage math is delegated to the shared pure core. Persistence, turn
 * ownership, rewards and authorization remain in each authoritative engine.
 */
import {
  normalizeCombatIntent, normalizeCombatStats, resolveDamage,
  COMBAT_MODE, COMBAT_PROFILES
} from './combat-core.js';
import { resolveCombatSkill, collectEquipmentEffects, findSharedSkill, normalizeCombatEffects, applyCombatLoadout, tickCombatStatuses } from './shared-skill-runtime.js?v=1841';
import { getSpecializationHandler, resolveSpecializationSkill } from './specialization-skill-bridge.js?v=1863';
import { activateSwordAsceticDomain, tickSwordAsceticDomain, findSwordAsceticSkill, resolveSwordAsceticIncomingHit, applySwordAsceticPassiveStats, applySwordAsceticTurnRecovery, resolveSwordAsceticControlDuration } from './sword-ascetic-runtime.js?v=1863';
import { activateIronBastionDomain, tickIronBastionDomain, findIronBastionSkill, resolveIronBastionIncomingHit, applyIronBastionTurnRecovery, resolveIronBastionControlDuration } from './iron-bastion-runtime.js?v=1874';
import { activateWorldsEnd, tickWorldsEnd, findApocalypseSkill } from './apocalypse-harbinger-runtime.js?v=1881';

function makeAdapter(mode) {
  return Object.freeze({
    mode,
    intent: (intent) => normalizeCombatIntent(mode, intent),
    snapshot: (character) => normalizeCombatStats(character),
    damage: (attacker, defender, tuning = {}, rolls = {}) =>
      resolveDamage(attacker, defender, { ...COMBAT_PROFILES[mode], ...tuning }, rolls),
    skill: (payload = {}) => {
      const loadout = collectEquipmentEffects(payload.actor || {}, payload.equipment ?? payload.actor?.equipment, payload.activePotions ?? payload.actor?.activePotions);
      const effects = normalizeCombatEffects(payload.effects || {}, loadout, payload.actor?.combatEffects || {});
      const actor = applyCombatLoadout(payload.actor || {}, loadout);
      return resolveCombatSkill({ ...payload, actor, effects, mode });
    },
    tick: (combatant = {}) => tickCombatStatuses(combatant),
    skillById: (catalog, skillId, specializationId, classId) => specializationId === 'warrior_sword_ascetic' ? findSwordAsceticSkill(skillId) : specializationId === 'warrior_iron_bastion' ? findIronBastionSkill(skillId) : specializationId === 'warrior_apocalypse_harbinger' ? findApocalypseSkill(skillId) : findSharedSkill(catalog, skillId, specializationId, classId),
    activateDomain: (actor, options = {}) => { if (options.specializationId === 'warrior_iron_bastion') return activateIronBastionDomain(actor, options); if (options.specializationId === 'warrior_apocalypse_harbinger') return activateWorldsEnd(actor); if (options.specializationId !== 'warrior_sword_ascetic') throw new Error('domain_not_implemented_for_specialization'); return activateSwordAsceticDomain(actor, options); },
    tickDomain: (actor, targets = [], options = {}) => { if (options.specializationId === 'warrior_iron_bastion') return tickIronBastionDomain(actor, targets); if (options.specializationId === 'warrior_apocalypse_harbinger') return tickWorldsEnd(actor, targets); if (options.specializationId !== 'warrior_sword_ascetic') return { actor, targets, log: [] }; return tickSwordAsceticDomain(actor, targets); },
    incomingSpecializationHit: (actor, attacker, damage, options = {}) => { if (options.specializationId === 'warrior_iron_bastion') return resolveIronBastionIncomingHit(actor,attacker,damage,{mode}); if (options.specializationId !== 'warrior_sword_ascetic') return null; const prepared = applySwordAsceticPassiveStats(actor).actor; return resolveSwordAsceticIncomingHit(prepared, attacker, damage, options); },
    specializationTurnRecovery: (actor, baseRecovery = 0, options = {}) => options.specializationId === 'warrior_iron_bastion' ? applyIronBastionTurnRecovery(actor,baseRecovery) : options.specializationId === 'warrior_sword_ascetic' ? applySwordAsceticTurnRecovery(actor, baseRecovery) : { actor, recovered: 0 },
    specializationControlDuration: (actor, duration, kind, options = {}) => options.specializationId === 'warrior_iron_bastion' ? resolveIronBastionControlDuration(actor,duration) : options.specializationId === 'warrior_sword_ascetic' ? resolveSwordAsceticControlDuration(actor, duration, kind) : duration,
    specializationHandler: (catalog, specializationId) => getSpecializationHandler(catalog, specializationId),
    specializationSkill: (catalog, specializationId, skillId, payload = {}) => {
      const loadout = collectEquipmentEffects(payload.actor || {}, payload.equipment ?? payload.actor?.equipment, payload.activePotions ?? payload.actor?.activePotions);
      const effects = normalizeCombatEffects(payload.effects || {}, loadout, payload.actor?.combatEffects || {});
      const actor = applyCombatLoadout(payload.actor || {}, loadout);
      return resolveSpecializationSkill(catalog, specializationId, skillId, { ...payload, actor, effects, mode });
    },
    loadoutEffects: (character, equipment, potions) => collectEquipmentEffects(character, equipment, potions)
  });
}

export const CombatAdapter = Object.freeze({
  solo: makeAdapter(COMBAT_MODE.SOLO),
  party: makeAdapter(COMBAT_MODE.PARTY),
  pvp: makeAdapter(COMBAT_MODE.PVP)
});

export function getCombatAdapter(mode) {
  const adapter = CombatAdapter[String(mode || '').toLowerCase()];
  if (!adapter) throw new TypeError(`Unknown ETRANOM combat mode: ${mode}`);
  return adapter;
}
