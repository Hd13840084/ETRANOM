-- ETRANOM v129: atomic, escrow-backed player-to-player barter.
create table if not exists public.player_trade_offers (
 id uuid primary key default gen_random_uuid(),
 proposer_id uuid not null references auth.users(id) on delete cascade,
 receiver_id uuid not null references auth.users(id) on delete cascade,
 proposer_assets jsonb not null,
 receiver_assets jsonb not null,
 status text not null default 'pending' check(status in ('pending','accepted','rejected','cancelled','expired')),
 created_at timestamptz not null default now(), responded_at timestamptz,
 constraint trade_not_self check(proposer_id<>receiver_id)
);
create index if not exists player_trade_offers_proposer_idx on public.player_trade_offers(proposer_id,created_at desc);
create index if not exists player_trade_offers_receiver_idx on public.player_trade_offers(receiver_id,status,created_at desc);
alter table public.player_trade_offers enable row level security;
drop policy if exists "participants read trade offers" on public.player_trade_offers;
create policy "participants read trade offers" on public.player_trade_offers for select to authenticated using(proposer_id=auth.uid() or receiver_id=auth.uid());
revoke all on public.player_trade_offers from anon,public;
grant select on public.player_trade_offers to authenticated;

-- Apply a normalized asset bundle to a save. direction=-1 debits, +1 credits.
create or replace function public.etranom_trade_apply_assets(p_save jsonb,p_assets jsonb,p_direction integer)
returns jsonb language plpgsql set search_path=public,pg_temp as $$
declare v jsonb:=coalesce(p_save,'{}'::jsonb); a jsonb:=coalesce(p_assets,'{}'::jsonb); inv jsonb; it jsonb; v_item jsonb; newinv jsonb:='[]'::jsonb; iid text; q bigint; found boolean; oldq bigint;
begin
 if p_direction not in (-1,1) then raise exception 'invalid_direction'; end if;
 if jsonb_typeof(a)<>'object' then raise exception 'invalid_assets'; end if;
 if coalesce((a->>'gold')::bigint,0)<0 then raise exception 'invalid_gold'; end if;
 if p_direction=-1 and coalesce((v->>'gold')::bigint,0)<coalesce((a->>'gold')::bigint,0) then raise exception 'insufficient_gold'; end if;
 v:=jsonb_set(v,'{gold}',to_jsonb(coalesce((v->>'gold')::bigint,0)+p_direction*coalesce((a->>'gold')::bigint,0)),true);
 inv:=case when jsonb_typeof(v->'inventory')='array' then v->'inventory' else '[]'::jsonb end;
 if jsonb_typeof(coalesce(a->'items','[]'::jsonb))<>'array' then raise exception 'invalid_items'; end if;
 for it in select value from jsonb_array_elements(coalesce(a->'items','[]'::jsonb)) loop
   iid:=it->>'id'; q:=coalesce((it->>'qty')::bigint,0);
   if iid is null or length(iid)=0 or length(iid)>120 or q<1 or q>1000000 then raise exception 'invalid_item_bundle'; end if;
   if p_direction=-1 then
     if exists(select 1 from jsonb_array_elements(inv) as e(value) where value->>'id'=iid and coalesce((value->>'tradeable')::boolean,true)=false) then raise exception 'item_not_tradeable'; end if;
     oldq:=0; for v_item in select value from jsonb_array_elements(inv) as e(value) where value->>'id'=iid loop oldq:=oldq+greatest(0,coalesce((v_item->>'qty')::bigint,1)); end loop;
     if oldq<q then raise exception 'insufficient_item'; end if;
     -- Trade locks exclude equipped items; only inventory assets are tradable.
     found:=false;
     for v_item in select value from jsonb_array_elements(inv) loop
       if v_item->>'id'=iid and not found then
         oldq:=greatest(0,coalesce((v_item->>'qty')::bigint,1));
         if oldq>q then newinv:=newinv||jsonb_set(v_item,'{qty}',to_jsonb(oldq-q),true); q:=0; found:=true;
         else q:=q-oldq; if q=0 then found:=true; end if; end if;
       else newinv:=newinv||v_item; end if;
     end loop;
     inv:=newinv; newinv:='[]'::jsonb;
   else
     found:=false;
     for v_item in select value from jsonb_array_elements(inv) loop
       if v_item->>'id'=iid and not found then newinv:=newinv||jsonb_set(v_item,'{qty}',to_jsonb(greatest(0,coalesce((v_item->>'qty')::bigint,1))+q),true);found:=true;
       else newinv:=newinv||v_item; end if;
     end loop;
     if not found then
       newinv:=newinv||jsonb_set(it,'{qty}',to_jsonb(q),true);
     end if;
     inv:=newinv;newinv:='[]'::jsonb;
   end if;
 end loop;
 return jsonb_set(jsonb_set(v,'{inventory}',inv,true),'{updatedAt}',to_jsonb(now()::text),true);
