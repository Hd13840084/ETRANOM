import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const root = new URL('../../', import.meta.url);
const js = fs.readFileSync(new URL('../../game.js', import.meta.url), 'utf8');
const match = js.match(/const REGION_ENCOUNTERS=(\[.*?\]);\n/s);
assert.ok(match, 'runtime encounter catalogue exists');
const encounters = JSON.parse(match[1]);
const keys = ['power','speed','endurance','vitality','intellect','perception','luck','faith'];
const zones = ['burnt_forest','thorn_grove','ash_hills','vardash_river','southern_plains','rootbound_ruins'];
test('zone 1 remains a beginner growth zone and retains its miniboss balance', () => {
  const mini = encounters.find(x => x.id === 'ashroot_warden');
  assert.equal(mini.hp, 700);
  assert.equal(mini.attack, 16);
  assert.equal(mini.defense, 12);
  const normals = encounters.filter(x => x.regionId === 'burnt_forest' && x.kind === 'normal');
  assert.equal(normals.length, 5);
  assert.equal(normals.filter(x => x.skills.length > 0).length, 2);
});
test('zones 2-6 have five distinct eight-stat monsters and exactly two skilled MP users', () => {
  for (const zone of zones.slice(1)) {
    const normals = encounters.filter(x => x.regionId === zone && x.kind === 'normal');
    assert.equal(normals.length, 5, `${zone}: five normal monsters`);
    assert.equal(normals.filter(x => x.skills.length > 0).length, 2, `${zone}: two skill monsters`);
    assert.equal(normals.filter(x => x.skills.length > 0 && x.maxMp > 0).length, 2, `${zone}: two MP bars`);
    assert.ok(normals.every(x => x.skills.length ? x.maxMp > 0 : x.maxMp === 0), `${zone}: MP only for skill monsters`);
    assert.equal(new Set(normals.map(x => keys.map(k => x.stats[k]).join(':'))).size, 5, `${zone}: all eight-stat profiles differ`);
    for (const key of keys) assert.ok(normals.every(x => Number.isFinite(x.stats[key]) && x.stats[key] > 0), `${zone}/${key}`);
  }
});
test('zone 6 is stronger than zone 5 while levels remain correct', () => {
  const fifth = encounters.filter(x => x.regionId === 'southern_plains' && x.kind === 'normal').sort((a,b)=>a.id.localeCompare(b.id));
  const sixth = encounters.filter(x => x.regionId === 'rootbound_ruins' && x.kind === 'normal').sort((a,b)=>a.id.localeCompare(b.id));
  for (let i=0;i<5;i++) {
    assert.ok(sixth[i].hp > fifth[i].hp);
    assert.ok(sixth[i].attack > fifth[i].attack);
    assert.ok(sixth[i].defense > fifth[i].defense);
    assert.equal(fifth[i].level, 5);
    assert.equal(sixth[i].level, 5);
  }
});
test('ten new zone skills are registered and the runtime does not overwrite authored stats', () => {
  const skills = JSON.parse(fs.readFileSync(new URL('content/packs/region_one_complete_v1/skills/monster_skills.json', root), 'utf8'));
  assert.equal(skills.length, 10);
  for (const enemy of encounters.filter(x => x.regionId !== 'burnt_forest' && x.kind === 'normal' && x.skills.length)) {
    assert.ok(skills.some(s => s.id === enemy.skills[0]), `${enemy.id}: skill definition exists`);
  }
  assert.match(js, /enemy\.stats=\{\.\.\.\(enemy\.stats\|\|\{\}\),hp:enemy\.hp/);
  assert.match(js, /hasMp=Array\.isArray\(e\.skills\)&&e\.skills\.length>0/);
});
test('recipe progression remains ten levels and region one only drops level-one recipes', () => {
  assert.match(js, /ETRONOM_RECIPE_LEVEL_CAP=10/);
  assert.match(js, /recipeLevelMultiplier/);
  assert.match(js, /dropChance=\[35,20,15,8,4,2\]/);
});
