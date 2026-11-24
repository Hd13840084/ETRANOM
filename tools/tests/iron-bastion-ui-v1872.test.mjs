import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const game = fs.readFileSync(new URL('../../game.js', import.meta.url), 'utf8');
const index = fs.readFileSync(new URL('../../index.html', import.meta.url), 'utf8');
const bridge = fs.readFileSync(new URL('../../systems/combat/specialization-skill-bridge.js', import.meta.url), 'utf8');
const adapters = fs.readFileSync(new URL('../../systems/combat/combat-adapters.js', import.meta.url), 'utf8');

test('combat skill button displays the ascended name in place of its base skill', () => {
  assert.match(game, /asc=ip\.domain\?\.active\?\(IRON_BASTION\(\)\?\.ascendedSkills\|\|\[\]\)\.find\(a=>a\.id===ip\.domain\.ascendedSkillId&&a\.skillId===x\.id\):null/);
  assert.match(game, /data-use-iron-skill=\"'\+\(asc\?asc\.id:x\.id\)\+'\"/);
  assert.match(game, /esc\(asc\?asc\.name:x\.name\)/);
});

test('all ascension selection UI paths use the runtime validation function', () => {
  assert.match(game, /data-iron-asc-select[\s\S]{0,180}ironBastionPickAscended\(b\.dataset\.ironAscSelect\)/);
  assert.match(game, /data-iron-ascended-pick[\s\S]{0,180}ironBastionPickAscended\(b\.dataset\.ironAscendedPick\)/);
});

test('Iron Bastion runtime cache version is synchronized across app and combat adapters', () => {
  assert.match(index, /iron-bastion-runtime\.js\?v=1901/);
  assert.match(bridge, /iron-bastion-runtime\.js\?v=1901/);
  assert.match(adapters, /iron-bastion-runtime\.js\?v=1901/);
});

test('V1874 domain visual state and single-use UI state are connected', () => {
  assert.match(game, /if\(result\.ascended\)c\.ironAscendedUsed=true/);
  assert.match(game, /iron-domain-banner/);
  assert.match(game, /iron-domain-stage-/);
  assert.match(index, /iron-bastion-domain-visuals-v1874/);
});

test('selected ascension is not rendered as a duplicate second cast button', () => {
  assert.ok(game.includes('دکمه مهارت پایه در فهرست بالا اکنون با نام تعالی نمایش داده می‌شود'));
  assert.ok(game.includes('iron-ascension-selected'));
  assert.ok(!game.includes('button type=\"button\" data-iron-ascended-use=\"\'+a.id+\'\"'));
});
