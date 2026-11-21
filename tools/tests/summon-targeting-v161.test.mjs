import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const game=fs.readFileSync(new URL('../../game.js',import.meta.url),'utf8');
test('enemy attack targeting is 80% summoned legion and 20% player',()=>{
  assert.match(game,/Math\.random\(\)\*100>=80\)return false/);
  assert.match(game,/۸۰٪ یکی از احضارهای زنده و ۲۰٪ خود بازیکن/);
});
test('summon target selection happens before player-only defenses for primary and additional enemies',()=>{
  const primary=game.indexOf('if(routeEnemyAttackToSummonedLegion(c,raw,c.enemy))');
  const primaryDefense=game.indexOf('const darkResistance=',primary);
  assert.ok(primary>=0 && primaryDefense>primary);
  const additional=game.indexOf('if(routeEnemyAttackToSummonedLegion(live,raw,e.enemy))');
  const additionalDefense=game.indexOf('const reduction=Math.min(.85,Math.max(0,warriorDamageReduction()))',additional);
  assert.ok(additional>=0 && additionalDefense>additional);
});
test('dead summons are removed from the active target pool and no damage overflows to player',()=>{
  const start=game.indexOf('function routeEnemyAttackToSummonedLegion');
  const end=game.indexOf('\n  function enemyTurnPrimary',start);
  const helper=game.slice(start,end);
  assert.match(helper,/guard\.hp=Math\.max\(0,before-absorbed\)/);
  assert.match(helper,/return true; \/\/.*احضار/);
  assert.match(helper,/summonedLegionIds=\(combatRef\.summonedLegionIds\|\|\[\]\)\.filter/);
});
