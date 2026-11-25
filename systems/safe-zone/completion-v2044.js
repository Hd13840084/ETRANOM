/** ETRANOM V2044 — final wayfinding and safe-zone completion layer.
 * Visual-only markers; no collision, interaction, routing, NPC, persistence or network changes.
 */
import { SAFE_ZONE_EXTERIOR_IDS_V2037, SAFE_ZONE_EXTERIOR_CATALOG_V2037 } from './exterior-catalog-v2037.js?build=2081';
import { SAFE_ZONE_INTERIOR_CATALOG_V2035 } from './interior-catalog-v2035.js?build=2081';
export const SAFE_ZONE_COMPLETION_V2044 = Object.freeze({
    zones: Object.freeze(['شهر خاکستر', 'کشتزار', 'ریشه‌چوب', 'سنگ‌آهن']),
    exteriorBuildingCount: SAFE_ZONE_EXTERIOR_IDS_V2037.length,
    interiorCatalogCount: Object.keys(SAFE_ZONE_INTERIOR_CATALOG_V2035).length,
    markerType: 'decorative-wayfinding-sign'
});
const markers = [
    { x: 1500, y: 900, title: 'شهر خاکستر', sub: 'مرکز منطقه امن', tone: '#b58b56' },
    { x: 470, y: 740, title: 'کشتزار', sub: 'آبادی دشت‌های زرین', tone: '#a8a05b' },
    { x: 2240, y: 1020, title: 'ریشه‌چوب', sub: 'آبادی جنگل کهن', tone: '#78906b' },
    { x: 1770, y: 2190, title: 'سنگ‌آهن', sub: 'آبادی کوهستان', tone: '#92918b' }
];
const inView = (x, y, cx, cy) => x >= cx - 100 && x <= cx + 900 && y >= cy - 100 && y <= cy + 800;
function drawMarker(ctx, m, t) {
    ctx.save();
    ctx.fillStyle = 'rgba(12,15,14,.22)';
    ctx.beginPath();
    ctx.ellipse(m.x + 2, m.y + 17, 27, 7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#594632';
    ctx.fillRect(m.x - 3, m.y - 2, 6, 22);
    ctx.fillStyle = '#493a2b';
    ctx.fillRect(m.x - 28, m.y - 31, 56, 30);
    ctx.fillStyle = m.tone;
    ctx.fillRect(m.x - 25, m.y - 28, 50, 24);
    ctx.strokeStyle = '#d4bd8c';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(m.x - 25, m.y - 28, 50, 24);
    ctx.fillStyle = '#29251e';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = 'bold 10px sans-serif';
    ctx.fillText(m.title, m.x, m.y - 18, 48);
    ctx.fillStyle = '#e2d5b9';
    ctx.font = '8px sans-serif';
    ctx.fillText(m.sub, m.x, m.y - 7, 50);
    // A subtle moving highlight keeps the sign readable without flashing.
    ctx.globalAlpha = .12 + .05 * Math.sin(t / 700 + m.x);
    ctx.fillStyle = '#fff1c8';
    ctx.fillRect(m.x - 23, m.y - 26, 46, 2);
    ctx.restore();
}
export function drawSafeZoneCompletionV2044(ctx, t, cx = 0, cy = 0) {
    for (const marker of markers)
        if (inView(marker.x, marker.y, cx, cy))
            drawMarker(ctx, marker, t);
}
export function auditSafeZoneCompletionV2044() {
    const exteriorIds = SAFE_ZONE_EXTERIOR_IDS_V2037;
    const interiorIds = Object.keys(SAFE_ZONE_INTERIOR_CATALOG_V2035);
    return Object.freeze({
        exteriorCount: exteriorIds.length,
        exteriorUnique: new Set(exteriorIds).size === exteriorIds.length,
        exteriorMetadataComplete: exteriorIds.every(id => { var _a, _b; return ((_a = SAFE_ZONE_EXTERIOR_CATALOG_V2037[id]) === null || _a === void 0 ? void 0 : _a.name) && ((_b = SAFE_ZONE_EXTERIOR_CATALOG_V2037[id]) === null || _b === void 0 ? void 0 : _b.signature); }),
        interiorCount: interiorIds.length,
        interiorMetadataComplete: interiorIds.every(id => SAFE_ZONE_INTERIOR_CATALOG_V2035[id]),
        zoneMarkers: markers.length,
        zonesCovered: markers.map(m => m.title)
    });
}
