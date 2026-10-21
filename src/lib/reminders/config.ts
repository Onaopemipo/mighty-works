export const REMINDER_KEYS = [
  "7_days",
  "3_days",
  "1_day",
  "event_day",
] as const;

export type ReminderKey =
  (typeof REMINDER_KEYS)[number];

export type ReminderDefinition = {
  key: ReminderKey;
  brisbaneDate: string;
  scheduledFor: string;
  eyebrow: string;
  headline: string;
  subject: string;
  message: string;
};

export const REMINDERS: readonly ReminderDefinition[] = [
  {
    key: "7_days",
    brisbaneDate: "2026-10-31",
    scheduledFor: "2026-10-30T23:00:00.000Z",
    eyebrow: "Seven days to go",
    headline: "The countdown has entered its final week.",
    subject: "7 days to Mighty Works — your seat is waiting",
    message:
      "In one week, voices from across the nations will gather for worship, the Word, prayer and impartation. Begin preparing your heart for Greater Things.",
  },
  {
    key: "3_days",
    brisbaneDate: "2026-11-04",
    scheduledFor: "2026-11-03T23:00:00.000Z",
    eyebrow: "Three days to go",
    headline: "The gathering is almost here.",
    subject: "Only 3 days — Mighty Works is almost here",
    message:
      "The room is being prepared and anticipation is rising. Set this weekend apart, invite expectation in, and come ready for Greater Things.",
  },
  {
    key: "1_day",
    brisbaneDate: "2026-11-06",
    scheduledFor: "2026-11-05T23:00:00.000Z",
    eyebrow: "Tomorrow",
    headline: "One sleep. One gathering. Greater Things.",
    subject: "Tomorrow: Mighty Works Conference 2026",
    message:
      "Tomorrow we gather. Bring your faith, your expectation and an open heart—your place in the room is ready.",
  },
  {
    key: "event_day",
    brisbaneDate: "2026-11-07",
    scheduledFor: "2026-11-06T23:00:00.000Z",
    eyebrow: "Today is the day",
    headline: "Mighty Works begins today.",
    subject: "Today is the day — Mighty Works begins at 5 PM",
    message:
      "The wait is over. Today we step into two days of worship, the Word, prayer and impartation. We cannot wait to welcome you.",
  },
] as const;

export function brisbaneDate(
  date: Date
) {
  return new Intl.DateTimeFormat(
    "en-CA",
    {
      timeZone:
        "Australia/Brisbane",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }
  ).format(date);
}

export function getReminderForDate(
  date: Date
) {
  const localDate =
    brisbaneDate(date);

  return REMINDERS.find(
    (reminder) =>
      reminder.brisbaneDate ===
      localDate
  ) ?? null;
}
