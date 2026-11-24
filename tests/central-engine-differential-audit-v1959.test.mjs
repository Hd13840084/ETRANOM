import test from 'node:test';
import assert from 'node:assert/strict';
import { runCentralEngineDifferentialAuditV1959 } from '../systems/combat/engines/central-engine-differential-audit-v1959.js';
import { IMPLEMENTED_SPECIALIZATION_DATA_V1939 } from '../systems/combat/engines/shared-engine-specialization-orchestrator-v1939.js';

test('V1959 executes all base and ascended skills in Solo, Party and PvP policies',()=>{
 const audit=runCentralEngineDifferentialAuditV1959();
 assert.equal(audit.totalSkills,80);
 assert.equal(audit.expectedSkillExecutions,480);
 assert.equal(audit.successfulSkillExecutions,480);
 assert.equal(audit.failures.length,0,JSON.stringify(audit.failures.slice(0,10)));
 assert.equal(audit.localExecutionCoverage,true);
});

test('V1959 executes all four Domain stages for every implemented specialization in all modes',()=>{
 const audit=runCentralEngineDifferentialAuditV1959();
 assert.equal(audit.expectedDomainExecutions,96);
 assert.equal(audit.successfulDomainExecutions,96);
});

test('V1959 preserves exactly eight implemented specializations and 80 source skills',()=>{
 const audit=runCentralEngineDifferentialAuditV1959();
 assert.equal(Object.keys(IMPLEMENTED_SPECIALIZATION_DATA_V1939).length,8);
 assert.equal(audit.rows.length,80);
 assert.ok(audit.rows.every(row=>row.hasAscension));
});

test('V1959 explicitly refuses to claim legacy or live server parity',()=>{
 const audit=runCentralEngineDifferentialAuditV1959();
 assert.equal(audit.legacyParityProven,false);
 assert.equal(audit.liveServerParityProven,false);
 assert.ok(audit.limitations.length>=3);
});
