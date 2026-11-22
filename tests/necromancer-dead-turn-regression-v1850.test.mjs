import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source = fs.readFileSync(new URL('../game.js', import.meta.url), 'utf8');
const helperStart = source.indexOf('function resolveNecromancerControlledEnemyTurn(enemy,combatRef)');
const helperEnd = source.indexOf('\n  function enemyTurnPrimary', helperStart);
assert.notEqual(helperStart, -1, 'Necromancer controlled-turn resolver must exist');
assert.notEqual(helperEnd, -1, 'Resolver must end before enemyTurnPrimary');
const helperSource = source.slice(helperStart, helperEnd).replace(/^  /gm, '');
const messages = [];
const sandbox = { msg: text => messages.push(String(text)), Math };
vm.runInNewContext(`${helperSource}; globalThis.resolveNecromancerControlledEnemyTurn = resolveNecromancerControlledEnemyTurn;`, sandbox);
const resolveControlledTurn = sandbox.resolveNecromancerControlledEnemyTurn;

test('dead enemies are not eligible for a Necromancer-controlled turn', () => {
  const dead = { encounterId: 'dead', enemy: 'مرده', hp: 0, controlledByPlayer: true, necromancerControlledTurns: 2, attack: 20 };
  assert.equal(resolveControlledTurn(dead, { enemies: [dead] }), false);
  assert.equal(dead.necromancerControlledTurns, 2);
  assert.equal(messages.length, 0);
});

test('a dominated living enemy attacks a different living enemy and consumes one control turn', () => {
  const controlled = { encounterId: 'controlled', enemy: 'تسخیرشده', hp: 30, controlledByPlayer: true, necromancerControlledTurns: 2, attack: 20 };
  const target = { encounterId: 'target', enemy: 'هدف', hp: 100, enemyDefense: 0 };
  assert.equal(resolveControlledTurn(controlled, { targetId: 'target', enemies: [controlled, target] }), true);
  assert.equal(controlled.necromancerControlledTurns, 1);
  assert.equal(controlled.controlledByPlayer, true);
  assert.ok(target.hp < 100);
});

test('domination expires after its final action and the controlled enemy becomes hostile again', () => {
  const controlled = { encounterId: 'controlled', enemy: 'تسخیرشده', hp: 30, controlledByPlayer: true, necromancerControlledTurns: 1, attack: 20 };
  const target = { encounterId: 'target', enemy: 'هدف', hp: 100, enemyDefense: 0 };
  assert.equal(resolveControlledTurn(controlled, { targetId: 'target', enemies: [controlled, target] }), true);
  assert.equal(controlled.necromancerControlledTurns, 0);
  assert.equal(controlled.controlledByPlayer, false);
  assert.ok(messages.some(x => x.includes('فرمان نکرومنسر')));
});

test('enemy turn loop stores encounter IDs and resolves each secondary enemy from the live HP state', () => {
  assert.match(source, /const secondaryIds=plan\.others\.map\(e=>String\(e\.encounterId\)\)/);
  assert.match(source, /find\(e=>String\(e\.encounterId\)===enemyId&&Number\(e\.hp\)>0\)/);
  assert.match(source, /enemyTurnPrimary\(primaryId\)/);
});
