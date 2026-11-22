-- Run only after all v183_part*.sql files have completed.
begin;
do $v183run$
declare v_sql text;
begin
select string_agg(fragment,'' order by part) into v_sql from public.etranom_v183_rpc_staging;
if v_sql is null or (select count(*) from public.etranom_v183_rpc_staging)<>6 then raise exception 'v183_rpc_fragments_incomplete'; end if;
execute v_sql;
end
$v183run$;
revoke all on function public.etranom_party_battle_act(uuid,text,integer) from public,anon;
grant execute on function public.etranom_party_battle_act(uuid,text,integer) to authenticated;
drop table public.etranom_v183_rpc_staging;
commit;
