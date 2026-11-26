/**
 * ETRANOM V1959 — source-to-plan and all-mode execution differential audit.
 * This is a deterministic local audit only. It does not call legacy live
 * resolvers, Supabase, or authoritative production combat.
 */
import { IMPLEMENTED_SPECIALIZATION_DATA_V1939 } from './shared-engine-specialization-orchestrator-v1939.js?build=2081';
import { CentralCombatLifecycleV1956 } from './central-combat-lifecycle-v1956.js?build=2081';
import { compileCentralSkillEffectPlanV1958, compileCentralDomainActivationPlanV1958 } from './central-skill-effect-compiler-v1958.js?build=2081';
export const CENTRAL_ENGINE_DIFFERENTIAL_AUDIT_VERSION_V1959 = '1959.0.0';
const MODES = Object.freeze(['solo', 'party', 'pvp']);
const SUPPORTED = new Set(['damage', 'heal', 'shield', 'apply_status', 'remove_status', 'resource_gain', 'resource_drain', 'modifier', 'summon', 'multi_hit', 'reaction', 'taunt', 'revive']);
const obj = v => v && typeof v === 'object' && !Array.isArray(v) ? v : {};
const arr = v => Array.isArray(v) ? v : [];
const n = (v, d = 0) => Number.isFinite(Number(v)) ? Number(v) : d;
const canon = id => String(id) === 'warrior_chaos_warrior' ? 'warrior_chaos' : String(id);
const resourceOf = (specId, skill) => {
    if (skill.resource === 'استقامت' || skill.resourceType === 'stamina' || String(specId).startsWith('warrior_'))
        return 'stamina';
    if (skill.resource === 'مانا' || skill.resourceType === 'mana' || String(specId).startsWith('wizard_'))
        return 'mana';
    return 'energy';
};
function makeState() {
    return {
        actor: { id: 'audit-actor', hp: 100000, maxHp: 100000, mp: 100000, maxMp: 100000, stamina: 100000, maxStamina: 100000,
            energy: 100000, maxEnergy: 100000, souls: 100000, maxSouls: 100000, shield: 0, statuses: [], modifiers: [], reactions: [], summons: [] },
        allies: [{ id: 'audit-ally', hp: 100000, maxHp: 100000, shield: 0, statuses: [], modifiers: [] }],
        targets: [
            { id: 'audit-target-1', hp: 100000, maxHp: 100000, shield: 0, statuses: [], modifiers: [], reactions: [] },
            { id: 'audit-target-2', hp: 100000, maxHp: 100000, shield: 0, statuses: [], modifiers: [], reactions: [] },
            { id: 'audit-corpse', hp: 0, maxHp: 100000, shield: 0, statuses: [], modifiers: [], reactions: [] }
        ]
    };
}
function makeSkillPlan(specializationId, skill, mode, form, suffix) {
    const spec = IMPLEMENTED_SPECIALIZATION_DATA_V1939[specializationId];
    const asc = form === 'ascended' ? arr(spec.ascendedSkills).find(x => String(x.skillId || x.baseSkillId) === String(skill.id)) : null;
    return {
        schema: 'etranom.central-skill-plan.v1', mode, actorId: 'audit-actor', specializationId, skillId: skill.id,
        requestId: `v1959:${specializationId}:${skill.id}:${mode}:${form}:${suffix}`, targetId: 'audit-target-1',
        targetIds: ['audit-target-1', 'audit-target-2', 'audit-corpse'], skill,
        stats: { attack: 1000, physicalAttack: 1000, magicPower: 1000, magicalAttack: 1000, stats: { attack: 1000, physicalAttack: 1000, magicPower: 1000, magicalAttack: 1000 } },
        rank: 1, upgrade: {}, talent: {}, domain: { active: form === 'ascended', stage: 4, ascensionId: asc === null || asc === void 0 ? void 0 : asc.id },
        resource: { resource: resourceOf(specializationId, skill), cost: 0 }, cooldown: { turns: 0 }, executionStatus: 'prepared_only'
    };
}
export function runCentralEngineDifferentialAuditV1959() {
    var _a, _b, _c, _d, _e;
    const rows = [];
    const failures = [];
    let executions = 0;
    let operationCount = 0;
    const lifecycle = new CentralCombatLifecycleV1956({ effectCompiler: (plan, state, context) => {
            if (plan.skillId === '__domain_activation__') {
                const p = compileCentralDomainActivationPlanV1958(plan.specializationId, plan.domain.stage);
                return p;
            }
            return compileCentralSkillEffectPlanV1958(plan, state, context);
        } });
    for (const [specializationId, spec] of Object.entries(IMPLEMENTED_SPECIALIZATION_DATA_V1939)) {
        for (const skill of arr(spec.skills)) {
            const asc = arr(spec.ascendedSkills).find(x => String(x.skillId || x.baseSkillId) === String(skill.id));
            const row = { specializationId, canonicalSpecializationId: canon(specializationId), skillId: skill.id, baseType: skill.type,
                sourceResource: resourceOf(specializationId, skill), sourceCost: n((_c = (_b = (_a = skill.staminaCost) !== null && _a !== void 0 ? _a : skill.manaCost) !== null && _b !== void 0 ? _b : skill.manaPct) !== null && _c !== void 0 ? _c : skill.manaCostPercent),
                cooldownTurns: n(skill.cooldownTurns), hasAscension: !!asc, forms: { base: [], ascended: [] }, operationTypes: [] };
            for (const form of ['base', 'ascended']) {
                if (form === 'ascended' && !asc)
                    continue;
                for (const mode of MODES) {
                    try {
                        const plan = makeSkillPlan(specializationId, skill, mode, form, executions);
                        const compiled = compileCentralSkillEffectPlanV1958(plan, {});
                        const unknown = compiled.operations.filter(op => !SUPPORTED.has(op.type));
                        if (unknown.length)
                            throw new Error(`unsupported_ops:${unknown.map(x => x.type).join(',')}`);
                        for (const op of compiled.operations) {
                            if (op.amount != null && !Number.isFinite(Number(op.amount)))
                                throw new Error(`non_finite_amount:${op.type}`);
                            if (op.type === 'apply_status' && (!((_d = op.status) === null || _d === void 0 ? void 0 : _d.id) || !Number.isFinite(Number(op.status.turns))))
                                throw new Error('invalid_status_contract');
                            if (op.type === 'summon' && !((_e = op.summon) === null || _e === void 0 ? void 0 : _e.id))
                                throw new Error('invalid_summon_contract');
                        }
                        const targetId = 'audit-target-1';
                        const result = lifecycle.executePreparedSkill({ plan, state: makeState(), requestId: plan.requestId, targetId, targetIds: plan.targetIds });
                        if (result.duplicate)
                            throw new Error('unexpected_duplicate');
                        row.forms[form].push({ mode, operations: compiled.operations.length, executed: true });
                        row.operationTypes.push(...compiled.operations.map(op => op.type));
                        executions++;
                        operationCount += compiled.operations.length;
                    }
                    catch (error) {
                        const failure = { specializationId, skillId: skill.id, form, mode, message: String((error === null || error === void 0 ? void 0 : error.message) || error) };
                        failures.push(failure);
                        row.forms[form].push({ mode, executed: false, error: failure.message });
                    }
                }
            }
            row.operationTypes = [...new Set(row.operationTypes)].sort();
            row.sourceToPlanParity = 'not_proven_without_legacy_runtime_snapshot';
            rows.push(row);
        }
    }
    let domainExecutions = 0;
    for (const specializationId of Object.keys(IMPLEMENTED_SPECIALIZATION_DATA_V1939))
        for (let stage = 1; stage <= 4; stage++)
            for (const mode of MODES) {
                try {
                    const domain = compileCentralDomainActivationPlanV1958(specializationId, stage);
                    const plan = { schema: 'etranom.central-skill-plan.v1', mode, actorId: 'audit-actor', specializationId, skillId: '__domain_activation__',
                        requestId: `v1959:domain:${specializationId}:${stage}:${mode}`, skill: { id: '__domain_activation__', type: 'domain' }, stats: {}, rank: 1,
                        domain: { active: true, stage }, resource: { resource: String(specializationId).startsWith('warrior_') ? 'stamina' : 'mana', cost: 0 }, cooldown: { turns: 0 }, executionStatus: 'prepared_only' };
                    const result = lifecycle.executePreparedSkill({ plan, state: makeState(), requestId: plan.requestId, targetId: 'audit-target-1' });
                    if (result.duplicate || !domain.operations.length)
                        throw new Error('domain_activation_not_executed');
                    domainExecutions++;
                }
                catch (error) {
                    failures.push({ specializationId, skillId: '__domain_activation__', stage, mode, message: String((error === null || error === void 0 ? void 0 : error.message) || error) });
                }
            }
    const totalSkills = rows.length;
    const expectedSkillExecutions = totalSkills * 2 * MODES.length;
    const expectedDomainExecutions = Object.keys(IMPLEMENTED_SPECIALIZATION_DATA_V1939).length * 4 * MODES.length;
    return Object.freeze({ version: CENTRAL_ENGINE_DIFFERENTIAL_AUDIT_VERSION_V1959, totalSkills, implementedSpecializations: Object.keys(IMPLEMENTED_SPECIALIZATION_DATA_V1939).length,
        modes: MODES, expectedSkillExecutions, successfulSkillExecutions: executions, expectedDomainExecutions, successfulDomainExecutions: domainExecutions,
        operationCount, failures: Object.freeze(failures), rows: Object.freeze(rows),
        localExecutionCoverage: failures.length === 0 && executions === expectedSkillExecutions && domainExecutions === expectedDomainExecutions,
        legacyParityProven: false, liveServerParityProven: false,
        limitations: Object.freeze(['No authoritative legacy resolver was executed in this audit.', 'No production Supabase RPC or two-account online battle was exercised.', 'Rank/talent progression, atomic resource persistence and cooldown persistence require separate server verification.']) });
}
