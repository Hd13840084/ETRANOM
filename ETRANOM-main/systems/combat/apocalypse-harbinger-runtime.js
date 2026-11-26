/** Apocalypse Harbinger deterministic solo-combat runtime. */
import { resolveCanonicalSkillDamage } from './character-stat-core.js?v=1901&build=2081';
import DATA from '../../content/classes/warrior_apocalypse_harbinger_v1.json' with { type: 'json' };
const clone = v => JSON.parse(JSON.stringify(v !== null && v !== void 0 ? v : {}));
const num = (v, d = 0) => Number.isFinite(Number(v)) ? Number(v) : d;
const clamp = (v, a, b) => Math.max(a, Math.min(b, num(v)));
const SKILLS = new Map(DATA.skills.map(s => [s.id, s]));
const ASC = new Map(DATA.ascendedSkills.map(s => [s.id, s]));
const TALENTS = DATA.talentBranches.flatMap(b => b.talents);
export const APOCALYPSE_HARBINGER_DATA = DATA;
export function createApocalypseProgress() { return { skillRanks: {}, unlockedTalents: [], talentRanks: {}, domain: { active: false, stage: 0, turnsRemaining: 0, usedThisBattle: false, ascendedUsed: false, ascendedSkillId: null, cooldownBattles: 0 }, cooldowns: {}, statuses: {}, buffs: {} }; }
export function normalizeApocalypseProgress(raw = {}) { const p = { ...createApocalypseProgress(), ...clone(raw) }; p.skillRanks = { ...(p.skillRanks || {}) }; p.unlockedTalents = [...new Set(Array.isArray(p.unlockedTalents) ? p.unlockedTalents : [])]; p.talentRanks = { ...(p.talentRanks || {}) }; p.cooldowns = { ...(p.cooldowns || {}) }; p.statuses = { ...(p.statuses || {}) }; p.buffs = { ...(p.buffs || {}) }; p.domain = { ...createApocalypseProgress().domain, ...(p.domain || {}) }; return p; }
const getP = a => { var _a; return normalizeApocalypseProgress(((_a = a.classProgress) === null || _a === void 0 ? void 0 : _a.warrior_apocalypse_harbinger) || a.apocalypseProgress || {}); };
const putP = (a, p) => { a.classProgress = { ...(a.classProgress || {}), warrior_apocalypse_harbinger: p }; a.apocalypseProgress = p; };
export function unlockApocalypseSkills(actor) { const p = getP(actor), level = Math.max(1, num(actor.level, 1)); for (const s of DATA.skills)
    if (level >= s.unlockLevel && !p.skillRanks[s.id])
        p.skillRanks[s.id] = 1; putP(actor, p); return p; }
