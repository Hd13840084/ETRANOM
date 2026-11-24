import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { runV1944ServerContractAudit } from '../scripts/v1944-server-contract-audit.mjs';

const audit = runV1944ServerContractAudit();
const read = path => fs.readFileSync(new URL(path, import.meta.url), 'utf8');

test('V1944 Party RPC authenticates members, serializes battle state and blocks duplicate round actions', () => {
  assert.equal(audit.transactionGuards.partyRowLock, true);
  assert.equal(audit.transactionGuards.partyDuplicateActionGuard, true);
  assert.equal(audit.checks.find(x => x.id === 'party-membership').pass, true);
  assert.equal(audit.checks.find(x => x.id === 'party-atomic-action-ledger').pass, true);
});

test('V1944 Party SQL has Warrior routing, stamina accounting and physical attack scaling', () => {
  for (const id of ['party-warrior-specialization-routing','party-warrior-stamina-cost','party-warrior-physical-scaling'])
    assert.equal(audit.checks.find(x => x.id === id).pass, true, id);
});

test('V1944 PvP RPC authenticates participants, locks match row and enforces active turn', () => {
  assert.equal(audit.transactionGuards.pvpRowLock, true);
  assert.equal(audit.transactionGuards.pvpTurnGuard, true);
  assert.equal(audit.checks.find(x => x.id === 'pvp-private-snapshot').pass, true);
  assert.equal(audit.checks.find(x => x.id === 'pvp-trusted-skill-catalog').pass, true);
});

test('V1944 detects the confirmed Warrior PvP server gap instead of claiming full online parity', () => {
  assert.equal(audit.warriorPvpSupported, false);
  assert.equal(audit.checks.find(x => x.id === 'pvp-warrior-specialization-routing').pass, false);
  assert.equal(audit.checks.find(x => x.id === 'pvp-warrior-class-allowance').pass, false);
  assert.equal(audit.checks.find(x => x.id === 'pvp-warrior-stamina-accounting').pass, false);
});

test('V1944 Party and PvP server procedures remain transactionally distinct and authoritative', () => {
  const party = read('../database/reference/etranom_party_battle_act_live_snapshot_v1921.sql');
  const pvp = read('../database/ETRANOM_V1921_WIZARD_PVP_LIVE_BRIDGE.sql');
  assert.match(party, /for update/i);
  assert.match(pvp, /for update/i);
  assert.match(pvp, /skill_not_in_trusted_catalog/);
  assert.doesNotMatch(pvp.slice(pvp.indexOf('create or replace function public.etranom_pvp_skill_action'), pvp.indexOf('-- Preserve attack/guard compatibility')), /p_client_snapshot|p_actor_state|p_character_json/);
});
