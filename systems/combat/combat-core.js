/**
 * ETRANOM Shared Combat Core — v170 shared damage runtime.
 * Pure, side-effect-free combat primitives shared by solo/party/PvP adapters.
 * Mode tuning is supplied as data; this module never trusts client values as authority.
 */
const finite = (v, fallback = 0) => Number.isFinite(Number(v)) ? Number(v) : fallback;
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

export const COMBAT_CORE_VERSION = '170.0.0';
export const COMBAT_MODE = Object.freeze({ SOLO: 'solo', PARTY: 'party', PVP: 'pvp' });

// Shared pipeline with server-owned tuning per mode.
export const COMBAT_PROFILES = Object.freeze({
  solo: Object.freeze({ defenseScale: 1.25, minDamage: 3, guardMultiplier: 1, critMultiplier: 1.5 }),
  party: Object.freeze({ defenseScale: 1.25, minDamage: 3, guardMultiplier: 1, critMultiplier: 1.5 }),
  pvp: Object.freeze({ defenseScale: 0.35, minDamage: 1, guardMultiplier: 0.5, critMultiplier: 1.5 })
});

export function normalizeCombatStats(input = {}) {
  const maxHp = Math.max(1, finite(input.maxHp ?? input.max_hp, 1));
  const maxMp = Math.max(0, finite(input.maxMp ?? input.max_mp, 0));
  return Object.freeze({
    attack: Math.max(0, finite(input.attack ?? input.power, 0)),
    defense: Math.max(0, finite(input.defense, 0)),
    hp: clamp(finite(input.hp, maxHp), 0, maxHp), maxHp,
    mp: clamp(finite(input.mp, maxMp), 0, maxMp), maxMp,
    level: Math.max(1, Math.floor(finite(input.level, 1))),
    accuracy: clamp(finite(input.accuracy, 100), 0, 100),
    critChance: clamp(finite(input.critChance ?? input.crit_chance, 0), 0, 100)
  });
}

/**
 * Common damage pipeline. `tuning` is server-owned per-mode configuration.
 * Injected rolls make tests deterministic and allow the SQL implementation to
 * produce byte-for-byte equivalent outcomes for the same inputs.
 */
export function resolveDamage(attacker = {}, defender = {}, tuning = {}, rolls = {}) {
  const a = normalizeCombatStats(attacker);
  const d = normalizeCombatStats(defender);
  const hitChance = clamp(finite(tuning.hitChance, a.accuracy), 0, 100);
  const critChance = clamp(finite(tuning.critChance, a.critChance), 0, 100);
  const hitRoll = clamp(finite(rolls.hit, 0), 0, 99.999999);
  const critRoll = clamp(finite(rolls.crit, 99.999999), 0, 99.999999);
  const varianceRoll = clamp(finite(rolls.variance, 0), 0, 0.999999);
  if (a.hp <= 0 || d.hp <= 0) return Object.freeze({ hit: false, critical: false, damage: 0, reason: 'combatant_unavailable' });
  if (hitRoll >= hitChance) return Object.freeze({ hit: false, critical: false, damage: 0, reason: 'miss' });

  const powerScale = Math.max(0, finite(tuning.powerScale, 1));
  const flatBonus = finite(tuning.flatBonus, 0);
  const variance = Math.max(0, finite(tuning.variance, 0));
  const defenseScale = Math.max(0, finite(tuning.defenseScale, 1.25));
  const guardMultiplier = clamp(finite(tuning.guardMultiplier, 1), 0, 1);
  const minDamage = Math.max(0, finite(tuning.minDamage, 1));
  const critMultiplier = Math.max(1, finite(tuning.critMultiplier, 1.5));
  const raw = a.attack * powerScale + flatBonus + variance * varianceRoll;
  const mitigated = raw * (100 / (100 + d.defense * defenseScale));
  let damage = Math.max(minDamage, Math.floor(mitigated * guardMultiplier));
  const critical = critRoll < critChance;
  if (critical) damage = Math.floor(damage * critMultiplier);
  return Object.freeze({ hit: true, critical, damage: Math.max(0, damage), reason: null });
}

export function resolveGuard(currentGuard = {}, duration = 1) {
  return Object.freeze({ active: true, turns: Math.max(1, Math.floor(finite(duration, 1))) });
}

export function normalizeCombatIntent(mode, intent = {}) {
  const allowedModes = Object.values(COMBAT_MODE);
  if (!allowedModes.includes(mode)) throw new TypeError(`Unsupported combat mode: ${mode}`);
  const action = String(intent.action || '').trim().toLowerCase();
  const allowed = new Set(['attack', 'skill', 'item', 'guard', 'heal', 'retreat', 'pass']);
  if (!allowed.has(action)) throw new TypeError(`Unsupported combat action: ${action}`);
  const targetId = intent.targetId == null ? null : String(intent.targetId);
  const skillId = intent.skillId == null ? null : String(intent.skillId);
  if (skillId && !/^[a-z0-9_]{1,48}$/i.test(skillId)) throw new TypeError('Invalid skill identifier');
  return Object.freeze({ mode, action, targetId, skillId });
}
