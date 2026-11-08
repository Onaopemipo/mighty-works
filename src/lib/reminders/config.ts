export const REMINDER_KEYS = [
  "7_days",
  "3_days",
  "1_day",
  "event_day",
  "grand_finale",
  "conference_thanks",
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
  {
    key: "grand_finale",
    brisbaneDate: "2026-11-08",
    scheduledFor: "2026-11-07T20:00:00.000Z",
    eyebrow: "The grand finale",
    headline: "Day Two is here. Let’s finish strong together.",
    subject: "Grand Finale today — join us at 9 AM",
    message:
      "Thank you for being part of Mighty Works Conference 2026. This morning we gather for the grand finale—another powerful time of worship, the Word, prayer and impartation. Come expectant, bring someone with you, and let us step into Greater Things together.",
  },
  {
    key: "conference_thanks",
    brisbaneDate: "2026-11-08",
    scheduledFor: "2026-11-08T07:56:00.000Z",
    eyebrow: "With heartfelt appreciation",
    headline: "Thank you for being part of MWC 2026.",
    subject: "Thank You for Being Part of MWC 2026",
    message:
      "What a remarkable time we shared at Mighty Works Conference 2026! On behalf of Everwinning Faith Ministries Australia, thank you for being part of two powerful days of worship, the Word, prayer, fellowship and impartation. Your presence, faith and expectation helped make this gathering truly special. Whether you joined us in person or online, we are grateful that you chose to share this experience with us. As the conference concludes, we pray that everything God began in your life during MWC 2026 will continue to grow and produce lasting fruit. May you walk boldly into Greater Things, strengthened in faith and ready to fulfil God’s purpose for your life. The conference may have ended, but the journey has only just begun.",
  },
] as const;

export function getReminderByKey(
  key: string
) {
  return REMINDERS.find(
    (reminder) => reminder.key === key
  ) ?? null;
}

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
