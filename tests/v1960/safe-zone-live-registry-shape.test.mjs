import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { createSafeZoneEngine } from '../../systems/safe-zone/safe-zone-engine.js';

const source = fs.readFileSync(new URL('../../game.js', import.meta.url), 'utf8');
function readArray(name) {
  const match = source.match(new RegExp(`const ${name}=\\[([\\s\\S]*?)\\n  \\];`));
  assert.ok(match, `could not locate ${name}`);
  return vm.runInNewContext(`[${match[1]}]`);
}

test('actual live NPC/building arrays register without missing stewards or duplicate identities', () => {
  const npcs = readArray('safeNPCs');
  const buildings = readArray('cityPOI');
  const landmarks = readArray('safeLandmarks');
  const engine = createSafeZoneEngine();
  const audit = engine.registerWorld({ npcs, buildings, landmarks });
  assert.deepEqual(audit.counts, { npcs: 10, buildings: 9, landmarks: 8, total: 27 });
  assert.equal(audit.ok, true, JSON.stringify(audit));
  for (const npc of npcs) assert.equal(engine.get('npc', npc.id).sections.length, 3);
  for (const building of buildings) assert.equal(engine.get('building', building.id).sections.length, 3);
});
