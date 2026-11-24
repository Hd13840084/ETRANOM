import test from 'node:test';
import assert from 'node:assert/strict';
import {
  normalizeCombatActionV1972,
  dispatchSoloCombatActionV1972,
  dispatchRemoteCombatActionV1972,
  getCentralCombatIntegrationManifestV1972
} from '../../systems/combat/central-combat-runtime-v1972.js';

test('Solo aliases map legacy potion/scroll/flee/defend actions to central vocabulary', () => {
  assert.equal(normalizeCombatActionV1972('solo', { action: 'potion:minor_hp' }).action, 'item');
  assert.equal(normalizeCombatActionV1972('solo', { action: 'scroll:fire' }).action, 'item');
  assert.equal(normalizeCombatActionV1972('solo', { action: 'flee' }).action, 'retreat');
  assert.equal(normalizeCombatActionV1972('solo', { action: 'defend' }).action, 'guard');
});

test('Solo adapter delegates exactly once and attaches central context', () => {
  let calls = 0;
  const response = dispatchSoloCombatActionV1972({
    intent: { action: 'attack', targetId: 'mob-1' },
    context: { turn: 4 },
    execute: command => { calls++; return { hit: true, target: command.targetId, version: command.context.runtimeVersion }; }
  });
  assert.equal(calls, 1);
  assert.equal(response.accepted, true);
  assert.equal(response.mode, 'solo');
  assert.equal(response.result.target, 'mob-1');
  assert.equal(response.result.version, '1972.0.0');
});

test('Solo adapter rejects unsupported action before executor mutation', () => {
  let calls = 0;
  assert.throws(() => dispatchSoloCombatActionV1972({ intent: { action: 'dance' }, execute: () => calls++ }));
  assert.equal(calls, 0);
});

test('Party remote adapter preserves request identity and delegates to existing RPC', async () => {
  let captured;
  const result = await dispatchRemoteCombatActionV1972({
    mode: 'party', intent: { action: 'attack', targetId: '2' }, requestId: 'req-party-1',
    context: { sessionId: 'session-1' },
    execute: async payload => { captured = payload; return { accepted: true, server: 'party-rpc' }; }
  });
  assert.equal(captured.requestId, 'req-party-1');
  assert.equal(captured.command.action, 'attack');
  assert.equal(captured.context.mode, 'party');
  assert.equal(result.server, 'party-rpc');
});

test('Party legacy skill action is normalized without losing skill id and choice', async () => {
  let captured;
  await dispatchRemoteCombatActionV1972({
    mode: 'party', intent: { action: 'skill:iron_wall|fortify' }, requestId: 'req-party-skill',
    execute: async payload => { captured = payload; return { accepted: true }; }
  });
  assert.equal(captured.command.action, 'skill');
  assert.equal(captured.command.skillId, 'iron_wall');
  assert.equal(captured.command.choice, 'fortify');
});

test('PvP skill is allowed only through explicit server-validated skill route', async () => {
  await assert.rejects(() => dispatchRemoteCombatActionV1972({
    mode: 'pvp', intent: { action: 'skill', skillId: 'pvp_skill' }, requestId: 'req-pvp-bad', execute: async () => ({})
  }));
  let captured;
  await dispatchRemoteCombatActionV1972({
    mode: 'pvp', intent: { action: 'skill', skillId: 'pvp_skill' }, serverValidatedSkill: true,
    requestId: 'req-pvp-skill', execute: async payload => { captured = payload; return { accepted: true }; }
  });
  assert.equal(captured.command.action, 'skill');
  assert.equal(captured.command.skillId, 'pvp_skill');
});

test('remote adapter requires request id and supported mode', async () => {
  await assert.rejects(() => dispatchRemoteCombatActionV1972({ mode: 'solo', intent: { action: 'attack' }, requestId: 'x', execute: async () => ({}) }));
  await assert.rejects(() => dispatchRemoteCombatActionV1972({ mode: 'party', intent: { action: 'attack' }, execute: async () => ({}) }));
});

test('integration manifest clearly records authorities and known boundary', () => {
  const manifest = getCentralCombatIntegrationManifestV1972();
  assert.equal(manifest.version, '1972.0.0');
  assert.match(manifest.modes.party.authority, /Supabase/);
  assert.match(manifest.modes.pvp.authority, /Supabase/);
  assert.match(manifest.limitations.join(' '), /Solo remains browser-save authoritative/);
});
