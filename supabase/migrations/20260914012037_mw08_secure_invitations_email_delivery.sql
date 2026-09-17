create table if not exists public.registration_invitations (
  id uuid primary key default gen_random_uuid(),
  registration_id uuid not null unique references public.registrations(id) on delete cascade,
  token_hash text not null unique,
  token_version smallint not null default 1 check (token_version >= 1),
  expires_at timestamptz not null default '2026-12-08 13:59:59+00'::timestamptz,
  email_status text not null default 'pending' check (email_status = any (array['pending'::text,'sent'::text,'failed'::text,'skipped'::text])),
  email_attempts integer not null default 0 check (email_attempts >= 0),
  last_email_attempt_at timestamptz,
  email_sent_at timestamptz,
  email_provider_id text,
  last_email_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.registration_invitations enable row level security;

revoke all on table public.registration_invitations from anon, authenticated;

grant all on table public.registration_invitations to service_role;

create index if not exists registration_invitations_token_hash_idx
  on public.registration_invitations(token_hash);

create index if not exists registration_invitations_email_status_idx
  on public.registration_invitations(email_status, updated_at desc);

create or replace function private.touch_registration_invitation_updated_at()
returns trigger
language plpgsql
security definer
set search_path = public, private
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists registration_invitations_touch_updated_at on public.registration_invitations;

create trigger registration_invitations_touch_updated_at
before update on public.registration_invitations
for each row
execute function private.touch_registration_invitation_updated_at();;
