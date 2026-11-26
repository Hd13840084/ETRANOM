import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderIsometricInteriorV2036 } from '../../systems/safe-zone/interior-renderer-v2036.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

test('V2108 places twelve independent interior micro-sprites on the room perimeter', () => {
  const html = renderIsometricInteriorV2036({buildingId:'smith', title:'آهنگری', residents:[], player:{x:5,y:7}});
  assert.equal((html.match(/data-room-detail-v="2108"/g) || []).length, 12);
  assert.match(html, /data-grid-x="10"/);
  assert.match(html, /data-grid-y="8"/);
  assert.ok(html.indexOf('data-grid-y="0"') < html.indexOf('data-grid-y="8"'));
});

test('V2108 keeps workers visible and leaves their service logic untouched', () => {
  const html = renderIsometricInteriorV2036({buildingId:'smith', title:'آهنگری', residents:[{id:'smith-npc',name:'آهنگر'}]});
  assert.match(html, /data-interior-npc-marker="smith-npc"/);
  assert.match(html, /npc-authored-sprite/);
  assert.match(html, /کوبیدن آهن روی سندان/);
});

test('all referenced interior micro-sprite SVGs exist', () => {
  assert.ok(fs.existsSync(path.join(root,'systems/safe-zone/interior-renderer-v2036.js')));
  for (const kind of ['forge','arcane','harvest','mine','civic','wood']) {
    for (let i=1;i<=6;i++) {
      const files = fs.readdirSync(path.join(root,'assets/safe-zone/interiors-v2101/props'));
      assert.ok(files.some(f=>f.startsWith(`${kind}_${String(i).padStart(2,'0')}_`) && f.endsWith('.svg')), `${kind} ${i}`);
    }
  }
});
