/** V1929 reference contract mirroring the SQL server resolver. */
export function resolveWizardDomainFormServerContractV1929({specializationKey,baseSkillId,progress={},baseSkill,forms=[]}={}) {
  if (!String(specializationKey||'').startsWith('wizard_')) return baseSkill;
  if (!baseSkill || baseSkill.id!==baseSkillId) throw new Error('wizard_base_skill_identity_mismatch');
  const domain=progress.domain||{};
  const active=progress.domainActive===true||domain.active===true;
  if (!active) return baseSkill;
  const selected=progress.ascendedSkillId||domain.ascensionId||domain.ascendedSkillId||null;
  if (!selected) return baseSkill;
  const form=forms.find(x=>x.id===selected);
  if (!form) throw new Error('wizard_domain_form_invalid_selection');
  if (!(progress.ascendedSkillUsedThisDomain===true||domain.ascensionUsed===true||domain.ascendedUsed===true)) throw new Error('wizard_domain_form_selection_not_committed');
  const mapped=form.skillId||form.baseSkillId;
  if (mapped!==baseSkillId) return baseSkill;
  return {...baseSkill,...form,id:baseSkill.id,type:baseSkill.type,domainFormId:form.id,domainFormBaseSkillId:mapped};
}
