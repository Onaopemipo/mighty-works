-- MW-12A production repair.
--
-- Fix PL/pgSQL ambiguity between registrations.checked_in_at
-- and the checked_in_at RETURNS TABLE output variable.
--
-- Repairs:
--   1. partial scanner arrival
--   2. partial manual arrival
--   3. partial manual departure
--
-- The original MW-12 migration remains immutable.

create or replace function
public.process_registration_checkin_scan_partial(
  p_registration_id uuid,
  p_credential_version integer,
  p_actor_email text,
  p_arrival_count integer
)
returns table (
  outcome text,
  checked_in boolean,
  checked_in_at timestamptz,
  checked_in_count integer,
  party_size integer,
  remaining_count integer
)
language plpgsql
security definer
set search_path to 'public', 'pg_temp'
as $function$
declare
  v_status text;
  v_checked_in_at timestamptz;
  v_checked_in_count integer;
  v_party_size integer;
  v_remaining integer;
  v_new_count integer;
  v_now timestamptz := now();
begin
  select
    r.registration_status,
    r.checked_in_at,
    coalesce(r.checked_in_count, 0),
    greatest(coalesce(r.party_size, 1), 1)
  into
    v_status,
    v_checked_in_at,
    v_checked_in_count,
    v_party_size
  from public.registrations r
  where r.id = p_registration_id
  for update;

  if not found
    or v_status <> 'confirmed'
  then
    return query
      select
        'unavailable'::text,
        false,
        null::timestamptz,
        0,
        0,
        0;

    return;
  end if;

  v_remaining :=
    greatest(
      v_party_size - v_checked_in_count,
      0
    );

  if v_remaining = 0 then
    insert into public.registration_checkin_events (
      registration_id,
      credential_version,
      event_type,
      source,
      actor_email,
      scanned_at,
      metadata
    )
    values (
      p_registration_id,
      p_credential_version,
      'duplicate_scan',
      'scanner',
      lower(trim(p_actor_email)),
      v_now,
      jsonb_build_object(
        'party_size',
        v_party_size,
        'checked_in_count',
        v_checked_in_count,
        'remaining_count',
        0,
        'already_checked_in_at',
        v_checked_in_at
      )
    );

    return query
      select
        'duplicate_scan'::text,
        true,
        v_checked_in_at,
        v_checked_in_count,
        v_party_size,
        0;

    return;
  end if;

  if p_arrival_count < 1
    or p_arrival_count > v_remaining
  then
    return query
      select
        'invalid_arrival_count'::text,
        v_checked_in_count > 0,
        v_checked_in_at,
        v_checked_in_count,
        v_party_size,
        v_remaining;

    return;
  end if;

  v_new_count :=
    v_checked_in_count +
    p_arrival_count;

  update public.registrations as r
  set
    checked_in_count = v_new_count,
    checked_in = true,
    checked_in_at =
      coalesce(r.checked_in_at, v_now)
  where r.id = p_registration_id;

  insert into public.registration_checkin_events (
    registration_id,
    credential_version,
    event_type,
    source,
    actor_email,
    scanned_at,
    metadata
  )
  values (
    p_registration_id,
    p_credential_version,
    'check_in',
    'scanner',
    lower(trim(p_actor_email)),
    v_now,
    jsonb_build_object(
      'arrival_count',
      p_arrival_count,
      'previous_checked_in_count',
      v_checked_in_count,
      'checked_in_count',
      v_new_count,
      'party_size',
      v_party_size,
      'remaining_count',
      greatest(
        v_party_size - v_new_count,
        0
      )
    )
  );

  return query
    select
      case
        when v_new_count < v_party_size
          then 'partial_check_in'
        else 'check_in'
      end::text,
      true,
      coalesce(v_checked_in_at, v_now),
      v_new_count,
      v_party_size,
      greatest(
        v_party_size - v_new_count,
        0
      );
end;
$function$;

create or replace function
public.set_registration_attendance_admin_partial(
  p_registration_id uuid,
  p_action text,
  p_actor_email text,
  p_count integer
)
returns table (
  outcome text,
  checked_in boolean,
  checked_in_at timestamptz,
  checked_in_count integer,
  party_size integer,
  remaining_count integer
)
language plpgsql
security definer
set search_path to 'public', 'pg_temp'
as $function$
declare
  v_status text;
  v_checked_in_at timestamptz;
  v_checked_in_count integer;
  v_party_size integer;
  v_new_count integer;
  v_now timestamptz := now();
