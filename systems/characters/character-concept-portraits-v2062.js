/** ETRANOM V2062 — safe fallback portrait lookup.
 * The generated manifest expression in the previous file was invalid JavaScript.
 * This module is not referenced by the authentication flow; keep a valid empty registry.
 */
const portraits = Object.freeze({});
export function getCharacterConceptPortraitV2062(specializationId) {
  const id = String(specializationId || '').trim();
  return portraits[id] || null;
}
export function auditCharacterConceptPortraitsV2062() {
  const ids = Object.keys(portraits);
  return Object.freeze({ complete: false, portraitCount: ids.length, ids: Object.freeze(ids) });
}
