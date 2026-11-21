import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveDamage, COMBAT_PROFILES, normalizeCombatIntent, COMBAT_MODE } from '../systems/combat/combat-core.js';

test('all three modes share the same resolver contract',()=>{
  for (const mode of Object.values(COMBAT_MODE)) {
    const result=resolveDamage({attack:100,hp:100,maxHp:100,accuracy:100},{defense:20,hp:100,maxHp:100},{...COMBAT_PROFILES[mode],hitChance:100,critChance:0},{hit:0,crit:99,variance:0});
    assert.equal(result.hit,true); assert.ok(result.damage>0);
    assert.equal(normalizeCombatIntent(mode,{action:'attack'}).mode,mode);
  }
});
test('shared resolver rejects dead combatants and clamps invalid stats',()=>{
  assert.equal(resolveDamage({attack:50,hp:0,maxHp:100},{defense:0,hp:10,maxHp:10}).damage,0);
  assert.equal(resolveDamage({attack:50,hp:10,maxHp:10},{defense:0,hp:0,maxHp:10}).damage,0);
});
test('guard mitigation and critical hits are resolved centrally',()=>{
  const normal=resolveDamage({attack:100,hp:10,maxHp:10},{defense:0,hp:10,maxHp:10},{minDamage:1,critChance:0},{hit:0,crit:99,variance:0});
  const guarded=resolveDamage({attack:100,hp:10,maxHp:10},{defense:0,hp:10,maxHp:10},{minDamage:1,guardMultiplier:.5,critChance:0},{hit:0,crit:99,variance:0});
  const critical=resolveDamage({attack:100,hp:10,maxHp:10},{defense:0,hp:10,maxHp:10},{minDamage:1,critChance:100,critMultiplier:1.5},{hit:0,crit:0,variance:0});
  assert.ok(guarded.damage<normal.damage); assert.ok(critical.damage>normal.damage);
});

test('adapters expose one damage implementation for every mode', async()=>{
  const { getCombatAdapter } = await import('../systems/combat/combat-adapters.js');
  const args=[{attack:80,hp:50,maxHp:50},{defense:12,hp:50,maxHp:50},{hitChance:100,critChance:0},{hit:0,crit:99,variance:0}];
  for (const mode of Object.values(COMBAT_MODE)) {
    const result=getCombatAdapter(mode).damage(...args);
    assert.equal(result.hit,true);
    assert.ok(result.damage>=1);
  }
});

test('v170 SQL routes party and PvP server damage through the shared resolver', async()=>{
  const fs=await import('node:fs');
  const sql=fs.readFileSync(new URL('../database/combat_engine_unification_v170.sql',import.meta.url),'utf8');
  const party=sql.slice(sql.indexOf('create or replace function public.etranom_party_battle_act'),sql.indexOf('create or replace function public.etranom_pvp_action'));
  const pvp=sql.slice(sql.indexOf('create or replace function public.etranom_pvp_action'));
  assert.ok((party.match(/etranom_combat_resolve_damage\(/g)||[]).length>=3);
  assert.ok(pvp.includes('etranom_combat_resolve_damage('));
  assert.match(pvp,/security definer/);
  assert.match(party,/security definer/);
});

test('solo base attack and basic skill call the shared resolver with safe fallback', async()=>{
  const fs=await import('node:fs');
  const game=fs.readFileSync(new URL('../game.js',import.meta.url),'utf8');
  assert.ok(game.includes('const sharedCore=window.ETRANOM_COMBAT_CORE'));
  assert.ok(game.includes('sharedCore.resolveDamage'));
  assert.ok(game.includes('damageCombatTarget(d,"ضربه عادی")'));
});
