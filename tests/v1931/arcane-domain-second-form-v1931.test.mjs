import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const root = process.cwd();
const game = fs.readFileSync(`${root}/game.js`, 'utf8');
const html = fs.readFileSync(`${root}/index.html`, 'utf8');

test('Arcane Mage has no permanent ascension selection outside Domain', () => {
  assert.match(game, /function arcaneSelectAscended\(id\)\{if\(!isArcaneMage\(\)\|\|!state\.combat\|\|Number\(state\.combat\.arcaneDomainTurns\)<=0\)/);
  assert.doesNotMatch(game, /این انتخاب دائمی است/);
  assert.doesNotMatch(game, /data-arcane-select-ascended/);
});

test('Arcane Mage offers the ten second-form choices only while Domain is active', () => {
  assert.match(game, /const arcaneAscensionPanel=arcane&&Number\(c\.arcaneDomainTurns\)>0/);
  assert.match(game, /data-arcane-domain-ascended-pick/);
  assert.match(game, /پس از فعال‌سازی یکی از ۱۰ فرم دوم را برای همین قلمرو انتخاب کن/);
});

test('Arcane Mage runtime selection and consumption are connected to the class module', () => {
  assert.match(html, /ETRANOM_SELECT_ARCANE_ASCENDED_SKILL = arcaneModule\.selectArcaneMageAscendedSkill/);
  assert.match(game, /ETRANOM_SELECT_ARCANE_ASCENDED_SKILL/);
  assert.match(game, /ETRANOM_USE_ARCANE_ASCENDED_SKILL/);
});


test('unchanged Wizard modules retain their V1931 keys, Necromancer receives V1936, and the updated game entry uses V1936', () => {
  assert.match(html, /elementalist\.js\?v=1931/);
  assert.match(html, /warlock\.js\?v=1931/);
  assert.match(html, /necromancer\.js\?v=1936/);
  assert.match(html, /arcane-mage-v130\.js\?v=1931/);
  assert.match(html, /game\.js\?v=1961&nav=1961/);
});
