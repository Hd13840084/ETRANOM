import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeCombatant, renderCombatPlayerCard, renderCombatLog, renderCombatActionBar } from '../systems/combat/shared-combat-ui.js';
import { getCombatCapabilities, isCombatActionSupported } from '../systems/combat/combat-contract.js';

test('normalizes solo/party/pvp combatant shapes into one display model', () => {
  const player = normalizeCombatant({
    user_id: 'u1', name: 'قهرمان', player_class: 'جنگجو', level: 12,
    save_snapshot: { character: { maxHp: 180, hp: 120, maxMp: 40, mp: 15 } },
    battle: { hp: 95, max_hp: 180, mp: 12, max_mp: 40 }
  });
  assert.equal(player.id, 'u1');
  assert.equal(player.hp, 95);
  assert.equal(player.maxHp, 180);
  assert.equal(player.mp, 12);
  assert.equal(player.maxMp, 40);
});

test('shared player card uses the same battle-card structure for both sides', () => {
  const html = renderCombatPlayerCard({ name: '<قهرمان>', hp: 50, max_hp: 100, mp: 8, max_mp: 20 }, { role: 'حریف', isTurn: true });
  assert.match(html, /etr-battle-card player/);
  assert.match(html, /battle-meter hp/);
  assert.match(html, /battle-meter mp/);
  assert.match(html, /&lt;قهرمان&gt;/);
  assert.match(html, /نوبت اقدام/);
});

test('shared combat log escapes untrusted event text', () => {
  assert.match(renderCombatLog([{ text: '<script>alert(1)</script>' }]), /&lt;script&gt;/);
  assert.doesNotMatch(renderCombatLog([{ text: '<script>alert(1)</script>' }]), /<script>/);
});

test('mode capabilities do not expose unimplemented PvP skills or items', () => {
  assert.equal(isCombatActionSupported('pvp', 'attack'), true);
  assert.equal(isCombatActionSupported('pvp', 'guard'), true);
  assert.equal(isCombatActionSupported('pvp', 'skill'), false);
  assert.equal(isCombatActionSupported('pvp', 'item'), false);
  assert.equal(getCombatCapabilities('party').some(x => x.id === 'skill'), true);
});

test('all combat modes receive the same four-button control layout', () => {
  const expected = ['حمله عادی', 'مهارت‌ها', 'آیتم‌ها', 'دفاع / جاخالی'];
  for (const mode of ['solo', 'party', 'pvp']) {
    const attribute = mode === 'solo' ? 'data-fight' : mode === 'party' ? 'data-battle-action' : 'data-pvp-action';
    const html = renderCombatActionBar({ attribute, actionValues: mode === 'solo' ? { guard: 'defend' } : {} });
    for (const label of expected) assert.ok(html.includes(label), `${mode} missing ${label}`);
    assert.equal((html.match(/<button/g) || []).length, 4);
  }
});