export function upgradeApocalypseSkill(actor, skillId) {
    var _a, _b, _c, _d;
    const a = clone(actor), p = getP(a), s = SKILLS.get(String(skillId));
    if (!s)
        throw Error('apocalypse_skill_not_found');
    if (num(a.level, 1) < num(s.unlockLevel, 1))
        throw Error('apocalypse_skill_locked');
    const rank = clamp(Math.floor(num(p.skillRanks[s.id], 1)), 1, 7);
    if (rank >= 7)
        throw Error('apocalypse_skill_max_rank');
    const cost = Math.max(1, num((_b = (_a = s.upgrades) === null || _a === void 0 ? void 0 : _a[rank - 1]) === null || _b === void 0 ? void 0 : _b.pointsRequired, 1)), points = num((_d = (_c = a.skillPoints) !== null && _c !== void 0 ? _c : a.skill_points) !== null && _d !== void 0 ? _d : 0);
    if (points < cost)
        throw Error('insufficient_skill_points');
    a.skillPoints = points - cost;
    p.skillRanks[s.id] = rank + 1;
    putP(a, p);
    return { actor: a, progress: p, skillId: s.id, rank: rank + 1, spent: cost };
}
export function purchaseApocalypseTalent(actor, talentId) {
    var _a, _b, _c;
    const a = clone(actor), p = getP(a), t = TALENTS.find(x => x.id === String(talentId));
    if (!t)
        throw Error('apocalypse_talent_not_found');
    if (p.unlockedTalents.includes(t.id))
        throw Error('apocalypse_talent_already_owned');
    if (t.prerequisite && !p.unlockedTalents.includes(t.prerequisite))
        throw Error('apocalypse_talent_prerequisite');
    const cost = Math.max(1, num((_a = t.pointsRequired) !== null && _a !== void 0 ? _a : t.cost, 1)), points = num((_c = (_b = a.skillPoints) !== null && _b !== void 0 ? _b : a.skill_points) !== null && _c !== void 0 ? _c : 0);
    if (points < cost)
        throw Error('insufficient_skill_points');
    a.skillPoints = points - cost;
    p.unlockedTalents.push(t.id);
    p.talentRanks[t.id] = 1;
    putP(a, p);
    return { actor: a, progress: p, talent: t, spent: cost };
}
export function getApocalypseProgress(actor) { return getP(actor); }
export function resetApocalypseBattle(actor, { newBattle = false } = {}) { const p = getP(actor); p.domain = { ...p.domain, active: false, stage: 0, turnsRemaining: 0, usedThisBattle: false, ascendedUsed: false, ascendedSkillId: null }; if (newBattle) {
    p.domain.cooldownBattles = Math.max(0, num(p.domain.cooldownBattles) - 1);
    p.cooldowns = {};
    p.statuses = {};
    p.buffs = {};
} putP(actor, p); return { actor, progress: p }; }
export function endApocalypseBattle(actor) { const p = getP(actor); p.domain = { ...p.domain, active: false, stage: 0, turnsRemaining: 0, usedThisBattle: false, ascendedUsed: false, ascendedSkillId: null }; p.cooldowns = {}; p.statuses = {}; p.buffs = {}; putP(actor, p); return { actor, progress: p }; }
export function tickApocalypseTurn(actor, targets = []) { var _a, _b; const p = getP(actor), out = targets.map(t => ({ ...t, statuses: { ...(t.statuses || {}) } })), logs = []; for (const id of Object.keys(p.cooldowns))
    p.cooldowns[id] = Math.max(0, Number(p.cooldowns[id] || 0) - 1); for (const t of out) {
    const key = String((_a = t.encounterId) !== null && _a !== void 0 ? _a : t.id), st = p.statuses[key] || p.statuses[t.id];
    if (st === null || st === void 0 ? void 0 : st.endMark) {
        const damage = applySkillDamage(t, Math.max(1, num(actor.attack, 100)), 8 + num(st.markPct));
        st.endMark--;
        logs.push((t.name || t.enemy || 'دشمن') + ' از نشان پایان ' + damage + ' آسیب دریافت کرد.');
        if (st.endMark <= 0)
            delete st.endMark;
    }
    if (((_b = t.statuses) === null || _b === void 0 ? void 0 : _b.controlTurns) > 0) {
        t.statuses.controlTurns--;
        if (t.statuses.controlTurns <= 0) {
            delete t.statuses.apocControl;
            delete t.statuses.controlTurns;
        }
    }
    if (st && Object.keys(st).length === 0)
        delete p.statuses[key];
} const domain = tickWorldsEnd(actor, out); putP(actor, p); return { ...domain, targets: domain.targets || out, logs: [...logs, ...(domain.logs || [])] }; }
export function activateWorldsEnd(actor) { const p = getP(actor), stage = [...DATA.domain.stages].reverse().find(x => { var _a; return num(actor.level, 1) >= num(x.unlockLevel, DATA.domain.unlockLevel) && (!x.requiresQuest || ((_a = p.domainQuest) === null || _a === void 0 ? void 0 : _a.complete)); }); if (!stage)
    throw Error('domain_locked'); if (p.domain.usedThisBattle)
    throw Error('domain_used'); if (num(p.domain.cooldownBattles) > 0)
    throw Error('domain_cooldown'); p.domain = { ...p.domain, active: true, cooldownBattles: 3, stage: num(stage.stage, 1), turnsRemaining: num(stage.durationPlayerTurns, DATA.domain.durationTurns), usedThisBattle: true, ascendedUsed: false, ascendedSkillId: null }; putP(actor, p); return { actor, progress: p, domain: p.domain, stage }; }
