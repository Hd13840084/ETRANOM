/**
 * ETRANOM shared specialization registry.
 * This module is deliberately data-only: it resolves canonical IDs and never
 * grants reserved specializations playable status or invents their content.
 */
const asArray = value => Array.isArray(value) ? value : [];
const asObject = value => value && typeof value === 'object' && !Array.isArray(value) ? value : {};

export class SpecializationRegistry {
  #classes = new Map();
  #specializations = new Map();
  #aliases = new Map();
  #modes;

  constructor(manifest = {}) {
    this.#modes = Object.freeze(asArray(manifest.combat_modes).map(String));
    for (const classEntry of asArray(manifest.classes)) {
      const classId = String(classEntry?.id || '').trim();
      if (!classId) throw new TypeError('registry_class_id_required');
      if (this.#classes.has(classId)) throw new TypeError(`duplicate_class_id:${classId}`);
      const specializations = asArray(classEntry.specializations);
      if (specializations.length !== 4) throw new TypeError(`class_requires_four_specializations:${classId}`);
      this.#classes.set(classId, Object.freeze({
        id: classId,
        status: classEntry.status === 'implemented' ? 'implemented' : 'reserved',
        specializationIds: Object.freeze(specializations.map(s => String(s?.id || '')))
      }));
      for (const entry of specializations) {
        const id = String(entry?.id || '').trim();
        if (!id) throw new TypeError(`registry_specialization_id_required:${classId}`);
        if (this.#specializations.has(id) || this.#aliases.has(id)) throw new TypeError(`duplicate_specialization_id:${id}`);
        const status = entry.status === 'implemented' && classEntry.status === 'implemented' ? 'implemented' : 'reserved';
        const record = Object.freeze({ id, classId, status, aliases: Object.freeze(asArray(entry.aliases).map(String)) });
        this.#specializations.set(id, record);
        for (const alias of record.aliases) {
          if (!alias || this.#specializations.has(alias) || this.#aliases.has(alias)) throw new TypeError(`duplicate_specialization_alias:${alias}`);
          this.#aliases.set(alias, id);
        }
      }
    }
    Object.freeze(this);
  }

  get combatModes() { return this.#modes; }
  getClass(classId) { return this.#classes.get(String(classId || '')) || null; }
  getSpecialization(specializationId) {
    const input = String(specializationId || '');
    const canonicalId = this.#aliases.get(input) || input;
    return this.#specializations.get(canonicalId) || null;
  }
  resolveCanonicalId(specializationId) { return this.getSpecialization(specializationId)?.id || null; }
  isPlayable(specializationId) { return this.getSpecialization(specializationId)?.status === 'implemented'; }
  listSpecializations({ status } = {}) {
    const all = [...this.#specializations.values()];
    return Object.freeze(all.filter(item => !status || item.status === status));
  }
  get counts() {
    const all = [...this.#specializations.values()];
    return Object.freeze({ classes: this.#classes.size, specializations: all.length,
      implemented: all.filter(x => x.status === 'implemented').length,
      reserved: all.filter(x => x.status === 'reserved').length });
  }
}

export function createSpecializationRegistry(manifest) {
  return new SpecializationRegistry(asObject(manifest));
}
