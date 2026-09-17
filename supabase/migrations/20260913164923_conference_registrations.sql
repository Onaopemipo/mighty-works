-- Apply once to the selected Greater Works Supabase project.
-- Raw attendee data has no browser-readable policies or public grants.
begin;
create table public.registrations (
 id uuid primary key default gen_random_uuid(),
 name text not null check (char_length(btrim(name)) between 2 and 100),
 email text not null check (char_length(email) <= 254 and email = lower(btrim(email))),
 country text not null check (country ~ '^[A-Z]{2}$'),
 ticket_type text not null check (ticket_type in ('in_person','livestream')),
 created_at timestamptz not null default now(),
 constraint registrations_email_key unique(email)
);
create index registrations_created_at_idx on public.registrations(created_at);
alter table public.registrations enable row level security;
revoke all on public.registrations from anon, authenticated;
grant insert, select on public.registrations to service_role;

create function public.conference_analytics()
returns jsonb
language sql
stable
security invoker
set search_path = ''
as $$
 with local_today as (
  select (now() at time zone 'Australia/Brisbane')::date as day
 ), days as (
  select day - n as day from local_today cross join generate_series(13,0,-1) as n
 ), daily_counts as (
  select (created_at at time zone 'Australia/Brisbane')::date as day, count(*)::integer as total
  from public.registrations
  where created_at >= (((select day from local_today) - 13)::timestamp at time zone 'Australia/Brisbane')
  group by 1
 )
 select jsonb_build_object(
  'total',(select count(*) from public.registrations),
  'countries',coalesce((select jsonb_agg(country order by country) from (select distinct country from public.registrations) countries),'[]'::jsonb),
  'daily',(select jsonb_agg(jsonb_build_object('date',days.day,'count',coalesce(daily_counts.total,0)) order by days.day) from days left join daily_counts using(day))
 );
$$;
revoke all on function public.conference_analytics() from public, anon, authenticated;
grant execute on function public.conference_analytics() to service_role;
-- Do not add registrations to a public Realtime publication.
-- The application polls aggregate-only server responses every 10 seconds and refreshes after a successful insert.
commit;
;
