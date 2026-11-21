-- ETRANOM v169: shared deterministic damage primitive.
-- Safe additive migration: does not replace existing RPCs or change live combat behavior.
-- The next migration will route solo/party/PvP authoritative paths through this function
-- after their mode-specific balance profiles and skill coverage have been reconciled.
begin;

create or replace function public.etranom_combat_resolve_damage(
  p_attack numeric,
  p_defense numeric,
  p_power_scale numeric default 1,
  p_flat_bonus numeric default 0,
  p_variance numeric default 0,
  p_variance_roll numeric default 0,
  p_defense_scale numeric default 1.25,
  p_guard_multiplier numeric default 1,
  p_min_damage integer default 1,
  p_hit_chance numeric default 100,
  p_hit_roll numeric default 0,
  p_crit_chance numeric default 0,
  p_crit_roll numeric default 100,
  p_crit_multiplier numeric default 1.5
) returns jsonb
language plpgsql
immutable
security invoker
set search_path = ''
as $$
declare
  v_attack numeric := greatest(0, coalesce(p_attack,0));
  v_defense numeric := greatest(0, coalesce(p_defense,0));
  v_hit_chance numeric := greatest(0,least(100,coalesce(p_hit_chance,100)));
  v_crit_chance numeric := greatest(0,least(100,coalesce(p_crit_chance,0)));
  v_roll numeric := greatest(0,least(99.999999,coalesce(p_hit_roll,0)));
  v_crit_roll numeric := greatest(0,least(99.999999,coalesce(p_crit_roll,100)));
  v_variance_roll numeric := greatest(0,least(0.999999,coalesce(p_variance_roll,0)));
  v_raw numeric;
  v_damage integer;
  v_critical boolean;
begin
  if v_roll >= v_hit_chance then
    return jsonb_build_object('hit',false,'critical',false,'damage',0,'reason','miss');
  end if;
  v_raw := v_attack * greatest(0,coalesce(p_power_scale,1))
    + coalesce(p_flat_bonus,0)
    + greatest(0,coalesce(p_variance,0)) * v_variance_roll;
  v_damage := greatest(greatest(0,coalesce(p_min_damage,1)),
    floor(v_raw * (100 / (100 + v_defense * greatest(0,coalesce(p_defense_scale,1.25))))
      * greatest(0,least(1,coalesce(p_guard_multiplier,1))))::integer);
  v_critical := v_crit_roll < v_crit_chance;
  if v_critical then
    v_damage := floor(v_damage * greatest(1,coalesce(p_crit_multiplier,1.5)))::integer;
  end if;
  return jsonb_build_object('hit',true,'critical',v_critical,'damage',greatest(0,v_damage),'reason',null);
end;
$$;

revoke all on function public.etranom_combat_resolve_damage(numeric,numeric,numeric,numeric,numeric,numeric,numeric,numeric,integer,numeric,numeric,numeric,numeric,numeric) from public, anon;
grant execute on function public.etranom_combat_resolve_damage(numeric,numeric,numeric,numeric,numeric,numeric,numeric,numeric,integer,numeric,numeric,numeric,numeric,numeric) to authenticated;

commit;
