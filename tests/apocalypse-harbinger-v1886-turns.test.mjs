import assert from 'node:assert/strict';
import {createApocalypseProgress,unlockApocalypseSkills,resolveApocalypseSkill,activateWorldsEnd,selectApocalypseAscension,tickApocalypseTurn,resetApocalypseBattle,endApocalypseBattle} from '../systems/combat/apocalypse-harbinger-runtime.js';
const actor={level:30,attack:200,stamina:100,skillPoints:50,classProgress:{warrior_apocalypse_harbinger:createApocalypseProgress()}};
unlockApocalypseSkills(actor);
let enemies=[{encounterId:'e1',enemy:'نگهبان',hp:5000,encounterKind:'normal',statuses:{}},{encounterId:'e2',enemy:'سایه',hp:5000,encounterKind:'normal',statuses:{}}];
// End Mark must bind to the live encounter ID and tick damage on enemy response.
let mark=resolveApocalypseSkill('end_mark',{actor,targets:enemies,targetId:'e1'});
assert.ok(mark.progress.statuses.e1.endMark>=3);
let tick=tickApocalypseTurn(actor,mark.targets);
assert.ok(tick.targets[0].hp<5000);
// Control skips one enemy action and expires after exactly one enemy response.
let control=resolveApocalypseSkill('existence_inversion',{actor,targets:enemies,targetId:'e1'});
assert.equal(control.targets[0].statuses.controlTurns,1);
tick=tickApocalypseTurn(actor,control.targets);
assert.equal(tick.targets[0].statuses.controlTurns,undefined);
// Bosses are not hard-locked: they receive only a short, reduced control effect.
let boss=[{encounterId:'boss',enemy:'باس',hp:10000,encounterKind:'boss',statuses:{}}];
let bossControl=resolveApocalypseSkill('captivity_dominion',{actor,targets:boss,targetId:'boss'});
assert.equal(bossControl.targets[0].statuses.controlTurns,1);
assert.ok(bossControl.targets[0].attackReductionPct>0);
// World domain has two complete intervening battles of cooldown.
activateWorldsEnd(actor);selectApocalypseAscension(actor,'apoc_strike_ascended');
const cooldown=()=>actor.classProgress.warrior_apocalypse_harbinger.domain.cooldownBattles;
assert.equal(cooldown(),3);
endApocalypseBattle(actor);
resetApocalypseBattle(actor,{newBattle:true});assert.equal(cooldown(),2);
assert.throws(()=>activateWorldsEnd(actor),/domain_cooldown/);
resetApocalypseBattle(actor,{newBattle:true});assert.equal(cooldown(),1);
assert.throws(()=>activateWorldsEnd(actor),/domain_cooldown/);
resetApocalypseBattle(actor,{newBattle:true});assert.equal(cooldown(),0);
activateWorldsEnd(actor);
console.log('V1886 turn lifecycle, marks, control, boss resistance and domain cooldown checks passed.');
