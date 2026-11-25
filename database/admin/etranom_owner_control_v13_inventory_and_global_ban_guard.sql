-- ETRANOM Owner Control V13: safe inventory/equipment operations + row-level ban guard.
-- Depends on Owner Control V1-V12 and existing game_saves/player_profiles/etranom_player_bans.
begin;

create or replace function public.etranom_admin_patch_player_inventory_v13(
  p_player_id uuid,
  p_action text,
  p_item_id text default null,
  p_quantity integer default null,
  p_slot text default null
) returns jsonb
language plpgsql security definer set search_path=''
as $$
declare
  data jsonb; inv jsonb; gear jsonb; old_item jsonb; new_inv jsonb;
  idx integer; old_qty integer; new_qty integer; gear_item jsonb;
  allowed_slots text[] := array['mainWeapon','secondaryWeapon','armor','helmet','boots','gloves','greaves','bracer','ring1','ring2','necklace','cloak','emblem'];
begin
  if auth.uid() is null or not public.etranom_admin_is_authorized_v1('players') then raise exception 'ADMIN_FORBIDDEN'; end if;
  if p_player_id is null then raise exception 'PLAYER_ID_REQUIRED'; end if;
  if p_player_id='f9531c31-8c9f-495d-baf2-d19575982f78'::uuid then raise exception 'OWNER_ACCOUNT_PROTECTED'; end if;
  select save_data into data from public.game_saves where user_id=p_player_id for update;
  if not found or jsonb_typeof(data)<>'object' then raise exception 'PLAYER_SAVE_NOT_FOUND'; end if;
  inv:=coalesce(data->'inventory','[]'::jsonb);
  gear:=coalesce(data->'equipmentSlots','{}'::jsonb);
  if jsonb_typeof(inv)<>'array' or jsonb_typeof(gear)<>'object' then raise exception 'PLAYER_INVENTORY_SHAPE_INVALID'; end if;

  if p_action in ('set_quantity','remove') then
    if p_item_id is null or length(p_item_id)<1 or length(p_item_id)>160 then raise exception 'ITEM_ID_REQUIRED'; end if;
    select ordinality::integer, value into idx,old_item
      from jsonb_array_elements(inv) with ordinality as e(value,ordinality)
      where value->>'id'=p_item_id limit 1;
    if idx is null then raise exception 'INVENTORY_ITEM_NOT_FOUND'; end if;
    old_qty:=greatest(0,coalesce((old_item->>'qty')::integer,0));
    if p_action='remove' then new_qty:=0;
    else
      if p_quantity is null or p_quantity<0 or p_quantity>99999 then raise exception 'QUANTITY_OUT_OF_RANGE'; end if;
      new_qty:=p_quantity;
    end if;
    select coalesce(jsonb_agg(case when ordinality=idx then jsonb_set(value,'{qty}',to_jsonb(new_qty),true) else value end order by ordinality) filter(where case when ordinality=idx then new_qty>0 else coalesce((value->>'qty')::integer,0)>0 end),'[]'::jsonb)
      into new_inv from jsonb_array_elements(inv) with ordinality as e(value,ordinality);
    data:=jsonb_set(data,'{inventory}',new_inv,true);
    insert into public.etranom_admin_audit_logs(actor_id,action,target_type,target_id,details)
      values(auth.uid(),'player_inventory_'||p_action,'player',p_player_id::text,jsonb_build_object('item_id',p_item_id,'before_quantity',old_qty,'after_quantity',new_qty,'before_item',old_item));
  elsif p_action='unequip' then
    if p_slot is null or not (p_slot=any(allowed_slots)) then raise exception 'EQUIPMENT_SLOT_NOT_ALLOWED'; end if;
    gear_item:=gear->p_slot;
    if gear_item is null or gear_item='null'::jsonb then raise exception 'EQUIPMENT_SLOT_EMPTY'; end if;
    if coalesce(gear_item->>'id','')='' then raise exception 'EQUIPPED_ITEM_ID_MISSING'; end if;
    select coalesce(jsonb_agg(case when value->>'id'=gear_item->>'id' then jsonb_set(value,'{qty}',to_jsonb(coalesce((value->>'qty')::integer,0)+1),true) else value end order by ordinality),'[]'::jsonb)
      into new_inv from jsonb_array_elements(inv) with ordinality as e(value,ordinality);
    if not exists(select 1 from jsonb_array_elements(inv) e(value) where value->>'id'=gear_item->>'id') then
      new_inv:=inv||jsonb_build_array(jsonb_set(gear_item,'{qty}','1'::jsonb,true));
    end if;
    data:=jsonb_set(jsonb_set(data,'{inventory}',new_inv,true),array['equipmentSlots',p_slot],'null'::jsonb,true);
    insert into public.etranom_admin_audit_logs(actor_id,action,target_type,target_id,details)
      values(auth.uid(),'player_equipment_unequip','player',p_player_id::text,jsonb_build_object('slot',p_slot,'item',gear_item));
  else raise exception 'INVENTORY_ACTION_NOT_ALLOWED'; end if;

  update public.game_saves set save_data=data,updated_at=now() where user_id=p_player_id;
  return jsonb_build_object('ok',true,'player_id',p_player_id,'action',p_action,'inventory',data->'inventory','equipmentSlots',data->'equipmentSlots');
end; $$;

revoke all on function public.etranom_admin_patch_player_inventory_v13(uuid,text,text,integer,text) from public,anon;
grant execute on function public.etranom_admin_patch_player_inventory_v13(uuid,text,text,integer,text) to authenticated;

-- Defense in depth: any authenticated player write to their own save/profile is rejected while banned,
-- regardless of which combat, skill, inventory, or progression RPC initiated that write.
create or replace function public.etranom_reject_banned_self_write_v13()
returns trigger language plpgsql security definer set search_path='' as $$
declare target_id uuid;
begin
  if auth.uid() is null then
    if TG_OP='DELETE' then return OLD; else return NEW; end if;
  end if;
  if TG_OP='DELETE' then target_id:=OLD.user_id; else target_id:=NEW.user_id; end if;
  if target_id=auth.uid()
     and target_id<>'f9531c31-8c9f-495d-baf2-d19575982f78'::uuid
     and exists(select 1 from public.etranom_player_bans b where b.player_id=target_id and b.active and (b.expires_at is null or b.expires_at>now())) then
    raise exception 'PLAYER_BANNED' using errcode='42501';
  end if;
  if TG_OP='DELETE' then return OLD; else return NEW; end if;
end; $$;
revoke all on function public.etranom_reject_banned_self_write_v13() from public,anon;

drop trigger if exists etranom_ban_guard_game_saves_v13 on public.game_saves;
create trigger etranom_ban_guard_game_saves_v13 before insert or update or delete on public.game_saves
for each row execute function public.etranom_reject_banned_self_write_v13();
drop trigger if exists etranom_ban_guard_player_profiles_v13 on public.player_profiles;
create trigger etranom_ban_guard_player_profiles_v13 before insert or update or delete on public.player_profiles
for each row execute function public.etranom_reject_banned_self_write_v13();

commit;
