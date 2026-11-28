/**
 * ETRANOM V1940 — deterministic shared-plan vs legacy-outcome audit.
 * This module observes isolated before/after snapshots only. It never executes
 * a skill, charges resources, starts cooldowns, or changes combat state.
 */
const obj = value => value && typeof value === 'object' && !Array.isArray(value) ? value : {};
const arr = value => Array.isArray(value) ? value : [];
const num = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
const clone = value => structuredClone(value !== null && value !== void 0 ? value : {});
const resourceBalance = (actor, resource) => Math.max(0, num(obj(actor === null || actor === void 0 ? void 0 : actor.resources)[resource], num(actor === null || actor === void 0 ? void 0 : actor[resource])));
const progressStores = actor => [
    ...Object.values(obj(actor === null || actor === void 0 ? void 0 : actor.classProgress)), obj(actor === null || actor === void 0 ? void 0 : actor.arcaneMageProgress), obj(actor === null || actor === void 0 ? void 0 : actor.elementalistProgress),
    obj(actor === null || actor === void 0 ? void 0 : actor.warlockProgress), obj(actor === null || actor === void 0 ? void 0 : actor.necromancerProgress), obj(actor === null || actor === void 0 ? void 0 : actor.swordAsceticProgress),
    obj(actor === null || actor === void 0 ? void 0 : actor.ironBastionProgress), obj(actor === null || actor === void 0 ? void 0 : actor.chaosWarriorProgress), obj(actor === null || actor === void 0 ? void 0 : actor.apocalypseProgress),
    obj(actor === null || actor === void 0 ? void 0 : actor.specializationProgress)
];
const cooldownMap = actor => progressStores(actor).reduce((all, progress) => ({ ...all, ...obj(progress.cooldowns), ...obj(progress.skillCooldowns) }), { ...obj(actor === null || actor === void 0 ? void 0 : actor.cooldowns), ...obj(actor === null || actor === void 0 ? void 0 : actor.skillCooldowns) });
const statuses = actor => progressStores(actor).reduce((all, progress) => ({ ...all, ...obj(progress.statuses) }), obj(actor === null || actor === void 0 ? void 0 : actor.statuses));
export const SHARED_DIFFERENTIAL_AUDIT_VERSION_V1940 = '1940.0.0';
export function buildSharedExecutionPlanV1940({ specializationId, mode, skill, actor = {}, targets = [], statSnapshot = {}, talent = {}, upgrade = {}, domain = {} } = {}) {
    var _a, _b;
    if (!(skill === null || skill === void 0 ? void 0 : skill.id))
        throw new TypeError('shared_plan_skill_required');
    const resource = String(skill.resourceType || (String(specializationId).startsWith('warrior_') ? 'stamina' : 'mana'));
    const cost = Math.max(0, num((_a = skill.resourceCost) !== null && _a !== void 0 ? _a : skill.manaCost));
    const rawEffects = Array.isArray(skill.effects) ? skill.effects : arr(skill.effectList);
    const effects = rawEffects.map((effect, index) => ({ index, kind: String((effect === null || effect === void 0 ? void 0 : effect.kind) || (effect === null || effect === void 0 ? void 0 : effect.type) || 'unknown'), target: String((effect === null || effect === void 0 ? void 0 : effect.target) || skill.target || 'unspecified'), amount: num(effect === null || effect === void 0 ? void 0 : effect.amount), durationTurns: num(effect === null || effect === void 0 ? void 0 : effect.durationTurns) }));
    const attack = num((_b = statSnapshot === null || statSnapshot === void 0 ? void 0 : statSnapshot.stats) === null || _b === void 0 ? void 0 : _b.attack, num(actor.attack, num(actor.power)));
    const expectedDamage = effects.filter(effect => effect.kind === 'damage').map(effect => {
        var _a, _b;
        return ({
            targetId: String(((_a = targets[0]) === null || _a === void 0 ? void 0 : _a.id) || ''),
            // Mirrors SkillEngine's generic default resolver, not a claim about custom legacy formulas.
            amount: Math.max(0, Math.floor(attack * num(skill.damagePct, 100) / 100 - num((_b = targets[0]) === null || _b === void 0 ? void 0 : _b.defense)))
        });
    });
    return Object.freeze({ version: SHARED_DIFFERENTIAL_AUDIT_VERSION_V1940, specializationId, mode, skillId: String(skill.id),
        resource, cost, cooldownTurns: Math.max(0, num(skill.cooldownTurns)), target: skill.target || 'unspecified',
        contractType: skill.contractType || null, rank: num(upgrade.rank, 1), upgradeModifiers: clone(upgrade.modifiers),
        talentModifiers: clone(talent.modifiers), domainActive: domain.active === true,
        ascensionId: domain.selectedAscensionId || null, effects: Object.freeze(effects), expectedDamage: Object.freeze(expectedDamage),
        engineDamageFormula: 'floor(attack * damagePct / 100 - targetDefense)',
        customMechanics: ['specialization-specific handlers', 'reactive defense', 'legion/summon actions', 'multi-target routing', 'custom scaling'] });
}
export function compareLegacyOutcomeToSharedPlanV1940({ plan, beforeActor = {}, afterActor = {}, beforeTargets = [], afterTargets = [], events = [] } = {}) {
    if (!(plan === null || plan === void 0 ? void 0 : plan.skillId))
        throw new TypeError('shared_execution_plan_required');
    const beforeResource = resourceBalance(beforeActor, plan.resource), afterResource = resourceBalance(afterActor, plan.resource);
    const actualSpent = Math.max(0, beforeResource - afterResource);
    const beforeCd = num(cooldownMap(beforeActor)[plan.skillId]);
    const afterCd = num(cooldownMap(afterActor)[plan.skillId]);
    const beforeById = new Map(arr(beforeTargets).map(row => [String(row.id), row]));
    const targetDeltas = arr(afterTargets).map(row => {
        const prior = beforeById.get(String(row.id));
        return { targetId: String(row.id), hpBefore: num(prior === null || prior === void 0 ? void 0 : prior.hp), hpAfter: num(row.hp), damage: Math.max(0, num(prior === null || prior === void 0 ? void 0 : prior.hp) - num(row.hp)) };
    });
    const beforeStatus = statuses(beforeActor), afterStatus = statuses(afterActor);
    const statusAdded = Object.keys(afterStatus).filter(key => !(key in beforeStatus));
    const statusRemoved = Object.keys(beforeStatus).filter(key => !(key in afterStatus));
    const eventTypes = arr(events).map(event => String((event === null || event === void 0 ? void 0 : event.type) || (event === null || event === void 0 ? void 0 : event.kind) || 'unknown'));
    const differences = [];
    if (actualSpent !== plan.cost)
        differences.push({ category: 'resource_cost', expected: plan.cost, actual: actualSpent, severity: 'review' });
    if (plan.cooldownTurns > 0 && afterCd < plan.cooldownTurns && afterCd > beforeCd)
        differences.push({ category: 'cooldown_commit', expectedAtLeast: plan.cooldownTurns, before: beforeCd, after: afterCd, severity: 'review' });
    const actualDamage = targetDeltas.reduce((sum, row) => sum + row.damage, 0);
    const plannedDamage = plan.expectedDamage.reduce((sum, row) => sum + row.amount, 0);
    if (plan.expectedDamage.length && actualDamage !== plannedDamage)
        differences.push({ category: 'damage_formula_divergence', expected: plannedDamage, actual: actualDamage, severity: 'custom_or_bug_review' });
    if (statusAdded.length || statusRemoved.length)
        differences.push({ category: 'status_delta', added: statusAdded, removed: statusRemoved, severity: 'custom_or_bug_review' });
    return Object.freeze({ version: SHARED_DIFFERENTIAL_AUDIT_VERSION_V1940, specializationId: plan.specializationId, mode: plan.mode, skillId: plan.skillId,
        observed: Object.freeze({ resource: plan.resource, resourceBefore: beforeResource, resourceAfter: afterResource, resourceSpent: actualSpent,
            cooldownBefore: beforeCd, cooldownAfter: afterCd, targetDeltas: Object.freeze(targetDeltas), statusAdded: Object.freeze(statusAdded), statusRemoved: Object.freeze(statusRemoved), eventTypes: Object.freeze(eventTypes) }),
        sharedPlan: plan, differences: Object.freeze(differences), classification: differences.length ? 'requires_specialization_review' : 'observed_metrics_match',
        parityProven: false, note: 'A metric match is not full behavioral parity; custom mechanics and server transaction semantics require separate verification.' });
}
