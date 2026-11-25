/* ETRANOM modular content loader v1. Append-only JSON content packs. */
const ROOT = new URL('../../content/', import.meta.url);
const REQUIRED = {
  classes: ['id','name','description','specializations'],
  specializations: ['id','class_id','name','role','skills'],
  skills: ['id','name','unlock_level','type','description'],
  regions: ['id','name','level_min','level_max','subareas'],
  monsters: ['id','name','region_id','subarea_id','level','kind','stats','drops'],
  materials: ['id','name','source_ids'],
  items: ['id','name','slot','rarity','level'],
  recipes: ['id','name','result_item_id','ingredients'],
  npcs: ['id','name','region_id','services'],
  quests: ['id','name','giver_npc_id','objectives','rewards']
};
const isObject = x => x && typeof x === 'object' && !Array.isArray(x);
function validateRecord(kind, record, seen) {
  if (!isObject(record)) throw new Error(`${kind}: record must be an object`);
  for (const key of REQUIRED[kind]) if (!(key in record)) throw new Error(`${kind}/${record.id || '?'}: missing ${key}`);
  if (typeof record.id !== 'string' || !record.id.trim()) throw new Error(`${kind}: invalid id`);
  if (seen.has(record.id)) throw new Error(`${kind}: duplicate id ${record.id}`);
  seen.add(record.id);
}
export async function loadContent({ fetcher = fetch } = {}) {
  const manifestUrl = new URL('manifest.json', ROOT);
  const response = await fetcher(manifestUrl);
  if (!response.ok) throw new Error(`content manifest HTTP ${response.status}`);
  const manifest = await response.json();
  if (manifest.schema_version !== 1 || !Array.isArray(manifest.packs)) throw new Error('Unsupported content manifest');
  const catalogs = Object.fromEntries(Object.keys(REQUIRED).map(k => [k, []]));
  const ids = Object.fromEntries(Object.keys(REQUIRED).map(k => [k, new Set()]));
  for (const pack of manifest.packs) {
    if (!pack || typeof pack.path !== 'string' || !Array.isArray(pack.files)) throw new Error('Invalid pack entry');
    for (const file of pack.files) {
      if (!REQUIRED[file.kind]) throw new Error(`Unknown content kind: ${file.kind}`);
      const url = new URL(file.path, ROOT);
      if (!url.href.startsWith(ROOT.href)) throw new Error('Content path escapes content root');
      const r = await fetcher(url);
      if (!r.ok) throw new Error(`Content file HTTP ${r.status}: ${file.path}`);
      const payload = await r.json();
      const rows = Array.isArray(payload) ? payload : [payload];
      for (const row of rows) { validateRecord(file.kind, row, ids[file.kind]); catalogs[file.kind].push(row); }
    }
  }
  return Object.freeze({ manifest, catalogs: Object.fromEntries(Object.entries(catalogs).map(([k,v]) => [k, Object.freeze(v)])) });
}
