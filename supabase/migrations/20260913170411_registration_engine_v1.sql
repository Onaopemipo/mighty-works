create schema if not exists private;

alter table public.registrations
  add column if not exists registration_ref text,
  add column if not exists first_name text,
  add column if not exists last_name text,
  add column if not exists phone text,
  add column if not exists country_code text,
  add column if not exists city text,
  add column if not exists state_region text,
  add column if not exists church_ministry text,
  add column if not exists attendee_type text,
  add column if not exists party_size integer not null default 1,
  add column if not exists consent_privacy boolean not null default false,
  add column if not exists consent_updates boolean not null default false,
  add column if not exists registration_status text not null default 'confirmed',
  add column if not exists checked_in boolean not null default false,
  add column if not exists checked_in_at timestamptz,
  add column if not exists updated_at timestamptz not null default now();

alter table public.registrations
  add constraint registrations_party_size_check check (party_size between 1 and 10),
  add constraint registrations_country_code_check check (country_code is null or country_code ~ '^[A-Z]{2}$'),
  add constraint registrations_status_check check (registration_status in ('pending','confirmed','cancelled')),
  add constraint registrations_checkin_consistency check ((checked_in = false and checked_in_at is null) or checked_in = true);

create unique index if not exists registrations_email_unique_idx on public.registrations (lower(email));
create unique index if not exists registrations_ref_unique_idx on public.registrations (registration_ref) where registration_ref is not null;
create index if not exists registrations_created_at_idx on public.registrations (created_at desc);
create index if not exists registrations_country_idx on public.registrations (country);
create index if not exists registrations_country_code_idx on public.registrations (country_code);
create index if not exists registrations_church_idx on public.registrations (church_ministry) where church_ministry is not null;

create or replace function private.make_registration_ref()
returns text language plpgsql security definer set search_path = '' as $$
declare candidate text;
begin
  loop
    candidate := 'MW26-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8));
    exit when not exists (select 1 from public.registrations where registration_ref = candidate);
  end loop;
  return candidate;
end; $$;
revoke all on function private.make_registration_ref() from public, anon, authenticated;

create or replace function private.prepare_registration()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  new.email := lower(trim(new.email));
  new.name := trim(new.name);
  new.country := trim(new.country);
  new.ticket_type := trim(new.ticket_type);
  new.first_name := nullif(trim(coalesce(new.first_name, '')), '');
  new.last_name := nullif(trim(coalesce(new.last_name, '')), '');
  new.phone := nullif(trim(coalesce(new.phone, '')), '');
  new.country_code := upper(nullif(trim(coalesce(new.country_code, '')), ''));
  new.city := nullif(trim(coalesce(new.city, '')), '');
  new.state_region := nullif(trim(coalesce(new.state_region, '')), '');
  new.church_ministry := nullif(trim(coalesce(new.church_ministry, '')), '');
  new.attendee_type := nullif(trim(coalesce(new.attendee_type, '')), '');
  new.registration_ref := coalesce(new.registration_ref, private.make_registration_ref());
  new.updated_at := now();
  return new;
end; $$;
revoke all on function private.prepare_registration() from public, anon, authenticated;
drop trigger if exists registrations_prepare_trigger on public.registrations;
create trigger registrations_prepare_trigger before insert or update on public.registrations for each row execute function private.prepare_registration();

create table public.conference_stats (
  id smallint primary key default 1 check (id = 1),
  total_registrations integer not null default 0 check (total_registrations >= 0),
  total_attendees integer not null default 0 check (total_attendees >= 0),
  countries_represented integer not null default 0 check (countries_represented >= 0),
  churches_represented integer not null default 0 check (churches_represented >= 0),
  updated_at timestamptz not null default now()
);

create table public.country_registration_stats (
  country text primary key,
  country_code text,
  registration_count integer not null default 0 check (registration_count >= 0),
  attendee_count integer not null default 0 check (attendee_count >= 0),
  updated_at timestamptz not null default now(),
  constraint country_stats_country_code_check check (country_code is null or country_code ~ '^[A-Z]{2}$')
);

alter table public.conference_stats enable row level security;
alter table public.country_registration_stats enable row level security;
alter table public.registrations enable row level security;
revoke all on public.registrations from anon, authenticated;
grant insert on public.registrations to anon, authenticated;
revoke all on public.conference_stats from anon, authenticated;
grant select on public.conference_stats to anon, authenticated;
revoke all on public.country_registration_stats from anon, authenticated;
grant select on public.country_registration_stats to anon, authenticated;

create policy "public can register" on public.registrations for insert to anon, authenticated with check (
  length(trim(name)) between 2 and 120
  and email ~* '^[A-Z0-9._%+\-]+@[A-Z0-9.\-]+\.[A-Z]{2,}$'
  and length(trim(country)) between 2 and 100
  and length(trim(ticket_type)) between 1 and 80
  and party_size between 1 and 10
  and registration_status = 'confirmed'
  and checked_in = false
  and checked_in_at is null
);
create policy "public can read conference stats" on public.conference_stats for select to anon, authenticated using (true);
create policy "public can read country stats" on public.country_registration_stats for select to anon, authenticated using (true);

create or replace function private.rebuild_registration_stats()
returns void language plpgsql security definer set search_path = '' as $$
begin
  insert into public.conference_stats (id,total_registrations,total_attendees,countries_represented,churches_represented,updated_at)
  select 1,
    count(*) filter (where registration_status='confirmed')::integer,
    coalesce(sum(party_size) filter (where registration_status='confirmed'),0)::integer,
    count(distinct lower(trim(country))) filter (where registration_status='confirmed')::integer,
    count(distinct lower(trim(church_ministry))) filter (where registration_status='confirmed' and church_ministry is not null and trim(church_ministry)<>'')::integer,
    now()
  from public.registrations
  on conflict (id) do update set total_registrations=excluded.total_registrations,total_attendees=excluded.total_attendees,countries_represented=excluded.countries_represented,churches_represented=excluded.churches_represented,updated_at=excluded.updated_at;
  delete from public.country_registration_stats;
  insert into public.country_registration_stats (country,country_code,registration_count,attendee_count,updated_at)
  select min(trim(country)), max(country_code) filter (where country_code is not null), count(*)::integer, coalesce(sum(party_size),0)::integer, now()
  from public.registrations where registration_status='confirmed' group by lower(trim(country));
end; $$;
revoke all on function private.rebuild_registration_stats() from public, anon, authenticated;

create or replace function private.registration_stats_trigger()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  perform private.rebuild_registration_stats();
  return null;
end; $$;
revoke all on function private.registration_stats_trigger() from public, anon, authenticated;
drop trigger if exists registrations_stats_trigger on public.registrations;
create trigger registrations_stats_trigger after insert or update or delete on public.registrations for each statement execute function private.registration_stats_trigger();

insert into public.conference_stats (id) values (1) on conflict (id) do nothing;
select private.rebuild_registration_stats();;
