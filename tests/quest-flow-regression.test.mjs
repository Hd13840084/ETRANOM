import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('../game.js', import.meta.url), 'utf8');

test('personal quest actions no longer use the fragile confirmation relay', () => {
  const gate = source.match(/else if\(\[(.*?)\]\.includes\(a\)\)\{pendingConfirmation=/s)?.[1] ?? '';
  for (const action of ['personal-quest','region1-npc-quest','region1-main-quest','region-quest','lantern-quest','ore-ledger-quest','npc-request']) {
    assert.equal(gate.includes(`'${action}'`), false, `${action} should execute directly`);
  }
});

test('second personal quest is available at level one and later quests unlock gradually', () => {
  assert.match(source, /level:1\+Math\.floor\(index\/3\)/);
});

test('personal quest delivery aggregates and consumes split inventory stacks', () => {
  assert.match(source, /function inventoryQuantity\(id\).*?reduce\(\(sum,x\)=>sum\+Math\.max\(0,Number\(x\.qty\)\|\|0\),0\)/s);
  assert.match(source, /function consumeInventoryQuantity\(id,qty\).*?return remaining===0/s);
  assert.match(source, /const q=book\.active,have=\(state\.inventory\|\|\[\]\)\.filter\(x=>x\.id===q\.itemId\)/);
});

test('four-village quest stage destinations match visible NPCs', () => {
  for (const id of ["elder_sena", "guard_mira", "smith_bram", "priest_amon"]) assert.ok(source.includes(`npc.id!=='${id}'`));
});

test('lantern quest follow-up routes to the visible Sena and Liora NPCs', () => {
  assert.ok(source.includes("if(npc.id!=='elder_sena')"));
  assert.ok(source.includes("if(npc.id!=='alchemist_liora')"));
});

test('ore-ledger quest uses available Toren and Bram NPCs', () => {
  assert.ok(source.includes("if(npc.id!=='guildmaster_toren')"));
  assert.ok(source.includes("if(npc.id!=='smith_bram')"));
  assert.ok(source.includes("else if(q.stage===3&&npc.id==='guildmaster_toren')"));
});