end $$;


-- Resolve offered item IDs against the authoritative save and retain the real item snapshot.
-- Never trust client-supplied stats, rarity, recipe metadata, or effects.
create or replace function public.etranom_trade_normalize_assets(p_save jsonb,p_requested jsonb)
returns jsonb language plpgsql set search_path=public,pg_temp as $$
declare inv jsonb:=case when jsonb_typeof(p_save->'inventory')='array' then p_save->'inventory' else '[]'::jsonb end; it jsonb; snap jsonb; iid text; q bigint; available bigint; normalized jsonb:='[]'::jsonb; gold bigint;
begin
 if jsonb_typeof(p_requested)<>'object' or jsonb_typeof(coalesce(p_requested->'items','[]'::jsonb))<>'array' then raise exception 'invalid_assets'; end if;
 gold:=coalesce((p_requested->>'gold')::bigint,0); if gold<0 or gold>1000000000000 then raise exception 'invalid_gold'; end if;
 if coalesce((p_save->>'gold')::bigint,0)<gold then raise exception 'insufficient_gold'; end if;
 for it in select value from jsonb_array_elements(coalesce(p_requested->'items','[]'::jsonb)) loop
   iid:=it->>'id'; q:=coalesce((it->>'qty')::bigint,0);
   if iid is null or length(iid)=0 or length(iid)>120 or q<1 or q>1000000 then raise exception 'invalid_item_bundle'; end if;
   if exists(select 1 from jsonb_array_elements(inv) as e(value) where value->>'id'=iid and coalesce((value->>'tradeable')::boolean,true)=false) then raise exception 'item_not_tradeable'; end if;
   select coalesce(sum(greatest(0,coalesce((value->>'qty')::bigint,1))),0) into available from jsonb_array_elements(inv) as e(value) where value->>'id'=iid;
   if available<q then raise exception 'insufficient_item'; end if;
   select value into snap from jsonb_array_elements(inv) as e(value) where value->>'id'=iid limit 1;
   normalized:=normalized||jsonb_set(snap,'{qty}',to_jsonb(q),true);
 end loop;
 return jsonb_build_object('gold',gold,'items',normalized);
end $$;

create or replace function public.etranom_trade_create(p_receiver uuid,p_proposer_assets jsonb,p_receiver_assets jsonb)
returns jsonb language plpgsql security definer set search_path=public,pg_temp as $$
declare me uuid:=auth.uid(); s jsonb; offer_id uuid; v_proposer_assets jsonb; v_receiver_assets jsonb;
begin
 if me is null then raise exception 'not_authenticated'; end if;
 if p_receiver is null or p_receiver=me then raise exception 'invalid_receiver'; end if;
 if jsonb_typeof(p_proposer_assets)<>'object' or jsonb_typeof(p_receiver_assets)<>'object' then raise exception 'invalid_assets'; end if;
 if jsonb_typeof(coalesce(p_proposer_assets->'items','[]'::jsonb))<>'array' or jsonb_typeof(coalesce(p_receiver_assets->'items','[]'::jsonb))<>'array' then raise exception 'invalid_items'; end if;
 if coalesce((p_proposer_assets->>'gold')::bigint,0)<0 or coalesce((p_receiver_assets->>'gold')::bigint,0)<0 then raise exception 'invalid_gold'; end if;
 if coalesce((p_proposer_assets->>'gold')::bigint,0)=0 and jsonb_array_length(coalesce(p_proposer_assets->'items','[]'::jsonb))=0 then raise exception 'empty_offer'; end if;
 if coalesce((p_receiver_assets->>'gold')::bigint,0)=0 and jsonb_array_length(coalesce(p_receiver_assets->'items','[]'::jsonb))=0 then raise exception 'empty_counter_offer'; end if;
 if not exists(select 1 from public.game_saves where user_id=p_receiver) then raise exception 'game_save_missing'; end if;
 perform 1 from public.game_saves where user_id=me for update;
 select save_data into s from public.game_saves where user_id=me;
 if s is null then raise exception 'game_save_missing'; end if;
 v_proposer_assets:=public.etranom_trade_normalize_assets(s,p_proposer_assets);
 v_receiver_assets:=jsonb_build_object('gold',coalesce((p_receiver_assets->>'gold')::bigint,0),'items',coalesce(p_receiver_assets->'items','[]'::jsonb));
 s:=public.etranom_trade_apply_assets(s,v_proposer_assets,-1);
 update public.game_saves set save_data=s,updated_at=now() where user_id=me;
 insert into public.player_trade_offers(proposer_id,receiver_id,proposer_assets,receiver_assets) values(me,p_receiver,v_proposer_assets,v_receiver_assets) returning id into offer_id;
 return jsonb_build_object('success',true,'offer_id',offer_id);
