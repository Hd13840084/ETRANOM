-- ETRANOM v181 Wizard catalog cleanup — final part.
begin;
update public.party_battle_skill_catalog set enabled=false
where specialization_key in ('wizard_arcane_mage','wizard_elementalist','wizard_warlock','wizard_necromancer')
  and skill_id not in ('ancient_rune','arcane_blink','arcane_bolt','arcane_echo','arcane_explosion','arcane_overload','arcane_shield','arcane_singularity','assembly_of_souls','bone_blossom','chain_lightning','court_of_nameless','darkness_chains','death_claw','death_memory','demons_testament','earth_rupture','elemental_fusion','ember_bolt','erasure_from_reality','eternal_sovereign','final_covenant','forbidden_signature','frozen_armor','gravity_well','heir_of_hunger','hostage_heart','kingdom_of_bones','legion','life_siphon','primordial_cataclysm','prismatic_lance','radiant_judgment','return_threshold','reversal_of_sacrifice','soul_domination','stolen_moment','tempest','tidal_renewal','true_name_shatter','wizard_basic_strike','wizard_class_finisher','wizard_class_guard');
commit;
