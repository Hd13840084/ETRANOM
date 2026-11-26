-- ETRANOM OWNER CONTROL V4: schema-aware live data editor
-- Apply after V1, V2 and V3. Review and back up the project first.
begin;

create or replace function public.etranom_admin_table_schema_v1(p_table text)
returns setof jsonb language plpgsql stable security definer set search_path=''
as $$
declare perm text;
begin
  perm := case
    when p_table in ('player_profiles','game_saves','pvp_player_stats') then 'players'
    when p_table in ('etranom_content_regions','etranom_content_monsters','etranom_content_materials','etranom_content_recipes','etranom_recipe_drop_catalog','etranom_exploration_rewards') then 'world'
    when p_table in ('etranom_shared_skill_catalog','party_battle_skill_catalog','wizard_domain_skill_forms_v1929') then 'combat'
    when p_table in ('guilds','market_listings') then 'economy'
    else null end;
  if perm is null then raise exception 'TABLE_NOT_EDITABLE'; end if;
  if not public.etranom_admin_is_authorized_v1(perm) then raise exception 'ADMIN_FORBIDDEN'; end if;
  if to_regclass('public.'||p_table) is null then raise exception 'TABLE_NOT_FOUND'; end if;
  return query
  select jsonb_build_object(
    'column_name',c.column_name,'data_type',c.data_type,'is_nullable',c.is_nullable,
    'is_editable', (c.is_generated='NEVER' and c.is_identity='NO'
      and c.column_name not in ('id','user_id','created_at','updated_at','joined_at','archived_at','sold_at','completed_at','responded_at','created_by','leader_id','seller_id','buyer_id','sender_id','receiver_id','actor_id'))
  )
  from information_schema.columns c
  where c.table_schema='public' and c.table_name=p_table
  order by c.ordinal_position;
end; $$;

create or replace function public.etranom_admin_table_rows_v1(p_table text,p_limit integer default 40,p_offset integer default 0)
returns setof jsonb language plpgsql stable security definer set search_path=''
as $$
declare perm text; pkcols text[]; pkexpr text;
begin
  perm := case
    when p_table in ('player_profiles','game_saves','pvp_player_stats') then 'players'
    when p_table in ('etranom_content_regions','etranom_content_monsters','etranom_content_materials','etranom_content_recipes','etranom_recipe_drop_catalog','etranom_exploration_rewards') then 'world'
    when p_table in ('etranom_shared_skill_catalog','party_battle_skill_catalog','wizard_domain_skill_forms_v1929') then 'combat'
    when p_table in ('guilds','market_listings') then 'economy' else null end;
  if perm is null then raise exception 'TABLE_NOT_EDITABLE'; end if;
  if not public.etranom_admin_is_authorized_v1(perm) then raise exception 'ADMIN_FORBIDDEN'; end if;
  if to_regclass('public.'||p_table) is null then raise exception 'TABLE_NOT_FOUND'; end if;
  select array_agg(a.attname order by k.ordinality) into pkcols
  from pg_index i join unnest(i.indkey) with ordinality k(attnum,ordinality) on true
  join pg_attribute a on a.attrelid=i.indrelid and a.attnum=k.attnum
  where i.indrelid=to_regclass('public.'||p_table) and i.indisprimary;
  if pkcols is null then raise exception 'PRIMARY_KEY_REQUIRED'; end if;
  select string_agg(format('%L, to_jsonb(x)->%L',c,c),',') into pkexpr from unnest(pkcols) c;
  return query execute format(
    'select to_jsonb(x) || jsonb_build_object(''__pk'',jsonb_build_object(%s)) from public.%I x order by to_jsonb(x)::text limit $1 offset $2',
    pkexpr,p_table
  ) using least(greatest(coalesce(p_limit,40),1),100),greatest(coalesce(p_offset,0),0);
end; $$;

