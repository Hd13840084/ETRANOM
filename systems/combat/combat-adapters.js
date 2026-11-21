/** Compatibility boundary for the three existing execution paths.
 * All damage math is delegated to the shared pure core. Persistence, turn
 * ownership, rewards and authorization remain in each authoritative engine.
 */
import {
  normalizeCombatIntent, normalizeCombatStats, resolveDamage,
  COMBAT_MODE, COMBAT_PROFILES
} from './combat-core.js';
import { resolveCombatSkill, collectEquipmentEffects, findSharedSkill, normalizeCombatEffects, applyCombatLoadout, tickCombatStatuses } from './shared-skill-runtime.js';
import { getSpecializationHandler, resolveSpecializationSkill } from './specialization-skill-bridge.js';

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
    skillById: (catalog, skillId, specializationId, classId) => findSharedSkill(catalog, skillId, specializationId, classId),
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
