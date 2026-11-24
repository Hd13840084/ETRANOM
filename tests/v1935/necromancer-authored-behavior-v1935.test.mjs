import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { resolveNecromancerRevive, tickWizardCombatState } from '../../systems/classes/wizard-combat-runtime.js';

const root = new URL('../../', import.meta.url);
const game = fs.readFileSync(new URL('game.js', root), 'utf8');
const necromancer = fs.readFileSync(new URL('systems/classes/necromancer.js', root), 'utf8');

test('Return from the Threshold requires the authored three souls and arms the revive for three turns', () => {
  assert.match(necromancer, /هزینه پایه ۳ روح ذخیره‌شده است/);
  assert.match(game, /const soulCost=3/);
  assert.match(game, /c\.necromancerReviveTurns=3;c\.necromancerReviveHealthPct=25\*rankMultiplier/);
  assert.match(game, /حداقل سه روح ذخیره لازم است/);
});

test('Ascended Denial of Death arms a three-turn 55% maximum-HP return', () => {
  assert.match(game, /c\.necromancerReviveTurns=3;c\.necromancerReviveHealthPct=55/);
});

test('Necromancer revive uses the configured health percentage and can trigger only once', () => {
  const combat = { necromancerReviveArmed: true, necromancerReviveTurns: 2, necromancerReviveHealthPct: 55 };
  const character = { hp: 0 };
  assert.equal(resolveNecromancerRevive(combat, character, 1000), true);
  assert.equal(character.hp, 550);
  assert.equal(resolveNecromancerRevive(combat, character, 1000), false);
});

test('Necromancer revive expires after three successful enemy-response ticks without being consumed', () => {
  const combat = { necromancerReviveArmed: true, necromancerReviveTurns: 3, enemies: [] };
  tickWizardCombatState(combat);
  assert.equal(combat.necromancerReviveTurns, 2);
  tickWizardCombatState(combat);
  assert.equal(combat.necromancerReviveTurns, 1);
  tickWizardCombatState(combat);
  assert.equal(combat.necromancerReviveArmed, false);
  assert.equal(combat.necromancerReviveTurns, undefined);
});

test('Death Memory ascension applies all three debuffs at half strength against bosses', () => {
  assert.match(necromancer, /هر سه خاطره جنگ، بقا و جادو هم‌زمان بر هدف اعمال می‌شوند؛ باس‌ها شدت کمتر می‌گیرند/);
  assert.match(game, /const scale=\['boss','area_boss'\]\.includes\(e\.encounterKind\)\?0\.5:1;e\.necromancerDebuff=\{turns:3,attackReductionPct:25\*scale,defenseReductionPct:20\*scale,skillReductionPct:20\*scale,deathMemoryLegionDamagePct:10\}/);
});

