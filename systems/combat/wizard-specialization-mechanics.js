/** Deterministic Wizard-only specialization state transitions shared by Solo/Party/PvP adapters. */
const clamp = (v, min, max) => Math.max(min, Math.min(max, Number(v) || 0));
const copy = v => JSON.parse(JSON.stringify(v !== null && v !== void 0 ? v : {}));
const CHOICES = {
    court_of_nameless: new Set(['silence', 'refund', 'confiscation']),
    true_name_shatter: new Set(['body', 'will', 'magic', 'bond']),
    final_covenant: new Set(['annihilation', 'dominion', 'void']),
    assembly_of_souls: new Set(['hunt', 'protect', 'feed']),
    death_memory: new Set(['war', 'survival', 'magic']),
    soul_domination: new Set(['dominate', 'chain', 'silence'])
};
const DEFAULTS = { court_of_nameless: 'silence', true_name_shatter: 'will', final_covenant: 'annihilation', assembly_of_souls: 'hunt', death_memory: 'war', soul_domination: 'chain' };
export function prepareWizardSpecializationSkill(specId, skill, actor = {}, payload = {}) {
    var _a, _b;
    const a = copy(actor), s = { ...skill }, id = String((skill === null || skill === void 0 ? void 0 : skill.id) || ''), choice = String(payload.choice || DEFAULTS[id] || '');
    if (CHOICES[id] && !CHOICES[id].has(choice))
        throw new Error(`invalid_${id}_choice`);
    if (specId === 'wizard_warlock') {
        const p = copy(a.warlockProgress || ((_a = a.classProgress) === null || _a === void 0 ? void 0 : _a.wizard_warlock) || {});
        p.pactDebt = clamp(p.pactDebt, 0, 8);
        p.pactCredit = clamp(p.pactCredit, 0, 8);
        p.hungerReservoir = clamp(p.hungerReservoir, 0, 12);
        if (id === 'demons_testament')
            s.type = 'self_buff';
        const sacrifice = Boolean(p.reversalArmed) && id !== 'reversal_of_sacrifice';
        if (sacrifice) {
            s.manaCost = 0;
            s.manaPct = 0;
            s.manaCostPercent = 0;
            s.damagePct = Number(s.damagePct || 0) * 1.55;
            a._warlockSacrificeCost = Math.max(1, Math.ceil(Number(a.maxHp || a.max_hp || 1) * .07));
        }
        const pactActive = Boolean(p.testamentActive) && id !== 'demons_testament';
        if (pactActive && Number(s.damagePct) > 0)
            s.damagePct = Number(s.damagePct) * (1 + Math.min(8, p.pactDebt + 1) * .03);
        if (p.nextSkillDamagePct && Number(s.damagePct) > 0)
            s.damagePct = Number(s.damagePct) * (1 + Number(p.nextSkillDamagePct) / 100);
        if (p.nextSkillManaReductionPct)
            s.manaCost = Math.ceil(Number((_b = s.manaCost) !== null && _b !== void 0 ? _b : 0) * (1 - Number(p.nextSkillManaReductionPct) / 100));
        a.warlockProgress = p;
    }
    if (specId === 'wizard_necromancer') {
        if (id === 'life_siphon') {
            s.dotPct = Number(s.dotPct) || 12;
            s.dotTurns = Number(s.dotTurns) || 3;
            s.lifeStealPct = 30;
            s.healPct = 30;
        }
        if (id === 'death_claw') {
            s.dotPct = Number(s.dotPct) || 12;
            s.dotTurns = Number(s.dotTurns) || 3;
        }
    }
    return { actor: a, skill: s, choice };
}
export function finalizeWizardSpecializationSkill(specId, skill, result, payload = {}) {
    var _a, _b;
    const out = { ...result, actor: copy(result.actor), targets: copy(result.targets || []), log: [...(result.log || [])] };
    const id = String((skill === null || skill === void 0 ? void 0 : skill.id) || ''), choice = String(payload.choice || DEFAULTS[id] || '');
    if (specId === 'wizard_warlock') {
        const p = copy(out.actor.warlockProgress || ((_a = out.actor.classProgress) === null || _a === void 0 ? void 0 : _a.wizard_warlock) || {});
        p.pactDebt = clamp(p.pactDebt, 0, 8);
        p.pactCredit = clamp(p.pactCredit, 0, 8);
        if (id === 'demons_testament') {
            if (p.testamentActive) {
                p.testamentActive = false;
                p.pactCredit = clamp(p.pactCredit + Math.floor(p.pactDebt / 2), 0, 8);
                p.pactDebt = 0;
                out.log.push({ type: 'warlock_pact_cancelled', credit: p.pactCredit });
            }
            else {
                p.testamentActive = true;
                out.log.push({ type: 'warlock_pact_activated' });
            }
        }
        else if (p.testamentActive && id !== 'final_covenant') {
            p.pactDebt = clamp(p.pactDebt + 1, 0, 8);
        }
        if (id === 'reversal_of_sacrifice') {
            p.reversalArmed = true;
            out.log.push({ type: 'warlock_sacrifice_armed' });
        }
        else if (out.actor._warlockSacrificeCost) {
            const cost = out.actor._warlockSacrificeCost;
            out.actor.hp = Math.max(1, Number(out.actor.hp || 1) - cost);
            p.reversalArmed = false;
            p.sacrificeRefund = Math.floor(cost * .35);
            out.log.push({ type: 'warlock_sacrifice_paid', amount: cost });
            delete out.actor._warlockSacrificeCost;
        }
        if (id === 'stolen_moment') {
            p.nextSkillDamagePct = 15;
            p.nextSkillManaReductionPct = 20;
            const t = out.targets.find(x => String(x.id) === String(payload.targetId)) || out.targets.find(x => Number(x.hp) > 0);
            if (t) {
                t.statuses = { ...(t.statuses || {}), stolen_moment: { turns: 1, specialSkillLocked: true, bossWeakenPct: 20 } };
            }
        }
        else if (p.nextSkillDamagePct) {
            p.nextSkillDamagePct = 0;
            p.nextSkillManaReductionPct = 0;
        }
        if (id === 'court_of_nameless') {
            p.courtMode = choice;
            p.courtTurns = 2;
            out.log.push({ type: 'warlock_court', choice });
        }
        if (id === 'hostage_heart') {
            const t = out.targets.find(x => String(x.id) === String(payload.targetId)) || out.targets.find(x => Number(x.hp) > 0);
            if (t) {
                t.statuses = { ...(t.statuses || {}), hostage_heart: { turns: 3, linkPct: 22, healPct: 18, sourceId: out.actor.id } };
                p.hostageTargetId = t.id;
            }
        }
        if (id === 'heir_of_hunger') {
            p.hungerTurns = 3;
            p.hungerReservoir = clamp(p.hungerReservoir, 0, 12);
        }
        if (id === 'true_name_shatter') {
            const t = out.targets.find(x => String(x.id) === String(payload.targetId)) || out.targets.find(x => Number(x.hp) > 0);
            if (t) {
                t.statuses = { ...(t.statuses || {}), true_name_shatter: { turns: 3, choice, attackReductionPct: choice === 'will' ? 20 : 0, defenseReductionPct: choice === 'body' ? 22 : 0, skillPowerReductionPct: choice === 'magic' ? 25 : 0, removeBuff: choice === 'bond' } };
            }
        }
        if (id === 'final_covenant') {
            const consumed = p.pactDebt;
            p.pactDebt = 0;
            p.pactCredit = 0;
            const bonus = 1 + Math.min(40, Math.floor(consumed / 2) * 8) / 100;
            if (choice === 'annihilation') {
                for (const t of out.targets.filter(x => Number(x.hp) > 0)) {
                    const d = Math.max(1, Math.floor(Number(out.actor.magicPower || out.actor.attack || 1) * 3.6 * bonus));
                    t.hp = Math.max(0, Number(t.hp) - d);
                    out.log.push({ type: 'damage', target: t.id, amount: d });
                }
            }
            if (choice === 'dominion') {
                let total = 0;
                for (const t of out.targets) {
                    const lost = Math.max(0, Number(t.maxHp || t.max_hp || 0) - Number(t.hp || 0));
                    total += lost * .18;
                    t.statuses = { ...(t.statuses || {}), final_covenant: { turns: 2, attackReductionPct: 18 } };
                }
                out.actor.hp = Math.min(Number(out.actor.maxHp || out.actor.max_hp || 1), Number(out.actor.hp || 0) + Math.floor(total));
            }
            if (choice === 'void') {
                for (const t of out.targets.filter(x => Number(x.hp) > 0)) {
                    t.buffs = {};
                    const d = Math.max(1, Math.floor(Number(out.actor.magicPower || out.actor.attack || 1) * 1.6 * bonus));
                    t.hp = Math.max(0, Number(t.hp) - d);
                    out.log.push({ type: 'damage', target: t.id, amount: d });
                }
            }
            out.log.push({ type: 'warlock_final_covenant', choice, consumedDebt: consumed });
        }
        out.actor.warlockProgress = p;
        if (out.actor.classProgress)
            out.actor.classProgress = { ...out.actor.classProgress, wizard_warlock: p };
    }
    if (specId === 'wizard_necromancer') {
        const p = copy(out.actor.necromancerProgress || ((_b = out.actor.classProgress) === null || _b === void 0 ? void 0 : _b.wizard_necromancer) || {});
        p.souls = clamp(p.souls, 0, 99);
        if (id === 'death_claw') {
            const t = out.targets.find(x => String(x.id) === String(payload.targetId)) || out.targets.find(x => Number(x.hp) > 0);
            if (t && Number(t.hp) <= 0)
                p.souls = clamp(p.souls + 1, 0, 99);
        }
        if (id === 'death_memory' || id === 'soul_domination') {
            const t = out.targets.find(x => String(x.id) === String(payload.targetId)) || out.targets.find(x => Number(x.hp) > 0);
            if (t) {
                t.statuses = { ...(t.statuses || {}), [id]: { turns: id === 'death_memory' ? 3 : 2, choice, attackReductionPct: choice === 'war' || choice === 'chain' ? 20 : 0, defenseReductionPct: choice === 'survival' ? 20 : 0, skillPowerReductionPct: choice === 'magic' ? 25 : choice === 'chain' ? 15 : 0, controlled: choice === 'dominate', specialSkillLocked: choice === 'silence' } };
            }
        }
        if (id === 'assembly_of_souls') {
            const souls = p.souls;
            const power = Math.max(1, Math.floor(Number(out.actor.magicPower || out.actor.attack || 1) * Math.max(1, souls) * .12));
            if (choice === 'hunt') {
                for (const t of out.targets.filter(x => Number(x.hp) > 0)) {
                    const d = power;
                    t.hp = Math.max(0, Number(t.hp) - d);
                    out.log.push({ type: 'damage', target: t.id, amount: d });
                }
                p.souls = 0;
            }
            if (choice === 'protect') {
                out.actor.shield = { hp: power * 2, turns: 2, reductionPct: 20 };
                p.souls = 0;
            }
            if (choice === 'feed') {
                out.actor.hp = Math.min(Number(out.actor.maxHp || out.actor.max_hp || 1), Number(out.actor.hp || 0) + power);
                out.actor.mp = Math.min(Number(out.actor.maxMp || out.actor.max_mp || 0), Number(out.actor.mp || 0) + power);
                p.souls = 0;
            }
            out.log.push({ type: 'necromancer_soul_command', choice, spent: souls });
        }
        if (id === 'bone_blossom' || id === 'kingdom_of_bones') {
            p.legionBuffs = { defensePct: id === 'bone_blossom' ? 20 : 0, attackPct: id === 'kingdom_of_bones' ? 20 : 0, turns: 3 };
        }
        if (id === 'return_threshold') {
            if (p.souls < 3)
                throw new Error('necromancer_not_enough_souls_for_revive');
            p.souls -= 3;
            p.reviveArmed = true;
            p.reviveTurns = 3;
        }
        if (id === 'eternal_sovereign') {
            p.sovereignTurns = 3;
            p.sovereignDamagePct = 20;
        }
        if (id === 'life_siphon') {
            const healed = out.log.filter(x => x.type === 'heal').reduce((v, x) => v + Number(x.amount || 0), 0);
            const legion = Array.isArray(p.legion) ? p.legion : [];
            for (const member of legion.filter(x => Number(x.hp) > 0)) {
                member.hp = Math.min(Number(member.maxHp || member.max_hp || 1), Number(member.hp || 0) + Math.floor(healed * .2 / Math.max(1, legion.length)));
            }
        }
        out.actor.necromancerProgress = p;
        if (out.actor.classProgress)
            out.actor.classProgress = { ...out.actor.classProgress, wizard_necromancer: p };
    }
    return Object.freeze(out);
}
