import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
const root = path.resolve(new URL('../..', import.meta.url).pathname);
const game = fs.readFileSync(path.join(root, 'game.js'), 'utf8');
test('single battle enemy primary turn requires the actual selected encounter to be alive', () => {
  assert.match(game, /selectedEnemy=Array\.isArray\(c\.enemies\)\?c\.enemies\.find\(e=>String\(e\.encounterId\)===String\(c\.targetId\)\):c/);
  assert.match(game, /if\(!selectedEnemy\|\|Number\(selectedEnemy\.hp\)<=0\)return/);
});
test('secondary enemies are checked again after the turn animation delay', () => {
  assert.match(game, /if\(!e\|\|Number\(e\.hp\)<=0\)continue;[\s\S]*?await new Promise\(resolve=>window\.setTimeout\(resolve,520\)\);[\s\S]*?if\(Number\(e\.hp\)<=0\)continue;/);
});
test('necromancer corpse selection uses stable string IDs and validates the recruit runtime before consuming a corpse', () => {
  assert.match(game, /String\(e\.encounterId\)===String\(c\.selectedCorpseId\)/);
  assert.match(game, /const recruitFn=window\.ETRANOM_RECRUIT_NECROMANCER_LEGION;if\(typeof recruitFn!=='function'\)/);
  assert.match(game, /corpse\.recruitAttempted=true;state\.classProgress\.wizard_necromancer=r\.progress/);
});
