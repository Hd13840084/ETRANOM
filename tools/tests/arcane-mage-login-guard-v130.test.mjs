import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
const root = new URL('../../', import.meta.url);
const index = readFileSync(new URL('index.html', root), 'utf8');
test('Arcane Mage uses a fresh versioned asset and cannot block login', () => {
  assert.ok(existsSync(new URL('systems/classes/arcane-mage-v130.js', root)));
  assert.match(index, /try\s*\{\s*const arcaneModule = await import\('\.\/systems\/classes\/arcane-mage-v130\.js(?:\?v=\d+)?'\)/);
  assert.match(index, /Arcane Mage specialization failed to load; continuing with safe fallback/);
});