create or replace function public.etranom_admin_update_row_v1(p_table text,p_pk jsonb,p_patch jsonb)
returns jsonb language plpgsql security definer set search_path=''
as $$
declare perm text; pkcols text[]; where_sql text; set_sql text; c text; affected int; before_row jsonb; after_row jsonb; bad text;
begin
  perm := case
    when p_table in ('player_profiles','game_saves','pvp_player_stats') then 'players'
    when p_table in ('etranom_content_regions','etranom_content_monsters','etranom_content_materials','etranom_content_recipes','etranom_recipe_drop_catalog','etranom_exploration_rewards') then 'world'
    when p_table in ('etranom_shared_skill_catalog','party_battle_skill_catalog','wizard_domain_skill_forms_v1929') then 'combat'
    when p_table in ('guilds','market_listings') then 'economy' else null end;
  if perm is null then raise exception 'TABLE_NOT_EDITABLE'; end if;
  if not public.etranom_admin_is_authorized_v1(perm) then raise exception 'ADMIN_FORBIDDEN'; end if;
  if jsonb_typeof(p_pk)<>'object' or jsonb_typeof(p_patch)<>'object' or p_patch='{}'::jsonb then raise exception 'INVALID_PATCH'; end if;
  select array_agg(a.attname order by k.ordinality) into pkcols
  from pg_index i join unnest(i.indkey) with ordinality k(attnum,ordinality) on true
  join pg_attribute a on a.attrelid=i.indrelid and a.attnum=k.attnum
  where i.indrelid=to_regclass('public.'||p_table) and i.indisprimary;
  if pkcols is null then raise exception 'PRIMARY_KEY_REQUIRED'; end if;
  if (select count(*) from jsonb_object_keys(p_pk)) <> cardinality(pkcols) then raise exception 'INVALID_PRIMARY_KEY'; end if;
  foreach c in array pkcols loop if not (p_pk ? c) then raise exception 'INVALID_PRIMARY_KEY'; end if; end loop;
  select string_agg(format('to_jsonb(t)->>%L = $1->>%L',c,c),' and ') into where_sql from unnest(pkcols) c;
  select string_agg(format('%I = r.%I',k,k),', ') into set_sql
  from jsonb_object_keys(p_patch) k
  join information_schema.columns ic on ic.table_schema='public' and ic.table_name=p_table and ic.column_name=k
  where ic.is_generated='NEVER' and ic.is_identity='NO'
    and k <> all(pkcols)
    and k not in ('user_id','created_at','updated_at','joined_at','archived_at','sold_at','completed_at','responded_at','created_by','leader_id','seller_id','buyer_id','sender_id','receiver_id','actor_id');
  if set_sql is null then raise exception 'NO_EDITABLE_COLUMNS'; end if;
  select jsonb_agg(k) into bad from jsonb_object_keys(p_patch) k
  where not exists(select 1 from information_schema.columns ic where ic.table_schema='public' and ic.table_name=p_table and ic.column_name=k and ic.is_generated='NEVER' and ic.is_identity='NO' and k<>all(pkcols) and k not in ('user_id','created_at','updated_at','joined_at','archived_at','sold_at','completed_at','responded_at','created_by','leader_id','seller_id','buyer_id','sender_id','receiver_id','actor_id'));
  if bad is not null then raise exception 'PROTECTED_OR_UNKNOWN_COLUMNS: %',bad; end if;
  execute format('select to_jsonb(t) from public.%I t where %s for update',p_table,where_sql) into before_row using p_pk;
  if before_row is null then raise exception 'ROW_NOT_FOUND'; end if;
  execute format('update public.%I t set %s from jsonb_populate_record(null::public.%I,$2) r where %s returning to_jsonb(t)',p_table,set_sql,p_table,where_sql)
    into after_row using p_pk,p_patch;
  insert into public.etranom_admin_audit_logs(actor_id,action,target_type,target_id,details)
  values(auth.uid(),'live_row_update',p_table,p_pk::text,jsonb_build_object('before',before_row,'after',after_row,'changed_columns',p_patch));
  return jsonb_build_object('ok',true,'row',after_row);
end; $$;

revoke all on function public.etranom_admin_table_schema_v1(text) from public,anon;
revoke all on function public.etranom_admin_table_rows_v1(text,integer,integer) from public,anon;
revoke all on function public.etranom_admin_update_row_v1(text,jsonb,jsonb) from public,anon;
grant execute on function public.etranom_admin_table_schema_v1(text) to authenticated;
grant execute on function public.etranom_admin_table_rows_v1(text,integer,integer) to authenticated;
grant execute on function public.etranom_admin_update_row_v1(text,jsonb,jsonb) to authenticated;
commit;
