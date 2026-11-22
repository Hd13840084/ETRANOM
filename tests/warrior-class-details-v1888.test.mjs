import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const game=fs.readFileSync(new URL('../game.js',import.meta.url),'utf8');
test('warrior skill facts are rendered from stored skill mechanics',()=>{assert.match(game,/function warriorSkillFacts\(sk\)/);assert.match(game,/warriorSkillFacts\(sk\)/);assert.match(game,/اثر و ارقام ثبت‌شده/);});
test('Apocalypse Harbinger portrait aliases resolve to its dedicated asset',()=>{assert.match(game,/apocalypse_harbinger_portrait\.webp/);assert.match(game,/Harbinger of the Apocalypse/);});
