// ETRANOM V2164 — native-resolution alpha contact masks derived from shipped PNG assets.
// This is pixel-mask collision on the sprite contact slice, not a full 3D mesh collider.
import masks from './asset-contact-masks-v2164.json' with { type: 'json' };

const decoded = new Map();
const contactDistanceFields = new Map();
function normalizeAssetPath(asset) {
  const text = String(asset || '').replace(/\\/g, '/');
  const marker = 'safe-zone/';
  const at = text.lastIndexOf(marker);
  return at >= 0 ? text.slice(at + marker.length) : text.replace(/^\.\//, '');
}
function decodeMask(key) {
  if (decoded.has(key)) return decoded.get(key);
  const row = masks[key]; if (!row?.bits) return null;
  let binary;
  try { binary = typeof atob === 'function' ? atob(row.bits) : Buffer.from(row.bits, 'base64').toString('binary'); }
  catch { return null; }
  const bytes = new Uint8Array(binary.length);
  for (let i=0;i<binary.length;i++) bytes[i]=binary.charCodeAt(i);
  decoded.set(key, bytes); return bytes;
}
export function getAssetContactMaskV2164(asset) {
  const key = normalizeAssetPath(asset), mask = masks[key];
  if (!mask) return null;
  return Object.freeze({ ...mask, key, bytes: decodeMask(key) });
}

// Build a signed chamfer-distance field once per sprite. This turns the per-frame
// pixel-collider query from a ring-search over thousands of pixels into O(1).
// Distances use 3 units per orthogonal pixel and 4 per diagonal pixel.
function buildContactDistanceField(key) {
  if (contactDistanceFields.has(key)) return contactDistanceFields.get(key);
  const row = masks[key], bits = decodeMask(key);
  if (!row || !bits) return null;
  const width = row.width, height = row.height, count = width * height;
  const inside = index => !!(bits[index >> 3] & (1 << (7 - (index & 7))));
  const transform = seedOpaque => {
    const d = new Uint8Array(count);
    for (let i = 0; i < count; i++) d[i] = inside(i) === seedOpaque ? 0 : 255;
    // The outside of a sprite is transparent and is a valid seed for alpha pixels.
    if (!seedOpaque) {
      for (let x = 0; x < width; x++) { const a=x, b=(height-1)*width+x; if (inside(a)) d[a]=Math.min(d[a],3); if (inside(b)) d[b]=Math.min(d[b],3); }
      for (let y = 0; y < height; y++) { const a=y*width, b=a+width-1; if (inside(a)) d[a]=Math.min(d[a],3); if (inside(b)) d[b]=Math.min(d[b],3); }
    }
    const relax = (i, n, cost) => { if (n >= 0 && n < count) d[i] = Math.min(d[i], Math.min(255, d[n] + cost)); };
    for (let y=0; y<height; y++) for (let x=0; x<width; x++) {
      const i=y*width+x;
      if (x>0) relax(i,i-1,3);
      if (y>0) { relax(i,i-width,3); if(x>0)relax(i,i-width-1,4); if(x+1<width)relax(i,i-width+1,4); }
    }
    for (let y=height-1; y>=0; y--) for (let x=width-1; x>=0; x--) {
      const i=y*width+x;
      if (x+1<width) relax(i,i+1,3);
      if (y+1<height) { relax(i,i+width,3); if(x>0)relax(i,i+width-1,4); if(x+1<width)relax(i,i+width+1,4); }
    }
    return d;
  };
  const toOpaque = transform(true), toTransparent = transform(false), signed = new Uint8Array(count);
  for (let i=0;i<count;i++) signed[i] = inside(i) ? toTransparent[i] : toOpaque[i];
  contactDistanceFields.set(key, signed);
  return signed;
}
export function getAssetContactDistanceFieldV2164(asset) {
  const key = normalizeAssetPath(asset);
  return buildContactDistanceField(key);
}

function bitAt(mask, x, y) {
  if (!mask?.bytes || x<0 || y<0 || x>=mask.width || y>=mask.height) return false;
  const index=y*mask.width+x;
  return !!(mask.bytes[index>>3] & (1 << (7-(index&7))));
}
export function buildPixelContactColliderV2164({ id, asset, x, y, width, kind='environment-prop', source='V2164-native-alpha-mask', extra={} }) {
  const mask=getAssetContactMaskV2164(asset), w=Number(width);
  if(!mask?.bytes || ![x,y,w].every(Number.isFinite) || w<=0) return null;
  const drawHeight=w*mask.sourceHeight/mask.sourceWidth;
  const contactHeight=drawHeight*mask.contactSliceHeight;
  const b=mask.occupied, minX=Number(x)-w/2+w*b.minX, maxX=Number(x)-w/2+w*b.maxX;
  const minY=Number(y)-contactHeight+contactHeight*b.minY, maxY=Number(y)-contactHeight+contactHeight*b.maxY;
  return Object.freeze({id:String(id),shape:'alpha-mask',x:Number(x),y:Number(y),imageWidth:w,imageHeight:drawHeight,contactHeight,
    maskWidth:mask.width,maskHeight:mask.height,maskBytes:mask.bytes,maskDistanceField:getAssetContactDistanceFieldV2164(mask.key),maskDistanceUnit:1/3,maskBitOrder:'msb-first',bounds:Object.freeze({minX,maxX,minY,maxY}),
    kind,source,asset:mask.key,maskResolution:`${mask.width}x${mask.height}`,maskStatus:'native-resolution-alpha-contact-mask',...extra});
}
export function auditAssetContactMasksV2164() {
  const errors=[]; let totalPixels=0, distanceFields=0;
  for(const [name,m] of Object.entries(masks)) {
    if(!(m.width>0&&m.height>0&&m.bits)) errors.push(`invalid-mask:${name}`);
    const bytes=decodeMask(name); if(!bytes || bytes.length!==Math.ceil(m.width*m.height/8)) errors.push(`invalid-bitmap:${name}`);
    if(!(m.occupied?.maxX>m.occupied?.minX&&m.occupied?.maxY>m.occupied?.minY)) errors.push(`empty-mask:${name}`);
    totalPixels+=m.width*m.height;
    if (buildContactDistanceField(name)?.length === m.width*m.height) distanceFields++;
  }
  return Object.freeze({ok:errors.length===0,version:2164,assets:Object.keys(masks).length,totalSourcePixels:totalPixels,distanceFields,
    resolution:'per-source-pixel',method:'PNG-alpha-raster-lower-contact-slice-with-cached-chamfer-distance-field',errors:Object.freeze(errors)});
}
export const ETRANOM_ASSET_CONTACT_MASKS_V2164=Object.freeze({version:2164,count:Object.keys(masks).length,resolution:'native-source-pixel',
  source:'PNG alpha channel, lower 55 percent contact slice; unfilled transparent holes',assets:Object.freeze(Object.keys(masks))});
