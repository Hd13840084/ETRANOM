/**
 * ETRANOM V1976 — canonical combat attributes, mitigation and status lifecycle.
 * Pure deterministic helpers. Existing combat equations remain unchanged when
 * no explicit resistance/status profile is supplied (all defaults are zero).
 */
export const UNIFIED_COMBAT_VERSION_V1976 = '1976.0.0';
export const ATTRIBUTE_KEYS_V1976 = Object.freeze(['power', 'speed', 'endurance', 'vitality', 'intellect', 'perception', 'luck', 'faith']);
export const DAMAGE_TYPES_V1976 = Object.freeze(['physical', 'magical', 'fire', 'frost', 'lightning', 'poison', 'holy', 'shadow', 'true']);
export const CONTROL_TYPES_V1976 = Object.freeze(['stun', 'root', 'freeze', 'silence', 'fear', 'taunt', 'slow', 'disarm']);
const obj = v => v && typeof v === 'object' && !Array.isArray(v) ? v : {};
const num = (v, d = 0) => Number.isFinite(Number(v)) ? Number(v) : d;
const int = (v, d = 0) => Math.floor(num(v, d));
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const clone = v => structuredClone(v);
export function normalizeAttributesV1976(input = {}) {
    const source = obj(input.attributes || input.stats || input);
    return Object.freeze(Object.fromEntries(ATTRIBUTE_KEYS_V1976.map(k => [k, Math.max(0, num(source[k], 0))])));
}
export function normalizeResistanceProfileV1976(input = {}) {
    const raw = obj(input.resistances || input.resistanceProfile);
    const damage = Object.fromEntries(DAMAGE_TYPES_V1976.map(k => { var _a; return [k, k === 'true' ? 0 : clamp(num((_a = raw[k]) !== null && _a !== void 0 ? _a : raw[`${k}Pct`], 0), 0, 90)]; }));
    const controls = Object.fromEntries(CONTROL_TYPES_V1976.map(k => { var _a; return [k, clamp(num((_a = obj(raw.control || raw.controls)[k]) !== null && _a !== void 0 ? _a : obj(raw.control || raw.controls)[`${k}Pct`], 0), 0, 95)]; }));
    return Object.freeze({ damage: Object.freeze(damage), control: Object.freeze(controls) });
}
/**
 * Applies the existing core damage result after its normal defense/guard/crit
 * calculation. Resistance is an additional layer and defaults to zero.
 * True damage bypasses all resistance. Returns applied damage and audit data.
 */
export function mitigateDamageV1976(baseDamage, defender = {}, damageType = 'physical', options = {}) {
    const type = DAMAGE_TYPES_V1976.includes(String(damageType)) ? String(damageType) : 'physical';
    const profile = normalizeResistanceProfileV1976(defender);
    const resistance = type === 'true' ? 0 : profile.damage[type];
    const bossFactor = clamp(num(options.bossResistanceFactor, 1), 0, 1);
    const effectiveResistance = clamp(resistance * bossFactor, 0, 90);
    const base = Math.max(0, int(baseDamage, 0));
    const damage = type === 'true' ? base : Math.max(0, Math.floor(base * (1 - effectiveResistance / 100)));
    return Object.freeze({ damage, baseDamage: base, damageType: type, resistancePct: effectiveResistance, mitigated: base - damage });
}
export function resolveControlApplicationV1976(target = {}, controlType, duration = 1, options = {}) {
    const type = String(controlType || '').toLowerCase();
    if (!CONTROL_TYPES_V1976.includes(type))
        throw new TypeError('unsupported_control_type');
    const profile = normalizeResistanceProfileV1976(target);
    const immunity = obj(target.immunities);
    if (immunity[type] === true || target.controlImmune === true)
        return Object.freeze({ applied: false, reason: 'immune', duration: 0, type });
    const resistance = profile.control[type];
    const bossFactor = clamp(num(options.bossControlResistanceFactor, 1), 0, 1);
    const effective = clamp(resistance * bossFactor, 0, 95);
    const turns = Math.max(0, int(duration, 1));
    const finalTurns = turns === 0 ? 0 : Math.max(1, Math.ceil(turns * (1 - effective / 100)));
    if (finalTurns === 0)
        return Object.freeze({ applied: false, reason: 'zero_duration', duration: 0, type });
    return Object.freeze({ applied: true, reason: null, duration: finalTurns, type, resistancePct: effective });
}
/** Add or refresh a status with explicit stacking semantics. */
export function applyStatusEffectV1976(combatant = {}, effect = {}, options = {}) {
    var _a;
    const id = String(effect.id || '');
    if (!id || !/^[a-z0-9_:-]{1,80}$/i.test(id))
        throw new TypeError('invalid_status_id');
    const type = String(effect.type || 'debuff');
    const duration = Math.max(1, int((_a = effect.durationTurns) !== null && _a !== void 0 ? _a : effect.turns, 1));
    const incoming = { id, type, durationTurns: duration, remainingTurns: duration,
        sourceId: effect.sourceId == null ? null : String(effect.sourceId),
        dot: Math.max(0, num(effect.dot, 0)), hot: Math.max(0, num(effect.hot, 0)),
        dotPct: Math.max(0, num(effect.dotPct, 0)), hotPct: Math.max(0, num(effect.hotPct, 0)),
        damageType: DAMAGE_TYPES_V1976.includes(String(effect.damageType)) ? String(effect.damageType) : 'true',
        controlType: CONTROL_TYPES_V1976.includes(String(effect.controlType)) ? String(effect.controlType) : null,
        modifiers: clone(obj(effect.modifiers)),
        stackPolicy: ['refresh', 'stack', 'replace', 'strongest'].includes(options.stackPolicy || effect.stackPolicy) ? (options.stackPolicy || effect.stackPolicy) : 'refresh',
        stacks: Math.max(1, int(effect.stacks, 1)), maxStacks: clamp(int(effect.maxStacks, 1), 1, 99) };
    const statuses = { ...obj(combatant.statuses) };
    const old = statuses[id];
    if (old) {
        if (incoming.stackPolicy === 'stack')
            incoming.stacks = Math.min(incoming.maxStacks, Math.max(1, int(old.stacks, 1)) + incoming.stacks);
        else if (incoming.stackPolicy === 'strongest') {
            const oldStrength = num(old.dot) + num(old.hot) + num(old.dotPct) + num(old.hotPct);
            const newStrength = incoming.dot + incoming.hot + incoming.dotPct + incoming.hotPct;
            if (oldStrength > newStrength) {
                incoming.dot = num(old.dot);
                incoming.hot = num(old.hot);
                incoming.dotPct = num(old.dotPct);
                incoming.hotPct = num(old.hotPct);
            }
            incoming.remainingTurns = Math.max(int(old.remainingTurns, 0), duration);
        }
        else if (incoming.stackPolicy === 'replace') { /* incoming replaces old */ }
        else
            incoming.remainingTurns = Math.max(int(old.remainingTurns, 0), duration);
    }
    statuses[id] = incoming;
    return Object.freeze({ ...combatant, statuses });
}
/**
 * Tick all statuses once per unique turn token. DoT uses maxHp percentages or
 * flat values; HoT follows the same convention. Mitigation applies to DoT by
 * damageType. Tick output is idempotent for a repeated turnToken.
 */
