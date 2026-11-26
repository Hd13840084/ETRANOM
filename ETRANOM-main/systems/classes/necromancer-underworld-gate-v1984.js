/** ETRANOM V1984 — Underworld Gate, five summon seals and companion skill effects. */
export const NECROMANCER_GATE_ITEM_ID = 'summon_seal_1';
export const NECROMANCER_SUMMON_SEALS = Object.freeze([
    { id: 'summon_seal_1', name: 'مهر احضار نوع اول', rankWeights: { common: 75, uncommon: 20, rare: 5 }, description: 'برای موجودات معمولی تا نادر.' },
    { id: 'summon_seal_2', name: 'مهر احضار نوع دوم', rankWeights: { common: 50, uncommon: 30, rare: 15, epic: 5 }, description: 'شانس بیشتر برای رده‌های غیرمعمول و بالاتر.' },
    { id: 'summon_seal_3', name: 'مهر احضار نوع سوم', rankWeights: { common: 20, uncommon: 35, rare: 30, epic: 12, legendary: 3 }, description: 'مناسب جست‌وجوی موجودات نادر و حماسی.' },
    { id: 'summon_seal_4', name: 'مهر احضار نوع چهارم', rankWeights: { uncommon: 15, rare: 35, epic: 30, legendary: 17, mythic: 3 }, description: 'تمرکز بر موجودات نادر تا اسطوره‌ای.' },
    { id: 'summon_seal_5', name: 'مهر احضار نوع پنجم', rankWeights: { rare: 10, epic: 30, legendary: 35, mythic: 20, divine: 5 }, description: 'مهر بسیار کمیاب با امکان احضار موجود الهی.' }
]);
const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
export function unlockUnderworldGate(progress = {}, inventory = []) {
    const p = { ...progress };
    if (p.underworldGateUnlocked)
        return { ok: true, alreadyUnlocked: true, progress: p, inventory };
    const item = (inventory || []).find(x => (x === null || x === void 0 ? void 0 : x.id) === NECROMANCER_GATE_ITEM_ID && Number(x.qty || 1) > 0);
    if (!item)
        return { ok: false, reason: 'gate_seal_missing', progress: p, inventory };
    const next = inventory.map(x => x === item ? { ...x, qty: Math.max(0, Number(x.qty || 1) - 1) } : x).filter(x => Number(x.qty || 0) > 0);
    p.underworldGateUnlocked = true;
    p.underworldGateUnlockedAt = Date.now();
    return { ok: true, progress: p, inventory: next, consumedItemId: NECROMANCER_GATE_ITEM_ID };
}
export function rollCompanionRank(sealId, roll = 0) {
    const seal = NECROMANCER_SUMMON_SEALS.find(x => x.id === sealId);
    if (!seal)
        return null;
    const value = clamp(Number(roll) || 0, 0, 99.9999);
    let cursor = 0;
    for (const [rank, weight] of Object.entries(seal.rankWeights)) {
        cursor += weight;
        if (value < cursor)
            return rank;
    }
    return Object.keys(seal.rankWeights).at(-1) || null;
}
function makeId() { return `companion_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`; }
export function summonCompanionWithSeal({ progress = {}, inventory = [], sealId, speciesPool = [], rankRoll = Math.random() * 100, speciesRoll = Math.random() } = {}) {
    const p = { ...progress, companions: Array.isArray(progress.companions) ? progress.companions : (Array.isArray(progress.legion) ? progress.legion : []) };
    if (!p.underworldGateUnlocked)
        return { ok: false, reason: 'gate_locked', progress: p, inventory };
    const seal = NECROMANCER_SUMMON_SEALS.find(x => x.id === sealId);
    if (!seal)
        return { ok: false, reason: 'invalid_seal', progress: p, inventory };
    const item = (inventory || []).find(x => (x === null || x === void 0 ? void 0 : x.id) === sealId && Number(x.qty || 0) > 0);
    if (!item)
        return { ok: false, reason: 'seal_missing', progress: p, inventory };
    const rank = rollCompanionRank(sealId, rankRoll), pool = (speciesPool || []).filter(x => x.rank === rank);
    // Never consume a seal when the matching rank's bestiary has not been authored yet.
    if (!pool.length)
        return { ok: false, reason: 'rank_content_unavailable', rank, progress: p, inventory, sealPreserved: true };
    const species = pool[Math.min(pool.length - 1, Math.floor(clamp(Number(speciesRoll) || 0, 0, .999999) * pool.length))];
    const stats = { power: 0, speed: 0, endurance: 0, vitality: 0, intellect: 0, perception: 0, luck: 0, faith: 0, ...species.stats };
    const maxHp = Math.max(1, Math.floor(40 + stats.vitality * 12 + stats.endurance * 5));
    const id = makeId();
    const member = { id, instanceId: id, companionId: species.id, speciesId: species.id, name: species.name, nameEn: species.nameEn, rank, level: 1, xp: 0, hp: maxHp, maxHp, baseMaxHp: maxHp, attack: Math.max(1, Math.floor(stats.power * 4 + stats.intellect * 1.5)), baseAttack: Math.max(1, Math.floor(stats.power * 4 + stats.intellect * 1.5)), defense: Math.max(0, Math.floor(stats.endurance * 1.5 + stats.faith * .5)), baseDefense: Math.max(0, Math.floor(stats.endurance * 1.5 + stats.faith * .5)), stats, skills: species.skills, portrait: species.portrait, permanent: true, incapacitated: false, combatCooldowns: {} };
    p.companions = [...p.companions, member];
    p.legion = p.companions;
    const nextInventory = inventory.map(x => x === item ? { ...x, qty: Math.max(0, Number(x.qty || 0) - 1) } : x).filter(x => Number(x.qty || 0) > 0);
    return { ok: true, progress: p, inventory: nextInventory, member, rank, sealId };
}
const living = (arr) => (arr || []).filter(x => Number(x.hp) > 0);
export function resolveCompanionSkillV1984({ member, skill, combat, allies = [], turn = 1, targetId = null } = {}) {
    var _a, _b;
    if (!member || !skill || !combat)
        return { ok: false, reason: 'invalid_input', damage: 0, healing: 0, affected: [] };
    const enemies = living(combat.enemies), team = living(allies), mode = skill.target || 'single';
    const chosenId = targetId !== null && targetId !== void 0 ? targetId : combat.targetId;
    let targets = [];
    if (mode === 'all_enemies')
        targets = enemies;
    else if (mode === 'two_enemies')
        targets = enemies.slice().sort((a, b) => Number(a.hp) - Number(b.hp)).slice(0, 2);
    else if (mode === 'single')
        targets = [enemies.find(x => String(x.encounterId) === String(chosenId)) || enemies[0]].filter(Boolean);
    const stats = member.stats || {}, pct = Math.max(0, Number(skill.powerPct) || 0);
    const magic = /magic|hybrid|spirit/.test(skill.type || '');
    const base = magic ? (Number(stats.intellect || 0) * 3.2 + Number(stats.faith || 0) * 1.4) : (Number(stats.power || 0) * 4.2 + Number(stats.perception || 0) * .5);
    const scale = Math.max(.1, 1 + (Number(member.level || 1) - 1) * .018);
    let damage = 0, healing = 0;
    const affected = [];
    const duration = Math.max(1, Number(skill.durationTurns) || 1);
    const addStatus = (enemy, type) => { enemy.companionStatusEffects = enemy.companionStatusEffects || []; enemy.companionStatusEffects.push({ id: skill.id, type, turns: duration, attackReductionPct: Number(skill.attackReductionPct) || 0, defenseReductionPct: Number(skill.defenseReductionPct) || 0, speedReductionPct: Number(skill.speedReductionPct) || 0, dotDamage: Math.max(0, Number(skill.dotDamage) || Math.floor(base * .16)), silenced: type === 'silence' }); };
    if (mode === 'lowest_hp_ally' || mode === 'all_allies') {
        const recipients = (mode === 'all_allies' ? team : [...team].sort((a, b) => Number(a.hp) / Math.max(1, Number(a.maxHp)) - Number(b.hp) / Math.max(1, Number(b.maxHp))).slice(0, 1));
        for (const ally of recipients) {
            if (skill.type === 'heal') {
                const amount = Math.max(1, Math.floor(Number(ally.maxHp || 1) * Math.max(1, Number(skill.healPct) || 18) / 100));
                const before = Number(ally.hp) || 0;
                ally.hp = Math.min(Number(ally.maxHp) || before, before + amount);
                healing += ally.hp - before;
            }
            else {
                ally.companionEffects = ally.companionEffects || {};
                if (skill.type === 'shield' || Number(skill.shieldPct) > 0)
                    ally.companionEffects.shield = { value: Math.max(1, Math.floor(Number(ally.maxHp || 1) * (Number(skill.shieldPct) || 15) / 100)), expiresAt: turn + duration };
                if (skill.type === 'guard' || Number(skill.guardPct) > 0)
                    ally.companionEffects.guard = { pct: clamp(Number(skill.guardPct) || 25, 1, 80), expiresAt: turn + duration };
            }
            affected.push(ally.id || ally.name);
        }
    }
    if (mode === 'self' || ['guard', 'shield', 'buff', 'defense'].includes(skill.type)) {
        member.companionEffects = member.companionEffects || {};
        if (skill.type === 'guard' || skill.guardPct)
            member.companionEffects.guard = { pct: clamp(Number(skill.guardPct) || 20, 1, 80), expiresAt: turn + duration };
        if (skill.type === 'shield' || skill.shieldPct)
            member.companionEffects.shield = { value: Math.max(1, Math.floor(Number(member.maxHp || 1) * (Number(skill.shieldPct) || 15) / 100)), expiresAt: turn + duration };
        if (skill.type === 'buff' || skill.attackPct)
            member.companionEffects.attack = { pct: clamp(Number(skill.attackPct) || 15, 1, 100), expiresAt: turn + duration };
    }
    const statusTypes = ['debuff', 'control', 'silence', 'physical_debuff', 'aoe_debuff', 'magic_debuff', 'dot', 'dot_aoe'];
    for (const enemy of targets) {
        if (statusTypes.includes(skill.type)) {
            addStatus(enemy, skill.type);
            if (skill.type === 'control') {
                enemy.controlledByPlayer = true;
                enemy.necromancerControlledTurns = Math.max(Number(enemy.necromancerControlledTurns) || 0, duration);
            }
            if (skill.type === 'silence')
                enemy.necromancerDebuff = { ...(enemy.necromancerDebuff || {}), skillReductionPct: 100, turns: duration };
            if (Number(skill.attackReductionPct) > 0) {
                enemy.attackReductionPct = Math.max(Number(enemy.attackReductionPct) || 0, Number(skill.attackReductionPct));
                enemy.companionAttackReductionTurns = Math.max(Number(enemy.companionAttackReductionTurns) || 0, duration + 1);
            }
            if (Number(skill.defenseReductionPct) > 0)
                enemy.necromancerLegionDefenseBreak = { turns: duration, pct: Math.max(Number((_a = enemy.necromancerLegionDefenseBreak) === null || _a === void 0 ? void 0 : _a.pct) || 0, Number(skill.defenseReductionPct)) };
            if (Number(skill.speedReductionPct) > 0)
                enemy.companionSpeedReduction = { turns: duration, pct: Math.max(Number((_b = enemy.companionSpeedReduction) === null || _b === void 0 ? void 0 : _b.pct) || 0, Number(skill.speedReductionPct)) };
            if (skill.type === 'dot' || skill.type === 'dot_aoe')
                enemy.necromancerBoneWound = { turns: duration, damagePerTick: Math.max(1, Math.floor(Number(skill.dotDamage) || base * .16)) };
        }
        const damagingTypes = ['physical', 'magic', 'spirit', 'hybrid', 'physical_leech', 'magic_leech', 'physical_debuff', 'magic_debuff', 'magic_aoe', 'physical_multi', 'dot', 'dot_aoe', 'aoe_debuff'];
        if (pct > 0 && damagingTypes.includes(skill.type)) {
            const raw = Math.max(1, Math.floor(base * (pct / 100) * scale));
            const defense = Math.max(0, Number(enemy.enemyDefense || enemy.defense || 0));
            const dealt = Math.min(Number(enemy.hp) || 0, Math.max(1, Math.floor(raw * 100 / (100 + defense * 1.25))));
            enemy.hp = Math.max(0, Number(enemy.hp) - dealt);
            damage += dealt;
            affected.push(enemy.encounterId || enemy.enemy);
            if (/leech/.test(skill.type)) {
                const heal = Math.floor(dealt * .12);
                member.hp = Math.min(Number(member.maxHp) || member.hp, Number(member.hp || 0) + heal);
                healing += heal;
            }
        }
    }
    return { ok: true, damage, healing, affected, skillId: skill.id };
}
