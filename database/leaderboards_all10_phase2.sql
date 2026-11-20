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
      select coalesce(p.display_name,p.username,'بازیکن') name, greatest(coalesce(p.player_level,1),coalesce(nullif(s.save_data #>> '{character,level}','')::integer,1)) value,
             coalesce(p.player_class,'نامشخص') detail
      from public.player_profiles p left join public.game_saves s on s.user_id=p.user_id order by value desc,p.created_at asc limit 50
    ) x;
  elsif p_board = 2 then
    select coalesce(jsonb_agg(to_jsonb(x)),'[]'::jsonb) into rows from (
      select coalesce(p.display_name,p.username,'بازیکن') name,
             greatest(0,coalesce(case when s.save_data #>> '{character,xp}' ~ '^[0-9]+([.][0-9]+)?$' then (s.save_data #>> '{character,xp}')::numeric end,0)) value,
             'تجربه ذخیره‌شده' detail
      from public.player_profiles p join public.game_saves s on s.user_id=p.user_id
      order by value desc,p.player_level desc limit 50
    ) x;
  elsif p_board = 3 then
    select coalesce(jsonb_agg(to_jsonb(x)),'[]'::jsonb) into rows from (
      select coalesce(p.display_name,p.username,'بازیکن') name,
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
      select coalesce(p.display_name,p.username,'بازیکن') name,
             case when p_board=4 then st.wins else round(100.0*st.wins/greatest(1,st.wins+st.losses),1) end value,
             (st.wins+st.losses+st.draws)::text || ' نبرد' detail
      from public.pvp_player_stats st join public.player_profiles p on p.user_id=st.user_id
      where st.wins+st.losses+st.draws>0 and (p_board<>5 or st.wins+st.losses>=5)
      order by value desc,(st.wins+st.losses+st.draws) desc limit 50
    ) x;
  elsif p_board in (6,7) then
    -- Use explicit counters written by the game on confirmed victory, not localized journal text.
    select coalesce(jsonb_agg(to_jsonb(x)),'[]'::jsonb) into rows from (
      select coalesce(p.display_name,p.username,'بازیکن') name,
             greatest(0,coalesce(case when (s.save_data #>> case when p_board=7 then '{statistics,bossesKilled}' else '{statistics,monstersKilled}' end) ~ '^[0-9]+$' then (s.save_data #>> case when p_board=7 then '{statistics,bossesKilled}' else '{statistics,monstersKilled}' end)::bigint end,0)) value,
             case when p_board=7 then 'باس‌ها و مینی‌باس‌های شکست‌داده‌شده' else 'مجموع هیولاهای شکست‌داده‌شده' end detail
      from public.player_profiles p join public.game_saves s on s.user_id=p.user_id
      order by value desc,p.created_at asc limit 50
    ) x;
  elsif p_board = 8 then
    select coalesce(jsonb_agg(to_jsonb(x)),'[]'::jsonb) into rows from (
      select coalesce(p.display_name,p.username,'بازیکن') name,
             greatest(0,coalesce(case when s.save_data->>'gold' ~ '^[0-9]+([.][0-9]+)?$' then (s.save_data->>'gold')::numeric end,0)) value,
             'سکه فعلی' detail
      from public.player_profiles p join public.game_saves s on s.user_id=p.user_id
      order by value desc limit 50
    ) x;
  elsif p_board = 9 then
    select coalesce(jsonb_agg(to_jsonb(x)),'[]'::jsonb) into rows from (
      select coalesce(p.display_name,p.username,'بازیکن') name,
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