export function tickCombatStatusesV1976(combatant = {}, turnToken, options = {}) {
    var _a, _b;
    const token = String(turnToken !== null && turnToken !== void 0 ? turnToken : '');
    if (!token)
        throw new TypeError('turn_token_required');
    if (combatant.lastStatusTickToken === token)
        return Object.freeze({ combatant, log: Object.freeze([]), duplicate: true });
    const out = { ...combatant, statuses: { ...obj(combatant.statuses) } };
    const maxHp = Math.max(1, num((_a = out.maxHp) !== null && _a !== void 0 ? _a : out.max_hp, 1));
    const log = [];
    for (const [id, raw] of Object.entries(out.statuses)) {
        const status = { ...obj(raw) };
        const stacks = clamp(int(status.stacks, 1), 1, 99);
        const dotRaw = (Math.max(0, num(status.dot)) + maxHp * Math.max(0, num(status.dotPct)) / 100) * stacks;
        if (dotRaw > 0 && num(out.hp) > 0) {
            const mitigated = mitigateDamageV1976(Math.max(1, Math.floor(dotRaw)), out, status.damageType || 'true', options);
            const applied = Math.min(Math.max(0, num(out.hp)), mitigated.damage);
            out.hp = Math.max(0, num(out.hp) - applied);
            log.push({ type: 'dot', statusId: id, amount: applied, damageType: mitigated.damageType });
        }
        const hotRaw = (Math.max(0, num(status.hot)) + maxHp * Math.max(0, num(status.hotPct)) / 100) * stacks;
        if (hotRaw > 0 && num(out.hp) > 0) {
            const before = num(out.hp);
            out.hp = Math.min(maxHp, before + Math.floor(hotRaw));
            log.push({ type: 'hot', statusId: id, amount: out.hp - before });
        }
        status.remainingTurns = Math.max(0, int((_b = status.remainingTurns) !== null && _b !== void 0 ? _b : status.durationTurns, 1) - 1);
        if (status.remainingTurns <= 0)
            delete out.statuses[id];
        else
            out.statuses[id] = status;
    }
    out.lastStatusTickToken = token;
    return Object.freeze({ combatant: out, log: Object.freeze(log), duplicate: false });
}
export function cleanseStatusesV1976(combatant = {}, options = {}) {
    const statuses = { ...obj(combatant.statuses) };
    const allowed = Array.isArray(options.types) ? new Set(options.types.map(String)) : null;
    const remove = [];
    for (const [id, status] of Object.entries(statuses)) {
        const type = String((status === null || status === void 0 ? void 0 : status.type) || 'debuff');
        if ((!allowed || allowed.has(type)) && (options.includeControl !== false || !(status === null || status === void 0 ? void 0 : status.controlType))) {
            remove.push(id);
            delete statuses[id];
        }
    }
    return Object.freeze({ ...combatant, statuses, cleansed: remove });
}
/** Snapshot used by class/monster adapters; no authored stats are overwritten. */
export function createUnifiedCombatantProfileV1976(input = {}) {
    var _a, _b, _c;
    return Object.freeze({ id: input.id == null ? null : String(input.id), attributes: normalizeAttributesV1976(input), resistances: normalizeResistanceProfileV1976(input),
        controlImmune: input.controlImmune === true, immunities: Object.freeze({ ...obj(input.immunities) }),
        hp: Math.max(0, num(input.hp, 0)), maxHp: Math.max(1, num((_a = input.maxHp) !== null && _a !== void 0 ? _a : input.max_hp, 1)),
        mp: Math.max(0, num((_b = input.mp) !== null && _b !== void 0 ? _b : input.maxMp, 0)), maxMp: Math.max(0, num((_c = input.maxMp) !== null && _c !== void 0 ? _c : input.max_mp, 0)),
        statuses: Object.freeze({ ...obj(input.statuses) }), combatProfileVersion: UNIFIED_COMBAT_VERSION_V1976 });
}
