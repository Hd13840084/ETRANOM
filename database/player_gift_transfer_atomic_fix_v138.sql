-- ETRANOM v138: hardened atomic direct gifts (gold + item stacks).
-- Run after v128 and v131. This replaces only the existing gift RPC.
create or replace function public.etranom_send_player_asset(
  p_receiver uuid,
  p_asset_type text,
  p_item_id text default null,
  p_quantity bigint default 1
) returns jsonb
language plpgsql security definer set search_path=public,pg_temp as $$
declare
  v_sender uuid := auth.uid();
  v_sender_save jsonb;
  v_receiver_save jsonb;
  v_inventory jsonb;
  v_receiver_inventory jsonb;
  v_item jsonb;
  v_item_snapshot jsonb;
  v_found boolean := false;
  v_total bigint := 0;
  v_left bigint;
  v_take bigint;
  v_new_inventory jsonb := '[]'::jsonb;
  v_receiver_new jsonb := '[]'::jsonb;
  v_sender_gold bigint;
  v_receiver_gold bigint;
  v_transfer_id uuid;
begin
  if v_sender is null then raise exception 'not_authenticated'; end if;
  if p_receiver is null or p_receiver=v_sender then raise exception 'invalid_receiver'; end if;
  if p_quantity is null or p_quantity<1 or p_quantity>100000000 then raise exception 'invalid_quantity'; end if;
  if p_asset_type not in ('gold','item') then raise exception 'invalid_asset_type'; end if;
  if p_asset_type='item' and (p_item_id is null or length(btrim(p_item_id))=0 or length(p_item_id)>120) then raise exception 'invalid_item'; end if;

  -- Lock both save rows in deterministic order: all wallet changes below are one transaction.
  perform 1 from public.game_saves
   where user_id in (v_sender,p_receiver)
   order by user_id
   for update;
  select save_data into v_sender_save from public.game_saves where user_id=v_sender;
  select save_data into v_receiver_save from public.game_saves where user_id=p_receiver;
  if v_sender_save is null then raise exception 'sender_save_missing'; end if;
  if v_receiver_save is null then raise exception 'receiver_save_missing'; end if;

  if p_asset_type='gold' then
    v_sender_gold := coalesce(nullif(v_sender_save->>'gold','')::bigint,0);
    v_receiver_gold := coalesce(nullif(v_receiver_save->>'gold','')::bigint,0);
    if v_sender_gold < p_quantity then raise exception 'insufficient_gold'; end if;
    if v_receiver_gold > 9223372036854775807 - p_quantity then raise exception 'receiver_wallet_limit'; end if;
    update public.game_saves
       set save_data=jsonb_set(jsonb_set(v_sender_save,'{gold}',to_jsonb(v_sender_gold-p_quantity),true),'{updatedAt}',to_jsonb(now()::text),true), updated_at=now()
     where user_id=v_sender;
    update public.game_saves
       set save_data=jsonb_set(jsonb_set(v_receiver_save,'{gold}',to_jsonb(v_receiver_gold+p_quantity),true),'{updatedAt}',to_jsonb(now()::text),true), updated_at=now()
     where user_id=p_receiver;
  else
    v_inventory := case when jsonb_typeof(v_sender_save->'inventory')='array' then v_sender_save->'inventory' else '[]'::jsonb end;
    v_receiver_inventory := case when jsonb_typeof(v_receiver_save->'inventory')='array' then v_receiver_save->'inventory' else '[]'::jsonb end;
    for v_item in select value from jsonb_array_elements(v_inventory) loop
      if v_item->>'id'=p_item_id then
        v_total := v_total + greatest(0,coalesce(nullif(v_item->>'qty','')::bigint,1));
        v_found := true;
      end if;
    end loop;
    if not v_found or v_total<p_quantity then raise exception 'insufficient_item'; end if;
    if exists(select 1 from jsonb_array_elements(v_inventory) x where x->>'id'=p_item_id and coalesce((x->>'tradeable')::boolean,true)=false) then raise exception 'item_not_tradeable'; end if;
    v_left := p_quantity;
    for v_item in select value from jsonb_array_elements(v_inventory) loop
      if v_item->>'id'=p_item_id and v_left>0 then
        v_take := least(v_left,greatest(0,coalesce(nullif(v_item->>'qty','')::bigint,1)));
        if v_take>0 then
          if v_item_snapshot is null then v_item_snapshot := v_item-'qty'; end if;
          v_left := v_left-v_take;
          if coalesce(nullif(v_item->>'qty','')::bigint,1)>v_take then
            v_new_inventory := v_new_inventory || jsonb_set(v_item,'{qty}',to_jsonb(coalesce(nullif(v_item->>'qty','')::bigint,1)-v_take),true);
          end if;
        else v_new_inventory := v_new_inventory || v_item; end if;
      else v_new_inventory := v_new_inventory || v_item; end if;
    end loop;
    v_found := false;
    for v_item in select value from jsonb_array_elements(v_receiver_inventory) loop
      if v_item->>'id'=p_item_id and not v_found then
        if coalesce(nullif(v_item->>'qty','')::bigint,1) > 9223372036854775807-p_quantity then raise exception 'receiver_inventory_limit'; end if;
        v_receiver_new := v_receiver_new || jsonb_set(v_item,'{qty}',to_jsonb(coalesce(nullif(v_item->>'qty','')::bigint,1)+p_quantity),true);
        v_found := true;
      else v_receiver_new := v_receiver_new || v_item; end if;
    end loop;
    if not v_found then
      v_receiver_new := v_receiver_new || jsonb_set(coalesce(v_item_snapshot,'{}'::jsonb),'{qty}',to_jsonb(p_quantity),true);
    end if;
    update public.game_saves
       set save_data=jsonb_set(jsonb_set(v_sender_save,'{inventory}',v_new_inventory,true),'{updatedAt}',to_jsonb(now()::text),true),updated_at=now()
     where user_id=v_sender;
    update public.game_saves
       set save_data=jsonb_set(jsonb_set(v_receiver_save,'{inventory}',v_receiver_new,true),'{updatedAt}',to_jsonb(now()::text),true),updated_at=now()
     where user_id=p_receiver;
  end if;

  insert into public.player_asset_transfers(sender_id,receiver_id,asset_type,item_id,item_snapshot,quantity)
  values(v_sender,p_receiver,p_asset_type,case when p_asset_type='item' then p_item_id else null end,v_item_snapshot,p_quantity)
  returning id into v_transfer_id;
  return jsonb_build_object('success',true,'transfer_id',v_transfer_id,'asset_type',p_asset_type,'item_id',case when p_asset_type='item' then p_item_id else null end,'quantity',p_quantity);
end; $$;
revoke all on function public.etranom_send_player_asset(uuid,text,text,bigint) from public,anon;
grant execute on function public.etranom_send_player_asset(uuid,text,text,bigint) to authenticated;
