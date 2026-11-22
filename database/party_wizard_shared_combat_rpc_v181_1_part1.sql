-- ETRANOM v181.1 party RPC installer — fragment 1/3. Run after the Wizard catalog parts.
begin;
create table if not exists public.etranom_v181_rpc_staging(part integer primary key,fragment text not null);
alter table public.etranom_v181_rpc_staging enable row level security;
revoke all on public.etranom_v181_rpc_staging from public,anon,authenticated;
insert into public.etranom_v181_rpc_staging(part,fragment) values (1,$v181part$create or replace function public.etranom_party_battle_act(p_session_id uuid,p_action text,p_target_index integer default null)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  uid uuid:=auth.uid(); v_party uuid; st public.party_battle_state%rowtype;
  profiles jsonb; hpmap jsonb; guards jsonb; monsters jsonb; kills jsonb; profile jsonb;
  monster jsonb; item jsonb; drop_item jsonb; inventory jsonb; next_inventory jsonb; v_save_data jsonb;
  idx integer; ord integer; hp integer; maxhp integer; mp integer; maxmp integer; attack_power integer; defense_power integer;
  damage integer:=0; newhp integer; done_count integer; alive_count integer; level_no integer;
  action_name text:=p_action; potion_effect text; potion_power integer; found_potion boolean:=false;
  material_drops jsonb:='[]'::jsonb; coins integer:=0; min_coins integer; max_coins integer; monster_level integer;
  q numeric; xp_gain integer:=20; v_recipe text; v_class text; m record; enemy_damage integer; target_uid uuid; target_hp integer; member_damage integer; v_ledger_rows integer:=0; v_recipe_rarity text; v_recipe_chance numeric; v_skill_id text; v_skill jsonb; v_skill_type text; v_spec_key text; v_spec_name text; v_mana_cost integer; v_cooldowns jsonb; v_action_label text:=p_action; v_skill_pct numeric; v_skill_value integer; v_perception numeric:=10; v_hit_chance numeric:=85; v_crit_chance numeric:=0; v_skill_power numeric:=0; v_raw_damage numeric:=0; v_heal_amount integer:=0; v_statuses jsonb; v_status_data jsonb; v_buff_data jsonb; v_summons jsonb; v_summon jsonb; v_attack_reduction numeric:=0; v_defense_reduction numeric:=0; v_dot_damage integer:=0; v_skill_damage integer:=0; v_absorb integer:=0; v_target_monster jsonb; v_recruit_progress jsonb; v_recruit_legion jsonb; v_recruit_member jsonb; v_recruit_chance numeric:=35; v_recruit_roll numeric:=0; v_member_id uuid; target_row record; kill_row record; status_row record; status_key text; v_is_aoe boolean:=false; v_is_damage boolean:=false; v_is_status boolean:=false;
begin
  if uid is null then raise exception 'auth_required'; end if;
  if left(action_name,6)='skill:' then v_skill_id:=substring(action_name from 7); action_name:='skill'; end if;
  if action_name not in ('attack','skill','guard','heal','potion','retreat') then raise exception 'battle_action_invalid'; end if;
  if v_skill_id is not null and (v_skill_id !~ '^[a-z0-9_]+$' or length(v_skill_id)>48) then raise exception 'party_skill_invalid'; end if;
  select s.party_id into v_party from public.party_sessions s join public.party_members pm on pm.party_id=s.party_id and pm.user_id=uid
    where s.id=p_session_id and s.status='active';
  if v_party is null then raise exception 'battle_not_available'; end if;
  select * into st from public.party_battle_state where session_id=p_session_id for update;
  if st.status<>'active' then raise exception 'battle_already_finished'; end if;
  perform public.etranom_party_battle_heartbeat(p_session_id);
  if exists(select 1 from public.party_battle_retreats r where r.session_id=p_session_id and r.user_id=uid) then
    raise exception 'party_player_already_retreated';
  end if;
  if action_name<>'retreat' and exists(select 1 from public.party_battle_actions a where a.session_id=p_session_id and a.round_no=st.round_no and a.user_id=uid) then
    raise exception 'already_acted_this_round';
  end if;
  profiles:=st.player_combat; hpmap:=st.player_hp; guards:=st.player_guard; monsters:=st.monsters; kills:=st.kills_by_user;
  profile:=profiles -> (uid::text);
  if profile is null then profile:=public.etranom_party_character_combat_profile(uid); profiles:=profiles||jsonb_build_object(uid::text,profile); end if;
  hp:=coalesce((hpmap->>uid::text)::integer,0); maxhp:=greatest(1,coalesce((profile->>'max_hp')::integer,100));
  mp:=greatest(0,coalesce((profile->>'mp')::integer,0)); maxmp:=greatest(1,coalesce((profile->>'max_mp')::integer,60));
  attack_power:=greatest(1,coalesce((profile->>'attack')::integer,10)); defense_power:=greatest(0,coalesce((profile->>'defense')::integer,0));
  level_no:=greatest(1,coalesce((profile->>'level')::integer,1));
  v_perception:=greatest(0,coalesce((profile->>'perception')::numeric,10));
  v_crit_chance:=greatest(0,least(55,coalesce((profile->>'crit_chance')::numeric,0)));
  v_skill_power:=greatest(1,coalesce((profile->>'wizard_power')::numeric,attack_power*5+coalesce((profile->'gear'->>'magicPower')::numeric,0)));
  select coalesce(sum((value->>'magicPowerPct')::numeric),0) into v_attack_reduction from jsonb_each(coalesce(profile->'party_skill_buffs','{}'::jsonb));
  v_skill_power:=greatest(1,v_skill_power*(1+greatest(-80,least(200,v_attack_reduction))/100));
  if hp<=0 then raise exception 'player_defeated'; end if;

  if action_name in ('attack','skill') then
    if v_skill_id is not null then
      select coalesce(gs.save_data->'character'->>'specializationId',gs.save_data->'character'->>'specialization_id',gs.save_data->'character'->>'specialization') into v_spec_name
        from public.game_saves gs where gs.user_id=uid;
      v_spec_key:=case v_spec_name
        when 'wizard_arcane_mage' then 'wizard_arcane_mage'
        when 'wizard_elementalist' then 'wizard_elementalist'
        when 'wizard_warlock' then 'wizard_warlock'
        when 'wizard_necromancer' then 'wizard_necromancer'
        when 'آرکین‌میج' then 'wizard_arcane_mage'
        when 'آرکین میج' then 'wizard_arcane_mage'
        when 'Arcane Mage' then 'wizard_arcane_mage'
        when 'المنتالیست' then 'wizard_elementalist'
        when 'Elementalist' then 'wizard_elementalist'
        when 'وارلاک' then 'wizard_warlock'
        when 'Warlock' then 'wizard_warlock'
        when 'نکرومنسر' then 'wizard_necromancer'
        when 'Necromancer' then 'wizard_necromancer' else null end;
      if v_spec_key is null then raise exception 'party_skill_specialization_unsupported'; end if;
      select skill_data into v_skill from public.party_battle_skill_catalog
        where specialization_key=v_spec_key and skill_id=v_skill_id and enabled;
      if v_skill is null then raise exception 'party_skill_not_available'; end if;
      if level_no < coalesce((v_skill->>'unlockLevel')::integer,1) then raise exception 'party_skill_locked'; end if;
      v_cooldowns:=coalesce(profile->'party_skill_cooldowns','{}'::jsonb);
      if coalesce((v_cooldowns->>v_skill_id)::integer,0)>0 and coalesce((v_cooldowns->>v_skill_id)::integer,0)>st.round_no then raise exception 'party_skill_cooldown'; end if;
      v_mana_cost:=greatest(0,case when coalesce(v_skill->>'manaPct',v_skill->>'manaCostPercent',v_skill->>'manaCostPct') is not null then ceil(maxmp*coalesce((v_skill->>'manaPct')::numeric,(v_skill->>'manaCostPercent')::numeric,(v_skill->>'manaCostPct')::numeric,0)/100)::integer else ceil(coalesce((v_skill->>'manaCost')::numeric,0))::integer end);
      if mp<v_mana_cost then raise exception 'insufficient_mana'; end if;
      mp:=mp-v_mana_cost;
      v_skill_type:=coalesce(v_skill->>'type','');
      v_skill_pct:=coalesce((v_skill->>'damagePct')::numeric,(v_skill->>'damagePercent')::numeric,case when v_skill_id='death_claw' then 220 when v_skill_id='life_siphon' then 160 when v_skill_id='arcane_echo' then coalesce((profile->>'last_party_damage_pct')::numeric,100) else 0 end);
      v_skill_value:=greatest(0,coalesce((v_skill->>'shieldPct')::integer,case when v_skill_type='shield' then (v_skill->>'damagePct')::integer else 0 end));
      v_is_damage:=v_skill_type in ('single_damage','damage','all_damage','all_damage_control','all_damage_debuff','all_control_damage','all_dot_control','multi_target_damage','ultimate_all_damage','dual_element_combo','single_damage_cleanse','single_damage_drain','life_steal','damage_heal','repeat_last_spell');
      v_is_aoe:=v_skill_type in ('all_damage','all_damage_control','all_damage_debuff','all_control_damage','all_dot_control','ultimate_all_damage','multi_target_damage') or v_skill_id='court_of_nameless' or (v_skill_id='soul_domination' and p_target_index is null) or (v_skill_type='dual_element_combo' and p_target_index is null);
      v_is_status:=v_skill_type in ('control','debuff','debuff_choice','control_choice','choice_control','true_name_debuff','選択_debuff',' 선택_debuff','all_damage_control','all_damage_debuff','all_control_damage','all_dot_control');
      if v_skill_type='shield' then
        profile:=jsonb_set(profile,'{party_shield_hp}',to_jsonb(greatest(coalesce((profile->>'party_shield_hp')::integer,0),floor(v_skill_power*v_skill_value/100)::integer)),true);
        profile:=jsonb_set(profile,'{party_shield_turns}',to_jsonb(greatest(1,coalesce((v_skill->>'durationTurns')::integer,2))),true);
        profile:=jsonb_set(profile,'{party_shield_reduction_pct}',to_jsonb(greatest(0,least(80,coalesce((v_skill->>'damageReductionPct')::integer,0)))),true);
      elsif v_skill_type in ('self_heal','self_heal_cleanse') then
        v_heal_amount:=greatest(1,floor(v_skill_power*coalesce((v_skill->>'healPct')::numeric,v_skill_pct,100)/100)::integer);
        hp:=least(maxhp,hp+v_heal_amount); hpmap:=hpmap||jsonb_build_object(uid::text,hp);
        if v_skill_type='self_heal_cleanse' then profile:=jsonb_set(profile,'{party_statuses}','{}'::jsonb,true); end if;
      elsif v_skill_type in ('group_heal','heal_all') then
        v_heal_amount:=greatest(1,floor(v_skill_power*coalesce((v_skill->>'healPct')::numeric,100)/100)::integer);
        for m in select pm.user_id from public.party_members pm where pm.party_id=v_party loop
          target_hp:=coalesce((hpmap->>m.user_id::text)::integer,0);
          if target_hp>0 then
            target_hp:=least(greatest(1,coalesce(((profiles->(m.user_id::text))->>'max_hp')::integer,100)),target_hp+v_heal_amount);
            hpmap:=hpmap||jsonb_build_object(m.user_id::text,target_hp);
          end if;
        end loop;
      elsif v_skill_type in ('self_buff','evasion_counter','stance','empower','legion_defense_buff','legion_offense_buff','soul_command','ultimate_choice','ultimate_form','self_revive') then
        v_buff_data:=coalesce(profile->'party_skill_buffs','{}'::jsonb);
        v_buff_data:=jsonb_set(v_buff_data,array[v_skill_id],jsonb_build_object('turns',greatest(1,coalesce((v_skill->>'durationTurns')::integer,2)),'attackPct',coalesce((v_skill->>'attackPct')::numeric,0),'defensePct',coalesce((v_skill->>'defensePct')::numeric,0),'magicPowerPct',coalesce((v_skill->>'magicPowerPct')::numeric,0),'damageReductionPct',coalesce((v_skill->>'damageReductionPct')::numeric,0),'sourceType',v_skill_type),true);
        profile:=jsonb_set(profile,'{party_skill_buffs}',v_buff_data,true);
        if v_skill_type='evasion_counter' then profile:=jsonb_set(profile,'{party_evasion_turns}',to_jsonb(greatest(1,coalesce((v_skill->>'evadeTurns')::integer,1))),true); end if;
        if v_skill_type='self_revive' then profile:=jsonb_set(profile,'{party_revive_armed}','true'::jsonb,true); profile:=jsonb_set(profile,'{party_revive_hp_pct}',to_jsonb(greatest(1,coalesce((v_skill->>'reviveHealthPct')::integer,25))),true); end if;
      elsif v_skill_type in ('summon','summon_resource') then
        v_summons:=coalesce(profile->'party_summons','[]'::jsonb);
        if jsonb_array_length(v_summons)>=3 then raise exception 'party_summon_capacity_reached'; end if;
        v_summon:=jsonb_build_object('id',v_skill_id||'_'||st.round_no,'sourceSkill',v_skill_id,'hp',greatest(1,floor(maxhp*coalesce((v_skill->>'summonHpPct')::numeric,35)/100)::integer),'attack',greatest(1,floor(attack_power*coalesce((v_skill->>'summonDamagePct')::numeric,50)/100)::integer),'turns',greatest(1,coalesce((v_skill->>'durationTurns')::integer,3)),'createdRound',st.round_no);
        v_summons:=v_summons||jsonb_build_array(v_summon); profile:=jsonb_set(profile,'{party_summons}',v_summons,true);
      elsif v_skill_type in ('permanent_recruit') then
        null; -- persistent corpse recruitment is validated and saved below
      elsif v_skill_type in ('control','debuff','debuff_choice','control_choice','choice_control','true_name_debuff','選択_debuff',' 선택_debuff','purge','link') then
        v_is_status:=true;
      elsif not v_is_damage then
        raise exception 'party_wizard_skill_type_not_supported';
      end if;
      v_cooldowns:=jsonb_set(v_cooldowns,array[v_skill_id],to_jsonb(st.round_no+greatest(0,coalesce((v_skill->>'cooldownTurns')::integer,0))),true);
      profile:=jsonb_set(profile,'{party_skill_cooldowns}',v_cooldowns,true);
    end if;
    idx:=null; monster:=null;
    if p_target_index is not null then
      select q.x,q.ord::integer into monster,idx from jsonb_array_elements(monsters) with ordinality q(x,ord)
       where q.ord=p_target_index and (coalesce((q.x->>'hp')::integer,0)>0 or (v_skill_type='permanent_recruit' and coalesce((q.x->>'hp')::integer,0)<=0));
    else
      if v_skill_type='permanent_recruit' then raise exception 'necromancer_recruit_requires_selected_corpse'; end if;
      for item,ord in select x,ord::integer from jsonb_array_elements(monsters) with ordinality q(x,ord) loop
        if coalesce((item->>'hp')::integer,0)>0 then idx:=ord; monster:=item; exit; end if;
      end loop;
    end if;
    if idx is null then
      if v_skill_type='permanent_recruit' then raise exception 'necromancer_recruit_requires_selected_corpse';
      else raise exception 'party_target_invalid_or_defeated'; end if;
    end if;
    if v_skill_id is not null and v_skill_type='permanent_recruit' then
      if coalesce((monster->>'hp')::integer,0)>0 or coalesce((monster->>'boss')::boolean,false) or coalesce(monster->>'encounterKind','') in ('boss','area_boss') or coalesce((monster->>'recruitable')::boolean,true)=false then raise exception 'necromancer_recruit_invalid_corpse'; end if;
      select gs.save_data into v_save_data from public.game_saves gs where gs.user_id=uid for update;
      if v_save_data is null then raise exception 'player_save_missing'; end if;
      v_recruit_progress:=coalesce(v_save_data#>'{classProgress,wizard_necromancer}','{}'::jsonb);
      v_recruit_legion:=coalesce(v_recruit_progress->'legion','[]'::jsonb);
      if jsonb_array_length(v_recruit_legion)>=10 then raise exception 'legion_full'; end if;
      v_recruit_chance:=least(75,35+greatest(0,coalesce((v_recruit_progress->'skillRanks'->>'legion')::integer,1)-1)*3+coalesce((v_recruit_progress->'talentEffects'->>'legionRecruitChancePct')::numeric,0));
      v_recruit_roll:=random()*100;
      monster:=jsonb_set(monster,'{recruitAttempted}','true'::jsonb,true); monsters:=jsonb_set(monsters,array[(idx-1)::text],monster,true);
      if v_recruit_roll<v_recruit_chance then
        v_member_id:=gen_random_uuid();
        v_recruit_member:=jsonb_build_object('id',v_member_id::text,'instanceId',v_member_id::text,'speciesId',coalesce(monster->>'id','undead')$v181part$) on conflict(part) do update set fragment=excluded.fragment;
commit;
