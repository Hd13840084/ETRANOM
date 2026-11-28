import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve('content');
const manifestPath = path.join(root, 'manifest.json');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const kinds = ['classes','specializations','skills','regions','monsters','materials','items','recipes','npcs','quests'];
const required = {
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
const idPattern = /^[a-z][a-z0-9_]{1,63}$/;
const records = Object.fromEntries(kinds.map(k => [k, []]));
const ids = Object.fromEntries(kinds.map(k => [k, new Set()]));
const fail = message => { throw new Error(`[content] ${message}`); };
const obj = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const positive = value => Number.isInteger(value) && value > 0;

if (manifest.schema_version !== 1 || manifest.content_policy !== 'append_only' || !Array.isArray(manifest.packs)) fail('manifest schema/policy/packs invalid');
for (const pack of manifest.packs) {
  if (!obj(pack) || typeof pack.id !== 'string' || !Array.isArray(pack.files)) fail('invalid pack entry (id and files required)');
  for (const file of pack.files) {
    if (!obj(file) || !kinds.includes(file.kind) || typeof file.path !== 'string') fail(`invalid file entry in pack ${pack.id}`);
    const full = path.resolve(root, file.path);
    if (!full.startsWith(root + path.sep) || !fs.existsSync(full)) fail(`missing/unsafe path: ${file.path}`);
    const payload = JSON.parse(fs.readFileSync(full, 'utf8'));
    const rows = Array.isArray(payload) ? payload : [payload];
    for (const row of rows) {
      if (!obj(row)) fail(`${file.path}: record must be an object`);
      for (const key of required[file.kind]) if (!(key in row)) fail(`${file.kind}/${row.id ?? '?'}: missing ${key}`);
      if (typeof row.id !== 'string' || !idPattern.test(row.id)) fail(`${file.kind}: invalid stable id ${row.id}`);
      if (ids[file.kind].has(row.id)) fail(`${file.kind}: duplicate id ${row.id}`);
      ids[file.kind].add(row.id); records[file.kind].push(row);
    }
  }
}
// Tower encounters are a separate encounter catalog but may be valid material sources.
// Register their stable IDs in the monster reference namespace for source validation.
const towerEncounterPath = path.join(root, 'packs/region_one_master_v2/tower/tower_encounters.json');
if (fs.existsSync(towerEncounterPath)) {
  const towerEncounters = JSON.parse(fs.readFileSync(towerEncounterPath, 'utf8'));
  for (const encounter of towerEncounters) if (typeof encounter.id === 'string') ids.monsters.add(encounter.id);
}
const has = (kind, id) => ids[kind].has(id);
const refs = (kind, values, owner) => {
  if (!Array.isArray(values)) fail(`${owner}: expected array for ${kind} references`);
  for (const id of values) if (!has(kind, id)) fail(`${owner}: unknown ${kind} id ${id}`);
};
for (const c of records.classes) refs('specializations', c.specializations, `class/${c.id}`);
for (const s of records.specializations) { if (!has('classes', s.class_id)) fail(`specialization/${s.id}: unknown class ${s.class_id}`); refs('skills', s.skills, `specialization/${s.id}`); }
for (const r of records.regions) {
  if (!positive(r.level_min) || !positive(r.level_max) || r.level_min > r.level_max) fail(`region/${r.id}: invalid level range`);
  if (!Array.isArray(r.subareas) || r.subareas.some(x => typeof x !== 'string' || !idPattern.test(x))) fail(`region/${r.id}: subareas must be stable ids`);
}
for (const m of records.monsters) {
  if (!has('regions', m.region_id)) fail(`monster/${m.id}: unknown region ${m.region_id}`);
  const region = records.regions.find(x => x.id === m.region_id);
  if (!region.subareas.includes(m.subarea_id)) fail(`monster/${m.id}: subarea ${m.subarea_id} is not in ${m.region_id}`);
  if (!positive(m.level) || !obj(m.stats) || !positive(m.stats.hp) || !positive(m.stats.attack) || !Number.isInteger(m.stats.defense) || m.stats.defense < 0) fail(`monster/${m.id}: invalid level/stats`);
  if (!['normal','mini_boss','area_boss'].includes(m.kind)) fail(`monster/${m.id}: invalid kind`);
  if (!Array.isArray(m.drops)) fail(`monster/${m.id}: drops must be an array`);
  for (const d of m.drops) if (!obj(d) || !has('materials', d.material_id) || !positive(d.quantity) || typeof d.chance !== 'number' || d.chance < 0 || d.chance > 1) fail(`monster/${m.id}: invalid material drop`);
}
for (const m of records.materials) refs('monsters', m.source_ids, `material/${m.id}`);
for (const i of records.items) if (!positive(i.level) || typeof i.slot !== 'string' || typeof i.rarity !== 'string') fail(`item/${i.id}: invalid item fields`);
for (const r of records.recipes) {
  if (!has('items', r.result_item_id)) fail(`recipe/${r.id}: unknown result item ${r.result_item_id}`);
  if (!Array.isArray(r.ingredients) || !r.ingredients.length) fail(`recipe/${r.id}: ingredients required`);
  for (const ingredient of r.ingredients) if (!obj(ingredient) || !has('materials', ingredient.material_id) || !positive(ingredient.quantity)) fail(`recipe/${r.id}: invalid ingredient`);
}
for (const n of records.npcs) if (n.region_id !== null && n.region_id !== 'safe_zone' && !has('regions', n.region_id)) fail(`npc/${n.id}: unknown region ${n.region_id}`);
for (const q of records.quests) if (!has('npcs', q.giver_npc_id)) fail(`quest/${q.id}: unknown giver NPC ${q.giver_npc_id}`);
const total = Object.values(records).reduce((sum, rows) => sum + rows.length, 0);
console.log(`Content manifest valid. Packs: ${manifest.packs.length}. Records: ${total}. Cross-references: valid.`);
