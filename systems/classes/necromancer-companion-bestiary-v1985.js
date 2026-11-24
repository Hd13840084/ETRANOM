/** ETRANOM V1985 — combined authored companion bestiary and role-aware AI. */
import { NECROMANCER_COMMON_COMPANIONS, NECROMANCER_COMPANION_ATTRIBUTE_KEYS, resolveNecromancerCompanionLevel, chooseNecromancerCompanionIntent as chooseBaseIntent } from './necromancer-common-companions-v1995.js';
import { NECROMANCER_UNCOMMON_COMPANIONS } from './necromancer-uncommon-companions-v1985.js';
export { NECROMANCER_COMPANION_ATTRIBUTE_KEYS, resolveNecromancerCompanionLevel };
export const NECROMANCER_ALL_COMPANIONS = Object.freeze([...NECROMANCER_COMMON_COMPANIONS, ...NECROMANCER_UNCOMMON_COMPANIONS]);

/** Species-authored combat priorities; the battle engine still resolves the actual effects. */
export function chooseNecromancerCompanionIntent(companionOrId, context = {}) {
  const source = typeof companionOrId === 'string'
    ? NECROMANCER_ALL_COMPANIONS.find(x => x.id === companionOrId)
    : companionOrId;
  if (!source) return null;
  const enemies = (context.enemies || []).filter(x => Number(x.hp ?? 1) > 0);
  const allies = (context.allies || []).filter(x => Number(x.hp ?? 1) > 0);
  const lowestAlly = [...allies].sort((a,b) => Number(a.hp)/Math.max(1,Number(a.maxHp)||1)-Number(b.hp)/Math.max(1,Number(b.maxHp)||1))[0];
  const weakestEnemy = [...enemies].sort((a,b) => Number(a.hp)/Math.max(1,Number(a.maxHp)||1)-Number(b.hp)/Math.max(1,Number(b.maxHp)||1))[0];
  const ready = (source.skills || []).filter(skill => Number(context.cooldowns?.[skill.id] || 0) <= 0 && (context.canUseSkill ? context.canUseSkill(skill) !== false : true));
  const rules = source.combatAI?.rules || [];
  const choose = predicate => ready.find(predicate);
  let selected = null;
  const allyRatio = lowestAlly ? Number(lowestAlly.hp)/Math.max(1,Number(lowestAlly.maxHp)||1) : 1;
  const selfRatio = Math.max(0,Math.min(1,Number(context.selfHpPct ?? 100)/100));
  if (rules.some(x => /protect_low_hp_ally|shield_team|support_team_low_hp|heal_critical_ally/.test(x)) && allyRatio <= .65)
    selected = choose(s => ['heal','shield','guard'].includes(s.type) || s.target === 'lowest_hp_ally');
  if (!selected && rules.some(x => /aoe_when_many_enemies|control_dangerous_enemy/.test(x)) && enemies.length >= 2)
    selected = choose(s => ['magic_aoe','physical_multi','aoe_debuff','dot_aoe','control'].includes(s.type));
  if (!selected && rules.some(x => /disable_fast_enemy|debuff_elite|break_high_defense|mark_high_threat|ambush_then_bind|protect_and_root/.test(x)))
    selected = choose(s => ['control','debuff','physical_debuff','magic_debuff'].includes(s.type));
  if (!selected && rules.some(x => /guard|shield|frontline|resist_magic/.test(x)) && selfRatio <= .7)
    selected = choose(s => ['guard','shield','defense'].includes(s.type));
  if (!selected && rules.some(x => /buff_team|buff_team_then_attack/.test(x)))
    selected = choose(s => s.type === 'buff');
  if (!selected && weakestEnemy)
    selected = choose(s => ['physical','magic','hybrid','physical_leech','magic_leech','physical_multi','magic_aoe'].includes(s.type));
  if (!selected) return chooseBaseIntent(source, context);
  const targetId = ['self'].includes(selected.target) ? (context.selfId ?? null)
    : selected.target === 'lowest_hp_ally' ? (lowestAlly?.id ?? context.selfId ?? null)
    : ['all_enemies','two_enemies'].includes(selected.target) ? null : (weakestEnemy?.id ?? null);
  return { action:'use_skill', skillId:selected.id, targetId, targetMode:selected.target, reason:'species_authored_priority', skill:JSON.parse(JSON.stringify(selected)) };
}
