create table if not exists public.conference_reminder_deliveries (
  id uuid primary key default gen_random_uuid(),
  registration_id uuid not null references public.registrations(id) on delete cascade,
  reminder_key text not null check (
    reminder_key = any (array['7_days'::text, '3_days'::text, '1_day'::text, 'event_day'::text])
  ),
  scheduled_for timestamptz not null,
  status text not null default 'pending' check (
    status = any (array['pending'::text, 'sending'::text, 'sent'::text, 'failed'::text])
  ),
  attempt_count integer not null default 0 check (attempt_count >= 0),
  last_attempt_at timestamptz,
  sent_at timestamptz,
  email_provider_id text,
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint conference_reminder_delivery_once unique (registration_id, reminder_key)
);

create index if not exists conference_reminders_due_idx
  on public.conference_reminder_deliveries (reminder_key, status, scheduled_for);

alter table public.conference_reminder_deliveries enable row level security;

revoke all on table public.conference_reminder_deliveries from anon, authenticated;
grant select, insert, update on table public.conference_reminder_deliveries to service_role;

drop trigger if exists conference_reminders_touch_updated_at
  on public.conference_reminder_deliveries;

create trigger conference_reminders_touch_updated_at
before update on public.conference_reminder_deliveries
for each row
execute function private.touch_registration_invitation_updated_at();
