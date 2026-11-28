import test from 'node:test';
import assert from 'node:assert/strict';
import { runWarriorScenarioAuditV1943 } from '../scripts/v1943-warrior-scenario-audit.mjs';

const audit = runWarriorScenarioAuditV1943();

test('V1943 executes all 80 Warrior skill forms across four advanced scenarios and three modes', () => {
  assert.equal(audit.uniqueSkillForms, 80);
  assert.equal(audit.scenarioCount, 4);
  assert.equal(audit.totalRows, 960);
  assert.equal(audit.executed, 960);
  assert.deepEqual(audit.errors, []);
});

test('V1943 covers skill ranks 1, 4 and 7; Domain stages 1, 2 and 3; normal, miniboss and boss targets', () => {
  assert.deepEqual([...new Set(audit.rows.map(row => row.rank))].sort(), [1, 4, 7]);
  assert.deepEqual([...new Set(audit.rows.map(row => row.domainStage))].sort(), [1, 2, 3]);
  assert.deepEqual([...new Set(audit.rows.map(row => row.targetKind))].sort(), ['boss', 'miniboss', 'normal']);
  assert.ok(audit.rows.some(row => row.talentsEnabled));
  assert.ok(audit.rows.some(row => !row.talentsEnabled));
});

test('V1943 every scenario produces an observable state transition and no mode parity drift', () => {
  assert.equal(audit.rows.filter(row => row.stateChanged).length, 960);
  assert.equal(audit.parityChecks, 320);
  assert.deepEqual(audit.parityFailures, []);
});

test('V1943 records damage, resource, target and event telemetry for each execution', () => {
  for (const row of audit.rows) {
    assert.ok(Number.isFinite(row.damage));
    assert.ok(Number.isFinite(row.staminaSpent));
    assert.ok(Number.isFinite(row.changedTargets));
    assert.ok(Number.isFinite(row.eventCount));
    assert.ok(row.targetCount >= 1);
  }
});