test('Ascended Assembly of Souls presents one of the three authored commands before consuming the ascended form', () => {
  assert.match(game, /id==='assembly_of_souls_ascended'&&!hasMatchingMode/);
  assert.match(game, /c\.pendingWizardOptions=wizardModeOptions\('soul_command'\)/);
  assert.match(game, /if\(selectedMode===0\)enemies\.forEach\(e=>wizardRuntimeDamage\(e,110/);
  assert.match(game, /else if\(selectedMode===1\)c\.necromancerSoulGuard=\{turns:3,absorbPct:40\}/);
});

test('Life Siphon uses its authored 30% recovery fraction and shares 20% with living legion members', () => {
  assert.match(necromancer, /۳۰٪ آن به سلامتی نکرومنسر تبدیل می‌شود\. ۲۰٪ از مقدار بازیابی‌شده میان اعضای زنده لژیون تقسیم می‌شود/);
  assert.match(game, /healPct:\(30\+\(Number\(tal\.lifeStealPct\)\|\|0\)\)\*bossScale/);
  assert.match(game, /legionShareOfHealPct:20/);
});

test('Army of the Risen applies death forms to the configured active squad, not arbitrary reserve members', () => {
  assert.match(game, /const activeIds=new Set\(\(p\.activeLegionIds\|\|\[\]\)\.map\(String\)\)/);
  assert.match(game, /if\(!activeIds\.has\(String\(m\.id\|\|m\.speciesId\|\|m\.name\)\)\)return m/);
});

test('Death Memory kill bonus is queued for the next Legion turn and consumed once', () => {
  assert.match(game, /deathMemoryLegionDamagePct:10/);
  assert.match(game, /combatRef\.necromancerLegionNextDamagePct=Math\.max/);
  assert.match(game, /queuedDamageBonus=Math\.max\(0,Number\(combatRef\.necromancerLegionNextDamagePct\)\|\|0\);combatRef\.necromancerLegionNextDamagePct=0/);
  assert.match(game, /Number\(buff\.damagePct\|\|0\)\+queuedDamageBonus\+abilityDamagePct/);
});

test('Kingdom of Bones records at most two Legion kill souls per cast', () => {
  assert.match(necromancer, /کشتن دشمن توسط عضو لژیون ۱ روح تولید می‌کند؛ حداکثر ۲ روح در هر بار اجرا/);
  assert.match(game, /soulKillCap:isDefense\?0:2/);
  assert.match(game, /if\(kills<Number\(buff\.soulKillCap\)\)/);
  assert.match(game, /combatRef\.necromancerKingdomSoulKills=kills\+1/);
});

test('Legion buffs expire after their configured turn duration', () => {
  assert.match(fs.readFileSync(new URL('systems/classes/wizard-combat-runtime.js', root), 'utf8'), /necromancerLegionBuff\.turns--; if \(combat\.necromancerLegionBuff\.turns<=0\) \{ delete combat\.necromancerLegionBuff/);
});

test('Eternal Sovereign converts 15% of Legion damage into player healing during its active duration', () => {
  assert.match(necromancer, /۱۵٪ آسیب واردشده توسط لژیون به سلامتی نکرومنسر تبدیل می‌شود/);
  assert.match(game, /healing=Math\.floor\(total\*\.15\)/);
});

test('Soul Domination applies 35% chain and silence strength to bosses and never directly dominates minibosses', () => {
  assert.match(necromancer, /باس: تسخیر ممنوع؛ زنجیر و خاموشی با شدت ۳۵٪ اعمال می‌شوند\. مینی‌باس: تسخیر به تضعیف اراده تبدیل می‌شود/);
  assert.match(game, /\['boss','area_boss','miniboss','mini_boss'\]\.includes\(target\.encounterKind\|\|target\.kind\)/);
  assert.match(game, /const scale=\['boss','area_boss'\]\.includes\(target\.encounterKind\)\?0\.35:1/);
});


test('Ascended Return Threshold inherits the three-soul cost and does not consume the form when souls are insufficient', () => {
  assert.match(game, /id==='return_threshold_ascended'&&\(p\.reviveUsedThisBattle\|\|Number\(p\.storedSouls\|\|0\)<3\)/);
  assert.match(game, /result\.progress\.storedSouls=Math\.max\(0,Number\(result\.progress\.storedSouls\|\|0\)-3\)/);
});

test('Army of the Risen deploys the selected active squad into the current battle', () => {
  assert.match(game, /c\.summonedLegionIds=\[\.\.\.activeIds\]\.slice\(0,3\)/);
});

test('Life Siphon is a three-turn periodic effect with 30% recovery, 20% living-legion share and 20% marked-target bonus', () => {
  assert.match(necromancer, /برای ۳ نوبت از یک دشمن حیات می‌مکد؛ در هر نوبت آسیب تاریک وارد و ۳۰٪ آن به سلامتی نکرومنسر تبدیل می‌شود/);
  assert.match(game, /target\.necromancerLifeSiphon=\{turns:lifeTurns,damagePct:160\*rankMultiplier\*bossScale\/lifeTurns,healPct:\(30\+/);
  assert.match(game, /markedBonusPct:20,legionShareOfHealPct:20/);
  assert.match(game, /damagePct=Number\(tick\.damagePct\|\|0\)\*\(marked\?1\+\(Number\(tick\.markedBonusPct\)\|\|0\)\/100:1\)/);
});

test('Ascended Life Siphon inherits the duration, uses the 260% coefficient and halves mana steal against bosses', () => {
  assert.match(game, /damagePct:260\*bossScale\/lifeTurns,healPct:55\*bossScale,markedBonusPct:20,legionShareOfDamagePct:10\*bossScale/);
  assert.match(game, /Math\.floor\(warriorMaxMp\(\)\*\.08\*bossScale\)/);
});

test('Soul Domination chain command affects every living enemy and applies 35% intensity to bosses', () => {
  assert.match(game, /for\(const chained of \(c\.enemies\|\|\[\]\)\.filter\(e=>Number\(e\.hp\)>0\)\)/);
  assert.match(game, /\['boss','area_boss'\]\.includes\(chained\.encounterKind\)\?0\.35:1/);
});

test('Death Claw keeps full direct boss damage but halves the wound tick intensity against bosses', () => {
  assert.match(game, /pct:20\*rankScale\/100\*\(\['boss','area_boss'\]\.includes\(target\.encounterKind\)\?0\.5:1\)/);
});

test('Base and ascended Return from the Threshold share one once-per-battle use flag', () => {
  assert.match(game, /id==='return_threshold_ascended'&&\(p\.reviveUsedThisBattle\|\|Number\(p\.storedSouls\|\|0\)<3\)/);
  assert.match(game, /result\.progress\.reviveUsedThisBattle=true/);
});
