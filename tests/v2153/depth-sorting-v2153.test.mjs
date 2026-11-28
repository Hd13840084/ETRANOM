import test from 'node:test';
import assert from 'node:assert/strict';
import { sortIsometricDepthV2153, splitAtActorDepthV2153, auditDepthSortingV2153 } from '../../systems/world/depth-sorting-v2153.js';

test('sorts by ground anchor x+y with stable ties', () => {
  const items = [{ id: 'b', x: 4, y: 4 }, { id: 'a', x: 1, y: 1 }, { id: 'c', x: 4, y: 4 }];
  assert.deepEqual(sortIsometricDepthV2153(items).map(x => x.id), ['a', 'b', 'c']);
});
test('splits actor depth into rear and foreground sets', () => {
  const items = [{ id: 'rear', x: 1, y: 1 }, { id: 'front', x: 9, y: 9 }];
  const split = splitAtActorDepthV2153(items, { x: 5, y: 5 });
  assert.deepEqual(split.far.map(x => x.id), ['rear']);
  assert.deepEqual(split.near.map(x => x.id), ['front']);
});
test('runtime audit passes', () => assert.equal(auditDepthSortingV2153().ok, true));
