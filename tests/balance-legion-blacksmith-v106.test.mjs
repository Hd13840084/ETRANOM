import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const game = readFileSync(new URL('../game.js', import.meta.url), 'utf8');
const runtime = readFileSync(new URL('../systems/content/region-one-runtime.js', import.meta.url), 'utf8');
test('v106 applies 20% lower XP thresholds', () => {
  assert.match(game, /LEVEL_XP_REQUIREMENTS\[n-1\][\s\S]{0,80}\*0\.8/);
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
