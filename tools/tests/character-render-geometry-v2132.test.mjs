import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { getGroundAnchoredSpriteRectV2132 } from '../../systems/characters/character-render-geometry-v2132.js';

const game = fs.readFileSync(new URL('../../game.js', import.meta.url), 'utf8');

test('idle breathing and running scale preserve the exact foot anchor', () => {
  const base = getGroundAnchoredSpriteRectV2132(-24, -48, 48, 64, 1, 1);
  for (const [sx, sy] of [[1.006, .996], [1.009, .993], [.994, 1.004], [1, 1]]) {
    const rect = getGroundAnchoredSpriteRectV2132(-24, -48, 48, 64, sx, sy);
    assert.equal(rect.anchorX, base.anchorX);
    assert.equal(rect.anchorY, base.anchorY);
  }
});

test('sprite geometry clamps extreme scales and rejects invalid values', () => {
  const rect = getGroundAnchoredSpriteRectV2132(0, 0, 10, 20, 99, -4);
  assert.equal(rect.width, 30);
  assert.equal(rect.height, 2);
  assert.throws(() => getGroundAnchoredSpriteRectV2132(NaN, 0, 10, 20), TypeError);
});

test('local, remote and atlas-fallback sprites use the same ground anchor geometry', () => {
  assert.match(game, /getGroundAnchoredSpriteRectV2132\(x, y, w, h/);
  assert.match(game, /playerFallbackRect = getGroundAnchoredSpriteRectV2132/);
  assert.match(game, /remoteFallbackRect = getGroundAnchoredSpriteRectV2132/);
  assert.match(game, /2135-atlas-keyframe-completion/);
});

import { auditCharacterAtlasFootAnchorsV2132, getCharacterAtlasFootOffsetV2132 } from '../../systems/characters/character-atlas-foot-anchors-v2132.js';

test('authored atlas frame foot offsets are normalized for all 40 specializations', () => {
  const audit = auditCharacterAtlasFootAnchorsV2132();
  assert.equal(audit.correctedStrips, 1280);
  assert.ok(audit.correctedFrames > 0);
  assert.ok(audit.maxOffsetSourcePixels <= 12);
  assert.equal(audit.valid, true);
  assert.ok(getCharacterAtlasFootOffsetV2132('assassin_1', 'walk', 'south', 0) >= 0);
});

test('atlas rendering applies per-frame foot correction after ground-anchored scaling', () => {
  assert.match(game, /getCharacterAtlasFootOffsetV2132\(id, stateName, direction, command\.frameIndex\)/);
  assert.match(game, /const drawY = rect\.y \+ footOffset/);
});
