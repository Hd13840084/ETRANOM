import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
const root = path.resolve(new URL('../..', import.meta.url).pathname);
const game = fs.readFileSync(path.join(root, 'game.js'), 'utf8');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
test('هر دو دانجن چهار موج و باس مستقل دارند', () => {
  assert.match(game, /id:"dungeon_thorn"[^\n]*waves:4/);
  assert.match(game, /id:"dungeon_south"[^\n]*waves:4/);
  assert.match(game, /boss:"فرمانروای ریشه‌های تباه"/);
  assert.match(game, /boss:"شاه‌دندانِ شن‌خفته"/);
  assert.match(game, /bossLevel:3/);
  assert.match(game, /bossLevel:5/);
});
test('دانجن دوم فقط از هیولاهای محدوده‌های ۴ تا ۶ انتخاب می‌کند و سطح‌های ۳ تا ۵ دارد', () => {
  assert.match(game, /poolRegions:\["vardash_river","southern_plains","rootbound_ruins"\]/);
  assert.match(game, /levelWeights:\[\{level:3,weight:100\},\{level:4,weight:65\},\{level:5,weight:35\}\]/);
  assert.match(game, /if\(Math\.random\(\)<\.60\)selected\.push\(choose\(\)\)/);
  assert.match(game, /encounterOverrides/);
});
test('درصد گنجینه، تله و نوع تله دانجن دوم مطابق قوانین است', () => {
  assert.match(game, /treasureChances:\[0,\.10,\.20,\.30,\.45\]/);
  assert.match(game, /trapChances:\[0,\.20,\.30,\.45,0\]/);
  assert.match(game, /trapWeights:\[\[\.40,\.40,\.20\],\[\.25,\.45,\.30\],\[\.30,\.30,\.40\]\]/);
  assert.match(game, /eventRoll>=treasureChance\+trapChance/);
  assert.match(game, /grantDungeonTreasure\(wave,reportMaterials,dungeonId\)/);
});
test('گنجینه مواد ۴ تا ۶ واحد از مخزن همان دانجن می‌دهد', () => {
  assert.match(game, /dungeonMonsterPool\(dungeonId\)\.flatMap/);
  assert.match(game, /qty=4\+Math\.floor\(Math\.random\(\)\*3\)/);
  assert.match(game, /zoneIds\.includes\(r\.regionId\)/);
});
test('مرگ و فرار در هر دو دانجن snapshot را بازمی‌گردانند و جریمه مرگ اجرا می‌شود', () => {
  assert.match(game, /function resetDungeonRun/);
  assert.match(game, /function handleDungeonDeath/);
  assert.match(game, /const penalty=applyDeathPenalty\(\)/);
  assert.match(game, /if\(state\.dungeonRun\)\{const run=state\.dungeonRun,d=DUNGEON_DEFS\.find/);
});
test('هر دو دانجن در دفتر دانجن‌ها قابل مشاهده‌اند و پرتره باس دوم وجود دارد', () => {
  assert.match(game, /DUNGEON_DEFS\.map/);
  assert.ok(fs.existsSync(path.join(root, 'assets/monsters/dungeon_thorn_lord.webp')));
  assert.ok(fs.existsSync(path.join(root, 'assets/monsters/dungeon_south_sovereign.webp')));
  assert.match(game, /dungeon_boss_dungeon_south":"assets\/monsters\/dungeon_south_sovereign\.webp"/);
  assert.match(html, /game\.js\?v=38/);
});
