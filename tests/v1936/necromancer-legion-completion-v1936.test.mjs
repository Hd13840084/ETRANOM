import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  createNecromancerProgress,
  normalizeNecromancerProgress,
  getNecromancerLegionAbilities,
  activateNecromancerDomain
} from '../../systems/classes/necromancer.js';
import { tickWizardCombatState } from '../../systems/classes/wizard-combat-runtime.js';

const root = new URL('../../', import.meta.url);
const game = fs.readFileSync(new URL('game.js', root), 'utf8');
const necromancer = fs.readFileSync(new URL('systems/classes/necromancer.js', root), 'utf8');
const runtime = fs.readFileSync(new URL('systems/classes/wizard-combat-runtime.js', root), 'utf8');
const index = fs.readFileSync(new URL('index.html', root), 'utf8');

test('Every Legion species receives deterministic, species-stable normal and distinct Death Form abilities', () => {
  const member = { id: 'instance-a', speciesId: 'ash_wolf', name: 'گرگ خاکستر', hp: 50, maxHp: 50 };
  const first = getNecromancerLegionAbilities(member);
  const second = getNecromancerLegionAbilities({ ...member, id: 'instance-b' });
  assert.equal(first.legionAbility.id, second.legionAbility.id);
  assert.equal(first.deathFormAbility.id, second.deathFormAbility.id);
  assert.notEqual(first.legionAbility.id, first.deathFormAbility.id);
  assert.ok(first.legionAbility.damagePct > 0);
  assert.ok(first.deathFormAbility.damagePct > 0);
  const healer = getNecromancerLegionAbilities({ speciesId: 'bone_priest', specialAbility: 'soul healing' });
  assert.match(healer.legionAbility.id, /soul_drinker$/);
  assert.equal(healer.legionAbility.basedOn, 'soul healing');
});

test('Legacy Legion members are upgraded without losing their stable instance identity or authored fields', () => {
  const p = normalizeNecromancerProgress({ legion: [{ id: 'member-1', speciesId: 'ash_wolf', name: 'گرگ خاکستر', hp: 40, maxHp: 50, customTag: 'preserve-me' }] });
  assert.equal(p.legion[0].id, 'member-1');
  assert.equal(p.legion[0].customTag, 'preserve-me');
  assert.equal(p.legion[0].legionAbility.id, getNecromancerLegionAbilities(p.legion[0]).legionAbility.id);
  assert.equal(p.legion[0].deathForm, null);
});

test('Necromancer Domain grants Death Form only to the selected active squad', () => {
  const p = createNecromancerProgress();
  p.legion = [
    { id: 'a', speciesId: 'wolf', name: 'گرگ', hp: 30, maxHp: 30 },
    { id: 'b', speciesId: 'guard', name: 'نگهبان', hp: 30, maxHp: 30 }
  ];
  p.activeLegionIds = ['a'];
  const result = activateNecromancerDomain(p, 25);
  assert.equal(result.ok, true);
  const active = result.progress.legion.find(x => x.id === 'a');
  const reserve = result.progress.legion.find(x => x.id === 'b');
  assert.equal(active.deathForm.active, true);
  assert.equal(active.deathForm.abilityId, active.deathFormAbility.id);
  assert.equal(reserve.deathForm, null);
});

test('Bone Blossom has separate defense and resistance layers, a two-turn bone wound, and stronger ascended values', () => {
  assert.match(game, /resistancePct:isDefense\?15\*rankMultiplier/);
  assert.match(game, /boneWoundChancePct:isDefense\?20\*rankMultiplier/);
  assert.match(game, /boneWoundDamagePct:isDefense\?10\*rankMultiplier/);
  assert.match(game, /bone_blossom_ascended'.*?resistancePct:30,boneWoundChancePct:35,boneWoundDamagePct:15/s);
  assert.match(game, /wound\.turns=Math\.max\(0,Number\(wound\.turns\)-1\)/);
  assert.match(game, /const resistance=Math\.min\(75,Math\.max\(0,Number\(combatRef\.necromancerLegionBuff\?\.resistancePct\)/);
});

test('Kingdom of Bones adds critical chance, a 1.5x critical multiplier, defense break and the two-soul cap', () => {
  assert.match(game, /critChancePct:isDefense\?0:15\*rankMultiplier/);
  assert.match(game, /critDamageMultiplier:1\.5/);
  assert.match(game, /defenseBreakPct:isDefense\?0:20\*rankMultiplier/);
  assert.match(game, /critChancePct:25,critDamageMultiplier:1\.5,defenseBreakPct:30/);
  assert.match(game, /const critChance=Math\.min\(75,Math\.max\(0,Number\(buff\.critChancePct\|\|0\)\+Number\(legionTalents\.legionCritChancePct\|\|0\)\)\)/);
  assert.match(game, /if\(kills<Number\(buff\.soulKillCap\)\)/);
});

test('Miniboss Soul Domination weakens will instead of controlling the miniboss', () => {
  assert.match(game, /willWeakening:true,attackReductionPct:15\*rankMultiplier,skillReductionPct:12\*rankMultiplier/);
  assert.match(game, /willWeakening:true,attackReductionPct:22,skillReductionPct:18/);
  assert.match(necromancer, /مینی‌باس: تسخیر به تضعیف اراده تبدیل می‌شود/);
});

test('Eternal Sovereign expiration arms exactly two fatigue turns and fatigue suppresses Legion abilities', () => {
  const combat = { necromancerSovereignTurns: 1, enemies: [] };
  tickWizardCombatState(combat);
  assert.equal(combat.necromancerSovereignTurns, undefined);
  assert.equal(combat.necromancerSovereignFatiguePending, true);
  assert.match(game, /necromancerFatigueTurns=Math\.max\(Number\(member\.necromancerFatigueTurns\)\|\|0,2\)/);
  assert.match(game, /const abilityReady=\!\(fatigue>0\)/);
  assert.match(game, /const deathReady=deathActive&&\!\(fatigue>0\)/);
  assert.match(game, /fatigueScale=fatigue>0\?0\.8:1/);
  assert.match(game, /fatigue\?0\.85:1/);
  assert.match(game, /function applyNecromancerSovereignFatigue\(combatRef, force=false\)/);
  assert.match(game, /applyNecromancerSovereignFatigue\(activeBattle,true\)/);
  assert.match(game, /applyNecromancerSovereignFatigue\(abandoned,true\)/);
});

test('Legion ability cooldowns and death-form ability cooldowns are independent and battle-scoped', () => {
  assert.match(game, /necromancerLegionAbilityCooldowns\[member\.id\]=Number\(combatRef\.turn\|\|1\)\+3/);
  assert.match(game, /necromancerDeathAbilityCooldowns\[member\.id\]=Number\(combatRef\.turn\|\|1\)\+4/);
  assert.match(game, /member\.deathForm\?\.active&&Number\(combatRef\.wizardDomainTurns\)>0/);
});

test('Changed class module and game entry use V1936 cache keys', () => {
  assert.match(index, /necromancer\.js\?v=1936/);
  assert.match(index, /wizard-combat-runtime\.js\?v=1936/);
  assert.match(index, /game\.js\?v=1961&nav=1961/);
  assert.match(runtime, /necromancerSovereignFatiguePending=true/);
});
