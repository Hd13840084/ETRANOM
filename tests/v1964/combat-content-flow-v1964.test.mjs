import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { getDungeonFlowPlanV1964, getTowerFloorPlanV1964, validateCombatContentProgressionV1964, DUNGEON_NORMAL_WAVES_V1964, DUNGEON_BOSS_WAVE_V1964, TOWER_FLOOR_COUNT_V1964 } from '../../systems/combat/combat-content-flow-v1964.js';
const root = new URL('../../content/packs/region_one_master_v2/', import.meta.url);
const dungeons = JSON.parse(readFileSync(new URL('dungeons/dungeons.json', root), 'utf8'));
const tower = JSON.parse(readFileSync(new URL('tower/tower.json', root), 'utf8'));

test('all authored dungeons preserve five normal waves followed by the sixth boss encounter', () => {
  assert.equal(DUNGEON_NORMAL_WAVES_V1964, 5);
  assert.equal(DUNGEON_BOSS_WAVE_V1964, 6);
  for (const d of dungeons) {
    const first = getDungeonFlowPlanV1964(d, { wave: 1, stage: 'wave' });
    const fifth = getDungeonFlowPlanV1964(d, { wave: 5, stage: 'wave' });
    const boss = getDungeonFlowPlanV1964(d, { wave: 5, stage: 'boss' });
    assert.equal(first.wave, 1); assert.equal(first.stage, 'wave');
    assert.equal(fifth.wave, 5); assert.equal(fifth.stage, 'wave');
    assert.equal(boss.wave, 6); assert.equal(boss.stage, 'boss');
    assert.equal(boss.bossEncounterId, d.boss.id);
    assert.deepEqual(first.enemyPoolRegionIds, d.pool_region_ids);
  }
});

test('tower retains all twenty authored floors, enemy IDs, reward values and boss recipe odds', () => {
  assert.equal(tower.floor_count, TOWER_FLOOR_COUNT_V1964);
  for (let floor = 1; floor <= 20; floor++) {
    const actual = tower.floors.find(x => x.floor === floor);
    const plan = getTowerFloorPlanV1964(tower, floor);
    assert.deepEqual(plan.encounterIds, actual.encounter_ids);
    assert.equal(plan.level, actual.level);
    assert.equal(plan.type, actual.type);
    assert.deepEqual(plan.reward, actual.reward);
    assert.equal(plan.bossRecipeDropChancePercent, actual.boss_recipe_drop_chance_percent);
  }
});

test('tower encounter pattern remains 3 normals, 1 miniboss, 2 minibosses, boss in each 4-floor block', () => {
  for (let block = 0; block < 5; block++) {
    const types = [1,2,3,4].map(n => getTowerFloorPlanV1964(tower, block * 4 + n).type);
    assert.deepEqual(types, ['normal','miniboss','miniboss','boss']);
  }
});

test('progression validator accepts the current authored content and rejects altered dungeon/tower contracts', () => {
  assert.equal(validateCombatContentProgressionV1964({ dungeons, tower }).ok, true);
  assert.throws(() => getDungeonFlowPlanV1964({ ...dungeons[0], normal_waves: 4 }, { wave: 1 }), /unsupported_dungeon_progression_contract/);
  assert.throws(() => getTowerFloorPlanV1964({ ...tower, floor_count: 19 }, 1), /unsupported_tower_floor_count/);
  assert.throws(() => getTowerFloorPlanV1964(tower, 21), /tower_floor_out_of_range/);
});
