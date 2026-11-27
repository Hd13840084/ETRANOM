/** Strict structural validation for the shared 40-specialization contract. */
const arr = value => Array.isArray(value) ? value : [];
const obj = value => value && typeof value === 'object' && !Array.isArray(value) ? value : {};
export function validateSpecializationRegistryManifest(manifest = {}) {
    const errors = [];
    const classes = arr(manifest.classes);
    const modes = arr(manifest.combat_modes);
    const classIds = classes.map(x => String((x === null || x === void 0 ? void 0 : x.id) || ''));
    const specEntries = classes.flatMap(c => arr(c === null || c === void 0 ? void 0 : c.specializations).map(s => ({ classEntry: c, specialization: s })));
    const specIds = specEntries.map(x => { var _a; return String(((_a = x.specialization) === null || _a === void 0 ? void 0 : _a.id) || ''); });
    const implemented = specEntries.filter(x => { var _a, _b; return ((_a = x.specialization) === null || _a === void 0 ? void 0 : _a.status) === 'implemented' && ((_b = x.classEntry) === null || _b === void 0 ? void 0 : _b.status) === 'implemented'; });
    const reserved = specEntries.filter(x => { var _a, _b; return ((_a = x.specialization) === null || _a === void 0 ? void 0 : _a.status) === 'reserved' || ((_b = x.classEntry) === null || _b === void 0 ? void 0 : _b.status) === 'reserved'; });
    if (classes.length !== 10)
        errors.push(`class_count:${classes.length}/10`);
    if (new Set(classIds).size !== classIds.length)
        errors.push('duplicate_class_id');
    if (specEntries.length !== 40)
        errors.push(`specialization_count:${specEntries.length}/40`);
    if (new Set(specIds).size !== specIds.length)
        errors.push('duplicate_specialization_id');
    if (implemented.length !== 8)
        errors.push(`implemented_specialization_count:${implemented.length}/8`);
    if (reserved.length !== 32)
        errors.push(`reserved_specialization_count:${reserved.length}/32`);
    for (const c of classes) {
        if (!String((c === null || c === void 0 ? void 0 : c.id) || '').trim())
            errors.push('class_missing_id');
        if (arr(c === null || c === void 0 ? void 0 : c.specializations).length !== 4)
            errors.push(`class_must_have_four_specializations:${(c === null || c === void 0 ? void 0 : c.id) || 'unknown'}`);
        if (!['implemented', 'reserved'].includes(c === null || c === void 0 ? void 0 : c.status))
            errors.push(`invalid_class_status:${(c === null || c === void 0 ? void 0 : c.id) || 'unknown'}`);
    }
    for (const { classEntry, specialization } of specEntries) {
        const id = String((specialization === null || specialization === void 0 ? void 0 : specialization.id) || '');
        if (!id)
            errors.push(`specialization_missing_id:${(classEntry === null || classEntry === void 0 ? void 0 : classEntry.id) || 'unknown'}`);
        if (!['implemented', 'reserved'].includes(specialization === null || specialization === void 0 ? void 0 : specialization.status))
            errors.push(`invalid_specialization_status:${id || 'unknown'}`);
        if ((classEntry === null || classEntry === void 0 ? void 0 : classEntry.status) === 'reserved' && (specialization === null || specialization === void 0 ? void 0 : specialization.status) !== 'reserved')
            errors.push(`reserved_class_contains_implemented_specialization:${id}`);
    }
    for (const mode of ['solo', 'party', 'pvp'])
        if (!modes.includes(mode))
            errors.push(`missing_combat_mode:${mode}`);
    const aliasMap = new Map();
    for (const { specialization } of specEntries) {
        const canonical = String((specialization === null || specialization === void 0 ? void 0 : specialization.id) || '');
        for (const alias of arr(specialization === null || specialization === void 0 ? void 0 : specialization.aliases)) {
            const key = String(alias);
            if (!key || specIds.includes(key) || aliasMap.has(key))
                errors.push(`duplicate_or_conflicting_alias:${key}`);
            aliasMap.set(key, canonical);
        }
    }
    return Object.freeze({ ok: errors.length === 0, errors: Object.freeze(errors), counts: Object.freeze({
            classes: classes.length, specializations: specEntries.length,
            implemented: implemented.length, reserved: reserved.length,
            combatModes: modes.length, aliases: aliasMap.size
        }) });
}
export function validateSpecializationContentAgainstRegistry({ registry, content, specializationId } = {}) {
    var _a, _b;
    const errors = [];
    const record = (_a = registry === null || registry === void 0 ? void 0 : registry.getSpecialization) === null || _a === void 0 ? void 0 : _a.call(registry, specializationId);
    if (!record)
        errors.push('unknown_specialization');
    else if (record.status !== 'implemented')
        errors.push('specialization_reserved_not_playable');
    if (!obj(content).id)
        errors.push('content_id_required');
    else if (((_b = registry === null || registry === void 0 ? void 0 : registry.resolveCanonicalId) === null || _b === void 0 ? void 0 : _b.call(registry, content.id)) !== (record === null || record === void 0 ? void 0 : record.id))
        errors.push('content_specialization_id_mismatch');
    if (!Array.isArray(content === null || content === void 0 ? void 0 : content.skills))
        errors.push('skills_array_required');
    return Object.freeze({ ok: errors.length === 0, errors: Object.freeze(errors), specializationId: (record === null || record === void 0 ? void 0 : record.id) || null });
}
