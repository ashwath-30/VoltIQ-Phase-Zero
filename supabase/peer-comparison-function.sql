-- Real peer benchmarking, done in a way that respects the row-level
-- security we set up in Step 1. Normally, a user can only SELECT their
-- own rows from `profiles` and `bills` — which is correct and intentional,
-- but it means a plain client-side query can never compare one user
-- against others.
--
-- The fix is this function: it runs with elevated ("security definer")
-- privileges so it CAN see across all users internally, but it only
-- ever returns an aggregate number (a percentile and a count) — never
-- any other user's name, bill amount, or profile details. This is the
-- honest way to build "you're doing better than X% of similar homes":
-- computed from real data across real users, without exposing anyone's
-- individual information to anyone else.

create or replace function public.get_peer_percentile(
  p_home_size integer,
  p_current_kwh numeric
)
returns table(percentile numeric, comparable_homes integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_comparable_count integer;
  v_lower_count integer;
begin
  with comparable_users as (
    select p.id
    from profiles p
    where p.home_size between (p_home_size * 0.8) and (p_home_size * 1.2)
      and p.id != auth.uid()
      and p.home_size > 0
  ),
  latest_bills as (
    select distinct on (b.user_id) b.user_id, b.total_kwh
    from bills b
    where b.user_id in (select id from comparable_users)
    order by b.user_id, b.upload_date desc
  )
  select
    count(*),
    count(*) filter (where total_kwh > p_current_kwh)
  into v_comparable_count, v_lower_count
  from latest_bills;

  -- Fewer than 5 comparable homes isn't enough to produce an honest
  -- percentile — return null rather than a misleadingly precise number.
  if v_comparable_count < 5 then
    return query select null::numeric, v_comparable_count;
  else
    return query select round((v_lower_count::numeric / v_comparable_count) * 100, 0), v_comparable_count;
  end if;
end;
$$;

grant execute on function public.get_peer_percentile(integer, numeric) to authenticated;
