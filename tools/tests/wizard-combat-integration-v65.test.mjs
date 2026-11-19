import assert from 'node:assert/strict';
for (const [file, expected] of [['elementalist','ELEMENTALIST'],['arcane-mage','ARCANE_MAGE'],['warlock','WARLOCK'],['necromancer','NECROMANCER']]) {
  const mod = await import(`../../systems/classes/${file}.js`);
  const data = mod[expected];
  assert.equal(data.skills.length, 10, `${file}: ten skills`);
  assert.equal(data.talentBranches.length, 4, `${file}: four talent branches`);
  assert.equal(data.ascendedSkills.length, 10, `${file}: ten ascended skills`);
}
const e = await import('../../systems/classes/elementalist.js');
let ep = e.createElementalistProgress();
assert.equal(e.activateElementalistDomain(ep,25).ok,true);
const w = await import('../../systems/classes/warlock.js');
let wp = w.createWarlockProgress();
assert.equal(w.activateWarlockDomain(wp,25).ok,true);
const n = await import('../../systems/classes/necromancer.js');
let np = n.createNecromancerProgress();
const recruit = n.recruitNecromancerLegion(np,{id:'test-undead',speciesId:'test-undead',name:'Test Undead'},0);
assert.equal(recruit.ok,true);
assert.equal(recruit.progress.legion.length,1);
assert.equal(n.activateNecromancerDomain(recruit.progress,25).ok,true);
console.log('wizard combat integration v65 smoke tests passed');
