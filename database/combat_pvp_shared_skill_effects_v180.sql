-- ETRANOM v180 PvP shared-skill server fix. Apply after v173/v174.
-- Fixes target-side debuffs, soft control, self buffs, shields and summons.
-- PvP hard-control is intentionally disabled to prevent turn-lock exploits.
begin;
create or replace function public.etranom_pvp_skill_action(p_match uuid,p_skill_id text,p_target_id uuid default null)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
 uid uuid:=auth.uid(); m public.pvp_matches%rowtype; s jsonb; actor jsonb; target jsonb;
 actor_key text; target_key text; actor_id uuid; target_id uuid;
 ac jsonb; tc jsonb; ab jsonb; tb jsonb; sk jsonb; sd jsonb;
 skill_type text; lvl integer; mp numeric; maxmp numeric; hp numeric; maxhp numeric;
 atk numeric; mag numeric; def numeric; cost integer; cd integer; cooldowns jsonb;
 dmg integer:=0; heal integer:=0; shield integer:=0; next_player uuid; log_entry jsonb; status_data jsonb; summon_data jsonb; target_statuses jsonb; effect_row record; effect_key text; effect_json jsonb; actor_effects jsonb; actor_summons jsonb; actor_maxhp numeric; dot_damage integer:=0; attack_reduction numeric:=0; defense_reduction numeric:=0;
