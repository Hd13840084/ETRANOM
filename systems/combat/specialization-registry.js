var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _SpecializationRegistry_classes, _SpecializationRegistry_specializations, _SpecializationRegistry_aliases, _SpecializationRegistry_modes;
/**
 * ETRANOM shared specialization registry.
 * This module is deliberately data-only: it resolves canonical IDs and never
 * grants reserved specializations playable status or invents their content.
 */
const asArray = value => Array.isArray(value) ? value : [];
const asObject = value => value && typeof value === 'object' && !Array.isArray(value) ? value : {};
export class SpecializationRegistry {
    constructor(manifest = {}) {
        _SpecializationRegistry_classes.set(this, new Map());
        _SpecializationRegistry_specializations.set(this, new Map());
        _SpecializationRegistry_aliases.set(this, new Map());
        _SpecializationRegistry_modes.set(this, void 0);
        __classPrivateFieldSet(this, _SpecializationRegistry_modes, Object.freeze(asArray(manifest.combat_modes).map(String)), "f");
        for (const classEntry of asArray(manifest.classes)) {
            const classId = String((classEntry === null || classEntry === void 0 ? void 0 : classEntry.id) || '').trim();
            if (!classId)
                throw new TypeError('registry_class_id_required');
            if (__classPrivateFieldGet(this, _SpecializationRegistry_classes, "f").has(classId))
                throw new TypeError(`duplicate_class_id:${classId}`);
            const specializations = asArray(classEntry.specializations);
            if (specializations.length !== 4)
                throw new TypeError(`class_requires_four_specializations:${classId}`);
            __classPrivateFieldGet(this, _SpecializationRegistry_classes, "f").set(classId, Object.freeze({
                id: classId,
                status: classEntry.status === 'implemented' ? 'implemented' : 'reserved',
                specializationIds: Object.freeze(specializations.map(s => String((s === null || s === void 0 ? void 0 : s.id) || '')))
            }));
            for (const entry of specializations) {
                const id = String((entry === null || entry === void 0 ? void 0 : entry.id) || '').trim();
                if (!id)
                    throw new TypeError(`registry_specialization_id_required:${classId}`);
                if (__classPrivateFieldGet(this, _SpecializationRegistry_specializations, "f").has(id) || __classPrivateFieldGet(this, _SpecializationRegistry_aliases, "f").has(id))
                    throw new TypeError(`duplicate_specialization_id:${id}`);
                const status = entry.status === 'implemented' && classEntry.status === 'implemented' ? 'implemented' : 'reserved';
                const record = Object.freeze({ id, classId, status, aliases: Object.freeze(asArray(entry.aliases).map(String)) });
                __classPrivateFieldGet(this, _SpecializationRegistry_specializations, "f").set(id, record);
                for (const alias of record.aliases) {
                    if (!alias || __classPrivateFieldGet(this, _SpecializationRegistry_specializations, "f").has(alias) || __classPrivateFieldGet(this, _SpecializationRegistry_aliases, "f").has(alias))
                        throw new TypeError(`duplicate_specialization_alias:${alias}`);
                    __classPrivateFieldGet(this, _SpecializationRegistry_aliases, "f").set(alias, id);
                }
            }
        }
        Object.freeze(this);
    }
    get combatModes() { return __classPrivateFieldGet(this, _SpecializationRegistry_modes, "f"); }
    getClass(classId) { return __classPrivateFieldGet(this, _SpecializationRegistry_classes, "f").get(String(classId || '')) || null; }
    getSpecialization(specializationId) {
        const input = String(specializationId || '');
        const canonicalId = __classPrivateFieldGet(this, _SpecializationRegistry_aliases, "f").get(input) || input;
        return __classPrivateFieldGet(this, _SpecializationRegistry_specializations, "f").get(canonicalId) || null;
    }
    resolveCanonicalId(specializationId) { var _a; return ((_a = this.getSpecialization(specializationId)) === null || _a === void 0 ? void 0 : _a.id) || null; }
    isPlayable(specializationId) { var _a; return ((_a = this.getSpecialization(specializationId)) === null || _a === void 0 ? void 0 : _a.status) === 'implemented'; }
    listSpecializations({ status } = {}) {
        const all = [...__classPrivateFieldGet(this, _SpecializationRegistry_specializations, "f").values()];
        return Object.freeze(all.filter(item => !status || item.status === status));
    }
    get counts() {
        const all = [...__classPrivateFieldGet(this, _SpecializationRegistry_specializations, "f").values()];
        return Object.freeze({ classes: __classPrivateFieldGet(this, _SpecializationRegistry_classes, "f").size, specializations: all.length,
            implemented: all.filter(x => x.status === 'implemented').length,
            reserved: all.filter(x => x.status === 'reserved').length });
    }
}
_SpecializationRegistry_classes = new WeakMap(), _SpecializationRegistry_specializations = new WeakMap(), _SpecializationRegistry_aliases = new WeakMap(), _SpecializationRegistry_modes = new WeakMap();
export function createSpecializationRegistry(manifest) {
    return new SpecializationRegistry(asObject(manifest));
}
