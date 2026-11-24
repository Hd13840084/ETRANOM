import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const root = new URL('../../', import.meta.url);
const game = fs.readFileSync(new URL('game.js', root), 'utf8');
const warlock = fs.readFileSync(new URL('systems/classes/warlock.js', root), 'utf8');
const warlockDoc = fs.readFileSync(new URL('docs/WARLOCK_SPECIALIZATION_V1_FA.md', root), 'utf8');
const index = fs.readFileSync(new URL('index.html', root), 'utf8');

test('Theft of Tomorrow matches authored 35% damage and 25% mana reduction and consumes its one next-skill charge', () => {
  assert.match(warlock, /مهارت بعدی‌اش 35٪ قوی‌تر و 25٪ ارزان‌تر/);
  assert.match(game, /warlockMomentBuff=\{turns:1,damagePct:35,manaCostReductionPct:25\}/);
  assert.match(game, /momentDiscount\?Math\.max\(1,Math\.ceil\(baseManaCost\*\(1-momentDiscount\/100\)\)\):baseManaCost/);
  assert.match(game, /if\(isWarlock\(\)&&momentDiscount>0\)c\.warlockMomentBuff=null/);
});

test('Altar of the Unpayable refunds 60% of its initial sacrifice only after a successful hit and does not charge a second HP sacrifice', () => {
  assert.match(warlock, /12٪ حداکثر HP را \(بدون کشتن\) قربانی می‌کند؛ مهارت بعدی 100٪ قوی‌تر است و 60٪ قربانی در صورت اصابت بازمی‌گردد/);
  assert.match(game, /paidHpCost:hp,source:'altar_of_the_unpayable'/);
  assert.match(game, /Number\.isFinite\(Number\(sacrifice\.hpCostPct\)\).*sacrificePct/);
  assert.match(game, /sacrifice\.refundOnHit\?!!c\.warlockSacrificeHit:true/);
  assert.match(game, /refundBase=Number\.isFinite\(Number\(sacrifice\.paidHpCost\)\).*sacrificeHpCost/);
});

test('Edict of the True Name restores 6% max MP when the marked enemy casts a special skill', () => {
  assert.match(warlock, /هر مهارت ویژه‌اش 6٪ حداکثر مانا به وارلاک می‌دهد/);
  assert.equal((game.match(/فرمان نام نخستین '\+restored\+' مانا بازیابی کرد/g) || []).length, 2);
  assert.match(game, /restored=Math\.ceil\(warriorMaxMp\(\)\*Number\(wd\.manaRestorePct\)\/100\)/);
});

test('Heart of the Bound King uses its configured 35% damage transfer instead of a hardcoded 22%', () => {
  assert.match(game, /damageTransferPct:35,healingReturnPct:25/);
  assert.match(game, /transferPct=Number\(hostage\.warlockHostage\.damageTransferPct\)\|\|22,bossTransferScale=hostage\.warlockHostage\.breakDamagePct\?1:/);
});

test('Unmaking of the Named removes one positive buff and applies the authored 40% boss skill weakening', () => {
  assert.match(warlock, /باس یک اثر مثبت را از دست می‌دهد و مهارت بعدی‌اش 40٪ ضعیف می‌شود/);
  assert.match(game, /const buffKeys=Object\.keys\(target\.buffs\|\|\{\}\);if\(buffKeys\.length\)\{const key=buffKeys\[0\];delete target\.buffs\[key\];\}/);
  assert.match(game, /skillReductionPct:40/);
});

test('Covenant at Worlds End includes the authored debt scaling, single-buff purge and 15% missing-HP recovery', () => {
  assert.match(warlock, /هر 2 بدهی \+10٪ آسیب تا سقف \+50٪/);
  assert.match(game, /bonus=Math\.min\(50,Math\.floor\(debt\/2\)\*10\)/);
  assert.match(game, /wizardRuntimeDamage\(e,420\*\(1\+bonus\/100\),skill\.name\)/);
  assert.match(game, /healed=Math\.floor\(missing\*\.15\)/);
});

