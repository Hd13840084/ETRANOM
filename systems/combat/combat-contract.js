/** Shared action vocabulary. This does not grant a mode an action unless its
 * authoritative adapter explicitly advertises that capability. */
export const ETRANOM_COMBAT_MODES = Object.freeze(['solo', 'party', 'pvp']);
export const ETRANOM_COMBAT_ACTIONS = Object.freeze({
    attack: 'حمله عادی', guard: 'دفاع', skill: 'مهارت', item: 'آیتم',
    heal: 'درمان', retreat: 'عقب‌نشینی', pass: 'پایان نوبت'
});
const MODE_ACTIONS = Object.freeze({
    solo: ['attack', 'skill', 'item', 'guard', 'retreat'],
    party: ['attack', 'skill', 'item', 'guard', 'heal', 'retreat'],
    // PvP deliberately remains limited until skill/item effects are validated server-side.
    pvp: ['attack', 'guard']
});
export function isCombatActionSupported(mode, action) {
    var _a;
    return Boolean((_a = MODE_ACTIONS[mode]) === null || _a === void 0 ? void 0 : _a.includes(action));
}
export function getCombatCapabilities(mode) {
    return (MODE_ACTIONS[mode] || []).map(id => ({ id, label: ETRANOM_COMBAT_ACTIONS[id] }));
}
