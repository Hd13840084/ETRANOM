-- ETRANOM v91: canonical character names for social surfaces and all player leaderboards.
-- Run this file in Supabase SQL Editor after the existing social, chat and leaderboard migrations.

-- Repair profiles whose names were left as generated/system identifiers.
update public.player_profiles p
set display_name = nullif(btrim(s.save_data #>> '{character,name}'), ''),
    updated_at = now()
from public.game_saves s
where s.user_id = p.user_id
  and nullif(btrim(s.save_data #>> '{character,name}'), '') is not null
  and (
    nullif(btrim(p.display_name), '') is null
    or btrim(p.display_name) = 'مسافر بی‌نام'
    or btrim(p.display_name) ~* '^(wanderer-[a-z0-9]+|مسافر[-_][a-z0-9]+)$'
    or btrim(p.display_name) ~* '^[0-9a-f]{8}-[0-9a-f-]{27,}$'
  );

-- Repair both old and recent global-chat rows using the sender's actual character name.
update public.global_messages gm
set display_name = coalesce(
  nullif(btrim(p.display_name), ''),
  nullif(btrim(p.username), ''),
  nullif(btrim(s.save_data #>> '{character,name}'), ''),
  'بازیکن'
)
from public.player_profiles p
left join public.game_saves s on s.user_id = p.user_id
where gm.sender_id = p.user_id;

-- Ensure every future global message is stamped with the profile's canonical player name.
create or replace function public.etranom_global_chat_prepare_message()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  profile_name text;
  last_message timestamptz;
begin
  if auth.uid() is null or new.sender_id <> auth.uid() then
    raise exception 'global_chat_auth_required';
  end if;

  select case
    when nullif(btrim(p.display_name), '') is not null
      and btrim(p.display_name) !~* '^(wanderer-[a-z0-9]+|مسافر[-_][a-z0-9]+)$'
      and btrim(p.display_name) !~* '^[0-9a-f]{8}-[0-9a-f-]{27,}$'
      then btrim(p.display_name)
    when nullif(btrim(p.username), '') is not null
      and btrim(p.username) !~* '^(wanderer-[a-z0-9]+|مسافر[-_][a-z0-9]+)$'
      and btrim(p.username) !~* '^[0-9a-f]{8}-[0-9a-f-]{27,}$'
      then btrim(p.username)
    else nullif(btrim(s.save_data #>> '{character,name}'), '')
  end
  into profile_name
  from public.player_profiles p
  left join public.game_saves s on s.user_id = p.user_id
  where p.user_id = new.sender_id;

  new.display_name := coalesce(profile_name, 'بازیکن');

  select created_at into last_message
  from public.global_messages
  where sender_id = new.sender_id
  order by created_at desc
  limit 1;

  if last_message is not null and last_message > now() - interval '2 seconds' then
    raise exception 'global_chat_rate_limit';
  end if;
  return new;
end;
$$;

drop trigger if exists etranom_global_chat_prepare on public.global_messages;
create trigger etranom_global_chat_prepare
before insert on public.global_messages
for each row execute function public.etranom_global_chat_prepare_message();

-- ETRANOM: activate all ten world leaderboard categories.
-- Run after pvp_leaderboards_phase6.sql, guilds_phase3.sql and game_saves_setup.sql.
-- Save-derived statistics are provisional because game_saves is currently client-writable.
create or replace function public.etranom_leaderboards(p_board integer default 1)
returns jsonb
language plpgsql
security definer
set search_path=public
as $$
declare
  uid uuid := auth.uid();
  rows jsonb := '[]'::jsonb;
begin
  if uid is null then raise exception 'auth_required'; end if;
  if p_board < 1 or p_board > 10 then raise exception 'invalid_leaderboard'; end if;

  if p_board = 1 then
    select coalesce(jsonb_agg(to_jsonb(x)),'[]'::jsonb) into rows from (
      select p.user_id, coalesce(nullif(btrim(p.display_name),''),nullif(btrim(p.username),''),'بازیکن') name, coalesce(p.player_level,1) value,
             coalesce(p.player_class,'نامشخص') detail
      from public.player_profiles p order by p.player_level desc nulls last,p.created_at asc limit 50
    ) x;
  elsif p_board = 2 then
    select coalesce(jsonb_agg(to_jsonb(x)),'[]'::jsonb) into rows from (
      select p.user_id, coalesce(nullif(btrim(p.display_name),''),nullif(btrim(p.username),''),'بازیکن') name,
             greatest(0,coalesce(case when s.save_data #>> '{character,xp}' ~ '^[0-9]+([.][0-9]+)?$' then (s.save_data #>> '{character,xp}')::numeric end,0)) value,
             'تجربه ذخیره‌شده' detail
      from public.player_profiles p join public.game_saves s on s.user_id=p.user_id
      order by value desc,p.player_level desc limit 50
    ) x;
  elsif p_board = 3 then
    select coalesce(jsonb_agg(to_jsonb(x)),'[]'::jsonb) into rows from (
      select p.user_id, coalesce(nullif(btrim(p.display_name),''),nullif(btrim(p.username),''),'بازیکن') name,
             (coalesce(nullif(s.save_data #>> '{character,stats,power}','')::numeric,0)
             +coalesce(nullif(s.save_data #>> '{character,stats,speed}','')::numeric,0)
             +coalesce(nullif(s.save_data #>> '{character,stats,endurance}','')::numeric,0)
             +coalesce(nullif(s.save_data #>> '{character,stats,vitality}','')::numeric,0)
             +coalesce(nullif(s.save_data #>> '{character,stats,intellect}','')::numeric,0)
             +coalesce(nullif(s.save_data #>> '{character,stats,perception}','')::numeric,0)
             +coalesce(nullif(s.save_data #>> '{character,stats,luck}','')::numeric,0)
             +coalesce(nullif(s.save_data #>> '{character,stats,faith}','')::numeric,0)) value,
             'مجموع ویژگی‌های پایه' detail
      from public.player_profiles p join public.game_saves s on s.user_id=p.user_id
      order by value desc,p.player_level desc limit 50
    ) x;
  elsif p_board in (4,5) then
    select coalesce(jsonb_agg(to_jsonb(x)),'[]'::jsonb) into rows from (
      select p.user_id, coalesce(nullif(btrim(p.display_name),''),nullif(btrim(p.username),''),'بازیکن') name,
             case when p_board=4 then st.wins else round(100.0*st.wins/greatest(1,st.wins+st.losses),1) end value,
             (st.wins+st.losses+st.draws)::text || ' نبرد' detail
      from public.pvp_player_stats st join public.player_profiles p on p.user_id=st.user_id
      where st.wins+st.losses+st.draws>0 and (p_board<>5 or st.wins+st.losses>=5)
      order by value desc,(st.wins+st.losses+st.draws) desc limit 50
    ) x;
  elsif p_board in (6,7) then
    -- Count explicit defeat entries in the persisted journal; do not invent missing telemetry.
    select coalesce(jsonb_agg(to_jsonb(x)),'[]'::jsonb) into rows from (
      select p.user_id, coalesce(nullif(btrim(p.display_name),''),nullif(btrim(p.username),''),'بازیکن') name,
             count(*) filter (where
               (j.value #>> '{}') ~* case when p_board=7 then '(باس|boss).*(شکست|کشته|مغلوب)|(شکست|کشته|مغلوب).*(باس|boss)'
                    else '(هیولا|دشمن|monster).*(شکست|کشته|مغلوب)|(شکست|کشته|مغلوب).*(هیولا|دشمن|monster)' end) value,
             'بر اساس گزارش‌های ثبت‌شده در ژورنال' detail
      from public.player_profiles p join public.game_saves s on s.user_id=p.user_id
      cross join lateral jsonb_array_elements(coalesce(s.save_data->'journal','[]'::jsonb)) j(value)
      group by p.user_id,p.display_name,p.username
      having count(*) filter (where (j.value #>> '{}') ~* case when p_board=7 then '(باس|boss).*(شکست|کشته|مغلوب)|(شکست|کشته|مغلوب).*(باس|boss)' else '(هیولا|دشمن|monster).*(شکست|کشته|مغلوب)|(شکست|کشته|مغلوب).*(هیولا|دشمن|monster)' end)>0
      order by value desc limit 50
    ) x;
  elsif p_board = 8 then
    select coalesce(jsonb_agg(to_jsonb(x)),'[]'::jsonb) into rows from (
      select p.user_id, coalesce(nullif(btrim(p.display_name),''),nullif(btrim(p.username),''),'بازیکن') name,
             greatest(0,coalesce(case when s.save_data->>'gold' ~ '^[0-9]+([.][0-9]+)?$' then (s.save_data->>'gold')::numeric end,0)) value,
             'سکه فعلی' detail
      from public.player_profiles p join public.game_saves s on s.user_id=p.user_id
      order by value desc limit 50
    ) x;
  elsif p_board = 9 then
    select coalesce(jsonb_agg(to_jsonb(x)),'[]'::jsonb) into rows from (
      select p.user_id, coalesce(nullif(btrim(p.display_name),''),nullif(btrim(p.username),''),'بازیکن') name,
             ((case when coalesce((s.save_data #>> '{quest,completed}')::boolean,false) then 1 else 0 end)
             +(case when coalesce((s.save_data #>> '{regionQuest,completed}')::boolean,false) then 1 else 0 end)
             +(case when coalesce((s.save_data #>> '{mainRegionOneQuest,completed}')::boolean,false) then 1 else 0 end)
             +(case when coalesce((s.save_data #>> '{lanternQuest,completed}')::boolean,false) then 1 else 0 end)
             +(case when coalesce((s.save_data #>> '{oreLedgerQuest,completed}')::boolean,false) then 1 else 0 end)
             +coalesce((select count(*) from jsonb_each(coalesce(s.save_data->'personalQuests','{}'::jsonb)) q where coalesce((q.value->>'completed')::boolean,false)),0)) value,
             'مأموریت‌های تکمیل‌شده ثبت‌شده' detail
      from public.player_profiles p join public.game_saves s on s.user_id=p.user_id
      order by value desc,p.player_level desc limit 50
    ) x;
  elsif p_board = 10 then
    select coalesce(jsonb_agg(to_jsonb(x)),'[]'::jsonb) into rows from (
      select g.name||' ['||g.tag||']' name,count(m.user_id)::bigint value,'تعداد اعضا' detail
      from public.guilds g left join public.guild_members m on m.guild_id=g.id
      group by g.id order by value desc,g.created_at asc limit 50
    ) x;
  end if;
  return jsonb_build_object('board',p_board,'available',true,'rows',rows,
    'note','آمار مبتنی بر ذخیره فعلی بازی است؛ تا زمان انتقال ثبت رویدادها به سرور، برخی جدول‌ها ممکن است ناقص یا قابل دستکاری باشند.');
end;
$$;
revoke all on function public.etranom_leaderboards(integer) from public,anon;
grant execute on function public.etranom_leaderboards(integer) to authenticated;
