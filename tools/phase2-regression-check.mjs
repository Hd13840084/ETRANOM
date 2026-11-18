import fs from 'node:fs';
const game = fs.readFileSync(new URL('../game.js', import.meta.url), 'utf8');
const classBlock = game.match(/const CLASS_DATA = \{([\s\S]*?)\n  \};/);
if (!classBlock) { console.error('CLASS_DATA registry missing.'); process.exit(1); }
const classEntries = [...classBlock[1].matchAll(/^    "([^"]+)":\{specs:\[([^\]]*)\]/gm)];
if (classEntries.length !== 10 || classEntries.some(([, , specs]) => (specs.match(/"[^"]+"/g) || []).length !== 4)) {
  console.error('Expected 10 classes with exactly 4 specializations each.'); process.exit(1);
}
const mustBeAbsent = [
  'WARRIOR_SKILLS','WARRIOR_TALENTS','WARRIOR_UNLOCK_LEVELS','skillRankFor',
  'talentTotals','warriorSkillCostLabel','warriorSkillCooldown',
  'warriorSkillDetail','upgradeWarriorSkill','upgradeWarriorTalent','useWarriorSkill',
  'data-fight-skill','data-skill-upgrade','data-talent-upgrade','data-toggle-combat-skills'
];
const failures = mustBeAbsent.filter(token => game.includes(token));
for (const pattern of [/function\s+talentRank\s*\(/, /function\s+skillRankFor\s*\(/, /state\.(?:skillRanks|talentRanks|skillCooldowns|knownRecipes)\s*=/]) { if (pattern.test(game)) failures.push(String(pattern)); }
if (failures.length) {
  console.error('Legacy skill references remain:', failures.join(', '));
  process.exit(1);
}
for (const token of ['const FIRST_REGION_ENCOUNTERS=[];','{id:\'burnt_forest\'','{id:\'thorn_grove\'','{id:\'ash_hills\'','{id:\'vardash_river\'','{id:\'southern_plain\'','{id:\'rootbound_ruins\'']) {
  if (!game.includes(token)) { console.error('Expected retained map/empty encounter registry missing:', token); process.exit(1); }
}
if (!game.includes('for(const key of ["skillRanks","talentRanks","skillCooldowns","knownRecipes","firstRegionKills","regionEncounterZone"])')) {
  console.error('Targeted save migration for obsolete content metadata missing.'); process.exit(1);
}
if (!game.includes('state.quest={accepted:false,completed:false}')) {
  console.error('Legacy region quest reset/compatibility migration missing.'); process.exit(1);
}
if (!game.includes('مهارت‌های تخصصی در مرحله بازسازی محتوا')) {
  console.error('Combat placeholder for redesigned skills missing.'); process.exit(1);
}
console.log('Phase 2 regression checks passed.');
