import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const game=fs.readFileSync(new URL('../../game.js',import.meta.url),'utf8');
test('character creator has a live preview and tracks name, class and specialization',()=>{
  assert.match(game,/id="creator-live-preview"/);
  assert.match(game,/id="creator-preview-name"/);
  assert.match(game,/creator-preview-class/);
  assert.match(game,/creator-preview-desc/);
  assert.match(game,/creator-preview-name/);
});
test('only existing Wizard specialization portraits are used in the live preview',()=>{
  for(const file of ['arcane_mage_portrait.webp','elementalist_portrait.webp','warlock_portrait.webp','necromancer_portrait.webp'])
    assert.ok(fs.existsSync(new URL('../../assets/classes/'+file,import.meta.url)),file);
  assert.match(game,/specPortraits\[specSelect\.value\]/);
  assert.match(game,/classPortraits\[name\]/);
});
test('character dossier shows resources, stats and preserves existing skill book rendering',()=>{
  assert.match(game,/character-hero-card/);
  assert.match(game,/character-meter/);
  assert.match(game,/character-profile-grid/);
  assert.match(game,/renderSkillBook\(\)/);
});
