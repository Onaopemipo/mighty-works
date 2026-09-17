create or replace function private.rebuild_registration_stats()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.conference_stats (
    id,
    total_registrations,
    total_attendees,
    countries_represented,
    churches_represented,
    updated_at
  )
  select
    1,
    count(*) filter (where registration_status = 'confirmed')::integer,
    coalesce(sum(party_size) filter (where registration_status = 'confirmed'), 0)::integer,
    count(distinct lower(trim(country))) filter (where registration_status = 'confirmed')::integer,
    count(distinct lower(trim(church_ministry))) filter (
      where registration_status = 'confirmed'
        and church_ministry is not null
        and trim(church_ministry) <> ''
    )::integer,
    now()
  from public.registrations
  on conflict (id) do update set
    total_registrations = excluded.total_registrations,
    total_attendees = excluded.total_attendees,
    countries_represented = excluded.countries_represented,
    churches_represented = excluded.churches_represented,
    updated_at = excluded.updated_at;

  delete from public.country_registration_stats
  where country is not null;

  insert into public.country_registration_stats (
    country,
    country_code,
    registration_count,
    attendee_count,
    updated_at
  )
  select
    min(trim(country)) as country,
    max(country_code) filter (where country_code is not null) as country_code,
    count(*)::integer as registration_count,
    coalesce(sum(party_size), 0)::integer as attendee_count,
    now()
  from public.registrations
  where registration_status = 'confirmed'
  group by lower(trim(country));
end;
$$;

revoke all on function private.rebuild_registration_stats() from public, anon, authenticated;
;
