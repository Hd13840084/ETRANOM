-- ETRANOM v183 Party RPC fragment; run in listed order.
begin;
create table if not exists public.etranom_v183_rpc_staging(part integer primary key,fragment text not null);
alter table public.etranom_v183_rpc_staging enable row level security;
revoke all on public.etranom_v183_rpc_staging from public,anon,authenticated;
insert into public.etranom_v183_rpc_staging(part,fragment) values (6,$v183_6$onb_set(monsters,array[(target_row.ord-1)::text],target_row.x,true);
    end loop;
    -- Player-side buff durations expire at the same authoritative round boundary.
    for m in select pm.user_id from public.party_members pm where pm.party_id=v_party loop
      profile:=profiles->(m.user_id::text); v_buff_data:=coalesce(profile->'party_skill_buffs','{}'::jsonb);
      for status_row in select key,value from jsonb_each(v_buff_data) loop
        v_status_data:=jsonb_set(status_row.value,'{turns}',to_jsonb(greatest(0,coalesce((status_row.value->>'turns')::integer,0)-1)),true);
        if coalesce((v_status_data->>'turns')::integer,0)<=0 then v_buff_data:=v_buff_data-status_row.key; else v_buff_data:=jsonb_set(v_buff_data,array[status_row.key],v_status_data,true); end if;
      end loop;
      profile:=jsonb_set(profile,'{party_skill_buffs}',v_buff_data,true);
      v_summons:=coalesce(profile->'party_summons','[]'::jsonb); v_buff_data:='[]'::jsonb;
      for status_row in select value from jsonb_array_elements(v_summons) loop
        v_status_data:=jsonb_set(status_row.value,'{turns}',to_jsonb(greatest(0,coalesce((status_row.value->>'turns')::integer,0)-1)),true);
        if coalesce((v_status_data->>'turns')::integer,0)>0 and coalesce((v_status_data->>'hp')::integer,0)>0 then v_buff_data:=v_buff_data||jsonb_build_array(v_status_data); end if;
      end loop;
      profile:=jsonb_set(profile,'{party_summons}',v_buff_data,true); profiles:=profiles||jsonb_build_object(m.user_id::text,profile);
    end loop;
    -- DOT can defeat players before the enemy action; no dead player receives another hit.
    for m in select pm.user_id from public.party_members pm where pm.party_id=v_party loop
      profile:=profiles->(m.user_id::text); v_statuses:=coalesce(profile->'party_statuses','{}'::jsonb); target_hp:=coalesce((hpmap->>m.user_id::text)::integer,0);
      for status_row in select key,value from jsonb_each(v_statuses) loop
        v_status_data:=status_row.value;
        if target_hp>0 and coalesce((v_status_data->>'dotPct')::numeric,0)>0 then
          v_dot_damage:=greatest(1,floor(coalesce((profile->>'max_hp')::numeric,100)*least(50,(v_status_data->>'dotPct')::numeric)/100)::integer); target_hp:=greatest(0,target_hp-v_dot_damage);
        end if;
        v_status_data:=jsonb_set(v_status_data,'{turns}',to_jsonb(greatest(0,coalesce((v_status_data->>'turns')::integer,0)-1)),true);
        if coalesce((v_status_data->>'turns')::integer,0)<=0 then v_statuses:=v_statuses-status_row.key; else v_statuses:=jsonb_set(v_statuses,array[status_row.key],v_status_data,true); end if;
      end loop;
      if target_hp<=0 and coalesce((profile->>'party_revive_armed')::boolean,false) then
        target_hp:=greatest(1,floor(coalesce((profile->>'max_hp')::numeric,100)*coalesce((profile->>'party_revive_hp_pct')::numeric,25)/100)::integer);
        profile:=jsonb_set(profile,'{party_revive_armed}','false'::jsonb,true);
        profile:=jsonb_set(profile,'{party_revive_used}','true'::jsonb,true);
      end if;
      hpmap:=hpmap||jsonb_build_object(m.user_id::text,target_hp); profile:=jsonb_set(profile,'{party_statuses}',v_statuses,true); profiles:=profiles||jsonb_build_object(m.user_id::text,profile);
    end loop;
    select value into monster from jsonb_array_elements(monsters) where coalesce((value->>'hp')::integer,0)>0 limit 1;
    enemy_damage:=greatest(1,coalesce((monster->>'attack')::integer,12));
    for m in select pm.user_id from public.party_members pm
      where pm.party_id=v_party
        and not exists(select 1 from public.party_battle_retreats r where r.session_id=p_session_id and r.user_id=pm.user_id)
        and exists(select 1 from public.party_battle_presence bp where bp.session_id=p_session_id and bp.user_id=pm.user_id and bp.last_seen_at>now()-interval '45 seconds') loop
      target_hp:=coalesce((hpmap->>m.user_id::text)::integer,0);
      if target_hp>0 then
        profile:=profiles -> (m.user_id::text);
        defense_power:=greatest(0,coalesce((profile->>'defense')::integer,0));
        member_damage:=enemy_damage;
        profile:=profiles -> (m.user_id::text);
        select greatest(0,least(80,coalesce(max((value->>'attackReductionPct')::numeric),0))) into v_attack_reduction from jsonb_each(coalesce(monster->'statuses','{}'::jsonb));
        member_damage:=greatest(1,floor(member_damage*(1-v_attack_reduction/100))::integer);
        if coalesce((profile->>'party_evasion_turns')::integer,0)>0 then member_damage:=0; profile:=jsonb_set(profile,'{party_evasion_turns}',to_jsonb(greatest(0,(profile->>'party_evasion_turns')::integer-1)),true); end if;
        v_summons:=coalesce(profile->'party_summons','[]'::jsonb);
        if jsonb_typeof(v_summons)='array' and jsonb_array_length(v_summons)>0 then
          v_summon:=v_summons->0; v_absorb:=least(member_damage,greatest(0,coalesce((v_summon->>'hp')::integer,0)));
          member_damage:=greatest(0,member_damage-v_absorb); v_summon:=jsonb_set(v_summon,'{hp}',to_jsonb(greatest(0,coalesce((v_summon->>'hp')::integer,0)-v_absorb)),true);
          if coalesce((v_summon->>'hp')::integer,0)<=0 then v_summons:=v_summons-'0'; else v_summons:=jsonb_set(v_summons,'{0}',v_summon,true); end if;
          profile:=jsonb_set(profile,'{party_summons}',v_summons,true);
        end if;
        if coalesce((profile->>'party_shield_turns')::integer,0)>0 then
          v_skill_value:=greatest(0,coalesce((profile->>'party_shield_hp')::integer,0));
          if v_skill_value>0 then
            v_skill_value:=greatest(0,v_skill_value-member_damage);
            member_damage:=greatest(0,floor(member_damage*(1-greatest(0,least(80,coalesce((profile->>'party_shield_reduction_pct')::numeric,0)))/100)::integer)-coalesce((profile->>'party_shield_hp')::integer,0));
            profile:=jsonb_set(profile,'{party_shield_hp}',to_jsonb(v_skill_value),true);
          end if;
          profile:=jsonb_set(profile,'{party_shield_turns}',to_jsonb(greatest(0,(profile->>'party_shield_turns')::integer-1)),true);
        end if;
        if coalesce((guards->>m.user_id::text)::boolean,false) then member_damage:=greatest(0,floor(member_damage*.5)::integer); end if;
        newhp:=greatest(0,target_hp-case when member_damage=0 then 0 else greatest(1,floor(member_damage*(100/(100+defense_power*1.25)))::integer) end);
        if newhp<=0 and coalesce((profile->>'party_revive_armed')::boolean,false) then newhp:=greatest(1,floor(coalesce((profile->>'max_hp')::numeric,100)*coalesce((profile->>'party_revive_hp_pct')::numeric,25)/100)::integer); profile:=jsonb_set(profile,'{party_revive_armed}','false'::jsonb,true); profile:=jsonb_set(profile,'{party_revive_used}','true'::jsonb,true); end if;
        hpmap:=hpmap||jsonb_build_object(m.user_id::text,newhp);
        profiles:=profiles||jsonb_build_object(m.user_id::text,profile);
      end if;
    end loop;
    if not exists(select 1 from public.party_members pm where pm.party_id=v_party
      and coalesce((hpmap->>pm.user_id::text)::integer,0)>0
      and not exists(select 1 from public.party_battle_retreats r where r.session_id=p_session_id and r.user_id=pm.user_id)) then st.status:='defeat'; st.completed_at:=now();
    else st.round_no:=st.round_no+1; guards:='{}'::jsonb; end if;
  end if;

  update public.party_battle_state set monsters=monsters,kills_by_user=kills,
    monster_hp=(select coalesce(sum((e.value->>'hp')::integer),0) from jsonb_array_elements(monsters) e(value)),
    round_no=st.round_no,status=st.status,player_hp=hpmap,player_guard=guards,player_combat=profiles,
    updated_at=now(),completed_at=st.completed_at where session_id=p_session_id;
  if action_name='retreat' then
    select gs.save_data into v_save_data from public.game_saves gs where gs.user_id=uid for update;
    if v_save_data is not null then
      v_save_data:=jsonb_set(v_save_data,'{character,hp}',to_jsonb(coalesce((hpmap->>uid::text)::integer,0)),true);
      v_save_data:=jsonb_set(v_save_data,'{character,mp}',to_jsonb(coalesce((profiles->(uid::text)->>'mp')::integer,0)),true);
      update public.game_saves gs set save_data=v_save_data,updated_at=now() where gs.user_id=uid;
    end if;
  end if;
  if st.status in ('victory','defeat') then
    -- Persist the final surviving HP/MP values without overwriting inventory/gold rewards.
    for m in select pm.user_id from public.party_members pm where pm.party_id=v_party loop
      select gs.save_data into v_save_data from public.game_saves gs where gs.user_id=m.user_id for update;
      if v_save_data is not null then
        profile:=profiles -> (m.user_id::text);
        v_save_data:=jsonb_set(v_save_data,'{character,hp}',to_jsonb(coalesce((hpmap->>m.user_id::text)::integer,0)),true);
        v_save_data:=jsonb_set(v_save_data,'{character,mp}',to_jsonb(coalesce((profile->>'mp')::integer,0)),true);
        update public.game_saves gs set save_data=v_save_data,updated_at=now() where gs.user_id=m.user_id;
      end if;
    end loop;
    update public.party_sessions set status='completed',finished_at=now() where id=p_session_id and status='active';
    update public.parties set status='forming',region_id=null,updated_at=now() where id=v_party;
    update public.party_members set is_ready=false where party_id=v_party;
  end if;
  return public.etranom_party_battle_snapshot(p_session_id);
end $$;$v183_6$) on conflict(part) do update set fragment=excluded.fragment;
commit;
