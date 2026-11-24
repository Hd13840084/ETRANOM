import { ARCANE_MAGE } from '../systems/classes/arcane-mage.js';
import { ELEMENTALIST } from '../systems/classes/elementalist.js';
import { WARLOCK } from '../systems/classes/warlock.js';
import { NECROMANCER } from '../systems/classes/necromancer.js';
import SWORD from '../content/classes/warrior_sword_ascetic_v1.json' with { type: 'json' };
import IRON from '../content/classes/warrior_iron_bastion_v1.json' with { type: 'json' };
import CHAOS from '../content/classes/warrior_chaos_v1.json' with { type: 'json' };
import APOCALYPSE from '../content/classes/warrior_apocalypse_harbinger_v1.json' with { type: 'json' };
import { auditSpecializationContent, normalizeSpecializationContentRecord } from '../systems/combat/specialization-contract-runtime.js';

const specs = [ARCANE_MAGE, ELEMENTALIST, WARLOCK, NECROMANCER, SWORD, IRON, CHAOS, APOCALYPSE];
const expectedDomainUnlocks = [25, 40, 50, 50];
const results = specs.map(spec => {
  const audit = auditSpecializationContent(spec, spec.id);
  const normalized = normalizeSpecializationContentRecord(spec);
  const errors = [...audit.errors];
  if (JSON.stringify(normalized.domain.stages.map(stage => stage.unlockLevel)) !== JSON.stringify(expectedDomainUnlocks)) errors.push('domain_unlock_levels_mismatch');
  const skillIds = new Set(normalized.skills.map(skill => skill.id));
  if (normalized.ascensions.some(ascension => !skillIds.has(ascension.baseSkillId))) errors.push('ascension_base_skill_reference_invalid');
  if (normalized.skills.some(skill => skill.upgrades.some((upgrade, index) => upgrade.rank !== index + 2))) errors.push('skill_upgrade_rank_sequence_invalid');
  return {
    id: spec.id,
    ok: errors.length === 0,
    errors,
    skills: normalized.skills.length,
    upgradeSteps: normalized.skills.reduce((sum, skill) => sum + skill.upgrades.length, 0),
    talents: normalized.talentBranches.reduce((sum, branch) => sum + branch.talents.length, 0),
    talentBranches: normalized.talentBranches.length,
    domainUnlockLevels: normalized.domain.stages.map(stage => stage.unlockLevel),
    ascensions: normalized.ascensions.length,
    ascensionsWithBaseSkill: normalized.ascensions.filter(ascension => skillIds.has(ascension.baseSkillId)).length,
    primaryResource: normalized.skills[0]?.resourceType,
    resourceCostModes: [...new Set(normalized.skills.map(skill => skill.resourceCostMode))]
  };
});
const report = {
  version: 'V1901',
  generatedAt: new Date().toISOString(),
  specializationCount: results.length,
  totals: {
    skills: results.reduce((sum, row) => sum + row.skills, 0),
    upgradeSteps: results.reduce((sum, row) => sum + row.upgradeSteps, 0),
    talents: results.reduce((sum, row) => sum + row.talents, 0),
    domainStages: results.reduce((sum, row) => sum + row.domainUnlockLevels.length, 0),
    ascensions: results.reduce((sum, row) => sum + row.ascensions, 0)
  },
  ok: results.every(row => row.ok),
  specializations: results
};
console.log(JSON.stringify(report, null, 2));
if (!report.ok) process.exitCode = 1;
