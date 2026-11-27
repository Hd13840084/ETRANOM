import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import {
  MONSTER_STAT_KEYS_V1970, normalizeMonsterProfileV1970,
  validateMonsterSkillLinksV1970, chooseMonsterSkillV1970,
  commitMonsterSkillV1970, tickMonsterSkillCooldownsV1970,
  createMonsterCombatEngineV1970
} from '../../systems/combat/monster-combat-engine-v1970.js';

const root = new URL('../../content/packs/region_one_master_v2/', import.meta.url);
const monsters = JSON.parse(await readFile(new URL('monsters/monsters.json', root), 'utf8'));
const skills = JSON.parse(await readFile(new URL('skills/monster_skills.json', root), 'utf8'));
const skillMap = Object.fromEntries(skills.map(skill => [skill.id, skill]));

 test('canonical monster profile exposes exactly the eight authored attributes without rescaling', () => {
  const profile = normalizeMonsterProfileV1970(monsters[0]);
  assert.deepEqual(Object.keys(profile.stats), MONSTER_STAT_KEYS_V1970);
  assert.equal(profile.resources.maxHp, Number(monsters[0].stats.hp));
  assert.equal(profile.combat.attack, Number(monsters[0].stats.attack));
  assert.equal(profile.combat.defense, Number(monsters[0].stats.defense));
});

test('all region-one monster skill references resolve to authored skill definitions', () => {
  const result = validateMonsterSkillLinksV1970(monsters, skills);
  assert.deepEqual(result, { valid: true, errors: [] });
});

test('scheduler respects mana, skill ownership, probability and cooldowns', () => {
  const monster = { id: 'test', hp: 100, mp: 30, skills: ['test_skill'], skillCooldowns: {} };
  const map = { test_skill: { id: 'test_skill', effects: { mp_cost: 10, cooldown_rounds: 2 } } };
  assert.equal(chooseMonsterSkillV1970(monster, map, { random: () => 0.99, chance: 0.25 }), null);
  const chosen = chooseMonsterSkillV1970(monster, map, { random: () => 0, chance: 1 });
  assert.equal(chosen.id, 'test_skill');
  assert.equal(commitMonsterSkillV1970(monster, chosen.id, chosen.definition), true);
  assert.equal(chooseMonsterSkillV1970(monster, map, { random: () => 0, chance: 1 }), null);
  tickMonsterSkillCooldownsV1970(monster);
  assert.equal(chooseMonsterSkillV1970(monster, map, { random: () => 0, chance: 1 }), null);
  tickMonsterSkillCooldownsV1970(monster);
  assert.equal(chooseMonsterSkillV1970(monster, map, { random: () => 0, chance: 1 }), null);
  tickMonsterSkillCooldownsV1970(monster);
  assert.equal(chooseMonsterSkillV1970(monster, map, { random: () => 0, chance: 1 }).id, 'test_skill');
  monster.mp = 0;
  assert.equal(chooseMonsterSkillV1970(monster, map, { random: () => 0, chance: 1 }), null);
});

test('engine factory exposes one shared implementation for all combat modes', () => {
  const engine = createMonsterCombatEngineV1970({ skillMap });
  assert.equal(engine.version, '1970.0.0');
  assert.equal(engine.validateLinks(monsters).valid, true);
  assert.equal(engine.normalize(monsters[0]).id, monsters[0].id);
});

test('combat loader installs the shared monster engine and refuses dangling skill links', async () => {
  const source = await readFile(new URL('../../systems/content/region-one-runtime.js', import.meta.url), 'utf8');
  assert.match(source, /createMonsterCombatEngineV1970/);
  assert.match(source, /monsterCombatEngineVersion/);
  assert.match(source, /skillLinks\.valid/);
});

test('Solo primary and secondary enemy turns use the shared scheduler', async () => {
  const source = await readFile(new URL('../../game.js', import.meta.url), 'utf8');
  assert.match(source, /primarySkillDecision=monsterEngine\?\.chooseSkill/);
  assert.match(source, /secondarySkillDecision=monsterEngine\?\.chooseSkill/);
  assert.match(source, /commitSkill\?\./);
});
