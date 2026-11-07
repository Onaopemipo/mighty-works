import type {
  ReminderDefinition,
} from "@/lib/reminders/config";

type ReminderEmailInput = {
  to: string;
  attendeeName: string;
  registrationRef: string;
  attendanceMode: string;
  reminder: ReminderDefinition;
  idempotencyKey: string;
};

export type ReminderEmailResult =
  | {
      status: "sent";
      providerId: string | null;
      error: null;
    }
  | {
      status: "failed" | "skipped";
      providerId: null;
      error: string;
    };

function escapeHtml(
  value: string
) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export async function sendReminderEmail(
  input: ReminderEmailInput
): Promise<ReminderEmailResult> {
  const apiKey =
    process.env.RESEND_API_KEY?.trim();

  const from =
    process.env.REGISTRATION_EMAIL_FROM?.trim();

  if (!apiKey || !from) {
    return {
      status: "skipped",
      providerId: null,
      error:
        "Email delivery is not configured.",
    };
  }

  const attendeeName = escapeHtml(
    input.attendeeName
  );
  const registrationRef = escapeHtml(
    input.registrationRef
  );
  const eyebrow = escapeHtml(
    input.reminder.eyebrow
  );
  const headline = escapeHtml(
    input.reminder.headline
  );
  const message = escapeHtml(
    input.reminder.message
  );
  const isLivestream =
    input.attendanceMode ===
    "livestream";
  const isGrandFinale =
    input.reminder.key ===
    "grand_finale";

  const destinationTitle =
    isLivestream
      ? "Joining by livestream"
      : "Where we gather";
  const destinationCopy =
    isLivestream
      ? "Keep this email close and visit the conference website for the latest livestream access details."
      : "Faith Centre · 62 Eastern Rd, Browns Plains QLD 4118";
  const actionUrl = isLivestream
    ? "https://mwc.everwinningaustralia.com.au/#schedule"
    : "https://www.google.com/maps/search/?api=1&query=Faith+Centre+62+Eastern+Rd+Browns+Plains+QLD+4118";
  const actionLabel = isLivestream
    ? "View conference details"
    : "Get directions";

  const html = `
<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width" />
</head>
<body style="margin:0;background:#080719;color:#f9f4e8;font-family:Arial,Helvetica,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#080719;padding:24px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px;background:#111027;border:1px solid #302a4d;border-radius:24px;overflow:hidden;">
          <tr>
            <td style="padding:28px 30px;background:linear-gradient(135deg,#20183d,#7b153f);border-bottom:1px solid #4a3158;">
              <div style="font-size:10px;letter-spacing:3px;text-transform:uppercase;color:#ffb8ca;font-weight:700;">Mighty Works Conference 2026</div>
              <div style="margin-top:10px;font-family:Georgia,serif;font-size:20px;color:#fff8e9;">Everwinning Faith Ministries Australia</div>
            </td>
          </tr>

          <tr>
            <td style="padding:34px 30px 12px;">
              <div style="font-size:11px;letter-spacing:2.6px;text-transform:uppercase;color:#ff5b7f;font-weight:700;">${eyebrow}</div>
              <h1 style="margin:10px 0 0;font-family:Georgia,serif;font-size:38px;line-height:1.08;font-weight:400;color:#fffaf0;">${headline}</h1>
              <p style="margin:18px 0 0;color:#d4ccdc;font-size:15px;line-height:1.75;">Hello ${attendeeName},</p>
              <p style="margin:9px 0 0;color:#d4ccdc;font-size:15px;line-height:1.75;">${message}</p>
            </td>
          </tr>

          <tr>
            <td style="padding:18px 30px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#181630;border:1px solid #3a3458;border-radius:16px;">
                <tr>
                  <td style="padding:18px;border-bottom:1px solid #332e50;">
                    <div style="font-size:9px;letter-spacing:2px;text-transform:uppercase;color:#ff829d;">${isGrandFinale ? "Grand finale" : "Conference begins"}</div>
                    <div style="margin-top:6px;font-family:Georgia,serif;font-size:20px;color:#fff8e9;">${isGrandFinale ? "Sunday · 8 November 2026 · 9:00 AM" : "Saturday · 7 November 2026 · 5:00 PM"}</div>
                    <div style="margin-top:5px;color:#aaa2b7;font-size:12px;">${isGrandFinale ? "Doors open early · Brisbane time" : "Continues Sunday · 8 November · 9:00 AM · Brisbane time"}</div>
                  </td>
                </tr>
                <tr>
                  <td style="padding:18px;">
                    <div style="font-size:9px;letter-spacing:2px;text-transform:uppercase;color:#ff829d;">${destinationTitle}</div>
                    <div style="margin-top:7px;color:#f1e9f5;font-size:14px;line-height:1.55;">${destinationCopy}</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td align="center" style="padding:8px 30px 30px;">
              <a href="${actionUrl}" style="display:inline-block;background:#ed2e68;color:#ffffff;text-decoration:none;padding:14px 24px;border-radius:999px;font-size:13px;font-weight:700;">${actionLabel}</a>
              <div style="margin-top:18px;color:#7f788c;font-size:10px;letter-spacing:1px;">REGISTRATION · ${registrationRef}</div>
            </td>
          </tr>

          <tr>
            <td align="center" style="padding:18px 30px;border-top:1px solid #302a4d;color:#8f879b;font-size:10px;line-height:1.6;">Two days. One gathering. Greater Things.</td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const text = [
    input.reminder.eyebrow,
    input.reminder.headline,
    `Hello ${input.attendeeName},`,
    input.reminder.message,
    isGrandFinale
      ? "The grand finale begins Sunday, 8 November 2026 at 9:00 AM (Brisbane time)."
      : "Conference begins Saturday, 7 November 2026 at 5:00 PM and continues Sunday, 8 November at 9:00 AM (Brisbane time).",
    `${destinationTitle}: ${destinationCopy}`,
    `${actionLabel}: ${actionUrl}`,
    `Registration: ${input.registrationRef}`,
  ].join("\n\n");

  try {
    const response = await fetch(
      "https://api.resend.com/emails",
      {
        method: "POST",
        headers: {
          Authorization:
            `Bearer ${apiKey}`,
          "Content-Type":
            "application/json",
          "Idempotency-Key":
            input.idempotencyKey,
        },
        body: JSON.stringify({
          from,
          to: [input.to],
          subject:
            input.reminder.subject,
          html,
          text,
        }),
      }
    );

    const data =
      (await response.json()) as {
        id?: string;
        message?: string;
        error?: string;
      };

    if (!response.ok) {
      return {
        status: "failed",
        providerId: null,
        error:
          data.message ??
          data.error ??
          "Email provider rejected the reminder.",
      };
    }

    return {
      status: "sent",
      providerId:
        data.id ?? null,
      error: null,
    };
  } catch (error) {
    return {
      status: "failed",
      providerId: null,
      error:
        error instanceof Error
          ? error.message
          : "Unknown reminder delivery error.",
    };
  }
}
