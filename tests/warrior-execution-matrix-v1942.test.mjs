import test from 'node:test';
import assert from 'node:assert/strict';
import { runWarriorExecutionAuditV1942 } from '../scripts/v1942-warrior-execution-audit.mjs';

const audit = runWarriorExecutionAuditV1942();

test('V1942 executes every Warrior base and Ascension skill in Solo, Party and PvP fixtures', () => {
  assert.equal(audit.totalRows, 240);
  assert.equal(audit.uniqueSkillForms, 80);
  assert.equal(audit.executed, 240);
  assert.deepEqual(audit.errors, []);
});

test('V1942 Warrior skill outcomes are mode-invariant under the same deterministic fixture', () => {
  assert.equal(audit.modeParity.length, 80);
  assert.deepEqual(audit.modeParityFailures, []);
});

test('V1942 execution matrix retains per-skill resource, cooldown, damage and event observations', () => {
  for (const row of audit.rows) {
    assert.ok(['executed'].includes(row.status), `${row.specializationId}/${row.skillId}/${row.mode}`);
    assert.ok(Number.isFinite(row.damage));
    assert.ok(Number.isFinite(row.staminaSpent));
    assert.ok(Number.isFinite(row.logCount));
    assert.equal(row.targetCount, 3);
    assert.equal(row.stateChanged, true, `${row.specializationId}/${row.skillId}/${row.mode} must produce a real state transition`);
  }
});
