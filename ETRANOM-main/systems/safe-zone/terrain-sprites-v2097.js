// V2097: runtime hookup for the authored V2096 isometric ground tile pack.
// Visual-only layer: it does not alter navigation, collision, POIs, encounters or saves.
const ROOT = './assets/safe-zone/terrain-v2096/';
const REGION_LAYOUT = [
  { id: 'ashen_city', cx: 1500, cy: 1050, rx: 720, ry: 610, files: ['ashen_city_01.png','ashen_city_02.png','ashen_city_03.png','ashen_city_04.png'] },
  { id: 'farmland', cx: 490, cy: 800, rx: 480, ry: 465, files: ['farmland_01.png','farmland_02.png','farmland_03.png','farmland_04.png'] },
  { id: 'rootwood', cx: 2480, cy: 900, rx: 520, ry: 455, files: ['rootwood_01.png','rootwood_02.png','rootwood_03.png','rootwood_04.png'] },
  { id: 'ironstone', cx: 1900, cy: 2140, rx: 510, ry: 430, files: ['ironstone_01.png','ironstone_02.png','ironstone_03.png','ironstone_04.png'] }
];
const imageCache = new Map();
function getImage(file) {
  let img = imageCache.get(file);
  if (!img && typeof Image !== 'undefined') {
    img = new Image();
    img.src = ROOT + file;
    imageCache.set(file, img);
  }
  return img;
}
function hash(a, b, seed) {
  const v = Math.sin(a * 127.1 + b * 311.7 + seed * 74.7) * 43758.5453;
  return v - Math.floor(v);
}
export function drawTerrainSpritesV2097(ctx, camX, camY) {
  if (!ctx || typeof ctx.drawImage !== 'function') return;
  const left = camX - 220, right = camX + 940, top = camY - 180, bottom = camY + 850;
  for (let r = 0; r < REGION_LAYOUT.length; r++) {
    const region = REGION_LAYOUT[r];
    // Tile lattice is clipped to each settlement footprint. Existing roads and buildings
    // are painted later in the world pass and therefore remain readable and interactive.
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(region.cx, region.cy, region.rx, region.ry, 0, 0, Math.PI * 2);
    ctx.clip();
    const startCol = Math.floor((left - region.cx) / 100) - 1;
    const endCol = Math.ceil((right - region.cx) / 100) + 1;
    const startRow = Math.floor((top - region.cy) / 66) - 1;
    const endRow = Math.ceil((bottom - region.cy) / 66) + 1;
    for (let row = startRow; row <= endRow; row++) {
      const y = region.cy + row * 66;
      if (y < top - 100 || y > bottom + 100) continue;
      for (let col = startCol; col <= endCol; col++) {
        const x = region.cx + col * 100 + ((row & 1) ? 50 : 0);
        if (x < left - 100 || x > right + 100) continue;
        const pick = Math.floor(hash(col, row, r + 2097) * region.files.length);
        const img = getImage(region.files[pick]);
        if (!img || !img.complete || !img.naturalWidth) continue;
        ctx.drawImage(img, x - 100, y - 66, 200, 132);
      }
    }
    ctx.restore();
  }
}
export const TERRAIN_SPRITE_REGIONS_V2097 = REGION_LAYOUT.map(r => ({ id: r.id, tileCount: r.files.length }));
