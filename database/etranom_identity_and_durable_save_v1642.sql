-- ETRANOM v164.2: canonical player identity + durable save safety.
-- Run once in Supabase SQL Editor AFTER the existing game_saves, player_profiles,
-- group-battle and chat migrations. This migration does not delete player data.
begin;

do $$
begin
  if to_regclass('public.game_saves') is null then raise exception 'ETRANOM prerequisite missing: public.game_saves'; end if;
  if to_regclass('public.player_profiles') is null then raise exception 'ETRANOM prerequisite missing: public.player_profiles'; end if;
end $$;

-- One canonical resolver for every social surface. It never returns a UUID/system placeholder.
create or replace function public.etranom_player_display_name(p_user_id uuid)
returns text
language plpgsql
stable
security definer
set search_path = public
as $$
declare v_name text;
begin
  if p_user_id is null then return 'بازیکن'; end if;
  select coalesce(
    case when nullif(btrim(p.display_name),'') is not null
      and btrim(p.display_name) !~* '^(wanderer-[a-z0-9]+|مسافر[-_][a-z0-9]+)$'
      and btrim(p.display_name) !~* '^[0-9a-f]{8}-[0-9a-f-]{27,}$' then btrim(p.display_name) end,
    case when nullif(btrim(p.username),'') is not null
      and btrim(p.username) !~* '^(wanderer-[a-z0-9]+|مسافر[-_][a-z0-9]+)$'
      and btrim(p.username) !~* '^[0-9a-f]{8}-[0-9a-f-]{27,}$' then btrim(p.username) end,
    case when nullif(btrim(gs.save_data #>> '{character,name}'),'') is not null
      and btrim(gs.save_data #>> '{character,name}') !~* '^(wanderer-[a-z0-9]+|مسافر[-_][a-z0-9]+)$'
      and btrim(gs.save_data #>> '{character,name}') !~* '^[0-9a-f]{8}-[0-9a-f-]{27,}$'
      then btrim(gs.save_data #>> '{character,name}') end,
    'بازیکن')
  into v_name
  from (select p_user_id as user_id) u
  left join public.player_profiles p on p.user_id=u.user_id
  left join public.game_saves gs on gs.user_id=u.user_id;
  return coalesce(v_name,'بازیکن');
end;
$$;
revoke all on function public.etranom_player_display_name(uuid) from public, anon;
grant execute on function public.etranom_player_display_name(uuid) to authenticated;

-- Keep the shared profile row synchronized whenever a full character save is written.
create or replace function public.etranom_sync_player_profile_from_save()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_name text := nullif(btrim(new.save_data #>> '{character,name}'),'');
  v_level integer := 1;
  v_class text := coalesce(nullif(btrim(new.save_data #>> '{character,archetype}'),''),'نامشخص');
  v_fallback_username text := 'etranom_' || substr(replace(new.user_id::text,'-',''),1,16);
begin
  if v_name is null or v_name ~* '^(wanderer-[a-z0-9]+|مسافر[-_][a-z0-9]+)$' or v_name ~* '^[0-9a-f]{8}-[0-9a-f-]{27,}$' then
    return new;
  end if;
  if coalesce(new.save_data #>> '{character,level}','') ~ '^[0-9]+$' then
    v_level := greatest(1,least(999,(new.save_data #>> '{character,level}')::integer));
  end if;
  begin
    insert into public.player_profiles(user_id,username,display_name,player_level,player_class,updated_at)
    values(new.user_id,v_name,v_name,v_level,v_class,now())
    on conflict(user_id) do update set
      username=excluded.username,
      display_name=excluded.display_name,
      player_level=excluded.player_level,
      player_class=excluded.player_class,
      updated_at=now();
  exception when unique_violation then
    insert into public.player_profiles(user_id,username,display_name,player_level,player_class,updated_at)
    values(new.user_id,v_fallback_username,v_name,v_level,v_class,now())
    on conflict(user_id) do update set
      display_name=excluded.display_name,
      player_level=excluded.player_level,
      player_class=excluded.player_class,
      updated_at=now();
  end;
  return new;
end;
$$;

drop trigger if exists etranom_sync_player_profile_after_save on public.game_saves;
create trigger etranom_sync_player_profile_after_save
after insert or update of save_data on public.game_saves
for each row execute function public.etranom_sync_player_profile_from_save();

-- Backfill existing profiles and create missing profile rows from the saved character names.
do $$
declare r record; v_name text; v_level integer; v_class text; v_fallback_username text;
begin
  for r in select gs.user_id,gs.save_data from public.game_saves gs loop
    v_name:=nullif(btrim(r.save_data #>> '{character,name}'),'');
    if v_name is null or v_name ~* '^(wanderer-[a-z0-9]+|مسافر[-_][a-z0-9]+)$' or v_name ~* '^[0-9a-f]{8}-[0-9a-f-]{27,}$' then continue; end if;
    v_level:=1;
    if coalesce(r.save_data #>> '{character,level}','') ~ '^[0-9]+$' then v_level:=greatest(1,least(999,(r.save_data #>> '{character,level}')::integer)); end if;
    v_class:=coalesce(nullif(btrim(r.save_data #>> '{character,archetype}'),''),'نامشخص');
    v_fallback_username:='etranom_'||substr(replace(r.user_id::text,'-',''),1,16);
    begin
      insert into public.player_profiles(user_id,username,display_name,player_level,player_class,updated_at)
      values(r.user_id,v_name,v_name,v_level,v_class,now())
      on conflict(user_id) do update set username=excluded.username,display_name=excluded.display_name,
        player_level=excluded.player_level,player_class=excluded.player_class,updated_at=now();
    exception when unique_violation then
      insert into public.player_profiles(user_id,username,display_name,player_level,player_class,updated_at)
      values(r.user_id,v_fallback_username,v_name,v_level,v_class,now())
      on conflict(user_id) do update set display_name=excluded.display_name,player_level=excluded.player_level,
        player_class=excluded.player_class,updated_at=now();
    end;
  end loop;
end;
$$;

-- Repair historical global-chat author labels after profiles have been backfilled.
do $$
begin
  if to_regclass('public.global_messages') is not null then
    update public.global_messages gm set display_name=public.etranom_player_display_name(gm.sender_id);
  end if;
end;
$$;


create or replace function public.etranom_party_battle_snapshot(p_session_id uuid)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  uid uuid:=auth.uid(); v_party uuid; v_state public.party_battle_state%rowtype; v_members jsonb; v_monsters jsonb;
begin
  if uid is null then raise exception 'auth_required'; end if;
  select s.party_id into v_party from public.party_sessions s
    join public.party_members pm on pm.party_id=s.party_id and pm.user_id=uid where s.id=p_session_id;
  if v_party is null then raise exception 'battle_not_available'; end if;
  select * into v_state from public.party_battle_state where session_id=p_session_id;
  select coalesce(jsonb_agg(jsonb_build_object(
    'user_id',pm.user_id,'display_name',public.etranom_player_display_name(pm.user_id),
    'level',coalesce(((v_state.player_combat -> (pm.user_id::text)) ->> 'level')::integer,pp.player_level,1),
    'player_class',coalesce((v_state.player_combat -> (pm.user_id::text)) ->> 'class',pp.player_class,'ماجراجو'),
    'specialization',coalesce(gs.save_data->'character'->>'specialization',''),
    'hp',coalesce((v_state.player_hp->>pm.user_id::text)::integer,0),
    'max_hp',coalesce(((v_state.player_combat -> (pm.user_id::text)) ->> 'max_hp')::integer,100),
    'mp',coalesce(((v_state.player_combat -> (pm.user_id::text)) ->> 'mp')::integer,0),
    'max_mp',coalesce(((v_state.player_combat -> (pm.user_id::text)) ->> 'max_mp')::integer,60),
    'attack',coalesce(((v_state.player_combat -> (pm.user_id::text)) ->> 'attack')::integer,1),
    'defense',coalesce(((v_state.player_combat -> (pm.user_id::text)) ->> 'defense')::integer,0),
    'kills',coalesce((v_state.kills_by_user->>pm.user_id::text)::integer,0),
    'ready',exists(select 1 from public.party_battle_actions a where a.session_id=p_session_id and a.round_no=v_state.round_no and a.user_id=pm.user_id),
    'connected',exists(select 1 from public.party_battle_presence bp where bp.session_id=p_session_id and bp.user_id=pm.user_id and bp.last_seen_at>now()-interval '45 seconds'),
    'last_seen_at',(select bp.last_seen_at from public.party_battle_presence bp where bp.session_id=p_session_id and bp.user_id=pm.user_id)
  ) order by pm.joined_at),'[]'::jsonb) into v_members
  from public.party_members pm
  left join public.player_profiles pp on pp.user_id=pm.user_id
  left join public.game_saves gs on gs.user_id=pm.user_id
  where pm.party_id=v_party;
  select coalesce(jsonb_agg(x || jsonb_build_object('index',ord)), '[]'::jsonb) into v_monsters
    from jsonb_array_elements(v_state.monsters) with ordinality as t(x,ord);
  return jsonb_build_object('session_id',p_session_id,'party_id',v_party,'region_id',v_state.region_id,
    'encounter_type',v_state.encounter_type,'group_size',v_state.group_size,'enemy_name',v_state.encounter_name,
    'round',v_state.round_no,'enemy_hp',v_state.monster_hp,'enemy_max_hp',v_state.monster_max_hp,
    'monsters',v_monsters,'members',v_members,'status',v_state.status);
end $$;


commit;
