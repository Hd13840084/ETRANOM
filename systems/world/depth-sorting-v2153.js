/** ETRANOM V2153 — deterministic isometric depth ordering. */
export const ETRANOM_DEPTH_SORTING_V2153 = Object.freeze({
  projection: 'ground-anchor-x-plus-y',
  tieBreak: 'stable-source-order',
  layers: Object.freeze({ ground: 0, decals: 10, lowProps: 20, actors: 30, structures: 40, canopy: 50, overlays: 60 }),
  rules: Object.freeze([
    'Sort world sprites by their ground-contact anchor, never by sprite top-left.',
    'Keep UI/nameplates in screen space and outside world-depth sorting.',
    'Use explicit layer offsets only for intentional same-anchor ordering.',
    'Use screenDepth when supplied by a calibrated projection; do not invent a Z-to-screen scale.',
    'Split tall sprites into rear and foreground passes when their footprint straddles the actor lane.'
  ])
});

export function getIsometricDepthKeyV2153(item, fallbackIndex = 0) {
  const x = Number(item?.depthX ?? item?.groundX ?? item?.anchorX ?? item?.x ?? 0);
  const y = Number(item?.depthY ?? item?.groundY ?? item?.anchorY ?? item?.y ?? 0);
  const layer = Number(item?.depthLayer ?? item?.layerOrder ?? 0);
  // Height is not mixed into depth with an arbitrary epsilon. The world has no
  // metre-calibrated Z-to-screen transform yet; callers may provide screenDepth
  // directly or an explicitly calibrated depthElevationScale.
  const explicitScreenDepth = Number(item?.screenDepth);
  const elevation = Number(item?.elevation ?? item?.z ?? 0);
  const elevationScale = Number(item?.depthElevationScale ?? 0);
  const baseDepth = Number.isFinite(explicitScreenDepth)
    ? explicitScreenDepth
    : (x + y) - (Number.isFinite(elevation) && Number.isFinite(elevationScale) ? elevation * elevationScale : 0);
  return baseDepth + layer * 0.000001 + fallbackIndex * 0.000000001;
}

export function sortIsometricDepthV2153(items, getAnchor = item => item) {
  return (Array.isArray(items) ? items : []).map((item, index) => ({ item, index, anchor: getAnchor(item) || item }))
    .sort((a, b) => getIsometricDepthKeyV2153(a.anchor, a.index) - getIsometricDepthKeyV2153(b.anchor, b.index))
    .map(entry => entry.item);
}

export function splitAtActorDepthV2153(items, actor, getAnchor = item => item) {
  const depth = getIsometricDepthKeyV2153(actor);
  const sorted = sortIsometricDepthV2153(items, getAnchor);
  const far = [], near = [];
  for (const item of sorted) (getIsometricDepthKeyV2153(getAnchor(item) || item) <= depth ? far : near).push(item);
  return { far, near, actorDepth: depth };
}

export function auditDepthSortingV2153() {
  const sample = [{ id: 'near', x: 8, y: 8 }, { id: 'far', x: 2, y: 2 }, { id: 'middle', x: 5, y: 5 }];
  const sorted = sortIsometricDepthV2153(sample);
  const split = splitAtActorDepthV2153(sample, { x: 5, y: 5 });
  const ok = sorted.map(x => x.id).join(',') === 'far,middle,near' && split.far.length === 2 && split.near.length === 1;
  return { ok, projection: ETRANOM_DEPTH_SORTING_V2153.projection, sampleOrder: sorted.map(x => x.id), split: { far: split.far.length, near: split.near.length } };
}
