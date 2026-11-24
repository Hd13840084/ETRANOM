import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../..');
const dir = path.join(root, 'assets/necromancer/companions/mythic');
const targets = ['apep','tiamat','jormungandr','fenrir','rahu','ketu'];
test('V1993 replaces six Mythic portraits with distinct non-empty image assets', () => {
  const hashes = new Set();
  for (const id of targets) {
    const file = path.join(dir, `${id}.webp`);
    assert.ok(fs.existsSync(file), `${id} portrait exists`);
    const data = fs.readFileSync(file);
    assert.ok(data.length > 20000, `${id} portrait has image data`);
    assert.equal(data.subarray(0,4).toString(), 'RIFF');
    assert.equal(data.subarray(8,12).toString(), 'WEBP');
    hashes.add(data.toString('base64'));
  }
  assert.equal(hashes.size, targets.length, 'all six portrait files are distinct');
});
test('V1993 preserves the Mythic manifest portrait paths', () => {
  const manifest = JSON.parse(fs.readFileSync(path.join(dir,'manifest.json'),'utf8'));
  for (const id of targets) {
    const entry = manifest.find(x => x.id === id);
    assert.ok(entry, `${id} remains in manifest`);
    assert.equal(entry.portrait, `assets/necromancer/companions/mythic/${id}.webp`);
  }
});
