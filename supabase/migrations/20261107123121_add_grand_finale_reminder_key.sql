alter table public.conference_reminder_deliveries
  drop constraint if exists conference_reminder_deliveries_reminder_key_check;

alter table public.conference_reminder_deliveries
  add constraint conference_reminder_deliveries_reminder_key_check
  check (
    reminder_key = any (
      array[
        '7_days'::text,
        '3_days'::text,
        '1_day'::text,
        'event_day'::text,
        'grand_finale'::text
      ]
    )
  );
