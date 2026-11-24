-- ETRANOM OWNER CONTROL V6: audited player-save editing and safe catalog CRUD.
-- Apply only after V1-V5 on a backed-up staging database. No live database has been changed by this file.
begin;

create or replace function public.etranom_admin_update_player_save_v1(p_player_id uuid,p_save_data jsonb)
returns jsonb language plpgsql security definer set search_path=''
as $$
declare old_data jsonb; new_data jsonb;
begin
  if auth.uid() is null or not public.etranom_admin_is_authorized_v1('players') then raise exception 'ADMIN_FORBIDDEN'; end if;
  if p_player_id is null then raise exception 'PLAYER_ID_REQUIRED'; end if;
  if jsonb_typeof(p_save_data)<>'object' then raise exception 'SAVE_MUST_BE_OBJECT'; end if;
  select save_data into old_data from public.game_saves where user_id=p_player_id for update;
  if not found then raise exception 'PLAYER_SAVE_NOT_FOUND'; end if;
  update public.game_saves set save_data=p_save_data,updated_at=now() where user_id=p_player_id returning save_data into new_data;
  insert into public.etranom_admin_audit_logs(actor_id,action,target_type,target_id,details)
  values(auth.uid(),'player_save_admin_update','player',p_player_id::text,
    jsonb_build_object('before',old_data,'after',new_data,'warning','Full save replacement by Owner/Admin'));
  return jsonb_build_object('ok',true,'player_id',p_player_id,'updated_at',now());
end; $$;

create or replace function public.etranom_admin_insert_catalog_row_v1(p_table text,p_payload jsonb)
returns jsonb language plpgsql security definer set search_path=''
as $$
declare perm text; cols text; vals text; inserted jsonb;
begin
  perm:=case when p_table in ('etranom_content_regions','etranom_content_monsters','etranom_content_materials','etranom_content_recipes','etranom_recipe_drop_catalog','etranom_exploration_rewards') then 'world'
             when p_table in ('etranom_shared_skill_catalog','party_battle_skill_catalog','wizard_domain_skill_forms_v1929') then 'combat' else null end;
  if perm is null then raise exception 'TABLE_NOT_ALLOWED_FOR_INSERT'; end if;
  if not public.etranom_admin_is_authorized_v1(perm) then raise exception 'ADMIN_FORBIDDEN'; end if;
  if jsonb_typeof(p_payload)<>'object' or not (p_payload ? 'id') then raise exception 'PAYLOAD_OBJECT_WITH_ID_REQUIRED'; end if;
  if to_regclass('public.'||p_table) is null then raise exception 'TABLE_NOT_FOUND'; end if;
  select string_agg(format('%I',k),','),string_agg(format('(jsonb_populate_record(null::public.%I,$1)).%I',p_table,k),',')
    into cols,vals from jsonb_object_keys(p_payload) k
    join information_schema.columns c on c.table_schema='public' and c.table_name=p_table and c.column_name=k
    where c.is_generated='NEVER' and c.is_identity='NO';
  if cols is null or (select count(*) from jsonb_object_keys(p_payload))<>(select count(*) from information_schema.columns c where c.table_schema='public' and c.table_name=p_table and p_payload ? c.column_name and c.is_generated='NEVER' and c.is_identity='NO') then raise exception 'UNKNOWN_OR_PROTECTED_COLUMN'; end if;
  execute format('insert into public.%I as t (%s) values (%s) returning to_jsonb(t)',p_table,cols,vals) into inserted using p_payload;
  insert into public.etranom_admin_audit_logs(actor_id,action,target_type,target_id,details)
  values(auth.uid(),'catalog_row_insert',p_table,coalesce(inserted->>'id',''),jsonb_build_object('after',inserted));
  return jsonb_build_object('ok',true,'row',inserted);
end; $$;

create or replace function public.etranom_admin_delete_catalog_row_v1(p_table text,p_pk jsonb)
returns jsonb language plpgsql security definer set search_path=''
as $$
declare perm text; old_row jsonb; key_name text; key_value text;
begin
  perm:=case when p_table in ('etranom_content_regions','etranom_content_monsters','etranom_content_materials','etranom_content_recipes','etranom_recipe_drop_catalog','etranom_exploration_rewards') then 'world'
             when p_table in ('etranom_shared_skill_catalog','party_battle_skill_catalog','wizard_domain_skill_forms_v1929') then 'combat' else null end;
  if perm is null then raise exception 'TABLE_NOT_ALLOWED_FOR_DELETE'; end if;
  if not public.etranom_admin_is_authorized_v1(perm) then raise exception 'ADMIN_FORBIDDEN'; end if;
  if jsonb_typeof(p_pk)<>'object' or (select count(*) from jsonb_object_keys(p_pk))<>1 then raise exception 'SINGLE_KEY_PRIMARY_KEY_REQUIRED'; end if;
  select k.key_name into key_name from jsonb_object_keys(p_pk) as k(key_name);
  if key_name<>'id' then raise exception 'ONLY_ID_PRIMARY_KEY_SUPPORTED'; end if;
  key_value:=p_pk->>'id';
  execute format('delete from public.%I as t where id::text=$1 returning to_jsonb(t)',p_table) into old_row using key_value;
  if old_row is null then raise exception 'ROW_NOT_FOUND'; end if;
  insert into public.etranom_admin_audit_logs(actor_id,action,target_type,target_id,details)
  values(auth.uid(),'catalog_row_delete',p_table,key_value,jsonb_build_object('before',old_row));
  return jsonb_build_object('ok',true,'deleted_id',key_value);
end; $$;

revoke all on function public.etranom_admin_update_player_save_v1(uuid,jsonb) from public,anon;
revoke all on function public.etranom_admin_insert_catalog_row_v1(text,jsonb) from public,anon;
revoke all on function public.etranom_admin_delete_catalog_row_v1(text,jsonb) from public,anon;
grant execute on function public.etranom_admin_update_player_save_v1(uuid,jsonb) to authenticated;
grant execute on function public.etranom_admin_insert_catalog_row_v1(text,jsonb) to authenticated;
grant execute on function public.etranom_admin_delete_catalog_row_v1(text,jsonb) to authenticated;
commit;
