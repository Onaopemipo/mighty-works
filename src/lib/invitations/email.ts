type InvitationEmailInput = {
  to: string;
  attendeeName: string;
  registrationRef: string;
  country: string;
  invitationUrl: string;
  qrDataUrl: string;
};

export type InvitationEmailResult =
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

export async function sendInvitationEmail(
  input: InvitationEmailInput
): Promise<InvitationEmailResult> {
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

  const attendeeName =
    escapeHtml(input.attendeeName);

  const registrationRef =
    escapeHtml(input.registrationRef);

  const country =
    escapeHtml(input.country);

  const invitationUrl =
    escapeHtml(input.invitationUrl);

  const html = `
<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width" />
</head>
<body style="margin:0;background:#050611;color:#ffffff;font-family:Arial,Helvetica,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#050611;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;background:linear-gradient(145deg,#0b0d20,#13091d);border:1px solid #2c263c;border-radius:24px;overflow:hidden;">
          <tr>
            <td style="padding:36px 34px;border-bottom:1px solid #262536;">
              <div style="font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#ff7d86;">
                Mighty Works Conference · 2026
              </div>
              <div style="margin-top:8px;font-family:Georgia,serif;font-size:24px;">
                Everwinning Faith Ministries Australia
              </div>
            </td>
          </tr>

          <tr>
            <td style="padding:42px 34px 20px;">
              <div style="font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#d4a57d;">
                You're registered
              </div>

              <h1 style="margin:14px 0 0;font-family:Georgia,serif;font-size:56px;line-height:.95;font-weight:400;">
                You're invited.
              </h1>

              <p style="margin:24px 0 0;color:#bdb9c8;font-size:15px;line-height:1.8;">
                <strong style="color:#fff;">${attendeeName}</strong>,
                your place at Mighty Works Conference 2026 is confirmed.
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding:10px 34px 26px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#171128;border:1px solid #342647;border-radius:18px;">
                <tr>
                  <td style="padding:24px;">
                    <div style="font-size:10px;text-transform:uppercase;letter-spacing:2px;color:#ff7d86;">
                      2026 Theme
                    </div>
                    <div style="margin-top:8px;font-family:Georgia,serif;font-size:34px;color:#ff7d86;">
                      Greater Things
                    </div>
                    <div style="margin-top:8px;font-size:11px;color:#8f899b;">
                      Psalm 112:1–2
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding:0 34px 28px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="padding:12px 0;border-bottom:1px solid #242333;color:#85818f;font-size:10px;text-transform:uppercase;letter-spacing:2px;">
                    Registration reference
                  </td>
                  <td align="right" style="padding:12px 0;border-bottom:1px solid #242333;color:#fff;font-weight:700;">
                    ${registrationRef}
                  </td>
                </tr>
                <tr>
                  <td style="padding:12px 0;border-bottom:1px solid #242333;color:#85818f;font-size:10px;text-transform:uppercase;letter-spacing:2px;">
                    Nation
                  </td>
                  <td align="right" style="padding:12px 0;border-bottom:1px solid #242333;color:#fff;">
                    ${country}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding:0 34px 28px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td valign="top" width="50%" style="padding:18px;border:1px solid #29283a;border-radius:14px;">
                    <div style="font-size:10px;color:#8d8997;text-transform:uppercase;letter-spacing:2px;">Saturday</div>
                    <div style="margin-top:8px;font-weight:700;">7 November 2026</div>
                    <div style="margin-top:6px;color:#ff7d86;">5:00 PM</div>
                  </td>
                  <td width="12"></td>
                  <td valign="top" width="50%" style="padding:18px;border:1px solid #29283a;border-radius:14px;">
                    <div style="font-size:10px;color:#8d8997;text-transform:uppercase;letter-spacing:2px;">Sunday</div>
                    <div style="margin-top:8px;font-weight:700;">8 November 2026</div>
                    <div style="margin-top:6px;color:#ff7d86;">9:00 AM</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding:0 34px 30px;">
              <div style="padding:20px;border:1px solid #29283a;border-radius:14px;">
                <div style="font-size:10px;text-transform:uppercase;letter-spacing:2px;color:#8d8997;">Venue</div>
                <div style="margin-top:8px;font-size:18px;font-weight:700;">Faith Center</div>
                <div style="margin-top:5px;color:#b6b2bf;line-height:1.6;">
                  62 Eastern Rd<br />
                  Browns Plains QLD 4118
                </div>
              </div>
            </td>
          </tr>

          <tr>
            <td align="center" style="padding:0 34px 30px;">
              <table role="presentation" cellspacing="0" cellpadding="0" style="background:#ffffff;border-radius:20px;padding:18px;">
                <tr>
                  <td align="center">
                    <img
                      src="${input.qrDataUrl}"
                      alt="Mighty Works secure check-in QR code"
                      width="210"
                      height="210"
                      style="display:block;width:210px;height:210px;border:0;"
                    />
                  </td>
                </tr>
              </table>

              <div style="margin-top:12px;font-size:10px;text-transform:uppercase;letter-spacing:2px;color:#8d8997;">
                Your secure venue check-in code
              </div>

              <div style="margin-top:6px;font-size:11px;color:#b6b2bf;line-height:1.6;">
                Present this QR code at the conference entrance.
              </div>
            </td>
          </tr>

          <tr>
            <td align="center" style="padding:6px 34px 38px;">
              <a href="${invitationUrl}" style="display:inline-block;background:#fc4a53;color:#fff;text-decoration:none;padding:16px 28px;border-radius:999px;font-weight:700;">
                Open your digital invitation
              </a>
            </td>
          </tr>

          <tr>
            <td style="padding:28px 34px;border-top:1px solid #262536;color:#85818f;font-family:Georgia,serif;font-size:18px;font-style:italic;line-height:1.6;">
              “His seed shall be mighty upon earth: the generation of the upright shall be blessed.”
              <div style="margin-top:8px;font-family:Arial,Helvetica,sans-serif;font-size:9px;font-style:normal;text-transform:uppercase;letter-spacing:2px;">
                Psalm 112:2 · KJV
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

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
        },
        body: JSON.stringify({
          from,
          to: [input.to],
          subject:
            "You're registered — Mighty Works Conference 2026",
          html,
        }),
      }
    );

    const data = (await response.json()) as {
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
          "Email provider rejected the message.",
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
          : "Unknown email delivery error.",
    };
  }
}
