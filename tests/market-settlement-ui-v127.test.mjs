import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const game=fs.readFileSync(new URL('../game.js',import.meta.url),'utf8');
const sql=fs.readFileSync(new URL('../database/marketplace_settlement_and_wallet_sync_v127.sql',import.meta.url),'utf8');
test('potion recipes are restored into inventory during save migration/load',()=>{
  assert.match(game,/normalizeInventoryState\(\);ensurePotionProgress\(\);normalizeInventoryState\(\)/);
  assert.match(game,/itemType:'potion_recipe'/);
});
test('health, mana and stamina bars render explicit visible fills',()=>{
  assert.match(game,/colors=\{hp:'linear-gradient/);
  assert.match(game,/width:'\+pct\+'%!important;min-width:/);
  assert.match(game,/background:'\+colors\[cls\]\+'!important/);
});
test('seller is credited atomically and listing becomes sold, not returned',()=>{
  assert.match(sql,/v_seller_gold \+ v_total/);
  assert.match(sql,/seller_credited/);
  assert.match(sql,/status = 'sold'/);
  assert.match(sql,/transaction_type\)\s*values[\s\S]*'sale'/);
});
test('client periodically refreshes authoritative seller wallet and inventory',()=>{
  assert.match(game,/market wallet sync deferred/);
  assert.match(game,/},1500\);/);
});
test('header subtitle cannot collide with brand text or realm badge',()=>{
  assert.match(game,/\.game-brand:after\{content:none!important;display:none!important\}/);
});