begin
  if p_action not in (
    'check_in',
    'check_out'
  ) then
    raise exception
      'invalid attendance action';
  end if;

  if p_count < 1 then
    return query
      select
        'invalid_count'::text,
        false,
        null::timestamptz,
        0,
        0,
        0;

    return;
  end if;

  select
    r.registration_status,
    r.checked_in_at,
    coalesce(r.checked_in_count, 0),
    greatest(coalesce(r.party_size, 1), 1)
  into
    v_status,
    v_checked_in_at,
    v_checked_in_count,
    v_party_size
  from public.registrations r
  where r.id = p_registration_id
  for update;

  if not found
    or v_status <> 'confirmed'
  then
    return query
      select
        'unavailable'::text,
        false,
        null::timestamptz,
        0,
        0,
        0;

    return;
  end if;

  if p_action = 'check_in' then
    if v_checked_in_count >= v_party_size then
      return query
        select
          'already_checked_in'::text,
          true,
          v_checked_in_at,
          v_checked_in_count,
          v_party_size,
          0;

      return;
    end if;

    if v_checked_in_count + p_count >
      v_party_size
    then
      return query
        select
          'invalid_count'::text,
          v_checked_in_count > 0,
          v_checked_in_at,
          v_checked_in_count,
          v_party_size,
          v_party_size -
            v_checked_in_count;

      return;
    end if;

    v_new_count :=
      v_checked_in_count +
      p_count;

    update public.registrations as r
    set
      checked_in_count = v_new_count,
      checked_in = true,
      checked_in_at =
        coalesce(r.checked_in_at, v_now)
    where r.id = p_registration_id;

    insert into public.registration_checkin_events (
      registration_id,
      credential_version,
      event_type,
      source,
      actor_email,
      scanned_at,
      metadata
    )
    values (
      p_registration_id,
      null,
      'check_in',
      'admin_manual',
      lower(trim(p_actor_email)),
      v_now,
      jsonb_build_object(
        'arrival_count',
        p_count,
        'previous_checked_in_count',
        v_checked_in_count,
        'checked_in_count',
        v_new_count,
        'party_size',
        v_party_size,
        'remaining_count',
        v_party_size - v_new_count
      )
    );

    return query
      select
        case
          when v_new_count < v_party_size
            then 'partial_check_in'
          else 'check_in'
        end::text,
        true,
        coalesce(v_checked_in_at, v_now),
        v_new_count,
        v_party_size,
        v_party_size - v_new_count;

    return;
  end if;

  if v_checked_in_count = 0 then
    return query
      select
        'already_checked_out'::text,
        false,
        null::timestamptz,
        0,
        v_party_size,
        v_party_size;

    return;
  end if;

  if p_count > v_checked_in_count then
    return query
      select
        'invalid_count'::text,
        true,
        v_checked_in_at,
        v_checked_in_count,
        v_party_size,
        v_party_size -
          v_checked_in_count;

    return;
  end if;

  v_new_count :=
    v_checked_in_count -
    p_count;

  update public.registrations as r
  set
    checked_in_count = v_new_count,
    checked_in =
      v_new_count > 0,
    checked_in_at =
      case
        when v_new_count = 0
          then null
        else r.checked_in_at
      end
  where r.id = p_registration_id;

  insert into public.registration_checkin_events (
    registration_id,
    credential_version,
    event_type,
    source,
    actor_email,
    scanned_at,
    metadata
  )
  values (
    p_registration_id,
    null,
    'check_out',
    'admin_manual',
    lower(trim(p_actor_email)),
    v_now,
    jsonb_build_object(
      'departure_count',
      p_count,
      'previous_checked_in_count',
      v_checked_in_count,
      'checked_in_count',
      v_new_count,
      'party_size',
      v_party_size,
      'remaining_count',
      v_party_size - v_new_count,
      'previous_checked_in_at',
      v_checked_in_at
    )
  );

  return query
    select
      case
        when v_new_count > 0
          then 'partial_check_out'
        else 'check_out'
      end::text,
      v_new_count > 0,
      case
        when v_new_count = 0
          then null
        else v_checked_in_at
      end,
      v_new_count,
      v_party_size,
      v_party_size - v_new_count;
end;
$function$;

revoke all
  on function
    public.process_registration_checkin_scan_partial(
      uuid,
      integer,
      text,
      integer
    )
  from public, anon, authenticated;

revoke all
  on function
    public.set_registration_attendance_admin_partial(
      uuid,
      text,
      text,
      integer
    )
  from public, anon, authenticated;

grant execute
  on function
    public.process_registration_checkin_scan_partial(
      uuid,
      integer,
      text,
      integer
    )
  to service_role;

grant execute
  on function
    public.set_registration_attendance_admin_partial(
      uuid,
      text,
      text,
      integer
    )
  to service_role;
