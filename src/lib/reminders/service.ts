import {
  createAdminClient,
} from "@/lib/supabase/admin";
import {
  getReminderForDate,
  type ReminderDefinition,
} from "@/lib/reminders/config";
import {
  sendReminderEmail,
} from "@/lib/reminders/email";

type Registration = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  name: string;
  email: string;
  registration_ref: string | null;
  ticket_type: string;
};

type Delivery = {
  id: string;
  registration_id: string;
  status: string;
  attempt_count: number;
  updated_at: string;
};

export type ReminderRunResult = {
  reminder: string | null;
  eligible: number;
  sent: number;
  failed: number;
  skipped: number;
};

function attendeeName(
  registration: Registration
) {
  return [
    registration.first_name,
    registration.last_name,
  ]
    .filter(Boolean)
    .join(" ")
    .trim() || registration.name;
}

function isClaimable(
  delivery: Delivery,
  now: Date
) {
  if (
    delivery.status === "pending" ||
    delivery.status === "failed"
  ) {
    return delivery.attempt_count < 3;
  }

  if (delivery.status !== "sending") {
    return false;
  }

  const staleBefore =
    now.getTime() - 15 * 60 * 1000;

  return new Date(
    delivery.updated_at
  ).getTime() < staleBefore;
}

async function deliverReminder(
  reminder: ReminderDefinition,
  registration: Registration,
  delivery: Delivery,
  now: Date
) {
  const admin = createAdminClient();

  if (!isClaimable(delivery, now)) {
    return "skipped" as const;
  }

  const attemptAt =
    now.toISOString();

  const {
    data: claimed,
    error: claimError,
  } = await admin
    .from(
      "conference_reminder_deliveries"
    )
    .update({
      status: "sending",
      attempt_count:
        delivery.attempt_count + 1,
      last_attempt_at: attemptAt,
      last_error: null,
    })
    .eq("id", delivery.id)
    .eq(
      "updated_at",
      delivery.updated_at
    )
    .select("id")
    .maybeSingle();

  if (claimError) {
    throw claimError;
  }

  if (!claimed) {
    return "skipped" as const;
  }

  const result =
    await sendReminderEmail({
      to: registration.email,
      attendeeName:
        attendeeName(registration),
      registrationRef:
        registration.registration_ref ??
        "MW26-CONFIRMED",
      attendanceMode:
        registration.ticket_type,
      reminder,
      idempotencyKey:
        `mwc26/${reminder.key}/${registration.id}`,
    });

  const sent =
    result.status === "sent";

  const { error: updateError } =
    await admin
      .from(
        "conference_reminder_deliveries"
      )
      .update({
        status: sent
          ? "sent"
          : "failed",
        sent_at: sent
          ? new Date().toISOString()
          : null,
        email_provider_id:
          result.providerId,
        last_error: result.error,
      })
      .eq("id", delivery.id);

  if (updateError) {
    throw updateError;
  }

  return sent
    ? "sent" as const
    : "failed" as const;
}

export async function runConferenceReminders(
  now = new Date()
): Promise<ReminderRunResult> {
  const reminder =
    getReminderForDate(now);

  if (!reminder) {
    return {
      reminder: null,
      eligible: 0,
      sent: 0,
      failed: 0,
      skipped: 0,
    };
  }

  const admin = createAdminClient();
  const {
    data: registrations,
    error: registrationsError,
  } = await admin
    .from("registrations")
    .select(
      "id,first_name,last_name,name,email,registration_ref,ticket_type"
    )
    .eq(
      "registration_status",
      "confirmed"
    )
    .order("created_at", {
      ascending: true,
    });

  if (registrationsError) {
    throw registrationsError;
  }

  const attendees =
    (registrations ?? []) as Registration[];

  if (attendees.length === 0) {
    return {
      reminder: reminder.key,
      eligible: 0,
      sent: 0,
      failed: 0,
      skipped: 0,
    };
  }

  const { error: seedError } =
    await admin
      .from(
        "conference_reminder_deliveries"
      )
      .upsert(
        attendees.map(
          (registration) => ({
            registration_id:
              registration.id,
            reminder_key:
              reminder.key,
            scheduled_for:
              reminder.scheduledFor,
          })
        ),
        {
          onConflict:
            "registration_id,reminder_key",
          ignoreDuplicates: true,
        }
      );

  if (seedError) {
    throw seedError;
  }

  const {
    data: deliveries,
    error: deliveriesError,
  } = await admin
    .from(
      "conference_reminder_deliveries"
    )
    .select(
      "id,registration_id,status,attempt_count,updated_at"
    )
    .eq(
      "reminder_key",
      reminder.key
    );

  if (deliveriesError) {
    throw deliveriesError;
  }

  const deliveryByRegistration =
    new Map(
      (
        (deliveries ?? []) as Delivery[]
      ).map((delivery) => [
        delivery.registration_id,
        delivery,
      ])
    );

  const results = [];

  for (
    let index = 0;
    index < attendees.length;
    index += 5
  ) {
    const batch =
      attendees.slice(
        index,
        index + 5
      );

    const batchResults =
      await Promise.all(
        batch.map(
          async (registration) => {
            const delivery =
              deliveryByRegistration.get(
                registration.id
              );

            if (!delivery) {
              return "failed" as const;
            }

            return deliverReminder(
              reminder,
              registration,
              delivery,
              now
            );
          }
        )
      );

    results.push(...batchResults);
  }

  return {
    reminder: reminder.key,
    eligible: attendees.length,
    sent: results.filter(
      (result) => result === "sent"
    ).length,
    failed: results.filter(
      (result) => result === "failed"
    ).length,
    skipped: results.filter(
      (result) => result === "skipped"
    ).length,
  };
}
