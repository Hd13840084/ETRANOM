import test from 'node:test';
import assert from 'node:assert/strict';
import DATA from '../content/classes/warrior_sword_ascetic_v1.json' with { type: 'json' };
import {
  collectSwordAsceticTalentEffects, applySwordAsceticPassiveStats,
  resolveSwordAsceticSkill, resolveSwordAsceticIncomingHit,
  applySwordAsceticTurnRecovery, resolveSwordAsceticControlDuration
} from '../systems/combat/sword-ascetic-runtime.js';

const allIds = DATA.talentBranches.flatMap(b => b.talents.map(t => t.id));
const progressFor = ids => ({ unlockedTalents: ids, talentRanks: Object.fromEntries(ids.map(id => [id, 1])) });
const actor = (ids = []) => ({ id:'hero', level:50, attack:100, defense:100, accuracy:90, hp:500, maxHp:500,
  stamina:50, maxStamina:100, classProgress:{ warrior_sword_ascetic:progressFor(ids) } });

test('exactly 32 unique talents exist in four complete branches', () => {
  assert.equal(DATA.talentBranches.length, 4);
  assert.deepEqual(DATA.talentBranches.map(b => b.talents.length), [8,8,8,8]);
  assert.equal(allIds.length, 32);
  assert.equal(new Set(allIds).size, 32);
});

test('all 32 talent effects are collected from the supported save shape', () => {
  const fx = collectSwordAsceticTalentEffects(progressFor(allIds));
  for (const talent of DATA.talentBranches.flatMap(b => b.talents)) {
    for (const [key, value] of Object.entries(talent.effect)) assert.equal(fx[key] >= value, true, `${talent.id}:${key}`);
  }
});

test('defensive passives apply once and do not mutate persisted progress', () => {
  const source = actor(['iron_frame','pain_discipline','clear_intent','measured_cut']);
  const before = structuredClone(source);
  const first = applySwordAsceticPassiveStats(source).actor;
  const second = applySwordAsceticPassiveStats(first).actor;
  assert.equal(first.defense, 103);
  assert.equal(first.maxHp, 520);
  assert.equal(first.accuracy, 93);
  assert.equal(first.critChance, 2);
  assert.equal(second.defense, first.defense);
  assert.deepEqual(source, before);
});

test('sword damage, mastery, soul blade and armor talents modify the intended attacks', () => {
  const plain = actor();
  const trained = actor(['steady_grip','sword_mastery','soul_link','armor_splitter']);
  const targets = () => [{id:'armored',hp:3000,defense:30,isArmored:true},{id:'plain',hp:3000,defense:30}];
  const a = resolveSwordAsceticSkill('soul_blade',{actor:plain,targets:targets(),targetId:'armored'});
  const b = resolveSwordAsceticSkill('soul_blade',{actor:trained,targets:targets(),targetId:'armored'});
  assert.ok(b.targets[0].hp < a.targets[0].hp);
  assert.ok(b.log.some(x => x.type === 'sword_ascetic_armored_bonus'));
});


test('accuracy and critical talents affect server-rolled hit and critical outcomes', () => {
  const target = () => [{id:'mob',hp:2000,maxHp:2000,defense:0,evasionPct:94}];
  const plain = resolveSwordAsceticSkill('black_crescent',{actor:actor(),targets:target(),targetId:'mob',rolls:{hit:93,crit:99}});
  const trained = resolveSwordAsceticSkill('black_crescent',{actor:actor(['measured_cut','sword_gaze','absolute_perception','clear_intent','perfect_angle']),targets:target(),targetId:'mob',rolls:{hit:5,crit:1}});
  assert.ok(plain.log.some(x => x.type === 'sword_ascetic_miss'));
  assert.ok(trained.targets[0].hp < 2000);
  assert.ok(trained.log.some(x => x.type === 'sword_ascetic_critical_bonus'));
});

test('bleed talents apply a deterministic bleed proc with amplified tick data', () => {
  const result = resolveSwordAsceticSkill('crimson_blossom',{actor:actor(['blood_petals','deep_cut']),targets:[{id:'mob',hp:3000,defense:0}],targetId:'mob',rolls:{bleed:1}});
  assert.equal(result.targets[0].statuses.bleed.turns,2);
  assert.equal(result.targets[0].statuses.bleed.dotPct,5.25);
});

test('bleed talent data is compatible with the shared status tick engine', async () => {
  const { tickCombatStatuses } = await import('../systems/combat/shared-skill-runtime.js?v=1841');
  const result = resolveSwordAsceticSkill('crimson_blossom',{actor:actor(['blood_petals','deep_cut']),targets:[{id:'mob',hp:3000,maxHp:3000,defense:0}],targetId:'mob',rolls:{bleed:1}});
  const ticked = tickCombatStatuses(result.targets[0]);
  assert.ok(ticked.combatant.hp < result.targets[0].hp);
  assert.ok(ticked.log.some(x => x.type === 'dot'));
});

test('evasion grants second breath and counter-read damage; guard and ambush mitigation apply', () => {
  const defender = actor(['second_breath','counter_read','danger_sense','balanced_body']);
  defender.swordAsceticStates = {evasionPct:100,turns:1};
  const result = resolveSwordAsceticIncomingHit(defender,{id:'enemy',hp:500},100,{evasionRoll:0,isAmbush:true});
  assert.equal(result.dodged,true);
  assert.equal(result.actor.stamina,52);
  assert.equal(result.counterDamage,5);
  assert.equal(result.attacker.hp,495);
  const hit = resolveSwordAsceticIncomingHit(actor(['balanced_body','danger_sense']),{id:'enemy',hp:500},100,{isAmbush:true});
  assert.equal(hit.damageTaken,91); // 4% guard, then 5% ambush resistance, floored.
});

test('trained breath, control resistance and interrupt resistance are available through runtime hooks', () => {
  const trained = actor(['trained_breath','unyielding','rooted_stance']);
  const recovered = applySwordAsceticTurnRecovery(trained,10);
  assert.equal(recovered.recovered,10); // floor(10 * 1.05) = 10
  assert.equal(resolveSwordAsceticControlDuration(trained,4,'control'),4); // ceil(4 * .90)
  assert.equal(resolveSwordAsceticControlDuration(trained,4,'interrupt'),4);
});

test('all three adapters expose specialization recovery and control hooks without changing other classes', async () => {
  const { CombatAdapter } = await import('../systems/combat/combat-adapters.js');
  for (const mode of ['solo','party','pvp']) {
    const a = actor(['trained_breath']);
    const result = CombatAdapter[mode].specializationTurnRecovery(a,20,{specializationId:'warrior_sword_ascetic'});
    assert.equal(result.recovered,21);
    assert.equal(CombatAdapter[mode].specializationControlDuration(a,3,'control',{specializationId:'warrior'}),3);
  }
});
