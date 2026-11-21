/* Shared deterministic combat mechanics for all Wizard specializations. */
export const WIZARD_RUNTIME_VERSION = 1;
export function normalizeWizardCombatProgress(progress = {}) {
  const p = { skillRanks: {}, skillCooldowns: {}, talentRanks: {}, unlockedTalents: [], buffs: {}, statuses: {}, domainStage: 0, domainUsesThisBattle: 0, ascendedSkillUsedThisDomain: false, ...progress };
  p.skillRanks = { ...(p.skillRanks || {}) };
  p.skillCooldowns = { ...(p.skillCooldowns || {}) };
  p.talentRanks = { ...(p.talentRanks || {}) };
  p.unlockedTalents = [...new Set(Array.isArray(p.unlockedTalents) ? p.unlockedTalents : [])];
  p.buffs = { ...(p.buffs || {}) }; p.statuses = { ...(p.statuses || {}) };
  return p;
}
export function resolveSkillAtRank(skill, rank = 1) {
  const out = structuredCloneSafe(skill); if (!out) return out;
  const upgrades = Array.isArray(skill?.upgrades) ? skill.upgrades : [];
  const core = new Set(['damagePct','initialDamagePct','powerPct','shieldPct','healPct','drainPct','summonDamagePct','secondWavePct','reflectPct','dotPct','magicPowerPct','attackReductionPct','defenseReductionPct','enemyAttackReductionPct','durationTurns','critBonus','lifeStealPct','recruitChancePct']);
  for (let i = 0; i < Math.max(0, Math.min(6, Number(rank || 1) - 1)); i++) {
    const u = upgrades[i]; if (!u) continue;
    let explicit = false;
    for (const [k, v] of Object.entries(u)) if (!['description','effect','bonus','rank','pointsRequired'].includes(k) && typeof v === 'number') { out[k] = v; if (core.has(k) || !['accuracyBonus','critBonus','extraChargeChance'].includes(k)) explicit = true; }
    // Several specializations describe rank scaling in prose instead of numeric fields.
    if (!explicit) {
      const text = [u.effect,u.description,u.bonus].filter(Boolean).join(' ');
      const normalized = text.replace(/[۰-۹]/g, d => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)));
      const m = normalized.match(/(?:شدت اثر اصلی|ضریب اثر اصلی|اثر اصلی)[^0-9]{0,30}(\d{2,3})\s*٪|(?:effect|power)[^0-9]{0,24}(\d{2,3})\s*%/i);
      const pct = m ? Number(m[1] || m[2]) : 0;
      if (pct >= 100 && pct <= 250) { out.rankEffectMultiplierPct = pct; for (const key of core) if (Number.isFinite(Number(out[key]))) out[key] = Math.floor(Number(out[key]) * pct / 100); }
      const reduction = normalized.match(/(?:کاهش|کمتر|less|reduction)[^0-9]{0,18}(\d{1,2})\s*٪?[^.]{0,24}(?:هزینه مانا|mana cost)|(?:mana cost|هزینه مانا)[^0-9]{0,20}(\d{1,2})\s*٪?[^.]{0,18}(?:کمتر|کاهش|less|reduction)/i);
      if (reduction) { const base = Number(out.manaPct ?? out.manaCostPercent ?? 0); const amount = Number(reduction[1] || reduction[2] || 0); if (base > 0 && amount > 0) { out.manaCostPercent = Math.max(1, base - amount); out.manaPct = out.manaCostPercent; } }
    }
  }
  return out;
}
function structuredCloneSafe(v) { return v == null ? v : JSON.parse(JSON.stringify(v)); }
const EXPLICIT_TALENT_EFFECTS = {
  // Warlock: each talent has a distinct, directly consumed combat/economy field.
  scribe_of_oaths:{pactCreditGain:1}, fine_print:{signatureDurationTurns:1}, interest_bearing:{pactDamagePerTwoCreditsPct:3,pactDamageCapPct:15}, binding_clause:{forbiddenSignatureReflectPct:4}, early_termination:{pactCreditGain:1}, shared_liability:{hostageReflectPct:5}, sovereign_signature:{contractSkillDamagePct:6}, living_contract:{battleStartPactCredit:1}, thin_reality:{voidManaCostReductionPct:1}, suspended_benefit:{suspendedBuffPenaltyPct:10}, nameless_verdict:{judgmentDamagePct:8}, null_signature:{trueNameDefenseReductionPct:5}, void_residue:{voidKillManaRestorePct:3}, broken_axiom:{trueNameDebuffTurns:1}, unwritten_law:{momentTheftNextDamagePct:8}, absolute_absence:{earlyBuffCollapse:true}, measured_sacrifice:{sacrificeHpCostReductionPct:1}, red_accounting:{sacrificeHpRefundPct:35}, hostage_interest:{hostageHealBonusPct:5}, crimson_margin:{lowHpMagicDamagePct:8}, last_drop:{sacrificeHpFloorPct:5}, blood_transfusion:{hungerHealBonusPct:10}, predatory_vitality:{markedDamageLifeStealPct:3}, red_covenant:{hpCostSkillDamagePct:8}, hunger_whisper:{hungerReservoirCapacityPct:15}, patient_devourer:{hungerSummonDurationTurns:1}, borrowed_instinct:{summonOpeningAccuracyPct:5,summonOpeningDefensePct:5}, demonic_heritage:{annihilationManifestDamagePct:8}, throne_of_ashes:{exhaustionReductionTurns:1}, ancient_tribute:{ancientTributeMagicPowerPct:1,ancientTributeMagicPowerCapPct:5}, untrusted_alliance:{summonDamagePct:10,summonManaCostPct:2}, heir_apotheosis:{fullHungerNextSkillDamagePct:12},
  // Necromancer: per-rank values are explicit and never change legion capacity.
  death_sovereignty_01:{deathClawDamagePct:4}, death_sovereignty_02:{deathWoundDamagePct:5}, death_sovereignty_03:{markedEnemyDamagePct:3}, death_sovereignty_04:{darkSkillDamagePct:2}, death_sovereignty_05:{woundedKillSoulChancePct:5}, death_sovereignty_06:{necromancerDebuffStrengthPct:1}, death_sovereignty_07:{darkResistancePct:2}, death_sovereignty_08:{eternalSovereignStrengthPct:2}, undead_legion_01:{legionRecruitChancePct:2}, undead_legion_02:{legionDefensePct:3}, undead_legion_03:{legionMaxHpPct:3}, undead_legion_04:{legionDamagePct:3}, undead_legion_05:{legionCritChancePct:1}, undead_legion_06:{legionAbilityStrengthPct:3}, undead_legion_07:{legionControlResistancePct:3}, undead_legion_08:{legionPostBattleRecoveryPct:3}, spirit_magic_01:{soulCapacityAtRank3:1,soulCapacityAtRank5:1}, spirit_magic_02:{soulFeedingRecoveryPct:4}, spirit_magic_03:{lifeStealPct:2}, spirit_magic_04:{legionEnergyTransferPct:3}, spirit_magic_05:{deathMemoryStrengthPct:3}, spirit_magic_06:{soulChainStrengthPct:3}, spirit_magic_07:{willDominationChancePct:2}, spirit_magic_08:{soulSilenceStrengthPct:1}, reign_resurrection_01:{reviveHealthPct:3}, reign_resurrection_02:{reviveSoulCostReduction:0.2}, reign_resurrection_03:{boneBlossomDefensePct:3}, reign_resurrection_04:{kingdomBonesDamagePct:3}, reign_resurrection_05:{soulAssemblyCommandPct:3}, reign_resurrection_06:{eternalSovereignDurationAtRank5:1}, reign_resurrection_07:{legionRoyalAbilityPct:3}, reign_resurrection_08:{eternalSovereignFinisherPct:3}
};
export function collectTalentEffects(data, progress) {
  const p = normalizeWizardCombatProgress(progress), effects = {};
  const normalizeTalent = (t, branchId='') => {
    if (Array.isArray(t)) return { id:t[0], name:t[1], description:t[2], effects:t[3]||{}, branchId };
    if (typeof t === 'string') return { id:t, branchId };
    return { ...(t||{}), branchId:t?.branchId||branchId };
  };
  const nested = (data?.talentBranches || []).flatMap(b => (b.talents || b.talentIds || []).map(t => normalizeTalent(t,b.id)));
  const flat = (data?.talents || []).map(t => normalizeTalent(t));
  const all = [...new Map([...nested,...flat].filter(t=>t.id).map(t=>[t.id,t])).values()];
  for (const t of all) {
    const rank = Math.max(0, Number(p.talentRanks?.[t.id]) || (p.unlockedTalents.includes(t.id) ? 1 : 0));
    if (!rank) continue;
    const src = Object.keys(t.effects || t.effectValues || {}).length ? (t.effects || t.effectValues) : (EXPLICIT_TALENT_EFFECTS[t.id] || {});
    for (const [key,value] of Object.entries(src)) {
      if (typeof value === 'number' && Number.isFinite(value)) {
        let amount=value*rank;
        if (key==='soulCapacityAtRank3' || key==='soulCapacityAtRank5') amount=rank >= (key.endsWith('3')?3:5) ? value : 0;
        if (key==='eternalSovereignDurationAtRank5') amount=rank>=5?value:0;
        effects[key]=typeof value==='boolean' ? value : (effects[key]||0)+amount;
      } else if (typeof value==='boolean' && value) effects[key]=true;
    }
  }
  return effects;
}
/** Apply specialization-specific passive bonuses to a skill without mutating its catalog entry. */
export function applyWizardTalentEffectsToSkill(skill, effects = {}, specialization = '') {
  const out = structuredCloneSafe(skill) || {};
  const e = effects || {};
  const add = (field, ...keys) => { const n = keys.reduce((v,k)=>v+(Number(e[k])||0),0); if (n) out[field] = (Number(out[field])||0) + n; };
  const spec = String(specialization).toLowerCase();
  if (spec.includes('necromancer') || spec.includes('نکرومنسر')) {
    add('durationTurns','trueNameDebuffTurns');
  }
  if (out.type==='summon_resource' && Number(e.summonManaCostPct)>0) out.manaPct=Math.max(0,Number(out.manaPct??out.manaCostPercent??0)-Number(e.summonManaCostPct));
  if (Number(e.cooldownReductionTurns) > 0) out.cooldownTurns = Math.max(0,(Number(out.cooldownTurns)||0)-Number(e.cooldownReductionTurns));
  if (Number(e.manaCostReductionPct) > 0) out.manaPct = Math.max(0,(Number(out.manaPct ?? out.manaCostPercent)||0)-Number(e.manaCostReductionPct));
  return out;
}
export function calculateWizardManaCost(maxMana, basePercent, effects = {}) {
  const max = Math.max(0, Number(maxMana)||0), pct = Math.max(0, Number(basePercent)||0);
  const discount = Math.min(50, Math.max(0, Number(effects.manaCostReductionPct)||0) + Number(effects.voidManaCostReductionPct||0));
  return pct === 0 ? 0 : Math.max(1, Math.ceil(max*pct/100*(1-discount/100)));
}
export function calculateWizardDamage(basePower, damagePercent, enemyDefense = 0, effects = {}) {
  const power = Math.max(0, Number(basePower)||0), pct = Math.max(0, Number(damagePercent)||0);
  const bonus = Math.max(-90, Number(effects.damagePct)||0);
  const defense = Math.max(0, Number(enemyDefense)||0);
  return Math.max(0, Math.floor(power*pct/100*(1+bonus/100)*100/(100+defense*1.25)));
}
export function resolveNecromancerRecruitChance(progress, effects = {}) {
  const rank = Math.max(1, Number(progress?.skillRanks?.legion)||1);
  return Math.min(75, 35 + Math.max(0,rank-1)*3 + Math.max(0,Number(effects.legionRecruitChancePct)||0));
}
export function normalizeLegionCapacity(progress) {
  if (!progress || typeof progress !== 'object') return [];
  return Array.isArray(progress.legion) ? progress.legion.slice(0,10) : [];
}
export function tickWizardCombatState(combat) {
  if (!combat) return { expired: [], damage: 0 };
  const expired = []; let damage = 0;
  for (const e of combat.enemies || []) {
    if (e.hp <= 0) continue;
    for (const key of ['necromancerWound','necromancerDebuff','warlockDebuff','wizardStatus']) {
      const s = e[key]; if (!s || !(Number(s.turns) > 0)) continue;
      if (key === 'necromancerWound') { const d = Math.max(1, Math.floor((Number(e.maxHp) || 1) * (Number(s.pct) || 0) / 100)); e.hp = Math.max(0, e.hp - d); damage += d; } else if (key === 'wizardStatus' && Number(s.dotPct)>0) { const d=Math.max(1,Math.floor((Number(e.maxHp)||1)*Number(s.dotPct)/100));e.hp=Math.max(0,e.hp-d);damage+=d; }
      s.turns -= 1; if (s.turns <= 0) { delete e[key]; expired.push(key); }
    }
  }
  for (const e of combat.enemies || []) {
    if (Number(e.necromancerControlledTurns) > 0) { const resist=Math.min(80,Math.max(0,Number(combat.wizardTalentEffects?.legionControlResistancePct)||0));e.necromancerControlledTurns = Math.max(0,Number(e.necromancerControlledTurns)-1+Math.floor(resist/50)); if (e.necromancerControlledTurns <= 0) { e.controlledByPlayer = false; delete e.necromancerControlledTurns; } }
    if (e.warlockHostage && Number(e.warlockHostage.turns) > 0) { e.warlockHostage.turns -= 1; if (e.warlockHostage.turns <= 0) { const burst=Math.max(0,Number(e.warlockHostage.storedDamage)||0); if (burst && e.hp>0) { e.hp=Math.max(0,e.hp-Math.floor(burst*.7)); damage += Math.floor(burst*.7); } delete e.warlockHostage; } }
    if (e.warlockDebuff && Number(e.warlockDebuff.turns) > 0) { e.warlockDebuff.turns -= 1; if (e.warlockDebuff.turns <= 0) delete e.warlockDebuff; }
  }
  if (combat.warlockHunger && Number(combat.warlockHunger.turns) > 0) { combat.warlockHunger.turns -= 1; if (combat.warlockHunger.turns <= 0) delete combat.warlockHunger; }
  if (Number(combat.warlockCourtTurns)>0) { combat.warlockCourtTurns--; if (combat.warlockCourtTurns<=0) { delete combat.warlockCourtTurns; delete combat.warlockCourtMode; } }
  if (combat.necromancerSoulGuard && Number(combat.necromancerSoulGuard.turns)>0) { combat.necromancerSoulGuard.turns--; if (combat.necromancerSoulGuard.turns<=0) delete combat.necromancerSoulGuard; }
  if (Number(combat.necromancerSovereignTurns)>0) { combat.necromancerSovereignTurns--; if (combat.necromancerSovereignTurns<=0) { const pct=Math.max(0,Number(combat.wizardTalentEffects?.eternalSovereignFinisherPct)||0); if(pct) for(const e of combat.enemies||[]) if(e.hp>0){const d=Math.max(1,Math.floor((Number(e.maxHp)||1)*pct/100));e.hp=Math.max(0,e.hp-d);damage+=d;} delete combat.necromancerSovereignTurns; } }
  for (const key of Object.keys(combat.wizardBuffs || {})) {
    const b = combat.wizardBuffs[key]; if (b && Number(b.turns) > 0) { b.turns--; if (b.turns <= 0) delete combat.wizardBuffs[key]; }
  }
  return { expired, damage };
}
export function runLegionActions(combat, character, progress, powerScale = 1) {
  if (!combat || !Array.isArray(progress?.legion)) return [];
  if (!(combat.enemies || []).some(e => e.hp > 0)) return [];
  const reports = [];
  const selected = Array.isArray(combat.summonedLegionIds) && combat.summonedLegionIds.length ? new Set(combat.summonedLegionIds.map(String)) : new Set((progress.activeLegionIds || []).slice(0,3).map(String));
  if (!selected.size) return reports;
  for (const member of progress.legion.slice(0, 10)) {
    const memberId=String(member.instanceId||member.id||''); if(!memberId||!selected.has(memberId)) continue;
    if (member.incapacitated || member.hp === 0) continue;
    // Never reduce a possibly empty target list without an initial value.
    // Combat transitions can temporarily leave the shared encounter with no
    // living targets while the UI is rebuilding; in that state the legion must
    // simply skip its action instead of aborting the whole navigation/render.
    const enemies = (Array.isArray(combat.enemies) ? combat.enemies : []).filter(e => Number(e?.hp) > 0);
    if (!enemies.length) break;
    let target = enemies[0] || null;
    for (let i = 1; i < enemies.length; i++) {
      if (Number(enemies[i]?.hp) < Number(target?.hp)) target = enemies[i];
    }
    if (!target) break;
    const base = Math.max(1, Number(member.attack) || Math.floor((Number(character?.level) || 1) * 2));
    const talent = combat.wizardTalentEffects || {};
    const buff = (Number(combat.necromancerLegionBuff?.damagePct) || 0) + (Number(talent.legionDamagePct) || 0) + (Number(talent.legionRoyalAbilityPct) || 0) + (Number(talent.legionAbilityStrengthPct) || 0);
    let damage = Math.max(1, Math.floor(base * powerScale * (1 + buff / 100)));
    const critChance=Math.min(50,Math.max(0,Number(talent.legionCritChancePct)||0));if(critChance&&Math.random()*100<critChance)damage=Math.floor(damage*1.5);
    target.hp = Math.max(0, Number(target.hp) - damage);
    reports.push({ member: member.name || 'عضو لژیون', target: target.enemy, damage, critical: damage>base*powerScale*(1+buff/100) });
  }
  return reports;
}
export function resolveNecromancerRevive(combat, character, maxHp) {
  if (!combat?.necromancerReviveArmed || combat.necromancerReviveConsumed || Number(character?.hp) > 0) return false;
  combat.necromancerReviveArmed = false; combat.necromancerReviveConsumed = true;
  character.hp = Math.max(1, Math.floor(Math.max(1, Number(maxHp) || 1) * 0.3));
  return true;
}
export function completeWizardDomainTrial(progress, trialStage) {
  const p = normalizeWizardCombatProgress(progress); const stage = Math.max(0, Math.min(3, Number(trialStage) || 0));
  p.domainQuest = { ...(p.domainQuest || {}), completedStages: [...new Set([...(p.domainQuest?.completedStages || []), stage])] };
  if ([0,1,2,3].every(x => p.domainQuest.completedStages.includes(x))) { p.domainQuest.complete = true; p.domainStage = 4; }
  return p;
}
export function resetWizardBattleProgress(progress) {
  const p = normalizeWizardCombatProgress(progress); p.domainUsesThisBattle = 0; p.ascendedSkillUsedThisDomain = false; p.skillCooldowns = {}; p.buffs = {}; p.statuses = {}; return p;
}
