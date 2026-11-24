import test from 'node:test';
import assert from 'node:assert/strict';
import { ARCANE_MAGE } from '../../systems/classes/arcane-mage.js';
import { ELEMENTALIST } from '../../systems/classes/elementalist.js';
import { WARLOCK } from '../../systems/classes/warlock.js';
import { NECROMANCER } from '../../systems/classes/necromancer.js';
import { resolveWizardAuthoredDomainFormV1927, resolveWizardSpecializationSkill } from '../../systems/combat/specialization-skill-bridge.js';
import { CombatAdapter } from '../../systems/combat/combat-adapters.js';

const specs = [ARCANE_MAGE, ELEMENTALIST, WARLOCK, NECROMANCER];
const baseId = form => form.skillId || form.baseSkillId;

test('outside Domain the authoritative resolver keeps the normal skill definition', () => {
  for (const spec of specs) {
    const base = spec.skills[0];
    const current = { ...base, rank: 3, talentMarker: true };
    const result = resolveWizardAuthoredDomainFormV1927(spec, base, current, { domainActive: false, ascendedSkillId: spec.ascendedSkills[0].id });
    assert.equal(result.id, base.id);
    assert.equal(result.isDomainForm, undefined);
    assert.equal(result.talentMarker, true);
  }
});

test('each selected ascended record becomes the second form of exactly its mapped base skill', () => {
  for (const spec of specs) {
    for (const form of spec.ascendedSkills) {
      const base = spec.skills.find(skill => skill.id === baseId(form));
      const current = { ...base, rank: 4, talentMarker: true };
      const result = resolveWizardAuthoredDomainFormV1927(spec, base, current, { domainActive: true, ascendedSkillId: form.id, ascendedSkillUsedThisDomain: true });
      assert.equal(result.id, base.id);
      assert.equal(result.domainFormId, form.id);
      assert.equal(result.isDomainForm, true);
      assert.equal(result.type, current.type);
      assert.equal(result.talentMarker, true);
      for (const [key, value] of Object.entries(form)) {
        if (!['id', 'skillId', 'baseSkillId', 'type'].includes(key)) assert.deepEqual(result[key], value);
      }
    }
  }
});

test('the other nine skills remain normal and invalid selected forms fail closed', () => {
  for (const spec of specs) {
    const form = spec.ascendedSkills[0];
    const selectedBase = baseId(form);
    const other = spec.skills.find(skill => skill.id !== selectedBase);
    const result = resolveWizardAuthoredDomainFormV1927(spec, other, other, { domainActive: true, ascendedSkillId: form.id });
    assert.equal(result.isDomainForm, undefined);
    assert.throws(() => resolveWizardAuthoredDomainFormV1927(spec, other, other, { domainActive: true, ascendedSkillId: 'not-a-real-form' }), /selection_invalid/);
  }
});

test('legacy Wizard resolver consumes selected Arcane Mage domain form from canonical persistence key', () => {
  const form = ARCANE_MAGE.ascendedSkills.find(item => item.skillId === 'arcane_bolt');
  const actor = {
    id: 'test-arcane', level: 30, hp: 1000, maxHp: 1000, mp: 1000, maxMp: 1000,
    attack: 100, magicPower: 100, defense: 20, classProgress: { arcaneMage: {
      domainActive: true, ascendedSkillId: form.id, ascendedSkillUsedThisDomain: true,
      skillRanks: { arcane_bolt: 1 }, skillCooldowns: {}, buffs: {}, statuses: {}, charges: 5
    } }
  };
  const result = resolveWizardSpecializationSkill('wizard_arcane_mage', 'arcane_bolt', {
    mode: 'solo', actor, targets: [{ id: 'target', hp: 5000, maxHp: 5000, defense: 0 }], targetId: 'target'
  });
  assert.equal(result.skillId, 'arcane_bolt');
  assert.ok(Array.isArray(result.log));
});

test('authoritative legacy resolver receives the selected second form in all four Wizard specializations', () => {
  const aliases = {
    wizard_arcane_mage: 'arcaneMage', wizard_elementalist: 'elementalist',
    wizard_warlock: 'warlock', wizard_necromancer: 'necromancer'
  };
  for (const spec of specs) {
    const base = spec.skills[0];
    const form = spec.ascendedSkills.find(item => baseId(item) === base.id);
    const actor = {
      id: `player-${spec.id}`, level: 30, hp: 1000, maxHp: 1000, mp: 1000, maxMp: 1000,
      attack: 100, magicPower: 100, defense: 30,
      classProgress: { [aliases[spec.id]]: {
        domainActive: true, ascendedSkillId: form.id, ascendedSkillUsedThisDomain: true,
        skillRanks: { [base.id]: 1 }, skillCooldowns: {}, buffs: {}, statuses: {}, charges: 5, storedSouls: 5
      } }
    };
    const result = resolveWizardSpecializationSkill(spec.id, base.id, {
      mode: 'solo', actor,
      targets: [{ id: 'target', hp: 10000, maxHp: 10000, defense: 0 }], targetId: 'target'
    });
    assert.equal(result.skillId, base.id, `${spec.id} must preserve base skill identity`);
    assert.ok(result.log.length > 0, `${spec.id} must resolve through the existing gameplay resolver`);
    assert.ok(result.targets[0].hp < 10000, `${spec.id} must execute an effect`);
  }
});

test('Solo, Party and PvP JavaScript adapters all pass the selected form to the legacy resolver', () => {
  const aliases = {
    wizard_arcane_mage: 'arcaneMage', wizard_elementalist: 'elementalist',
    wizard_warlock: 'warlock', wizard_necromancer: 'necromancer'
  };
  for (const mode of ['solo', 'party', 'pvp']) {
    for (const spec of specs) {
      const base = spec.skills[0];
      const form = spec.ascendedSkills.find(item => baseId(item) === base.id);
      const actor = {
        id: `adapter-${mode}-${spec.id}`, level: 30, hp: 1000, maxHp: 1000, mp: 1000, maxMp: 1000,
        attack: 100, magicPower: 100, defense: 30,
        classProgress: { [aliases[spec.id]]: {
          domainActive: true, ascendedSkillId: form.id, ascendedSkillUsedThisDomain: true,
          skillRanks: { [base.id]: 1 }, skillCooldowns: {}, buffs: {}, statuses: {}, charges: 5, storedSouls: 5
        } }
      };
      const result = CombatAdapter[mode].specializationSkill({}, spec.id, base.id, {
        actor, targets: [{ id: 'target', hp: 10000, maxHp: 10000, defense: 0 }], targetId: 'target'
      });
      assert.equal(result.skillId, base.id, `${mode}/${spec.id} base skill identity`);
      assert.ok(result.targets[0].hp < 10000, `${mode}/${spec.id} should execute`);
    }
  }
});
