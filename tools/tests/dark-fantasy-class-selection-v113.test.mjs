import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const root = new URL('../../', import.meta.url);
const game = fs.readFileSync(new URL('game.js', root), 'utf8');
const classes = ['تفنگدار','راهب','جنگجو','جادوگر','رنجر','آدمکش','کشیش','پالادین','شمن','احضارگر'];
const portraits = ['arcane_mage_portrait.webp','elementalist_portrait.webp','warlock_portrait.webp','necromancer_portrait.webp'];
test('class selection presents all ten classes and four specializations per class', () => {
  assert.match(game, /origin-class-grid/);
  assert.match(game, /specialization-grid/);
  assert.match(game, /Object\.keys\(CLASS_DATA\)\.map/);
  assert.match(game, /data-class-choice/);
  for (const name of classes) assert.ok(game.includes(`"${name}"`), `missing ${name}`);
});
test('only the four existing Wizard specialization portraits are wired into the selector', () => {
  for (const file of portraits) {
    assert.ok(fs.existsSync(new URL(`assets/classes/${file}`, root)), `missing asset ${file}`);
    assert.ok(game.includes(file), `portrait not wired ${file}`);
  }
  assert.match(game, /پرتره در آینده/);
  assert.match(game, /پرتره اختصاصی آماده/);
});
test('existing character creation form fields and submit integration are preserved', () => {
  assert.match(game, /name="archetype"/);
  assert.match(game, /name="specialization"/);
  assert.match(game, /createCharacter\(form\)/);
});
