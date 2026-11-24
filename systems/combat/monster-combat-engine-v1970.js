/** ETRANOM V1970 — shared monster combat profile and skill scheduler.
 * Authored encounter values remain authoritative; this module adds validation,
 * canonical eight-stat projection, and per-monster skill cooldown scheduling.
 */
export const MONSTER_STAT_KEYS_V1970 = Object.freeze([
  'power','speed','endurance','vitality','intellect','perception','luck','faith'
]);
const finite = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const object = value => value && typeof value === 'object' && !Array.isArray(value) ? value : {};

export function normalizeMonsterProfileV1970(monster = {}) {
  const source = object(monster.stats);
  const stats = Object.fromEntries(MONSTER_STAT_KEYS_V1970.map(key => [key, Math.max(0, finite(source[key], 0))]));
  const hp = Math.max(1, finite(source.hp, finite(monster.hp, 1)));
  const mp = Math.max(0, finite(source.mp, finite(monster.mp, 0)));
  const attack = Math.max(1, finite(source.attack, finite(monster.attack, stats.power || 1)));
  const defense = Math.max(0, finite(source.defense, finite(monster.defense, stats.endurance)));
  const accuracy = clamp(finite(source.accuracy, finite(monster.accuracy, 80)), 1, 100);
  return {
    id: String(monster.id || monster.encounterId || ''),
    level: Math.max(1, Math.floor(finite(monster.level, 1))),
    kind: String(monster.kind || 'normal'),
    quality: String(monster.quality || 'معمولی'),
    stats,
    resources: { hp, maxHp: hp, mp, maxMp: mp },
    combat: { attack, defense, accuracy, speed: stats.speed, hasSkills: Array.isArray(monster.skills) && monster.skills.length > 0 }
  };
}

export function validateMonsterSkillLinksV1970(monsters = [], skills = []) {
  const skillIds = new Set(skills.map(skill => String(skill?.id || '')).filter(Boolean));
  const errors = [];
  for (const monster of monsters) {
    for (const skillId of Array.isArray(monster?.skills) ? monster.skills : []) {
      if (!skillIds.has(String(skillId))) errors.push({ monsterId: monster?.id || null, skillId: String(skillId) });
    }
  }
  return { valid: errors.length === 0, errors };
}

/** Selects one ready skill. The caller supplies its legacy probability gate. */
export function chooseMonsterSkillV1970(monster, skillMap, { random = Math.random, chance = 1, minimumMp = 1 } = {}) {
  if (!monster || finite(monster.hp, 1) <= 0 || random() >= clamp(finite(chance, 1), 0, 1)) return null;
  const skills = Array.isArray(monster.skills) ? monster.skills : [];
  if (!skills.length) return null;
  const map = skillMap instanceof Map ? skillMap : new Map(Object.entries(object(skillMap)));
  const cooldowns = object(monster.skillCooldowns);
  const ready = skills.map(id => ({ id: String(id), definition: map.get(String(id)) }))
    .filter(entry => entry.definition && finite(cooldowns[entry.id], 0) <= 0)
    .filter(entry => finite(monster.mp, 0) >= Math.max(finite(entry.definition.effects?.mp_cost, minimumMp), 0));
  if (!ready.length) return null;
  return ready[Math.floor(random() * ready.length)];
}

export function commitMonsterSkillV1970(monster, skillId, definition) {
  if (!monster || !skillId || !definition) return false;
  monster.skillCooldowns = { ...object(monster.skillCooldowns) };
  const rounds = Math.max(0, Math.floor(finite(definition.effects?.cooldown_rounds, 0)));
  if (rounds > 0) monster.skillCooldowns[String(skillId)] = rounds + 1;
  return true;
}

export function tickMonsterSkillCooldownsV1970(monster) {
  if (!monster || !monster.skillCooldowns) return monster;
  const next = {};
  for (const [id, value] of Object.entries(object(monster.skillCooldowns))) {
    const remaining = Math.max(0, Math.floor(finite(value, 0)) - 1);
    if (remaining > 0) next[id] = remaining;
  }
  monster.skillCooldowns = next;
  return monster;
}

export function createMonsterCombatEngineV1970({ skillMap = {} } = {}) {
  const map = skillMap instanceof Map ? skillMap : new Map(Object.entries(object(skillMap)));
  return Object.freeze({
    version: '1970.0.0',
    normalize: normalizeMonsterProfileV1970,
    validateLinks: monsters => validateMonsterSkillLinksV1970(monsters, [...map.values()]),
    chooseSkill: (monster, options = {}) => chooseMonsterSkillV1970(monster, map, options),
    commitSkill: commitMonsterSkillV1970,
    tickCooldowns: tickMonsterSkillCooldownsV1970
  });
}
