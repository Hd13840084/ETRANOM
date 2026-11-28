// ETRANOM V2140 — Stage 3/24 geometry-driven terrain tile rendering.
// Reuses the existing V2096 authored PNGs and tile cadence; only the clipping
// footprint becomes a canonical polygon from world-geometry-v2140.js.
import { ETRANOM_WORLD_GEOMETRY_V2140, tracePolygonPathV2140 } from '../world/world-geometry-v2140.js?v=2140';

const imageCache = new Map();
function getImage(filePath) {
  let img = imageCache.get(filePath);
  if (!img && typeof Image !== 'undefined') {
    img = new Image();
    img.decoding = 'async';
    img.src = filePath;
    imageCache.set(filePath, img);
  }
  return img;
}
function hash(a, b, seed) {
  const value = Math.sin(a * 127.1 + b * 311.7 + seed * 74.7) * 43758.5453;
  return value - Math.floor(value);
}

export function drawTerrainSpritesV2140(ctx, camX = 0, camY = 0) {
  if (!ctx || typeof ctx.drawImage !== 'function' || typeof ctx.save !== 'function') return { drawn: 0, regions: 0 };
  const left = camX - 220, right = camX + 940, top = camY - 180, bottom = camY + 850;
  let drawn = 0, regionsDrawn = 0;
  for (const region of ETRANOM_WORLD_GEOMETRY_V2140.terrainFootprints) {
    const bounds = region.bounds;
    if (bounds.maxX < left || bounds.minX > right || bounds.maxY < top || bounds.minY > bottom) continue;
    ctx.save();
    if (!tracePolygonPathV2140(ctx, region.points)) { ctx.restore(); continue; }
    ctx.clip();
    const tile = region.tilePlacement;
    const startCol = Math.floor((left - region.center.x) / tile.stepX) - 1;
    const endCol = Math.ceil((right - region.center.x) / tile.stepX) + 1;
    const startRow = Math.floor((top - region.center.y) / tile.stepY) - 1;
    const endRow = Math.ceil((bottom - region.center.y) / tile.stepY) + 1;
    let regionDrawn = 0;
    for (let row = startRow; row <= endRow; row++) {
      const y = region.center.y + row * tile.stepY;
      if (y < top - 100 || y > bottom + 100) continue;
      for (let col = startCol; col <= endCol; col++) {
        const x = region.center.x + col * tile.stepX + ((row & 1) ? tile.alternateRowOffsetX : 0);
        if (x < left - 100 || x > right + 100) continue;
        const variant = Math.floor(hash(col, row, region.variantSeed) * region.assetFiles.length);
        const image = getImage(region.assetRoot + region.assetFiles[variant]);
        if (!image || !image.complete || !image.naturalWidth) continue;
        ctx.drawImage(image, x - tile.width / 2, y - tile.height / 2, tile.width, tile.height);
        drawn++;
        regionDrawn++;
      }
    }
    if (regionDrawn) regionsDrawn++;
    ctx.restore();
  }
  return { drawn, regions: regionsDrawn };
}

export function auditTerrainSpriteCatalogV2140() {
  const regions = ETRANOM_WORLD_GEOMETRY_V2140.terrainFootprints;
  const assets = regions.flatMap((region) => region.assetFiles);
  return Object.freeze({
    ok: regions.length === 4 && assets.length === 16 && new Set(assets).size === 16,
    version: 2140,
    regions: regions.length,
    tileVariants: assets.length,
    assetRoot: './assets/safe-zone/terrain-v2096/',
    placementCadence: { stepX: 100, stepY: 66, tileWidth: 200, tileHeight: 132 },
    collisionChanges: false
  });
}

export const TERRAIN_SPRITE_REGIONS_V2140 = Object.freeze(ETRANOM_WORLD_GEOMETRY_V2140.terrainFootprints.map((region) => Object.freeze({ id: region.id, tileCount: region.assetFiles.length, pointCount: region.pointCount })));
