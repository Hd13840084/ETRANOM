import test from 'node:test';
import assert from 'node:assert/strict';
import SWORD from '../content/classes/warrior_sword_ascetic_v1.json' with { type: 'json' };
import IRON from '../content/classes/warrior_iron_bastion_v1.json' with { type: 'json' };
import CHAOS from '../content/classes/warrior_chaos_v1.json' with { type: 'json' };
import APOCALYPSE from '../content/classes/warrior_apocalypse_harbinger_v1.json' with { type: 'json' };

const specs = [
  ['warrior_sword_ascetic', SWORD],
  ['warrior_iron_bastion', IRON],
  ['warrior_chaos', CHAOS],
  ['warrior_apocalypse_harbinger', APOCALYPSE]
];

test('V1941 all four Warrior specializations retain complete authored catalogs', () => {
  const allSkillIds = new Set();
  let skillCount = 0;
  let ascensionCount = 0;
  let talentCount = 0;
  for (const [specializationId, data] of specs) {
    assert.equal(data.skills.length, 10, `${specializationId}: expected 10 base skills`);
    assert.equal(data.ascendedSkills.length, 10, `${specializationId}: expected 10 ascended forms`);
    assert.equal(data.talentBranches.length, 4, `${specializationId}: expected 4 talent branches`);
    const baseIds = new Set(data.skills.map(skill => skill.id));
    assert.equal(baseIds.size, data.skills.length, `${specializationId}: duplicate base skill IDs`);
    for (const skill of data.skills) {
      assert.ok(skill.id && skill.name && skill.type, `${specializationId}: incomplete skill record`);
      assert.ok(Number.isFinite(Number(skill.unlockLevel)), `${specializationId}/${skill.id}: missing unlock level`);
      assert.ok(!allSkillIds.has(`${specializationId}/${skill.id}`), `${specializationId}/${skill.id}: duplicate global ID`);
      allSkillIds.add(`${specializationId}/${skill.id}`);
      skillCount++;
    }
    const ascIds = new Set();
    for (const asc of data.ascendedSkills) {
      assert.ok(asc.id && asc.name, `${specializationId}: incomplete ascension record`);
      assert.ok(baseIds.has(asc.skillId || asc.baseSkillId), `${specializationId}/${asc.id}: ascension has no base skill`);
      assert.ok(!ascIds.has(asc.id), `${specializationId}: duplicate ascension ID ${asc.id}`);
      ascIds.add(asc.id);
      ascensionCount++;
    }
    for (const branch of data.talentBranches) {
      assert.ok(Array.isArray(branch.talents), `${specializationId}: malformed talent branch`);
      talentCount += branch.talents.length;
    }
  }
  assert.equal(skillCount, 40);
  assert.equal(ascensionCount, 40);
  assert.equal(talentCount, 128);
});

test('V1941 critical Warrior damage regressions remain explicitly covered', async () => {
  const { resolveIronBastionSkill } = await import('../systems/combat/iron-bastion-runtime.js');
  const { resolveSwordAsceticSkill } = await import('../systems/combat/sword-ascetic-runtime.js');
  const actor = extra => ({ id: 'hero', level: 50, attack: 100, power: 100, hp: 1000, maxHp: 1000,
    stamina: 1000, maxStamina: 1000, ...extra });
  const target = { id: 'enemy', hp: 10000, maxHp: 10000, defense: 0 };
  const damage = result => result.log.filter(row => row.type === 'damage' && row.target === 'enemy')
    .reduce((sum, row) => sum + Number(row.amount || 0), 0);
  const iron = resolveIronBastionSkill('ironcleave', { actor: actor({ classProgress: { warrior_iron_bastion: { skillRanks: { ironcleave: 1 } } } }), targets: [{ ...target }], targetId: 'enemy' });
  const sword = resolveSwordAsceticSkill('black_crescent', { actor: actor({ classProgress: { warrior_sword_ascetic: { skillRanks: { black_crescent: 1 } } } }), targets: [{ ...target }], targetId: 'enemy' });
  assert.equal(damage(iron), 285);
  assert.equal(damage(sword), 280);
});