export function selectApocalypseAscension(actor, ascendedId) { const p = getP(actor), a = ASC.get(ascendedId); if (!p.domain.active)
    throw Error('domain_inactive'); if (!a)
    throw Error('invalid_ascension'); if (p.domain.ascendedUsed)
    throw Error('ascension_already_used'); p.domain.ascendedUsed = true; p.domain.ascendedSkillId = a.id; putP(actor, p); return { actor, progress: p, ascension: a }; }
function applySkillDamage(target, attackPower, damagePct, { percentBonus = 0, defenseReductionPct = 0, flatBonus = 0, maxHpDamagePct = 100 } = {}) { var _a, _b; if (!target || num(target.hp) <= 0)
    return 0; const resolved = resolveCanonicalSkillDamage({ attackPower, damagePct, percentBonus, flatBonus, targetDefense: (_a = target.defense) !== null && _a !== void 0 ? _a : target.enemyDefense, defenseReductionPct, targetDamageReductionPct: num(target.damageReductionPct) }); const maxHp = Math.max(num((_b = target.maxHp) !== null && _b !== void 0 ? _b : target.max_hp), num(target.hp), 1); const cap = Math.max(1, Math.floor(maxHp * clamp(maxHpDamagePct, 1, 100) / 100)); const dealt = Math.min(num(target.hp), resolved.damage, cap); target.hp = Math.max(0, num(target.hp) - dealt); return dealt; }