begin
 if uid is null then raise exception 'auth_required'; end if;
 if p_skill_id is null or p_skill_id !~ '^[a-z0-9_]{1,48}$' then raise exception 'invalid_skill_id'; end if;
 select * into m from public.pvp_matches where id=p_match and uid in (player_a,player_b) for update;
 if not found then raise exception 'match_not_found'; end if;
 if m.status<>'active' then raise exception 'match_not_active'; end if;
 if m.turn_player<>uid then raise exception 'not_your_turn'; end if;
 s:=coalesce(m.combat_state,'{}'::jsonb); 
 if m.player_a=uid then actor_key:='player_a'; target_key:='player_b'; actor_id:=m.player_a; target_id:=m.player_b; actor:=coalesce(s->'player_a','{}'::jsonb); target:=coalesce(s->'player_b','{}'::jsonb);
 else actor_key:='player_b'; target_key:='player_a'; actor_id:=m.player_b; target_id:=m.player_a; actor:=coalesce(s->'player_b','{}'::jsonb); target:=coalesce(s->'player_a','{}'::jsonb); end if;
 ac:=coalesce(actor->'save_snapshot'->'character','{}'::jsonb); tc:=coalesce(target->'save_snapshot'->'character','{}'::jsonb);
 if ac='{}'::jsonb or tc='{}'::jsonb then raise exception 'combat_character_data_missing'; end if;
 select skill_data into sd from public.etranom_shared_skill_catalog where skill_id=p_skill_id and enabled;
 if sd is null then raise exception 'skill_not_in_trusted_catalog'; end if;
 -- Bind a specialization skill to the actor's actual class/spec; base skills bind to class.
 if coalesce(lower(ac->>'classId'),lower(ac->>'class'),lower(ac->>'class_id')) is distinct from (select class_id from public.etranom_shared_skill_catalog where skill_id=p_skill_id) then raise exception 'skill_class_mismatch'; end if;
 if exists(select 1 from public.etranom_shared_skill_catalog where skill_id=p_skill_id and specialization_id is not null)
   and coalesce(ac->>'specializationId',ac->>'specialization_id',ac->>'specialization') is distinct from (select specialization_id from public.etranom_shared_skill_catalog where skill_id=p_skill_id) then raise exception 'skill_specialization_mismatch'; end if;
 lvl:=greatest(1,coalesce(nullif(ac->>'level','')::integer,nullif(ac->>'levelNo','')::integer,1));
 if lvl<coalesce((sd->>'unlockLevel')::integer,1) then raise exception 'skill_locked'; end if;
 -- Ownership is fail-closed: a skill must be present in the persisted character unlock list.
 if not (coalesce(ac->'skills','[]'::jsonb) @> jsonb_build_array(p_skill_id)
      or coalesce(ac->'unlockedSkills','[]'::jsonb) @> jsonb_build_array(p_skill_id)
      or coalesce(ac->'skillIds','[]'::jsonb) @> jsonb_build_array(p_skill_id)) then raise exception 'skill_not_owned'; end if;
 ab:=coalesce(actor->'battle','{}'::jsonb); tb:=coalesce(target->'battle','{}'::jsonb);
 -- Advance only the active combatant's timed effects at the start of their turn.
 -- DOT is applied before the action; expired effects are removed atomically with the turn.
 actor_effects:=coalesce(ab->'active_skill_effects','{}'::jsonb);
 hp:=greatest(0,coalesce((ab->>'hp')::numeric,0));
 actor_maxhp:=greatest(1,coalesce((ab->>'max_hp')::numeric,(ac->>'maxHp')::numeric,(ac->>'max_hp')::numeric,1));
 for effect_row in select key,value from jsonb_each(actor_effects) loop
   effect_key:=effect_row.key; effect_json:=effect_row.value;
   if greatest(0,coalesce((effect_json->>'turns')::integer,0))<=0 then
     actor_effects:=actor_effects-effect_key;
   else
     if greatest(0,coalesce((effect_json->>'dotPct')::numeric,0))>0 and hp>0 then
       dot_damage:=least(hp,greatest(1,floor(actor_maxhp*least(50,(effect_json->>'dotPct')::numeric)/100)::integer));
       hp:=greatest(0,hp-dot_damage);
     end if;
     effect_json:=jsonb_set(effect_json,'{turns}',to_jsonb(greatest(0,(effect_json->>'turns')::integer-1)),true);
     if coalesce((effect_json->>'turns')::integer,0)<=0 then actor_effects:=actor_effects-effect_key;
     else actor_effects:=jsonb_set(actor_effects,array[effect_key],effect_json,true); end if;
   end if;
 end loop;
 ab:=jsonb_set(ab,'{active_skill_effects}',actor_effects,true);
 ab:=jsonb_set(ab,'{hp}',to_jsonb(hp),true);
 -- Timers are advanced server-side too; no client can extend them by replaying a payload.
 if jsonb_typeof(ab->'shield')='object' then
   effect_json:=ab->'shield';
   effect_json:=jsonb_set(effect_json,'{turns}',to_jsonb(greatest(0,coalesce((effect_json->>'turns')::integer,0)-1)),true);
   ab:=case when coalesce((effect_json->>'turns')::integer,0)<=0 then ab-'shield' else jsonb_set(ab,'{shield}',effect_json,true) end;
 end if;
 actor_summons:=coalesce(ab->'summons','[]'::jsonb);
 if jsonb_typeof(actor_summons)='array' then
   summon_data:='[]'::jsonb;
   for effect_row in select value from jsonb_array_elements(actor_summons) loop
     effect_json:=jsonb_set(effect_row.value,'{turns}',to_jsonb(greatest(0,coalesce((effect_row.value->>'turns')::integer,0)-1)),true);
     if coalesce((effect_json->>'turns')::integer,0)>0 and coalesce((effect_json->>'hp')::integer,0)>0 then summon_data:=summon_data||jsonb_build_array(effect_json); end if;
   end loop;
   ab:=jsonb_set(ab,'{summons}',summon_data,true);
 end if;
 if hp<=0 then
   actor:=jsonb_set(actor,'{battle}',ab,true);
   if actor_key='player_a' then s:=jsonb_set(s,'{player_a}',actor,true); else s:=jsonb_set(s,'{player_b}',actor,true); end if;
   update public.pvp_matches set combat_state=s,status='completed',winner_id=target_id,completed_at=now(),updated_at=now(),last_action_at=now(),turn_no=turn_no+1,turn_player=null where id=p_match;
   insert into public.pvp_player_stats(user_id,wins,losses,draws) values(target_id,1,0,0),(actor_id,0,1,0) on conflict(user_id) do update set wins=public.pvp_player_stats.wins+excluded.wins,losses=public.pvp_player_stats.losses+excluded.losses,updated_at=now();
   return jsonb_build_object('success',true,'status','completed','reason','damage_over_time','winner_id',target_id);
 end if;
 hp:=greatest(0,coalesce((ab->>'hp')::numeric,0)); maxhp:=greatest(1,coalesce((ab->>'max_hp')::numeric,(ac->>'maxHp')::numeric,(ac->>'max_hp')::numeric,1));
 mp:=greatest(0,coalesce((ab->>'mp')::numeric,(ac->>'mp')::numeric,0)); maxmp:=greatest(0,coalesce((ab->>'max_mp')::numeric,(ac->>'maxMp')::numeric,(ac->>'max_mp')::numeric,0));
 atk:=greatest(1,coalesce((ab->>'attack')::numeric,(ac->>'attack')::numeric,10)); mag:=greatest(1,coalesce((ab->>'magicPower')::numeric,(ac->>'magicPower')::numeric,atk));
 select greatest(-60,least(70,coalesce(max((value->>'attackReductionPct')::numeric),0)-coalesce(max((value->'effects'->>'attackPct')::numeric),0))) into attack_reduction from jsonb_each(coalesce(ab->'active_skill_effects','{}'::jsonb));
 select greatest(-60,least(70,coalesce(max((value->>'defenseReductionPct')::numeric),0)-coalesce(max((value->'effects'->>'defensePct')::numeric),0))) into defense_reduction from jsonb_each(coalesce(tb->'active_skill_effects','{}'::jsonb));
 atk:=greatest(1,atk*(1-attack_reduction/100));
 def:=greatest(0,coalesce((tb->>'defense')::numeric,0))*(1-defense_reduction/100); cooldowns:=coalesce(ab->'skill_cooldowns','{}'::jsonb);
 if coalesce((cooldowns->>p_skill_id)::integer,0)>m.turn_no then raise exception 'skill_on_cooldown'; end if;
 cost:=greatest(0,ceil(coalesce((sd->>'manaCost')::numeric,0))::integer); if mp<cost then raise exception 'insufficient_mana'; end if;
 mp:=mp-cost; skill_type:=coalesce(sd->>'type',''); cd:=greatest(0,coalesce((sd->>'cooldownTurns')::integer,0));
 cooldowns:=jsonb_set(cooldowns,array[p_skill_id],to_jsonb(m.turn_no+cd+1),true);
 ab:=jsonb_set(ab,'{mp}',to_jsonb(mp),true); ab:=jsonb_set(ab,'{skill_cooldowns}',cooldowns,true);
 if skill_type in ('single_damage','damage_heal','multi_target_damage','all_damage','ultimate_all_damage','all_control_damage','all_dot_control') then
   dmg:=greatest(1,floor((case when sd->>'scalingStat'='magicPower' then mag else atk end)*greatest(1,coalesce((sd->>'damagePct')::numeric,100))/100*100/(100+def*1.25))::integer);
   hp:=greatest(0,coalesce((tb->>'hp')::numeric,1)-dmg); tb:=jsonb_set(tb,'{hp}',to_jsonb(hp),true);
   if skill_type='damage_heal' then heal:=greatest(0,floor(dmg*coalesce((sd->>'lifeStealPct')::numeric,coalesce((sd->>'healPct')::numeric,25))/100)::integer); end if;
   if coalesce((sd->>'dotPct')::numeric,0)>0 or coalesce((sd->>'attackReductionPct')::numeric,0)>0 or coalesce((sd->>'defenseReductionPct')::numeric,0)>0 then
     target_statuses:=coalesce(tb->'active_skill_effects','{}'::jsonb);
     status_data:=jsonb_build_object('source_skill',p_skill_id,'turns',greatest(1,coalesce((sd->>'durationTurns')::integer,2)),'dotPct',greatest(0,coalesce((sd->>'dotPct')::numeric,0)),'attackReductionPct',least(60,greatest(0,coalesce((sd->>'attackReductionPct')::numeric,0))),'defenseReductionPct',least(60,greatest(0,coalesce((sd->>'defenseReductionPct')::numeric,0))),'hardControl',false);
     target_statuses:=jsonb_set(target_statuses,array[p_skill_id],status_data,true); tb:=jsonb_set(tb,'{active_skill_effects}',target_statuses,true);
   end if;
 elsif skill_type in ('self_heal','heal','group_heal') then
   -- PvP ally/group healing is constrained to the acting player; a client target cannot heal the opponent.
   heal:=greatest(1,floor(mag*coalesce((sd->>'healPct')::numeric,100)/100)::integer);
 elsif skill_type='shield' then
   shield:=greatest(1,floor(mag*coalesce((sd->>'shieldPct')::numeric,100)/100)::integer);
 elsif skill_type in ('debuff','control') then
   -- Debuffs belong to the opponent, never to the caster. PvP control is soft only.
   target_statuses:=coalesce(tb->'active_skill_effects','{}'::jsonb);
   status_data:=jsonb_build_object('type',skill_type,'source_skill',p_skill_id,'turns',greatest(1,coalesce((sd->>'durationTurns')::integer,2)),'hardControl',false,'dotPct',greatest(0,coalesce((sd->>'dotPct')::numeric,0)),'attackReductionPct',least(60,greatest(0,coalesce((sd->>'attackReductionPct')::numeric,0))),'defenseReductionPct',least(60,greatest(0,coalesce((sd->>'defenseReductionPct')::numeric,0))));
   target_statuses:=jsonb_set(target_statuses,array[p_skill_id],status_data,true); tb:=jsonb_set(tb,'{active_skill_effects}',target_statuses,true);
 elsif skill_type in ('evasion_counter','self_buff') then
   ab:=jsonb_set(coalesce(ab,'{}'::jsonb),array['active_skill_effects',p_skill_id],jsonb_build_object('type',skill_type,'turns',greatest(1,coalesce((sd->>'durationTurns')::integer,2)),'hardControl',false,'effects',coalesce(sd->'effects','{}'::jsonb)),true);
 elsif skill_type in ('summon','summon_resource') then
   summon_data:=coalesce(ab->'summons','[]'::jsonb);
   if jsonb_array_length(summon_data)>=1 then raise exception 'pvp_summon_capacity_reached'; end if;
   summon_data:=summon_data||jsonb_build_array(jsonb_build_object('id',p_skill_id||'_summon','sourceSkill',p_skill_id,'hp',greatest(1,floor(maxhp*coalesce((sd->>'summonHpPct')::numeric,35)/100)::integer),'attack',greatest(1,floor(atk*coalesce((sd->>'summonDamagePct')::numeric,50)/100)::integer),'turns',greatest(1,coalesce((sd->>'durationTurns')::integer,2))));
   ab:=jsonb_set(ab,'{summons}',summon_data,true);
 else raise exception 'unsupported_pvp_skill_type'; end if;
 if heal>0 then ab:=jsonb_set(ab,'{hp}',to_jsonb(least(maxhp,hp+heal)),true); end if;
 if shield>0 then ab:=jsonb_set(ab,'{shield}',jsonb_build_object('hp',shield,'turns',greatest(1,coalesce((sd->>'durationTurns')::integer,2)),'reductionPct',least(80,greatest(0,coalesce((sd->>'damageReductionPct')::numeric,0)))),true); end if;
 actor:=jsonb_set(actor,'{battle}',ab,true); target:=jsonb_set(target,'{battle}',tb,true);
 if dmg>0 then if actor_key='player_a' then update public.pvp_matches set score_a=score_a+dmg where id=p_match; else update public.pvp_matches set score_b=score_b+dmg where id=p_match; end if; end if;
 if actor_key='player_a' then s:=jsonb_set(s,'{player_a}',actor,true); s:=jsonb_set(s,'{player_b}',target,true); else s:=jsonb_set(s,'{player_b}',actor,true); s:=jsonb_set(s,'{player_a}',target,true); end if;
 log_entry:=jsonb_build_object('type','skill','skill_id',p_skill_id,'text',coalesce(sd->>'name_fa',sd->>'name',p_skill_id),'damage',dmg,'heal',heal,'shield',shield,'at',now());
 s:=jsonb_set(s,'{log}',coalesce(s->'log','[]'::jsonb)||jsonb_build_array(log_entry),true);
 if coalesce((tb->>'hp')::numeric,1)<=0 then
   update public.pvp_matches set combat_state=s,status='completed',winner_id=uid,completed_at=now(),updated_at=now(),last_action_at=now(),turn_no=turn_no+1,turn_player=null where id=p_match;
   insert into public.pvp_player_stats(user_id,wins,losses,draws) values(actor_id,1,0,0),(target_id,0,1,0) on conflict(user_id) do update set wins=public.pvp_player_stats.wins+excluded.wins,losses=public.pvp_player_stats.losses+excluded.losses,updated_at=now();
   return jsonb_build_object('success',true,'status','completed','skill_id',p_skill_id,'damage',dmg,'heal',heal,'shield',shield);
 end if;
 next_player:=target_id;
 update public.pvp_matches set combat_state=s,turn_player=next_player,turn_no=turn_no+1,updated_at=now(),last_action_at=now() where id=p_match;
 return jsonb_build_object('success',true,'status','active','skill_id',p_skill_id,'damage',dmg,'heal',heal,'shield',shield,'turn_player',next_player,'turn_no',m.turn_no+1);
end; $$;
revoke all on function public.etranom_pvp_skill_action(uuid,text,uuid) from public,anon;
grant execute on function public.etranom_pvp_skill_action(uuid,text,uuid) to authenticated;
commit;
