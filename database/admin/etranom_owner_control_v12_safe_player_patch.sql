-- ETRANOM Owner Control V12: typed, bounded player-save patches.
-- Requires Owner Control V1-V11. Apply to staging first; does not replace the full save JSON.
begin;

create or replace function public.etranom_admin_patch_player_save_v12(
  p_player_id uuid,
  p_field text,
  p_value jsonb
) returns jsonb
language plpgsql security definer set search_path=''
as $$
declare
  old_data jsonb;
  new_data jsonb;
  n numeric;
  path text[];
  min_n numeric;
  max_n numeric;
  old_value jsonb;
begin
  if auth.uid() is null or not public.etranom_admin_is_authorized_v1('players') then
    raise exception 'ADMIN_FORBIDDEN';
  end if;
  if p_player_id is null then raise exception 'PLAYER_ID_REQUIRED'; end if;
  if p_player_id='f9531c31-8c9f-495d-baf2-d19575982f78'::uuid then
    raise exception 'OWNER_ACCOUNT_PROTECTED';
  end if;
  if jsonb_typeof(p_value)<>'number' then raise exception 'NUMERIC_VALUE_REQUIRED'; end if;
  begin n := (p_value #>> '{}')::numeric;
  exception when others then raise exception 'INVALID_NUMERIC_VALUE'; end;
  if n<>trunc(n) then raise exception 'INTEGER_VALUE_REQUIRED'; end if;

  case p_field
    when 'gold' then path:=array['gold']; min_n:=0; max_n:=1000000000000;
    when 'xp' then path:=array['character','xp']; min_n:=0; max_n:=1000000000000;
    when 'level' then path:=array['character','level']; min_n:=1; max_n:=50;
    when 'hp' then path:=array['character','hp']; min_n:=0; max_n:=1000000;
    when 'mp' then path:=array['character','mp']; min_n:=0; max_n:=1000000;
    when 'stamina' then path:=array['character','stamina']; min_n:=0; max_n:=1000000;
    else raise exception 'PLAYER_FIELD_NOT_ALLOWED';
  end case;
  if n<min_n or n>max_n then raise exception 'VALUE_OUT_OF_RANGE'; end if;

  select save_data into old_data from public.game_saves where user_id=p_player_id for update;
  if not found or jsonb_typeof(old_data)<>'object' then raise exception 'PLAYER_SAVE_NOT_FOUND'; end if;
  if path[1]='character' and jsonb_typeof(old_data->'character')<>'object' then
    raise exception 'CHARACTER_OBJECT_MISSING';
  end if;
  old_value:=old_data #> path;
  new_data:=jsonb_set(old_data,path,to_jsonb(n),true);
  update public.game_saves set save_data=new_data,updated_at=now() where user_id=p_player_id;
  if p_field='level' then
    update public.player_profiles set player_level=n::integer where user_id=p_player_id;
  end if;
  insert into public.etranom_admin_audit_logs(actor_id,action,target_type,target_id,details)
  values(auth.uid(),'player_save_typed_patch','player',p_player_id::text,
    jsonb_build_object('field',p_field,'before',old_value,'after',to_jsonb(n),'bounds',jsonb_build_array(min_n,max_n)));
  return jsonb_build_object('ok',true,'player_id',p_player_id,'field',p_field,'value',n,'updated_at',now());
end; $$;

revoke all on function public.etranom_admin_patch_player_save_v12(uuid,text,jsonb) from public,anon;
grant execute on function public.etranom_admin_patch_player_save_v12(uuid,text,jsonb) to authenticated;
commit;
