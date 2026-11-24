import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const game = readFileSync(new URL('../game.js', import.meta.url), 'utf8');
test('Legion recruitment is allowed in the post-victory pending-finish phase', () => {
  assert.match(game, /function wizardRuntimeUseSkill\(id\)\{if\(!state\.combat\|\|\(state\.combat\.phase!=='player'&&\!\(state\.combat\.awaitingFinish&&isNecromancer\(\)&&id==='legion'\)\)\|\|state\.combat\.enemyTurnPending\)return;/);
});
test('Legion recruitment still requires a selected eligible corpse and respects capacity', () => {
  assert.match(game, /String\(e\.encounterId\)===String\(c\.selectedCorpseId\)&&e\.hp<=0&&!e\.recruitAttempted&&!\['boss','area_boss'\]\.includes\(e\.encounterKind\)/);
  assert.match(game, /\(p\.legion\|\|\[\]\)\.length>=10/);
});
test('Recruitment after victory does not advance another enemy turn', () => {
  assert.match(game, /if\(c\.awaitingFinish\)\{notice='فرصت جذب اجساد باقی است؛ پس از پایان مدیریت لژیون، دکمه «پایان نبرد» را بزن\.';render\(\);save\(true\);return;\}/);
});