end $$;

create or replace function public.etranom_trade_respond(p_offer uuid,p_accept boolean)
returns jsonb language plpgsql security definer set search_path=public,pg_temp as $$
declare me uuid:=auth.uid(); o public.player_trade_offers%rowtype; proposer_save jsonb; receiver_save jsonb; v_receiver_assets jsonb;
begin
 if me is null then raise exception 'not_authenticated'; end if;
 select * into o from public.player_trade_offers where id=p_offer for update;
 if not found or (me<>o.receiver_id and me<>o.proposer_id) then raise exception 'trade_not_found'; end if;
 if o.status<>'pending' then raise exception 'trade_not_pending'; end if;
 if p_accept and me<>o.receiver_id then raise exception 'only_receiver_can_accept'; end if;
 if not p_accept and me<>o.receiver_id and me<>o.proposer_id then raise exception 'trade_forbidden'; end if;
 perform 1 from public.game_saves where user_id in(o.proposer_id,o.receiver_id) order by user_id for update;
 select save_data into proposer_save from public.game_saves where user_id=o.proposer_id;
 select save_data into receiver_save from public.game_saves where user_id=o.receiver_id;
 if proposer_save is null or receiver_save is null then raise exception 'game_save_missing'; end if;
 if p_accept then
   v_receiver_assets:=public.etranom_trade_normalize_assets(receiver_save,o.receiver_assets);
   receiver_save:=public.etranom_trade_apply_assets(receiver_save,v_receiver_assets,-1);
   proposer_save:=public.etranom_trade_apply_assets(proposer_save,v_receiver_assets,1);
   receiver_save:=public.etranom_trade_apply_assets(receiver_save,o.proposer_assets,1);
   update public.game_saves set save_data=proposer_save,updated_at=now() where user_id=o.proposer_id;
   update public.game_saves set save_data=receiver_save,updated_at=now() where user_id=o.receiver_id;
   update public.player_trade_offers set status='accepted',responded_at=now() where id=p_offer;
 else
   proposer_save:=public.etranom_trade_apply_assets(proposer_save,o.proposer_assets,1);
   update public.game_saves set save_data=proposer_save,updated_at=now() where user_id=o.proposer_id;
   update public.player_trade_offers set status=case when me=o.proposer_id then 'cancelled' else 'rejected' end,responded_at=now() where id=p_offer;
 end if;
 return jsonb_build_object('success',true,'status',case when p_accept then 'accepted' when me=o.proposer_id then 'cancelled' else 'rejected' end);
end $$;
revoke all on function public.etranom_trade_apply_assets(jsonb,jsonb,integer) from public,anon,authenticated;
revoke all on function public.etranom_trade_normalize_assets(jsonb,jsonb) from public,anon,authenticated;
revoke all on function public.etranom_trade_create(uuid,jsonb,jsonb) from public,anon;
revoke all on function public.etranom_trade_respond(uuid,boolean) from public,anon;
grant execute on function public.etranom_trade_create(uuid,jsonb,jsonb) to authenticated;
grant execute on function public.etranom_trade_respond(uuid,boolean) to authenticated;
