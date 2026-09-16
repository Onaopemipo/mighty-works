-- MW-12B — Event-day attendance operation idempotency.
--
-- Phase P2B-1A:
--   Schema foundation only.
--
-- operation_id identifies one logical attendance mutation.
-- Historical events remain valid because the column is nullable.
--
-- A partial unique index guarantees that a non-null operation UUID
-- can belong to at most one attendance event.

alter table public.registration_checkin_events
  add column if not exists
    operation_id uuid;

create unique index if not exists
  registration_checkin_events_operation_id_uidx
on public.registration_checkin_events (
  operation_id
)
where operation_id is not null;

-- P2B-1B — scanner partial-attendance idempotency.
--
-- This is an overload of the existing four-argument partial scanner RPC.
-- The existing RPC remains available until the application is migrated.

create or replace function
public.process_registration_checkin_scan_partial(
  p_registration_id uuid,
  p_credential_version integer,
  p_actor_email text,
  p_arrival_count integer,
  p_operation_id uuid
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
  v_current_version integer;
  v_checked_in_at timestamptz;
  v_checked_in_count integer;
  v_party_size integer;
  v_new_count integer;
  v_now timestamptz := now();

  v_existing_metadata jsonb;
begin
  if p_operation_id is null then
    raise exception
      'operation id is required';
  end if;

  if p_arrival_count < 1 then
    return query
      select
        'invalid_count'::text,
        false,
        null::timestamptz,
        0,
        1,
        1;

    return;
  end if;

  /*
   * Fast replay path.
   *
   * If this logical operation already completed, return the
   * previously recorded result without changing attendance.
   */
  select
    e.metadata
  into
    v_existing_metadata
  from public.registration_checkin_events e
  where e.operation_id =
    p_operation_id
  limit 1;

  if found then
    return query
      select
        'duplicate_operation'::text,
        coalesce(
          (
            v_existing_metadata ->
            'checked_in_count'
          )::integer,
          0
        ) > 0,
        nullif(
          v_existing_metadata ->>
            'result_checked_in_at',
          ''
        )::timestamptz,
        coalesce(
          (
            v_existing_metadata ->
            'checked_in_count'
          )::integer,
          0
        ),
        greatest(
          coalesce(
            (
              v_existing_metadata ->
              'party_size'
            )::integer,
            1
          ),
          1
        ),
        greatest(
          coalesce(
            (
              v_existing_metadata ->
              'remaining_count'
            )::integer,
            0
          ),
          0
        );

    return;
  end if;

  select
    r.registration_status,
    r.checked_in_at,
    coalesce(
      r.checked_in_count,
      0
    ),
    greatest(
      coalesce(
        r.party_size,
        1
      ),
      1
    )
  into
    v_status,
    v_checked_in_at,
    v_checked_in_count,
    v_party_size
  from public.registrations r
  where r.id =
    p_registration_id
  for update;

  select
    c.credential_version
  into
    v_current_version
  from public.registration_checkin_credentials c
  where c.registration_id =
    p_registration_id
    and c.revoked_at is null
  order by
    c.credential_version desc
  limit 1;

  if not found
    or v_status <> 'confirmed'
    or v_current_version <>
      p_credential_version
  then
    return query
      select
        'unavailable'::text,
        false,
        null::timestamptz,
        0,
        1,
        1;

    return;
  end if;

  /*
   * Re-check after taking the registration lock.
   * This handles identical concurrent requests.
   */
  select
    e.metadata
  into
    v_existing_metadata
  from public.registration_checkin_events e
  where e.operation_id =
    p_operation_id
  limit 1;

  if found then
    return query
      select
        'duplicate_operation'::text,
        coalesce(
          (
            v_existing_metadata ->
            'checked_in_count'
          )::integer,
          0
        ) > 0,
        nullif(
          v_existing_metadata ->>
            'result_checked_in_at',
          ''
        )::timestamptz,
        coalesce(
          (
            v_existing_metadata ->
            'checked_in_count'
          )::integer,
          0
        ),
        greatest(
          coalesce(
            (
              v_existing_metadata ->
              'party_size'
            )::integer,
            v_party_size
          ),
          1
        ),
        greatest(
          coalesce(
            (
              v_existing_metadata ->
              'remaining_count'
            )::integer,
            v_party_size
          ),
          0
        );

    return;
  end if;

  if v_checked_in_count >=
    v_party_size
  then
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

  if
    v_checked_in_count +
      p_arrival_count >
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
    p_arrival_count;

  update public.registrations as r
  set
    checked_in_count =
      v_new_count,
    checked_in = true,
    checked_in_at =
      coalesce(
        r.checked_in_at,
        v_now
      )
  where r.id =
    p_registration_id;

  insert into public.registration_checkin_events (
    registration_id,
    credential_version,
    event_type,
    source,
    actor_email,
    scanned_at,
    operation_id,
    metadata
  )
  values (
    p_registration_id,
    p_credential_version,
    'check_in',
    'scanner',
    p_actor_email,
    v_now,
    p_operation_id,
    jsonb_build_object(
      'party_size',
      v_party_size,
      'arrival_count',
      p_arrival_count,
      'previous_checked_in_count',
      v_checked_in_count,
      'checked_in_count',
      v_new_count,
      'remaining_count',
      v_party_size -
        v_new_count,
      'previous_checked_in_at',
      v_checked_in_at,
      'result_checked_in_at',
      coalesce(
        v_checked_in_at,
        v_now
      ),
      'operation_id',
      p_operation_id
    )
  );

  return query
    select
      case
        when v_new_count <
          v_party_size
          then 'partial_check_in'
        else 'check_in'
      end::text,
      true,
      coalesce(
        v_checked_in_at,
        v_now
      ),
      v_new_count,
      v_party_size,
      v_party_size -
        v_new_count;
end;
$function$;

revoke all on function
public.process_registration_checkin_scan_partial(
  uuid,
  integer,
  text,
  integer,
  uuid
)
from public;

grant execute on function
public.process_registration_checkin_scan_partial(
  uuid,
  integer,
  text,
  integer,
  uuid
)
to service_role;

-- P2B-1C — manual partial-attendance operation idempotency.
--
-- P2B-1C-A:
--   function signature
--   validation
--   fast replay
--   registration row lock
--   post-lock replay
--
-- IMPORTANT:
--   Function intentionally remains open until P2B-1C-C.

create or replace function
public.set_registration_attendance_admin_partial(
  p_registration_id uuid,
  p_action text,
  p_actor_email text,
  p_count integer,
  p_operation_id uuid
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
  v_existing_metadata jsonb;
begin
  if p_operation_id is null then
    raise exception
      'operation id is required';
  end if;

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
        1,
        1;

    return;
  end if;

  -- Fast replay before acquiring the registration lock.
  select
    e.metadata
  into
    v_existing_metadata
  from public.registration_checkin_events e
  where e.operation_id =
    p_operation_id
  limit 1;

  if found then
    return query
      select
        'duplicate_operation'::text,
        coalesce(
          (
            v_existing_metadata ->
            'checked_in_count'
          )::integer,
          0
        ) > 0,
        nullif(
          v_existing_metadata ->>
            'result_checked_in_at',
          ''
        )::timestamptz,
        coalesce(
          (
            v_existing_metadata ->
            'checked_in_count'
          )::integer,
          0
        ),
        greatest(
          coalesce(
            (
              v_existing_metadata ->
              'party_size'
            )::integer,
            1
          ),
          1
        ),
        greatest(
          coalesce(
            (
              v_existing_metadata ->
              'remaining_count'
            )::integer,
            0
          ),
          0
        );

    return;
  end if;

  select
    r.registration_status,
    r.checked_in_at,
    coalesce(
      r.checked_in_count,
      0
    ),
    greatest(
      coalesce(
        r.party_size,
        1
      ),
      1
    )
  into
    v_status,
    v_checked_in_at,
    v_checked_in_count,
    v_party_size
  from public.registrations r
  where r.id =
    p_registration_id
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
        1,
        1;

    return;
  end if;

  -- Replay check after acquiring the row lock.
  select
    e.metadata
  into
    v_existing_metadata
  from public.registration_checkin_events e
  where e.operation_id =
    p_operation_id
  limit 1;

  if found then
    return query
      select
        'duplicate_operation'::text,
        coalesce(
          (
            v_existing_metadata ->
            'checked_in_count'
          )::integer,
          0
        ) > 0,
        nullif(
          v_existing_metadata ->>
            'result_checked_in_at',
          ''
        )::timestamptz,
        coalesce(
          (
            v_existing_metadata ->
            'checked_in_count'
          )::integer,
          0
        ),
        greatest(
          coalesce(
            (
              v_existing_metadata ->
              'party_size'
            )::integer,
            v_party_size
          ),
          1
        ),
        greatest(
          coalesce(
            (
              v_existing_metadata ->
              'remaining_count'
            )::integer,
            v_party_size
          ),
          0
        );

    return;
  end if;

  -- P2B-1C-B — idempotent manual check-in branch.

  if p_action = 'check_in' then
    if v_checked_in_count >=
      v_party_size
    then
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

    if
      v_checked_in_count +
        p_count >
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
      checked_in_count =
        v_new_count,
      checked_in = true,
      checked_in_at =
        coalesce(
          r.checked_in_at,
          v_now
        )
    where r.id =
      p_registration_id;

    insert into public.registration_checkin_events (
      registration_id,
      credential_version,
      event_type,
      source,
      actor_email,
      scanned_at,
      operation_id,
      metadata
    )
    values (
      p_registration_id,
      null,
      'check_in',
      'admin_manual',
      p_actor_email,
      v_now,
      p_operation_id,
      jsonb_build_object(
        'party_size',
        v_party_size,
        'arrival_count',
        p_count,
        'previous_checked_in_count',
        v_checked_in_count,
        'checked_in_count',
        v_new_count,
        'remaining_count',
        v_party_size -
          v_new_count,
        'previous_checked_in_at',
        v_checked_in_at,
        'result_checked_in_at',
        coalesce(
          v_checked_in_at,
          v_now
        ),
        'operation_id',
        p_operation_id
      )
    );

    return query
      select
        case
          when v_new_count <
            v_party_size
            then 'partial_check_in'
          else 'check_in'
        end::text,
        true,
        coalesce(
          v_checked_in_at,
          v_now
        ),
        v_new_count,
        v_party_size,
        v_party_size -
          v_new_count;

    return;
  end if;

  -- P2B-1C-C — idempotent manual check-out branch.

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

  if p_count >
    v_checked_in_count
  then
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
    checked_in_count =
      v_new_count,
    checked_in =
      v_new_count > 0,
    checked_in_at =
      case
        when v_new_count = 0
          then null
        else r.checked_in_at
      end
  where r.id =
    p_registration_id;

  insert into public.registration_checkin_events (
    registration_id,
    credential_version,
    event_type,
    source,
    actor_email,
    scanned_at,
    operation_id,
    metadata
  )
  values (
    p_registration_id,
    null,
    'check_out',
    'admin_manual',
    p_actor_email,
    v_now,
    p_operation_id,
    jsonb_build_object(
      'party_size',
      v_party_size,
      'departure_count',
      p_count,
      'previous_checked_in_count',
      v_checked_in_count,
      'checked_in_count',
      v_new_count,
      'remaining_count',
      v_party_size -
        v_new_count,
      'previous_checked_in_at',
      v_checked_in_at,
      'result_checked_in_at',
      case
        when v_new_count = 0
          then null
        else v_checked_in_at
      end,
      'operation_id',
      p_operation_id
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
      v_party_size -
        v_new_count;
end;
$function$;

revoke all on function
public.set_registration_attendance_admin_partial(
  uuid,
  text,
  text,
  integer,
  uuid
)
from public;

grant execute on function
public.set_registration_attendance_admin_partial(
  uuid,
  text,
  text,
  integer,
  uuid
)
to service_role;
