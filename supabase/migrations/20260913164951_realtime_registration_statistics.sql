-- Apply after 202609130001_registrations.sql.
-- Only aggregate snapshots reach the app. Broadcasts contain no attendee data.
begin;

create or replace function public.conference_analytics()
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
 ), country_counts as (
  select country, count(*)::integer as total from public.registrations group by country
 ), daily_counts as (
  select (created_at at time zone 'Australia/Brisbane')::date as day, count(*)::integer as total
  from public.registrations
  where created_at >= (((select day from local_today) - 13)::timestamp at time zone 'Australia/Brisbane')
  group by 1
 )
 select jsonb_build_object(
  'total',coalesce((select sum(total) from country_counts),0),
  'countries',coalesce((select jsonb_agg(country order by country) from country_counts),'[]'::jsonb),
  'countryCounts',coalesce((select jsonb_agg(jsonb_build_object('country',country,'count',total) order by total desc,country) from country_counts),'[]'::jsonb),
  'daily',(select jsonb_agg(jsonb_build_object('date',days.day,'count',coalesce(daily_counts.total,0)) order by days.day) from days left join daily_counts using(day))
 );
$$;
revoke all on function public.conference_analytics() from public, anon, authenticated;
grant execute on function public.conference_analytics() to service_role;

create schema if not exists conference_private;
revoke all on schema conference_private from public, anon, authenticated;

-- A locked-down trigger helper needs permission to call realtime.send.
-- It has no direct browser entry point and never returns or broadcasts row values.
create or replace function conference_private.notify_registration_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  begin
    perform realtime.send(
      jsonb_build_object('changed',true),
      'registrations_changed',
      'mighty-works-2026',
      false
    );
  exception when others then
    -- Saving a registration must still succeed during a Realtime outage.
    -- Clients also reconcile from the aggregate API and refresh on reconnect.
    raise warning 'Conference Realtime notification unavailable';
  end;
  return null;
end;
$$;
revoke all on function conference_private.notify_registration_change() from public, anon, authenticated;

create trigger conference_registrations_changed
after insert or update or delete or truncate on public.registrations
for each statement execute function conference_private.notify_registration_change();

-- No table grants, RLS policies, or Realtime publication of raw registrations.
-- Public channel payloads are hints only: clients refetch the server aggregate.
commit;
;
