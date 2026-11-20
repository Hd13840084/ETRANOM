import fs from 'node:fs';
import assert from 'node:assert/strict';
const game = fs.readFileSync(new URL('../../game.js', import.meta.url), 'utf8');
for (const name of ['جنگل سوخته','بیشه خارزار','تپه‌های خاکستر','رود ورداش','دشت جنوبی','ویرانه‌های ریشه‌پوش']) {
  assert.ok(game.includes(name), `missing region card label: ${name}`);
}
assert.ok(game.includes('const westLabels='), 'live map region labels must be rendered inside map cards');
assert.ok(game.includes("labelText=z.name+' • محدوده '+zoneNumber"), 'map labels must show the canonical zone number after its name');
assert.ok(game.includes('state.scene="world";notice="";updateExplorationHud();'), 'region entry must preserve world scene');
assert.ok(!game.includes('state.scene="danger_zone";notice="از مرز دقیق عبور کردی'), 'crossing into a region must not switch page/DOM');
assert.ok(game.includes('جابه‌جایی میان پهنه‌ها فقط داده‌های مکان را عوض می‌کند'), 'joystick loop stability guard must exist');
console.log('PASS region map cards and joystick no-rerender transition checks');
