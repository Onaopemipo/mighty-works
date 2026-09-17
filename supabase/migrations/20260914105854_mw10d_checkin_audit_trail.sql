create table if not exists public.registration_checkin_events (
  id uuid primary key default gen_random_uuid(),
  registration_id uuid not null references public.registrations(id) on delete cascade,
  credential_version integer null check (credential_version is null or credential_version >= 1),
  event_type text not null check (event_type in ('check_in','duplicate_scan','check_out')),
  source text not null check (source in ('scanner','admin_manual')),
  actor_email text not null,
  scanned_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb
);

alter table public.registration_checkin_events enable row level security;

revoke all on public.registration_checkin_events from anon, authenticated;

grant select, insert on public.registration_checkin_events to service_role;

create index if not exists registration_checkin_events_registration_idx
  on public.registration_checkin_events(registration_id);

create index if not exists registration_checkin_events_scanned_at_idx
  on public.registration_checkin_events(scanned_at desc);

create or replace function public.process_registration_checkin_scan(
  p_registration_id uuid,
  p_credential_version integer,
  p_actor_email text
)
returns table (
  outcome text,
  checked_in boolean,
  checked_in_at timestamptz
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_status text;
  v_checked_in boolean;
  v_checked_in_at timestamptz;
  v_now timestamptz := now();
begin
  select r.registration_status, r.checked_in, r.checked_in_at
    into v_status, v_checked_in, v_checked_in_at
  from public.registrations r
  where r.id = p_registration_id
  for update;

  if not found or v_status <> 'confirmed' then
    return query select 'unavailable'::text, false, null::timestamptz;
    return;
  end if;

  if coalesce(v_checked_in, false) then
    insert into public.registration_checkin_events (
      registration_id,
      credential_version,
      event_type,
      source,
      actor_email,
      scanned_at,
      metadata
    ) values (
      p_registration_id,
      p_credential_version,
      'duplicate_scan',
      'scanner',
      lower(trim(p_actor_email)),
      v_now,
      jsonb_build_object('already_checked_in_at', v_checked_in_at)
    );

    return query select 'duplicate_scan'::text, true, v_checked_in_at;
    return;
  end if;

  update public.registrations
  set checked_in = true,
      checked_in_at = v_now
  where id = p_registration_id;

  insert into public.registration_checkin_events (
    registration_id,
    credential_version,
    event_type,
    source,
    actor_email,
    scanned_at,
    metadata
  ) values (
    p_registration_id,
    p_credential_version,
    'check_in',
    'scanner',
    lower(trim(p_actor_email)),
    v_now,
    '{}'::jsonb
  );

  return query select 'check_in'::text, true, v_now;
end;
$$;

revoke all on function public.process_registration_checkin_scan(uuid, integer, text) from public, anon, authenticated;
grant execute on function public.process_registration_checkin_scan(uuid, integer, text) to service_role;

create or replace function public.set_registration_attendance_admin(
  p_registration_id uuid,
  p_action text,
  p_actor_email text
)
returns table (
  outcome text,
  checked_in boolean,
  checked_in_at timestamptz
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_status text;
  v_checked_in boolean;
  v_checked_in_at timestamptz;
  v_now timestamptz := now();
begin
  if p_action not in ('check_in', 'check_out') then
    raise exception 'invalid attendance action';
  end if;

  select r.registration_status, r.checked_in, r.checked_in_at
    into v_status, v_checked_in, v_checked_in_at
  from public.registrations r
  where r.id = p_registration_id
  for update;

  if not found or v_status <> 'confirmed' then
    return query select 'unavailable'::text, false, null::timestamptz;
    return;
  end if;

  if p_action = 'check_in' then
    if coalesce(v_checked_in, false) then
      return query select 'already_checked_in'::text, true, v_checked_in_at;
      return;
    end if;

    update public.registrations
    set checked_in = true,
        checked_in_at = v_now
    where id = p_registration_id;

    insert into public.registration_checkin_events (
      registration_id,
      credential_version,
      event_type,
      source,
      actor_email,
      scanned_at,
      metadata
    ) values (
      p_registration_id,
      null,
      'check_in',
      'admin_manual',
      lower(trim(p_actor_email)),
      v_now,
      '{}'::jsonb
    );

    return query select 'check_in'::text, true, v_now;
    return;
  end if;

  if not coalesce(v_checked_in, false) then
    return query select 'already_checked_out'::text, false, null::timestamptz;
    return;
  end if;

  update public.registrations
  set checked_in = false,
      checked_in_at = null
  where id = p_registration_id;

  insert into public.registration_checkin_events (
    registration_id,
    credential_version,
    event_type,
    source,
    actor_email,
    scanned_at,
    metadata
  ) values (
    p_registration_id,
    null,
    'check_out',
    'admin_manual',
    lower(trim(p_actor_email)),
    v_now,
    jsonb_build_object('previous_checked_in_at', v_checked_in_at)
  );

  return query select 'check_out'::text, false, null::timestamptz;
end;
$$;

revoke all on function public.set_registration_attendance_admin(uuid, text, text) from public, anon, authenticated;
grant execute on function public.set_registration_attendance_admin(uuid, text, text) to service_role;;
