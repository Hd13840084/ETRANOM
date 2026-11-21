import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source = fs.readFileSync(new URL('../game.js', import.meta.url), 'utf8');
const start = source.indexOf('function livingEnemyTurnPlan(combatRef)');
assert.notEqual(start, -1, 'livingEnemyTurnPlan helper must exist');
const end = source.indexOf('\n  async function enemyTurn()', start);
assert.notEqual(end, -1, 'enemyTurn must follow the helper');
const helper = source.slice(start, end).replace(/^\s{2}/gm, '');
const sandbox = {};
vm.runInNewContext(`${helper}; globalThis.livingEnemyTurnPlan = livingEnemyTurnPlan;`, sandbox);
const plan = sandbox.livingEnemyTurnPlan;

test('dead selected target is skipped and next living enemy becomes primary', () => {
  const dead = { encounterId: 'dead', hp: 0 };
  const livingA = { encounterId: 'alive-a', hp: 12 };
  const livingB = { encounterId: 'alive-b', hp: 9 };
  const result = plan({ targetId: 'dead', enemies: [dead, livingA, livingB] });
  assert.equal(result.primary.encounterId, 'alive-a');
  assert.deepEqual(Array.from(result.others, x => x.encounterId), ['alive-b']);
  assert.equal(result.others.some(x => x.hp <= 0), false);
});

test('no enemy action is scheduled when every enemy is dead', () => {
  const result = plan({ targetId: 'dead-a', enemies: [
    { encounterId: 'dead-a', hp: 0 },
    { encounterId: 'dead-b', hp: 0 }
  ] });
  assert.equal(result.primary, null);
  assert.equal(result.others.length, 0);
});

test('living selected target remains primary and other dead enemies are excluded', () => {
  const result = plan({ targetId: 'alive-b', enemies: [
    { encounterId: 'dead-a', hp: 0 },
    { encounterId: 'alive-a', hp: 7 },
    { encounterId: 'alive-b', hp: 5 }
  ] });
  assert.equal(result.primary.encounterId, 'alive-b');
  assert.deepEqual(Array.from(result.others, x => x.encounterId), ['alive-a']);
});

test('corpse selection and permanent recruit are enabled only in the post-victory necromancer window', () => {
  assert.match(source, /corpseRecruitWindow=isNecromancer\(\)&&!!c\.awaitingFinish&&c\.phase!=='enemy'&&!c\.enemyTurnPending/);
  assert.match(source, /corpseRecruitWindow&&corpseSelectable/);
  assert.match(source, /corpseRecruitWindow&&isNecromancer\(\)&&x\.type==='permanent_recruit'/);
  assert.match(source, /awaitingFinish&&isNecromancer\(\)&&id==='legion'/);
});
