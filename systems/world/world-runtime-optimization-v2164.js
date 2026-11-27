// ETRANOM V2164 — Stage 22: bounded caches, world chunk culling and adaptive frame quality.
const clamp = (v, a, b) => Math.max(a, Math.min(b, Number(v) || 0));

export function createBoundedLRUCacheV2164(limit = 128) {
  const max = Math.max(8, Math.floor(Number(limit) || 128)), map = new Map();
  return Object.freeze({
    get size() { return map.size; },
    get(key) { if (!map.has(key)) return undefined; const v = map.get(key); map.delete(key); map.set(key, v); return v; },
    set(key, value) { if (map.has(key)) map.delete(key); map.set(key, value); while (map.size > max) map.delete(map.keys().next().value); return value; },
    has: key => map.has(key), delete: key => map.delete(key), clear: () => map.clear(),
    stats: () => Object.freeze({ size: map.size, limit: max })
  });
}

export function buildWorldChunkIndexV2164(entries = [], chunkSize = 384) {
  const size = clamp(chunkSize, 96, 1024), chunks = new Map(), records = [];
  for (const entry of entries) {
    const x = Number(entry.x), y = Number(entry.y); if (!Number.isFinite(x) || !Number.isFinite(y)) continue;
    const record = Object.freeze({ ...entry, depth: Number.isFinite(Number(entry.depth)) ? Number(entry.depth) : x + y }); records.push(record);
    const cx = Math.floor(x / size), cy = Math.floor(y / size), key = `${cx},${cy}`;
    if (!chunks.has(key)) chunks.set(key, []); chunks.get(key).push(record);
  }
  for (const list of chunks.values()) list.sort((a,b) => a.depth - b.depth);
  return Object.freeze({ version: 2164, chunkSize: size, chunks, records: Object.freeze(records), count: records.length });
}
export function queryWorldChunkIndexV2164(index, bounds = {}) {
  if (!index?.chunks) return [];
  const left = Number(bounds.left ?? -Infinity), right = Number(bounds.right ?? Infinity), top = Number(bounds.top ?? -Infinity), bottom = Number(bounds.bottom ?? Infinity);
  const size = index.chunkSize, minX = Number.isFinite(left) ? Math.floor(left / size) : -100000, maxX = Number.isFinite(right) ? Math.floor(right / size) : 100000;
  const minY = Number.isFinite(top) ? Math.floor(top / size) : -100000, maxY = Number.isFinite(bottom) ? Math.floor(bottom / size) : 100000;
  const seen = new Set(), out = [];
  for (let x = minX; x <= maxX; x++) for (let y = minY; y <= maxY; y++) for (const item of index.chunks.get(`${x},${y}`) || []) {
    if (seen.has(item.id)) continue; seen.add(item.id);
    if (item.x >= left && item.x <= right && item.y >= top && item.y <= bottom) out.push(item);
  }
  return out.sort((a,b) => a.depth - b.depth);
}

export function createWorldPerformanceGovernorV2164() {
  let ema = 16.7, slowFrames = 0, fastFrames = 0, last = 0, quality = 'high';
  return Object.freeze({
    observe(timestamp) {
      const now = Number(timestamp) || 0;
      if (last && now > last) {
        const frame = clamp(now - last, 1, 120); ema = ema * .88 + frame * .12;
        if (ema > 24) { slowFrames++; fastFrames = 0; }
        else if (ema < 18) { fastFrames++; slowFrames = Math.max(0, slowFrames - 1); }
        else { slowFrames = Math.max(0, slowFrames - 1); fastFrames = 0; }
        if (slowFrames >= 24) quality = 'low'; else if (slowFrames >= 9 && quality === 'high') quality = 'medium';
        if (fastFrames >= 90) { quality = 'high'; slowFrames = 0; }
        else if (fastFrames >= 36 && quality === 'low') quality = 'medium';
      }
      last = now;
      const profile = quality === 'low' ? { detailPass: false, castShadows: false, particleScale: .42, vegetationMotion: false }
        : quality === 'medium' ? { detailPass: true, castShadows: false, particleScale: .72, vegetationMotion: true }
          : { detailPass: true, castShadows: true, particleScale: 1, vegetationMotion: true };
      return Object.freeze({ quality, averageFrameMs: Math.round(ema * 10) / 10, targetFps: 60, ...profile });
    },
    current() { return Object.freeze({ quality, averageFrameMs: Math.round(ema * 10) / 10 }); },
    reset() { ema = 16.7; slowFrames = 0; fastFrames = 0; last = 0; quality = 'high'; }
  });
}

export function createFixedStepClockV2164(stepSeconds = 1 / 30, maxSteps = 4) {
  const step = clamp(stepSeconds, 1 / 120, 1 / 10), max = Math.floor(clamp(maxSteps, 1, 8)); let accumulator = 0;
  return Object.freeze({
    advance(dt, callback) {
      accumulator = Math.min(accumulator + clamp(dt, 0, .25), step * max);
      let count = 0; while (accumulator >= step && count < max) { callback(step); accumulator -= step; count++; }
      return Object.freeze({ steps: count, alpha: accumulator / step, droppedSeconds: Math.max(0, clamp(dt,0,.25) - step * count) });
    }, reset() { accumulator = 0; }
  });
}

export function auditWorldRuntimeOptimizationV2164() {
  const lru = createBoundedLRUCacheV2164(8); for (let i=0;i<20;i++) lru.set(i,i);
  const index = buildWorldChunkIndexV2164([{id:'a',x:10,y:10},{id:'b',x:500,y:500},{id:'c',x:15,y:12}],128);
  const visible = queryWorldChunkIndexV2164(index,{left:0,right:100,top:0,bottom:100});
  const governor=createWorldPerformanceGovernorV2164(); let result;
  for(let i=0;i<50;i++) result=governor.observe(i*34);
  const errors=[];
  if(lru.size>8)errors.push('lru-unbounded'); if(visible.length!==2)errors.push('chunk-cull'); if(result.quality==='high')errors.push('adaptive-quality-not-downshifted');
  return Object.freeze({ok:errors.length===0,version:2164,stage:22,lru:lru.stats(),visibleRecords:visible.length,adaptiveQuality:result?.quality,errors:Object.freeze(errors)});
}
