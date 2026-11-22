import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const game = readFileSync(new URL('../game.js', import.meta.url), 'utf8');
const runtime = readFileSync(new URL('../systems/content/region-one-runtime.js', import.meta.url), 'utf8');
test('current XP thresholds preserve the original first four levels and set level 5 to 25,000 XP', () => {
  const match = game.match(/const LEVEL_XP_REQUIREMENTS=\[([^\]]+)\]/);
  assert.ok(match);
  const values = match[1].split(',').map(Number);
  assert.deepEqual(values.slice(0, 4), [100, 2300, 3800, 5700]);
  assert.equal(values[4], 25000);
  assert.equal(values[5], 28000);
});
test('v106 applies 25% enemy stat reduction at shared combat creation', () => {
  assert.match(game, /map\(makeCombatEnemy\)\.map\(e=>\{const scale=0\.75/);
});
test('v106 exposes direct legion recruitment after selecting a corpse', () => {
  assert.match(game, /data-necro-recruit-now/);
  assert.match(game, /wizardRuntimeUseSkill\("legion"\)/);
  assert.match(game, /شانس '\+chancePct\+'٪/);
});
test('v106 makes blacksmith crafting resilient to saved recipe formats', () => {
  assert.match(game, /function knowsRecipe\(id\)/);
  assert.match(game, /root\.addEventListener\("click",e=>\{const b=e\.target\.closest\?\.\("\[data-craft-recipe\]"\)/);
});
test('runtime does not pre-apply an extra region-one-only attack nerf', () => {
  assert.match(runtime, /Global 25% enemy stat reduction is applied once/);
  assert.doesNotMatch(runtime, /فقط قدرت حمله پایه ۲۵٪ کاهش می‌یابد/);
});