function activeTalentPct(p) { return p.unlockedTalents.reduce((sum, id) => { var _a; const t = TALENTS.find(x => x.id === id); return sum + num((_a = t === null || t === void 0 ? void 0 : t.effect) === null || _a === void 0 ? void 0 : _a.powerPct); }, 0); }
export function resolveApocalypseSkill(skillId, { actor, targets = [], targetId = null } = {}) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
    if (!actor)
        throw Error('actor_required');
    const p = getP(actor), base = SKILLS.get(skillId), asc = ASC.get(skillId);
    let skill = base, ascended = false;
    if (asc) {
        if (!p.domain.active || !p.domain.ascendedUsed || p.domain.ascendedSkillId !== skillId)
            throw Error('ascension_not_selected');
        skill = SKILLS.get(asc.baseSkillId);
        ascended = true;
    }
    if (!skill)
        throw Error('unknown_skill');
    const rank = clamp(p.skillRanks[skill.id] || 1, 1, 7);
    if (num(actor.stamina) < skill.staminaCost)
        throw Error('insufficient_stamina');
    if (num(p.cooldowns[skill.id]) > 0)
        throw Error('skill_on_cooldown');
    actor.stamina = Math.max(0, num(actor.stamina) - skill.staminaCost);
    p.cooldowns[skill.id] = skill.cooldownTurns;
    const list = targets.map(t => ({ ...t })), chosen = list.find(t => String(t.id) === String(targetId) && t.hp > 0) || list.find(t => t.hp > 0);
    const talentEffects = TALENTS.filter(t => p.unlockedTalents.includes(t.id)).reduce((o, t) => { for (const [k, v] of Object.entries(t.effect || {}))
        o[k] = (o[k] || 0) + num(v); return o; }, {});
    const pct = 1 + (rank - 1) * .12 + activeTalentPct(p) / 100 + (p.domain.active ? num(p.domain.stage) * .05 : 0);
    let total = 0, logs = [];
    const mark = id => { const key = String(id); p.statuses[key] = p.statuses[key] || {}; p.statuses[key].endMark = 3 + Math.floor(num(talentEffects.durationPct) / 4) + (ascended ? 2 : 0); p.statuses[key].markPct = ascended ? 12 : 0; };
    if (['single_damage', 'line_damage', 'area_damage', 'ultimate'].includes(skill.type)) {
        for (const t of list) {
            if (t.hp <= 0)
                continue;
            let eligible = skill.type !== 'single_damage' || String((_a = t.encounterId) !== null && _a !== void 0 ? _a : t.id) === String((_b = chosen === null || chosen === void 0 ? void 0 : chosen.encounterId) !== null && _b !== void 0 ? _b : chosen === null || chosen === void 0 ? void 0 : chosen.id);
            if (!eligible)
                continue;
            let damagePct = skill.powerPct * pct * (1 + (((_c = p.statuses[t.id]) === null || _c === void 0 ? void 0 : _c.endMark) ? 0.25 : 0));
            if (ascended)
                damagePct *= 1.35;
            if (((_d = p.buffs.ruinCrown) === null || _d === void 0 ? void 0 : _d.turns) > 0)
                damagePct *= 1 + num(p.buffs.ruinCrown.powerPct) / 100;
            const boss = ['boss', 'area_boss', 'miniboss'].includes(t.encounterKind || t.kind) || t.isBoss;
            const capPct = boss ? 22 : (skill.type === 'ultimate' ? 45 : 30);
            const d = applySkillDamage(t, Math.max(1, num(actor.attack, 100)), damagePct, { maxHpDamagePct: capPct });
            total += d;
            logs.push(`${t.name || 'دشمن'}: ${d} آسیب`);
            if ((_e = p.statuses[t.id]) === null || _e === void 0 ? void 0 : _e.endMark) {
                p.statuses[t.id].endMark--;
                if (p.statuses[t.id].endMark <= 0) {
                    total += applySkillDamage(t, Math.max(1, num(actor.attack, 100)), damagePct * .35);
                    delete p.statuses[t.id].endMark;
                }
            }
        }
    }
    else if (skill.type === 'mark') {
        if (!chosen)
            throw Error('target_required');
        mark((_f = chosen.encounterId) !== null && _f !== void 0 ? _f : chosen.id);
        if (ascended) {
            for (const t of list)
                if (t !== chosen && t.hp > 0 && Math.abs(num(t.level) - num(chosen.level)) <= 2)
                    mark((_g = t.encounterId) !== null && _g !== void 0 ? _g : t.id);
        }
        logs.push(ascended ? 'حکم نابودی روی هدف و دشمنان نزدیک حک شد.' : 'نشان پایان روی هدف قرار گرفت.');
    }
    else if (skill.type === 'self_buff') {
        p.buffs.ruinCrown = { turns: 3 + Math.floor(num(talentEffects.durationPct) / 5) + (ascended ? 2 : 0), powerPct: ascended ? 35 : 20, damageReductionPct: ascended ? 12 : 5 };
        logs.push('تاج ویرانی فعال شد؛ قدرت ضربه و مقاومت در برابر آسیب افزایش یافت.');
    }
    else if (skill.type === 'control') {
        for (const t of list) {
            if (t.hp <= 0)
                continue;
            const boss = ['boss', 'area_boss', 'miniboss'].includes(t.encounterKind || t.kind) || t.isBoss;
            const turns = Math.max(1, (ascended ? 2 : 1) + (p.domain.active && p.domain.stage >= 2 ? 1 : 0) + Math.floor(num(talentEffects.durationPct) / 8));
            if (boss) {
                t.statuses = { ...(t.statuses || {}), apocControl: skill.id, controlTurns: 1 };
                t.attackReductionPct = Math.max(num(t.attackReductionPct), ascended ? 18 : 10);
                logs.push('باس در برابر کنترل کامل مقاوم است؛ فقط برای یک نوبت تضعیف شد.');
                continue;
            }
            t.statuses = { ...(t.statuses || {}), apocControl: skill.id, controlTurns: turns };
            logs.push(`${t.name || t.enemy || 'دشمن'} برای ${turns} نوبت مختل شد.`);
        }
    }
    if (ascended && skill.id === 'world_rift') {
        for (const t of list.filter(x => x.hp > 0)) {
            p.statuses[String((_h = t.encounterId) !== null && _h !== void 0 ? _h : t.id)] = p.statuses[String((_j = t.encounterId) !== null && _j !== void 0 ? _j : t.id)] || {};
            p.statuses[String((_k = t.encounterId) !== null && _k !== void 0 ? _k : t.id)].endMark = Math.max(2, num(p.statuses[String((_l = t.encounterId) !== null && _l !== void 0 ? _l : t.id)].endMark));
        }
    }
    if (ascended && skill.id === 'meteor_rain') {
        for (const t of list.filter(x => x.hp > 0))
            total += applySkillDamage(t, Math.max(1, num(actor.attack, 100)), 35);
        logs.push('شهاب‌های تعقیب‌کننده موج دوم انفجار را آزاد کردند.');
    }
    if (ascended && skill.id === 'existence_inversion') {
        for (const t of list.filter(x => x.hp > 0)) {
            const d = applySkillDamage(t, Math.max(1, num(actor.attack, 100)), 25);
            total += d;
        }
        logs.push('فروپاشی جاذبه به همه اهداف آسیب ثانویه زد.');
    }
    if (ascended && skill.id === 'outside_time') {
        p.buffs.timeFracture = { turns: 2, damagePct: 18 };
        logs.push('آخرین ثانیه جهان، موج بعدی دشمنان را تضعیف می‌کند.');
    }
    if (((_m = p.buffs.ruinCrown) === null || _m === void 0 ? void 0 : _m.turns) > 0 && ['single_damage', 'line_damage', 'area_damage', 'ultimate'].includes(skill.type)) {
        p.buffs.ruinCrown.turns--;
        if (p.buffs.ruinCrown.turns <= 0)
            delete p.buffs.ruinCrown;
    }
    p.cooldowns[skill.id] = skill.cooldownTurns;
    putP(actor, p);
    return { actor, targets: list, progress: p, damage: total, logs, ascended, displaySkillName: asc ? asc.name : skill.name };
}
export function tickWorldsEnd(actor, targets = []) { const p = getP(actor); if (!p.domain.active)
    return { actor, targets, ended: false }; const out = targets.map(t => ({ ...t })); p.domain.turnsRemaining = Math.max(0, p.domain.turnsRemaining - 1); if (p.domain.turnsRemaining === 0) {
    p.domain.active = false;
    p.domain.stage = 0;
    p.domain.ascendedSkillId = null;
    p.domain.ascendedUsed = false;
    putP(actor, p);
    return { actor, targets: out, ended: true, logs: ['قلمرو پایان جهان فرو نشست؛ مهارت‌ها به حالت اصلی بازگشتند.'] };
} putP(actor, p); return { actor, targets: out, ended: false, logs: [] }; }
export function endWorldsEnd(actor) { const p = getP(actor); p.domain.active = false; p.domain.stage = 0; p.domain.turnsRemaining = 0; p.domain.ascendedUsed = false; p.domain.ascendedSkillId = null; putP(actor, p); return { actor, progress: p }; }
/** Public catalog helpers used by the shared specialization/combat bridge. */
export function findApocalypseSkill(id) { return SKILLS.get(String(id)) || ASC.get(String(id)) || null; }
export function listApocalypseSkills({ level = 1, progress = {} } = {}) {
    const p = normalizeApocalypseProgress(progress);
    return DATA.skills.filter(s => num(s.unlockLevel, 1) <= num(level, 1)).map(s => ({ ...s, rank: clamp(p.skillRanks[s.id] || 1, 1, 7), classId: 'warrior', specializationId: 'warrior_apocalypse_harbinger' }));
}
