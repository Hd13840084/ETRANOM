-- ETRANOM Leaderboards v159 FINAL
-- Run this migration LAST, after:
-- pvp_leaderboards_phase6.sql, pvp_real_combat_phase1_v147.sql,
-- pvp_turn_engine_phase3_v149.sql, guilds_phase3.sql and game_saves_setup.sql.
--
-- Fixes: one canonical RPC for all ten boards; stable user_id values;
-- real completed PvP turn logs only; correct quest JSON schema; robust numeric parsing.
-- Save-backed boards reflect the latest saved game. They are not anti-cheat authoritative
-- while game_saves remains client-writable. PvP boards are derived from completed server
-- turn-engine matches with a non-empty combat log.

create or replace function public.etranom_leaderboards(p_board integer default 1)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  rows jsonb := '[]'::jsonb;
begin
  if uid is null then raise exception 'auth_required'; end if;
  if p_board is null or p_board < 1 or p_board > 10 then
    raise exception 'invalid_leaderboard';
  end if;

  -- 1. Highest level: use the greater of the profile and the latest saved character.
  if p_board = 1 then
    select coalesce(jsonb_agg(to_jsonb(x) order by x.value desc, x.name asc),'[]'::jsonb)
      into rows
    from (
      select p.user_id,
        coalesce(nullif(btrim(p.display_name),''),nullif(btrim(p.username),''),'بازیکن') as name,
        greatest(coalesce(p.player_level,1),
          case when s.save_data #>> '{character,level}' ~ '^[0-9]+$'
               then (s.save_data #>> '{character,level}')::integer else 1 end) as value,
        coalesce(nullif(btrim(p.player_class),''),'نامشخص') as detail,
        coalesce(s.updated_at,p.updated_at,p.created_at) as updated_at
      from public.player_profiles p
      left join public.game_saves s on s.user_id=p.user_id
      order by value desc, p.created_at asc
      limit 50
    ) x;

  -- 2. Total stored XP (character.xp, not level progress percentage).
  elsif p_board = 2 then
    select coalesce(jsonb_agg(to_jsonb(x) order by x.value desc, x.name asc),'[]'::jsonb)
      into rows
    from (
      select p.user_id,
        coalesce(nullif(btrim(p.display_name),''),nullif(btrim(p.username),''),'بازیکن') as name,
        case when s.save_data #>> '{character,xp}' ~ '^[0-9]+([.][0-9]+)?$'
             then (s.save_data #>> '{character,xp}')::numeric else 0 end as value,
        'تجربه کل ذخیره‌شده' as detail,
        s.updated_at
      from public.player_profiles p
      join public.game_saves s on s.user_id=p.user_id
      order by value desc, p.player_level desc nulls last
      limit 50
    ) x;

  -- 3. Sum of the eight actual base attributes. The UI label explicitly says this,
  --    rather than claiming to calculate full gear/buff combat power.
  elsif p_board = 3 then
    select coalesce(jsonb_agg(to_jsonb(x) order by x.value desc, x.name asc),'[]'::jsonb)
      into rows
    from (
      select p.user_id,
        coalesce(nullif(btrim(p.display_name),''),nullif(btrim(p.username),''),'بازیکن') as name,
        (select coalesce(sum(case when v ~ '^-?[0-9]+([.][0-9]+)?$' then v::numeric else 0 end),0)
         from unnest(array[
           s.save_data #>> '{character,stats,power}',
           s.save_data #>> '{character,stats,speed}',
           s.save_data #>> '{character,stats,endurance}',
           s.save_data #>> '{character,stats,vitality}',
           s.save_data #>> '{character,stats,intellect}',
           s.save_data #>> '{character,stats,perception}',
           s.save_data #>> '{character,stats,luck}',
           s.save_data #>> '{character,stats,faith}'
         ]) as vals(v)) as value,
        'مجموع ۸ ویژگی پایه؛ بدون تجهیزات و اثرهای موقت' as detail,
        s.updated_at
      from public.player_profiles p
      join public.game_saves s on s.user_id=p.user_id
      order by value desc, p.player_level desc nulls last
      limit 50
    ) x;

  -- 4/5. PvP rankings are calculated from completed turn-engine matches that contain
  --      an actual server-recorded combat log. Legacy instant-score matches are excluded.
  elsif p_board in (4,5) then
    with player_results as (
      select participant.user_id,
        count(*) filter (where m.winner_id=participant.user_id)::bigint as wins,
        count(*) filter (where m.winner_id is not null and m.winner_id<>participant.user_id)::bigint as losses,
        count(*) filter (where m.winner_id is null)::bigint as draws
      from public.pvp_matches m
      cross join lateral (values (m.player_a),(m.player_b)) as participant(user_id)
      where m.status='completed'
        and m.winner_id is not null
        and jsonb_typeof(coalesce(m.combat_state->'log','[]'::jsonb))='array'
        and case when jsonb_typeof(coalesce(m.combat_state->'log','[]'::jsonb))='array' then jsonb_array_length(coalesce(m.combat_state->'log','[]'::jsonb)) else 0 end > 0
      group by participant.user_id
    )
    select coalesce(jsonb_agg(to_jsonb(x) order by x.value desc, x.games desc, x.name asc),'[]'::jsonb)
      into rows
    from (
      select p.user_id,
        coalesce(nullif(btrim(p.display_name),''),nullif(btrim(p.username),''),'بازیکن') as name,
        case when p_board=4 then r.wins::numeric
             else round(100.0*r.wins/greatest(1,r.wins+r.losses),1) end as value,
        (r.wins+r.losses+r.draws)::text || ' نبرد ثبت‌شده' as detail,
        (r.wins+r.losses+r.draws)::bigint as games
      from player_results r
      join public.player_profiles p on p.user_id=r.user_id
      where r.wins+r.losses+r.draws>0
        and (p_board<>5 or r.wins+r.losses>=5)
      order by value desc, games desc
      limit 50
    ) x;

  -- 6/7. Cumulative counters are incremented once by winCombat after confirmed victory.
  elsif p_board in (6,7) then
    select coalesce(jsonb_agg(to_jsonb(x) order by x.value desc, x.name asc),'[]'::jsonb)
      into rows
    from (
      select p.user_id,
        coalesce(nullif(btrim(p.display_name),''),nullif(btrim(p.username),''),'بازیکن') as name,
        case
          when (s.save_data #>> case when p_board=7 then '{statistics,bossesKilled}' else '{statistics,monstersKilled}' end) ~ '^[0-9]+$'
          then (s.save_data #>> case when p_board=7 then '{statistics,bossesKilled}' else '{statistics,monstersKilled}' end)::bigint
          else 0
        end as value,
        case when p_board=7 then 'باس و مینی‌باس شکست‌داده‌شده'
             else 'هیولای شکست‌داده‌شده پس از پایان موفق نبرد' end as detail,
        s.updated_at
      from public.player_profiles p
      join public.game_saves s on s.user_id=p.user_id
      order by value desc, p.created_at asc
      limit 50
    ) x;

  -- 8. Current wallet balance from the actual save root key used by game.js.
  elsif p_board = 8 then
    select coalesce(jsonb_agg(to_jsonb(x) order by x.value desc, x.name asc),'[]'::jsonb)
      into rows
    from (
      select p.user_id,
        coalesce(nullif(btrim(p.display_name),''),nullif(btrim(p.username),''),'بازیکن') as name,
        case when s.save_data->>'gold' ~ '^[0-9]+([.][0-9]+)?$'
             then (s.save_data->>'gold')::numeric else 0 end as value,
        'موجودی فعلی کیف پول' as detail,
        s.updated_at
      from public.player_profiles p
      join public.game_saves s on s.user_id=p.user_id
      order by value desc
      limit 50
    ) x;

  -- 9. Quest count follows the real game state structures:
  -- mainRegionQuestChains, regionOneNpcQuests, regionQuest, lanternQuest,
  -- oreLedgerQuest, and personalQuests[*].completed (an integer 0..10).
  elsif p_board = 9 then
    select coalesce(jsonb_agg(to_jsonb(x) order by x.value desc, x.name asc),'[]'::jsonb)
      into rows
    from (
      select p.user_id,
        coalesce(nullif(btrim(p.display_name),''),nullif(btrim(p.username),''),'بازیکن') as name,
        (
          case when jsonb_typeof(s.save_data->'mainRegionQuestChains')='object' then
            (select count(*) from jsonb_each(s.save_data->'mainRegionQuestChains') q
             where lower(coalesce(q.value->>'completed','false')) in ('true','1','yes'))
          else case when lower(coalesce(s.save_data #>> '{mainRegionOneQuest,completed}','false')) in ('true','1','yes') then 1 else 0 end end
          + case when jsonb_typeof(s.save_data->'regionOneNpcQuests')='object' then
            (select count(*) from jsonb_each(s.save_data->'regionOneNpcQuests') q
             where lower(coalesce(q.value->>'completed','false')) in ('true','1','yes')) else 0 end
          + case when lower(coalesce(s.save_data #>> '{regionQuest,completed}','false')) in ('true','1','yes') then 1 else 0 end
          + case when lower(coalesce(s.save_data #>> '{lanternQuest,completed}','false')) in ('true','1','yes') then 1 else 0 end
          + case when lower(coalesce(s.save_data #>> '{oreLedgerQuest,completed}','false')) in ('true','1','yes') then 1 else 0 end
          + case when jsonb_typeof(s.save_data->'personalQuests')='object' then
            (select coalesce(sum(case when q.value->>'completed' ~ '^[0-9]+$'
                                      then greatest(0,least(10,(q.value->>'completed')::integer)) else 0 end),0)
             from jsonb_each(s.save_data->'personalQuests') q)
            else 0 end
        )::bigint as value,
        'مجموع زنجیره‌ها، روایت‌های فرعی و مأموریت‌های شخصی تکمیل‌شده' as detail,
        s.updated_at
      from public.player_profiles p
      join public.game_saves s on s.user_id=p.user_id
      order by value desc, p.player_level desc nulls last
      limit 50
    ) x;

  -- 10. Guild membership count from the live guild membership table.
  elsif p_board = 10 then
    select coalesce(jsonb_agg(to_jsonb(x) order by x.value desc, x.name asc),'[]'::jsonb)
      into rows
    from (
      select g.id as guild_id,
        g.name || case when nullif(btrim(g.tag),'') is not null then ' ['||g.tag||']' else '' end as name,
        count(m.user_id)::bigint as value,
        'اعضای فعلی انجمن' as detail
      from public.guilds g
      left join public.guild_members m on m.guild_id=g.id
      group by g.id,g.name,g.tag,g.created_at
      order by value desc,g.created_at asc
      limit 50
    ) x;
  end if;

  return jsonb_build_object(
    'board',p_board,
    'available',true,
    'rows',rows,
    'generated_at',now(),
    'source',case when p_board in (4,5) then 'server_pvp_matches'
                  when p_board=10 then 'guild_members'
                  else 'latest_game_saves' end,
    'note',case when p_board in (4,5)
      then 'PvP از نبردهای نوبتی تکمیل‌شده با گزارش واقعی سرور محاسبه شده است.'
      when p_board=10 then 'تعداد اعضای فعلی انجمن از جدول عضویت خوانده می‌شود.'
      else 'اطلاعات از آخرین ذخیره شخصیت خوانده می‌شود؛ تا زمانی که ذخیره بازی به‌طور کامل سمت سرور اعتبارسنجی نشود، این رتبه‌بندی‌ها ضدتقلب قطعی نیستند.' end
  );
end;
$$;

revoke all on function public.etranom_leaderboards(integer) from public, anon;
grant execute on function public.etranom_leaderboards(integer) to authenticated;
