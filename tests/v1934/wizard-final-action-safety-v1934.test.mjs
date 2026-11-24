import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const game = fs.readFileSync(new URL('../../game.js', import.meta.url), 'utf8');
const index = fs.readFileSync(new URL('../../index.html', import.meta.url), 'utf8');

test('Wizard second-form execution is blocked during pending enemy reaction', () => {
  assert.match(game, /function wizardUseAscended\(id\)\{if\(!state\.combat\|\|state\.combat\.phase!==\'player\'\|\|state\.combat\.enemyTurnPending\)return;/);
});

test('Elementalist second-form tactical choice is accepted only for the matching pending ascended skill', () => {
  assert.match(game, /const hasMatchingMode=Number\.isInteger\(c\.pendingWizardMode\)&&c\.pendingWizardSkill===id&&c\.pendingWizardAscendedSkill===id/);
  assert.match(game, /const selectedMode=hasMatchingMode\?c\.pendingWizardMode:null/);
});

test('normal Wizard tactical choice cannot reuse a stale or ascended pending mode', () => {
  assert.match(game, /Number\.isInteger\(c\.pendingWizardMode\)&&c\.pendingWizardSkill===id&&!c\.pendingWizardAscendedSkill\?c\.pendingWizardMode:null/);
});

test('Necromancer corpse lookup and card selection normalize encounter IDs to strings', () => {
  assert.match(game, /String\(e\.encounterId\)===String\(c\.selectedCorpseId\)/);
  assert.match(game, /c\.selectedCorpseId!=null&&String\(c\.selectedCorpseId\)===String\(e\.encounterId\)/);
  assert.match(game, /const recruitFn=window\.ETRANOM_RECRUIT_NECROMANCER_LEGION;if\(typeof recruitFn!==\'function\'\)/);
});


test('normal Wizard skill prompt clears any stale ascended routing token', () => {
  assert.match(game, /if\(modeOptions\.length&&selectedMode===null\)\{c\.pendingWizardSkill=id;c\.pendingWizardAscendedSkill=null;c\.pendingWizardOptions=modeOptions/);
});

test('changed game bundle has a fresh cache key', () => {
  assert.match(index, /game\.js\?v=1961&nav=1961/);
});
