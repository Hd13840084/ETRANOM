import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { CHARACTER_IDENTITY_ROSTER_V2047 } from '../systems/characters/character-identity-roster-v2047.js?build=2081';
import { resolveMapSpecializationV2066 } from '../systems/characters/character-map-binding-v2066.js?v=2129';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const exists = (p) => fs.existsSync(path.join(root, p));
const pngSize = (p) => {
  const b = fs.readFileSync(path.join(root, p));
  if (b.length < 24 || b.readUInt32BE(0) !== 0x89504e47) return null;
  return [b.readUInt32BE(16), b.readUInt32BE(20)];
};
const ids = CHARACTER_IDENTITY_ROSTER_V2047.map(x => x.specializationId);
const dirs = ['south','south-east','east','north-east','north','north-west','west','south-west'];
const states = ['idle','walk','run','interact'];
const errors = [];
if (ids.length !== 40 || new Set(ids).size !== 40) errors.push('canonical_roster_not_40_unique');

const mapArt = [];
const atlas = [];
for (const id of ids) {
  const mapPath = `assets/characters/v2067-map-art/${id}.png`;
  const size = exists(mapPath) ? pngSize(mapPath) : null;
  if (!size || size[0] !== 384 || size[1] !== 512) errors.push(`map_art_missing_or_wrong_size:${id}`);
  mapArt.push({ id, exists: !!size, size });
  for (const state of states) for (const direction of dirs) {
    const p = `assets/characters/v2055/${id}/${state}_${direction}.png`;
    const s = exists(p) ? pngSize(p) : null;
    const expectedFrames = state === 'idle' ? 6 : 8;
    if (!s || s[0] !== 128 * expectedFrames || s[1] !== 160)
      errors.push(`directional_atlas_missing_or_wrong_size:${id}/${state}/${direction}`);
    atlas.push({ id, state, direction, exists: !!s, size: s });
  }
}

const catalogDir = path.join(root, 'content/specializations/catalog');
const catalogFiles = fs.readdirSync(catalogDir).filter(x => x.endsWith('.json'));
const catalogNameChecks = [];
for (const file of catalogFiles) {
  const spec = JSON.parse(fs.readFileSync(path.join(catalogDir, file), 'utf8'));
  const expected = spec.id.startsWith('warrior_') ? ({warrior_1:'warrior_sword_ascetic',warrior_2:'warrior_iron_bastion',warrior_3:'warrior_chaos',warrior_4:'warrior_apocalypse_harbinger'}[spec.id])
    : spec.id.startsWith('wizard_') ? ({wizard_1:'wizard_arcane_mage',wizard_2:'wizard_elementalist',wizard_3:'wizard_warlock',wizard_4:'wizard_necromancer'}[spec.id])
    : spec.id;
  const byId = resolveMapSpecializationV2066({ specialization_id: spec.id });
  const byName = resolveMapSpecializationV2066({ specialization: spec.name_fa, class_id: spec.class_id });
  if (byId !== expected) errors.push(`legacy_id_binding:${spec.id}:${byId}:expected:${expected}`);
  if (byName !== expected) errors.push(`localized_name_binding:${spec.id}:${spec.name_fa}:${byName}:expected:${expected}`);
  catalogNameChecks.push({ id: spec.id, nameFa: spec.name_fa, expected, byId, byName, pass: byId === expected && byName === expected });
}

const game = read('game.js');
const index = read('index.html');
const checks = {
  localMapSpriteResolver: game.includes('const spriteId = resolveMapSpecializationV2066(state.character || {});'),
  remoteMapSpriteResolver: game.includes('const remoteSpecId = resolveMapSpecializationV2066(other);'),
  mapArtFallbackPath: game.includes("'./assets/characters/v2067-map-art/' + id + '.png'"),
  mapOverlayUsesCanonicalResolver: game.includes('const spriteId = resolveMapSpecializationV2066(player);'),
  presencePublishesCanonicalId: game.includes('specialization_id: resolveMapSpecializationV2066(cp)'),
  selfOverlayIncludesSpecialization: game.includes('specialization_id: own.specialization_id'),
  cacheBustedGameEntry: index.includes('game.js?v=2129-map-player-art-binding'),
  buildStampUpdated: game.includes("window.__ETRANOM_GAME_BUILD__ = '2129-map-player-art-binding'")
};
for (const [name, pass] of Object.entries(checks)) if (!pass) errors.push(`runtime_binding_missing:${name}`);

const result = {
  build: 'V2129',
  scope: 'canonical_specialization_binding_for_local_and_remote_map_avatars',
  canonicalSpecializations: ids.length,
  uniqueCanonicalIds: new Set(ids).size,
  mapArt: { checked: mapArt.length, expected: 40, size: '384x512 PNG', allPresent: mapArt.every(x => x.exists) },
  directionalAtlases: { checked: atlas.length, expected: 1280, allPresent: atlas.every(x => x.exists), contract: '6x128x160 idle; 8x128x160 walk/run/interact' },
  legacyCatalogSpecializations: { checked: catalogNameChecks.length, passed: catalogNameChecks.filter(x => x.pass).length, expected: 40 },
  runtimeBindings: checks,
  failures: errors
};
fs.writeFileSync(path.join(root, 'V2129_QA_RESULTS.json'), JSON.stringify(result, null, 2) + '\n');
if (errors.length) {
  console.error(JSON.stringify(result, null, 2));
  process.exitCode = 1;
} else {
  console.log(JSON.stringify(result, null, 2));
}
