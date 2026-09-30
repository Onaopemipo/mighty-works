alter table public.registrations
  add column is_everwinning_australia_member boolean not null default false;

comment on column public.registrations.is_everwinning_australia_member is
  'Whether the registrant answered Yes to membership of Everwinning Australia.';
