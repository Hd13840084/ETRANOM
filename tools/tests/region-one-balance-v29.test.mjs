import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const root = new URL('../../', import.meta.url);
const js = fs.readFileSync(new URL('../../game.js', import.meta.url), 'utf8');
const pack = new URL('content/packs/region_one_master_v2/', root);
const encounters = JSON.parse(fs.readFileSync(new URL('monsters/monsters.json', pack), 'utf8'));
const recipes = JSON.parse(fs.readFileSync(new URL('recipes/recipes.json', pack), 'utf8'));
const skills = JSON.parse(fs.readFileSync(new URL('skills/monster_skills.json', pack), 'utf8'));
const keys = ['power','speed','endurance','vitality','intellect','perception','luck','faith'];
const zones = ['burnt_forest','thorn_grove','ash_hills','vardash_river','southern_plains','rootbound_ruins'];
test('zone 1 remains a beginner growth zone and retains its miniboss balance', () => {
  const mini = encounters.find(x => x.id === 'ashroot_warden');
  assert.equal(mini.stats.hp, 700);
  assert.equal(mini.stats.attack, 16);
  assert.equal(mini.stats.defense, 12);
  const normals = encounters.filter(x => x.region_id === 'burnt_forest' && x.kind === 'normal');
  assert.equal(normals.length, 5);
  assert.equal(normals.filter(x => x.skills.length > 0).length, 2);
});
test('zones 2-6 have five distinct eight-stat monsters and exactly two skilled MP users', () => {
  for (const zone of zones.slice(1)) {
    const normals = encounters.filter(x => x.region_id === zone && x.kind === 'normal');
    assert.equal(normals.length, 5, `${zone}: five normal monsters`);
    assert.equal(normals.filter(x => x.skills.length > 0).length, 2, `${zone}: two skill monsters`);
    assert.equal(normals.filter(x => x.skills.length > 0 && x.stats.mp > 0).length, 2, `${zone}: two MP users`);
    assert.ok(normals.every(x => x.skills.length ? x.stats.mp > 0 : x.stats.mp === 0), `${zone}: MP only for skill monsters`);
    assert.equal(new Set(normals.map(x => keys.map(k => x.stats[k]).join(':'))).size, 5, `${zone}: all eight-stat profiles differ`);
    for (const key of keys) assert.ok(normals.every(x => Number.isFinite(x.stats[key]) && x.stats[key] > 0), `${zone}/${key}`);
  }
});
test('zone 6 is stronger than zone 5 while levels remain correct', () => {
  const fifth = encounters.filter(x => x.region_id === 'southern_plains' && x.kind === 'normal').sort((a,b)=>a.id.localeCompare(b.id));
  const sixth = encounters.filter(x => x.region_id === 'rootbound_ruins' && x.kind === 'normal').sort((a,b)=>a.id.localeCompare(b.id));
  for (let i=0;i<5;i++) {
    assert.ok(sixth[i].stats.hp > fifth[i].stats.hp);
    assert.ok(sixth[i].stats.attack > fifth[i].stats.attack);
    assert.ok(sixth[i].stats.defense > fifth[i].stats.defense);
    assert.equal(fifth[i].level, 5);
    assert.equal(sixth[i].level, 5);
  }
});
test('all authored monster skills exist and runtime preserves authored stats', () => {
  const skillIds = new Set(skills.map(x => x.id));
  for (const enemy of encounters) for (const skill of enemy.skills) assert.ok(skillIds.has(skill), `${enemy.id}: skill ${skill} exists`);
  assert.match(js, /enemy\.stats=\{\.\.\.\(enemy\.stats\|\|\{\}\),hp:enemy\.hp/);
});
test('recipe progression remains ten levels and rarity drop chances stay defined', () => {
  assert.equal(recipes.length,260);
  assert.ok(recipes.every(r=>r.recipe_level===1&&r.max_recipe_level===10&&r.item_level===1));
  assert.match(js, /ETRONOM_RECIPE_LEVEL_CAP=10/);
  assert.match(js, /recipeLevelMultiplier/);
  assert.match(js, /dropChance=\[35,20,15,8,4,2\]/);
});
