/** ETRANOM V2054 — final structural audit for the four-settlement Safe Zone.
 * Audit-only module: no gameplay, persistence, combat, movement or network mutations.
 */
import { SAFE_ZONE_EXTERIOR_IDS_V2037, SAFE_ZONE_EXTERIOR_CATALOG_V2037 } from './exterior-catalog-v2037.js?build=2081';
import { SAFE_ZONE_INTERIOR_IDS_V2035, SAFE_ZONE_INTERIOR_CATALOG_V2035 } from './interior-catalog-v2035.js?build=2081';
import { SAFE_ZONE_INTERIOR_DESIGNS_V2046 } from './interior-designs-v2046.js?build=2081';
import { interiorObstaclesV2036, renderIsometricInteriorV2036 } from './interior-renderer-v2036.js?build=2081';
import { SAFE_ZONE_COMPLETION_V2044 } from './completion-v2044.js?build=2081';
export const SAFE_ZONE_FINAL_CONTRACT_V2054 = Object.freeze({
    settlements: Object.freeze(['شهر خاکستر', 'کشتزار', 'ریشه‌چوب', 'سنگ‌آهن']),
    expectedBuildings: 27,
    expectedInteriors: 27,
    furniturePerInterior: 6,
    expectedWayfindingMarkers: 4
});
export function auditSafeZoneFinalV2054() {
    var _a, _b, _c, _d, _e, _f;
    const exteriorIds = [...SAFE_ZONE_EXTERIOR_IDS_V2037];
    const interiorIds = [...SAFE_ZONE_INTERIOR_IDS_V2035];
    const errors = [];
    const duplicate = values => values.filter((value, index) => values.indexOf(value) !== index);
    if (exteriorIds.length !== 27)
        errors.push(`exterior_count:${exteriorIds.length}`);
    if (interiorIds.length !== 27)
        errors.push(`interior_count:${interiorIds.length}`);
    if (duplicate(exteriorIds).length)
        errors.push('duplicate_exterior_ids');
    if (duplicate(interiorIds).length)
        errors.push('duplicate_interior_ids');
    if (exteriorIds.some(id => !interiorIds.includes(id)) || interiorIds.some(id => !exteriorIds.includes(id)))
        errors.push('exterior_interior_id_mismatch');
    const distribution = Object.fromEntries(SAFE_ZONE_FINAL_CONTRACT_V2054.settlements.map(name => [name, 0]));
    for (const id of exteriorIds) {
        const item = SAFE_ZONE_EXTERIOR_CATALOG_V2037[id];
        if (!item || !item.name || !item.zone || !item.silhouette || !item.roof || !item.materials || !item.signature || !item.exteriorProps || !item.atmosphere) {
            errors.push(`incomplete_exterior:${id}`);
        }
        if ((item === null || item === void 0 ? void 0 : item.zone) in distribution)
            distribution[item.zone] += 1;
        else
            errors.push(`unknown_settlement:${id}:${(_a = item === null || item === void 0 ? void 0 : item.zone) !== null && _a !== void 0 ? _a : 'missing'}`);
        const interior = SAFE_ZONE_INTERIOR_CATALOG_V2035[id];
        const design = SAFE_ZONE_INTERIOR_DESIGNS_V2046[id];
        if (!(interior === null || interior === void 0 ? void 0 : interior.title) || !(interior === null || interior === void 0 ? void 0 : interior.room) || !Array.isArray(interior === null || interior === void 0 ? void 0 : interior.props) || interior.props.length < 6)
            errors.push(`incomplete_interior_catalog:${id}`);
        if (!(design === null || design === void 0 ? void 0 : design.accent) || !Array.isArray(design === null || design === void 0 ? void 0 : design.spots) || design.spots.length !== 6)
            errors.push(`incomplete_interior_layout:${id}`);
        const obstacles = interiorObstaclesV2036(id);
        if (obstacles.length !== 6 || new Set(obstacles.map(p => `${p.x},${p.y}`)).size !== 6 || obstacles.some(p => p.x < 0 || p.x >= 11 || p.y < 0 || p.y >= 9))
            errors.push(`invalid_furniture_placement:${id}`);
        const html = renderIsometricInteriorV2036({ buildingId: id, title: (_b = interior === null || interior === void 0 ? void 0 : interior.title) !== null && _b !== void 0 ? _b : id, room: (_c = interior === null || interior === void 0 ? void 0 : interior.room) !== null && _c !== void 0 ? _c : '', props: (_d = interior === null || interior === void 0 ? void 0 : interior.props) !== null && _d !== void 0 ? _d : [], light: (_e = interior === null || interior === void 0 ? void 0 : interior.light) !== null && _e !== void 0 ? _e : 'warm', ambience: (_f = interior === null || interior === void 0 ? void 0 : interior.ambience) !== null && _f !== void 0 ? _f : '' });
        if (!html.includes(`prop-${design === null || design === void 0 ? void 0 : design.accent}`) || (html.match(/data-furniture-index=/g) || []).length !== 6)
            errors.push(`interior_render_contract:${id}`);
    }
    if (Object.values(distribution).some(count => count === 0))
        errors.push('settlement_without_buildings');
    if (SAFE_ZONE_COMPLETION_V2044.zones.length !== 4)
        errors.push('settlement_marker_contract');
    return Object.freeze({
        ok: errors.length === 0,
        errors: Object.freeze(errors),
        settlements: SAFE_ZONE_FINAL_CONTRACT_V2054.settlements,
        buildings: exteriorIds.length,
        interiors: interiorIds.length,
        distribution: Object.freeze(distribution),
        furniturePlacements: interiorIds.length * 6,
        wayfindingMarkers: SAFE_ZONE_COMPLETION_V2044.zones.length,
        auditScope: 'structural-content-and-render-contract; not manual visual QA'
    });
}
