revoke insert on public.registrations from anon, authenticated;
drop policy if exists "public can register" on public.registrations;

create table if not exists public.registration_rate_limits (
  key_hash text primary key,
  window_started_at timestamptz not null default now(),
  attempt_count integer not null default 0 check (attempt_count >= 0),
  last_attempt_at timestamptz not null default now(),
  blocked_until timestamptz
);

alter table public.registration_rate_limits enable row level security;
revoke all on public.registration_rate_limits from anon, authenticated;

create or replace function public.consume_registration_rate_limit(
  p_key_hash text,
  p_limit integer default 5,
  p_window_seconds integer default 900
)
returns boolean
language plpgsql
security invoker
set search_path = public
as $$
declare
  current_row public.registration_rate_limits%rowtype;
  now_ts timestamptz := now();
  window_interval interval := make_interval(secs => greatest(p_window_seconds, 60));
begin
  if p_key_hash is null or length(trim(p_key_hash)) < 16 then
    return false;
  end if;

  insert into public.registration_rate_limits (
    key_hash,
    window_started_at,
    attempt_count,
    last_attempt_at,
    blocked_until
  ) values (
    p_key_hash,
    now_ts,
    1,
    now_ts,
    null
  )
  on conflict (key_hash) do update set
    window_started_at = case
      when public.registration_rate_limits.window_started_at + window_interval <= now_ts
        then now_ts
      else public.registration_rate_limits.window_started_at
    end,
    attempt_count = case
      when public.registration_rate_limits.window_started_at + window_interval <= now_ts
        then 1
      else public.registration_rate_limits.attempt_count + 1
    end,
    last_attempt_at = now_ts,
    blocked_until = case
      when public.registration_rate_limits.window_started_at + window_interval > now_ts
        and public.registration_rate_limits.attempt_count + 1 > greatest(p_limit, 1)
        then greatest(
          coalesce(public.registration_rate_limits.blocked_until, now_ts),
          public.registration_rate_limits.window_started_at + window_interval
        )
      when public.registration_rate_limits.window_started_at + window_interval <= now_ts
        then null
      else public.registration_rate_limits.blocked_until
    end
  returning * into current_row;

  if current_row.blocked_until is not null and current_row.blocked_until > now_ts then
    return false;
  end if;

  return current_row.attempt_count <= greatest(p_limit, 1);
end;
$$;

revoke all on function public.consume_registration_rate_limit(text, integer, integer) from public, anon, authenticated;
grant execute on function public.consume_registration_rate_limit(text, integer, integer) to service_role;
grant select, insert, update on public.registration_rate_limits to service_role;
grant insert, select on public.registrations to service_role;;