test('Testament of the Eightfold accrues two debt per skill and grants five percent per debt up to eight debt', () => {
  assert.match(warlock, /هر مهارت 2 بدهی می‌سازد؛ هر بدهی 5٪ آسیب می‌دهد.*سقف 8 بدهی/);
  assert.match(game, /p\.pactDebt=Math\.min\(8,\(Number\(p\.pactDebt\)\|\|0\)\+2\)/);
  assert.match(game, /damagePct:Math\.min\(40,p\.pactDebt\*5\)/);
  assert.match(game, /state\.combat\?\.warlockTestament\|\|state\.combat\?\.warlockCovenantAtWorldsEnd\?0:Math\.min\(24/);
});

test('Shattering of First Speech requires choosing one of the six pairs of four bonds and scales boss effects to 65%', () => {
  assert.match(warlock, /دو بند از چهار بند روی هدف انتخاب می‌شود و 3 نوبت می‌ماند؛ شدت علیه باس 65٪ است/);
  assert.match(game, /key==='warlock'&&id==='shattering_of_first_speech'&&!hasMatchingMode/);
  assert.match(game, /pairs=\[\[0,1\],\[0,2\],\[0,3\],\[1,2\],\[1,3\],\[2,3\]\]/);
  assert.match(game, /scale=boss\?0\.65:1/);
});

test('Updated game entry uses the V1935 cache key', () => {
  assert.match(index, /game\.js\?v=1961&nav=1961/);
});


test('Court of Final Verdicts applies all three decrees for three turns with 60% boss strength', () => {
  assert.match(warlock, /هر سه حکم هم‌زمان برای 3 نوبت اجرا می‌شوند؛ شدت علیه باس 60٪ است/);
  assert.match(game, /e\.warlockDebuff=\{turns:3,skillReductionPct:25\*scale\};e\.warlockCourtAll=\{turns:3,reflectPct:15\*scale,manaDrainPct:3\*scale,creditGain:scale\}/);
  assert.match(game, /const stolen=Math\.min\(Number\(selectedEnemy\.mp\)\|\|0,Math\.ceil\(\(Number\(selectedEnemy\.maxMp\)\|\|0\)\*Number\(courtAll\.manaDrainPct\|\|0\)\/100\)\)/);
  assert.match(game, /selectedEnemy\.warlockCourtAll\.reflectPct/);
});

test('Covenant damage uses only its authored 10% per two debt scaling rather than also inheriting legacy debt bonus', () => {
  assert.match(game, /warlockTestament\|\|state\.combat\?\.warlockCovenantAtWorldsEnd\?0:Math\.min\(24/);
  assert.match(game, /c\.warlockCovenantAtWorldsEnd=true/);
});


test('Secondary enemies apply the same combined special-skill weakening as the primary enemy', () => {
  assert.match(game, /secondarySkillReduction=Math\.min\(100,Math\.max\(0,Number\(warDebuff\.skillSuppressionPct\|\|0\)\+Number\(warDebuff\.skillReductionPct\|\|0\)\+Number\(warDebuff\.bossSkillReductionPct\|\|0\)\+Number\(necDebuff\.skillReductionPct\|\|0\)\+Number\(wizStatus\.skillReductionPct\|\|0\)\+\(secondaryCourtMode===0\?25\*secondaryCourtScale:0\)\)\)/);
  assert.match(game, /raw=Math\.round\(raw\*multiplier\*\(1-secondarySkillReduction\/100\)/);
});

test('Base Stolen Moment does not suppress a boss turn and applies the authored 20% skill weakening and 15% mana surcharge', () => {
  assert.match(warlock, /اگر هدف باس باشد، مهارت بعدی‌اش 20٪ ضعیف‌تر و هزینه‌اش 15٪ بیشتر می‌شود؛ نوبتش حذف نمی‌شود/);
  assert.match(game, /const boss=\['boss','area_boss'\]\.includes\(target\.encounterKind\);target\.warlockDebuff=boss\?\{turns:1,bossSkillReductionPct:20\*rankMultiplier,manaCostIncreasePct:15\*rankMultiplier\}/);
  assert.match(game, /baseCost=Math\.max\(1,Number\(skill\?\.effects\?\.mp_cost\)\|\|10\+Math\.floor\(Math\.random\(\)\*6\)\),cost=Math\.max\(1,Math\.ceil\(baseCost\*\(1\+\(Number\(wd\.manaCostIncreasePct\)\|\|0\)\/100\)\)/);
});

test('Hunger reservoir records and drains mana from secondary enemies only when they cast a special skill', () => {
  assert.match(game, /let secondarySkillCast=false/);
  assert.match(game, /secondarySkillCast=true/);
  assert.match(game, /if\(secondarySkillCast&&state\.combat\?\.warlockHunger/);
});

test('Base Hostage Heart halves its damage transfer against bosses while the ascended form retains its authored 35%', () => {
  assert.match(warlock, /روی باس انتقال نصف است/);
  assert.match(game, /bossTransferScale=hostage\.warlockHostage\.breakDamagePct\?1:\(\['boss','area_boss'\]\.includes\(hostage\.encounterKind\)\?0\.5:1\)/);
});


test('Changed Wizard combat runtime module receives a fresh cache key', () => {
  assert.match(fs.readFileSync(new URL('index.html', root), 'utf8'), /wizard-combat-runtime\.js\?v=1936/);
});

test('Forbidden Signature applies half-strength boss reflection and credit, and grants two credits on normal-target death', () => {
  assert.match(warlockDoc, /با مرگ هدف، 2 اعتبار پیمان کسب می‌شود/);
  assert.match(game, /reflectPct:\(18\*rankMultiplier\+Number\(tal\.forbiddenSignatureReflectPct\|\|0\)\)\*bossScale,manaDrainPct:4\*rankMultiplier\*bossScale/);
  assert.match(game, /gain=\['boss','area_boss'\]\.includes\(enemy\.encounterKind\)\?1:2/);
});

test('Ascended Edict reflects 28% of damage received by its target and restores 6% max MP on its special skill', () => {
  assert.match(game, /damageReflectPct:28,manaRestorePct:6/);
  assert.match(game, /actualDamage\*Number\(enemy\.warlockDebuff\.damageReflectPct\)\/100/);
  assert.match(game, /warriorMaxMp\(\)\*Number\(wd\.manaRestorePct\)\/100/);
  assert.match(game, /handleCombatPlayerDefeat\(c,'بازتاب نام نخستین'\)/);
});

test('Base Testament uses one debt and 3% per debt; ascended Testament uses two debt and 5% per debt', () => {
  assert.match(game, /p\.pactDebt=Math\.min\(8,\(Number\(p\.pactDebt\)\|\|0\)\+2\);c\.warlockBuff=\{turns:99,damagePct:Math\.min\(40,p\.pactDebt\*5\)\}/);
  assert.match(game, /p\.pactDebt=Math\.min\(8,\(Number\(p\.pactDebt\)\|\|0\)\+1\);c\.warlockBuff=\{turns:99,damagePct:Math\.min\(24,p\.pactDebt\*3\)\}/);
  assert.match(game, /p\.pactDebt>=4&&!c\.warlockTestamentHpPenaltyApplied/);
  assert.match(game, /p\.pactDebt>=8&&!c\.warlockTestamentMpPenaltyApplied/);
});

test('Final Covenant consumes debt, caps the debt bonus at 40%, and applies two-turn boss exhaustion', () => {
  assert.match(warlock, /هر 2 بدهی مصرف‌شده 8٪ قدرت نهایی می‌افزاید \(حداکثر \+40٪\)/);
  assert.match(game, /bonus=Math\.min\(40,Math\.floor\(debt\/2\)\*8\)/);
  assert.match(game, /c\.warlockCovenantExhaustionTurns=2;c\.warlockCovenantDebtLock=true/);
  assert.match(game, /exhaustion=Number\(c\.warlockCovenantExhaustionTurns\)>0\?20:0/);
});

test('True Name Shatter halves boss effects and limits boss positive-buff purge to once per battle', () => {
  assert.match(warlock, /روی باس‌ها شدت 50٪ است؛ حذف اثر مثبت باس فقط یک بار در هر نبرد مجاز است/);
  assert.match(game, /boss=\['boss','area_boss'\]\.includes\(target\.encounterKind\),scale=boss\?0\.5:1/);
  assert.match(game, /if\(!boss\|\|!c\.warlockBossPurgeUsed\)/);
});

test('Erasure pauses enemy debuff timers during the erased turn and removes only one boss buff', () => {
  assert.match(warlock, /در بازگشت، یک اثر مثبت غیرذاتی حذف می‌شود/);
  assert.match(game, /selectedEnemy\.warlockErasedThisTurn=true/);
  assert.match(fs.readFileSync(new URL('systems/classes/wizard-combat-runtime.js', root), 'utf8'), /if \(e\.warlockErasedThisTurn\) \{ delete e\.warlockErasedThisTurn; continue; \}/);
});

test('Base Signature reflection also applies to the basic combat attack path and fatal reflection is resolved before enemy action', () => {
  assert.match(game, /if\(isWarlock\(\)&&applied>0&&Number\(t\.warlockDebuff\?\.damageReflectPct\)>0\)/);
  assert.match(game, /if\(state\.character\.hp<=0\)\{handleCombatPlayerDefeat\(c,'بازتاب نام نخستین'\);return;\}/);
});

test('Base Court modes apply boss half-strength to silence, refund and confiscation on primary and secondary enemies', () => {
  assert.match(game, /courtBossScale=\['boss','area_boss'\]\.includes\(selectedEnemy\.encounterKind\)\?0\.5:1/);
  assert.match(game, /secondaryCourtScale=\['boss','area_boss'\]\.includes\(e\.encounterKind\)\?0\.5:1/);
  assert.match(game, /secondaryCourtMode===1&&dmg>0/);
  assert.match(game, /secondaryCourtMode===2/);
});

test('Base Erasure removes only one boss buff and base Final Covenant Void still clears all positive buffs', () => {
  assert.match(game, /const keys=Object\.keys\(target\.buffs\|\|\{\}\);if\(keys\.length\)delete target\.buffs\[keys\[0\]\];target\.warlockDebuff=\{turns:1,skillReductionPct:25/);
  assert.match(game, /else\{for\(const e of enemies\)\{e\.buffs=\{\};wizardRuntimeDamage\(e,160/);
});

test('Heir of Hunger respects 12% normal and 6% boss reservoir caps', () => {
  assert.match(warlockDoc, /حداکثر 12٪/);
  assert.match(warlockDoc, /علیه باس سقف مخزن 6٪ است/);
  assert.match(game, /maxPct:enemies\.some\(e=>\['boss','area_boss'\]\.includes\(e\.encounterKind\)\)\?6:Math\.min\(15,12\*rankMultiplier/);
});

test('Base Reversal of Sacrifice returns 35% only when the next skill lands', () => {
  assert.match(warlockDoc, /35٪ هزینه قربانی‌شده بازمی‌گردد/);
  assert.match(game, /refundPct:35\+Number\(tal\.sacrificeHpRefundPct\|\|0\),refundOnHit:true/);
});

test('Hostage Heart transfer cannot exceed the target current HP and boss transfer is halved for the base form', () => {
  assert.match(warlockDoc, /انتقال آسیب نمی‌تواند از HP باقی‌مانده هدف بیشتر شود؛ روی باس انتقال نصف است/);
  assert.match(game, /transferred=Math\.min\(Math\.max\(0,Number\(hostage\.hp\)\|\|0\),Math\.floor\(dmg\*\(transferPct\*bossTransferScale\+hostageBonus\)\/100\)\)/);
});

test('Court of the Nameless reflection uses damage that penetrated the player shield and does not cancel the incoming hit', () => {
  assert.match(game, /if\(c\.shield>0&&dmg>0\).*?if\(c\.warlockCourtMode===1&&dmg>0\)/);
  assert.doesNotMatch(game, /if\(c\.hp<=0\)\{c\.turn\+\+;return;\}/);
});

test('True Name boss buff purge consumes its one-per-battle limit only when a buff was actually removed', () => {
  assert.match(game, /if\(keys\.length\)\{delete target\.buffs\[keys\[0\]\];if\(boss\)c\.warlockBossPurgeUsed=true;\}/);
});

test('Base Testament threshold penalties are tracked once for the whole battle, not reset by cancellation', () => {
  assert.match(game, /p\.pactDebt>=4&&!c\.warlockTestamentHpPenaltyApplied/);
  assert.match(game, /p\.pactDebt>=8&&!c\.warlockTestamentMpPenaltyApplied/);
  assert.doesNotMatch(game, /c\.warlockTestamentHpPenaltyApplied=false/);
  assert.doesNotMatch(game, /c\.warlockTestamentMpPenaltyApplied=false/);
});

test('Secondary Court confiscation occurs before the enemy special-skill check and grants boss-scaled credit', () => {
  assert.match(game, /secondaryCourtMode===2\)\{const stolen=Math\.min\(Number\(e\.mp\)\|\|0,Math\.ceil\(\(Number\(e\.maxMp\)\|\|0\)\*\.03\*secondaryCourtScale\)\)/);
  const secondaryStart=game.indexOf('secondaryCourtMode=Number(live.warlockCourtMode)');
  assert.ok(game.indexOf('secondaryCourtMode===2',secondaryStart) < game.indexOf('if(Array.isArray(e.skills)',secondaryStart));
});

test('Ascended Court grants fractional pact credit at the 60% boss intensity', () => {
  assert.match(game, /creditGain:scale/);
  assert.match(game, /Number\(courtAll\.creditGain\?\?1\)/);
});

test('Primary Hunger drains only available mana and stores only the percentage actually removed', () => {
  assert.match(game, /drained=Math\.min\(Math\.max\(0,Number\(c\.mp\)\|\|0\),Math\.ceil\(maxMp\*\.02\)\),gainedPct=maxMp>0\?drained\/maxMp\*100:0/);
  assert.match(game, /if\(activeEnemy\)activeEnemy\.mp=c\.mp/);
});
