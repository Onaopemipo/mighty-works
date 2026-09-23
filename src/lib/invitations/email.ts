type InvitationEmailInput = {
  to: string;
  attendeeName: string;
  registrationRef: string;
  country: string;
  invitationUrl: string;
  qrPngBase64: string;
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

  const photoFrameUrl =
    "https://mwc.everwinningaustralia.com.au/attending";

  const html = `
<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width" />
</head>
<body style="margin:0;background:#f3eee5;color:#17142b;font-family:Arial,Helvetica,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f3eee5;padding:20px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;background:#fffdf8;border:1px solid #ddd4c8;border-radius:20px;overflow:hidden;">
          <tr>
            <td style="padding:24px 26px 18px;border-bottom:1px solid #e6ddd2;">
              <div style="font-size:10px;letter-spacing:2.4px;text-transform:uppercase;color:#c9314c;font-weight:700;">
                Mighty Works Conference 2026 · 8th Edition
              </div>

              <div style="margin-top:7px;font-family:Georgia,serif;font-size:18px;color:#17142b;">
                Everwinning Faith Ministries Australia
              </div>
            </td>
          </tr>

          <tr>
            <td style="padding:24px 26px 12px;">
              <div style="font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#8a5b38;">
                Registration confirmed
              </div>

              <h1 style="margin:8px 0 0;font-family:Georgia,serif;font-size:32px;line-height:1.08;font-weight:400;color:#17142b;">
                Welcome, ${attendeeName}.
              </h1>

              <p style="margin:10px 0 0;color:#4e495c;font-size:14px;line-height:1.55;">
                Your registration is confirmed. Your secure check-in QR is available in your digital invitation and is also attached to this email.
              </p>
            </td>
          </tr>

          <tr>
            <td align="center" style="padding:12px 26px 18px;">
              <table role="presentation" cellspacing="0" cellpadding="0" style="background:#ffffff;border-radius:16px;">
                <tr>
                  <td align="center" style="padding:14px;">
                    <img
                      src="data:image/png;base64,${input.qrPngBase64}"
                      alt="Mighty Works secure check-in QR code"
                      width="190"
                      height="190"
                      style="display:block;width:190px;height:190px;border:0;"
                    />
                  </td>
                </tr>
              </table>

              <div style="margin-top:9px;font-size:10px;text-transform:uppercase;letter-spacing:1.7px;color:#625c6c;">
                Secure venue check-in
              </div>

              <p style="margin:10px auto 0;max-width:430px;color:#625c6c;font-size:12px;line-height:1.55;">
                If the QR image is not visible in your email app, use the attached
                <strong>mighty-works-checkin-qr.png</strong>
                or open your digital invitation below.
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding:0 26px 18px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f7f1e8;border:1px solid #ddd3c7;border-radius:12px;">
                <tr>
            <td style="padding:0 26px 18px;">
              <table
                role="presentation"
                width="100%"
                cellspacing="0"
                cellpadding="0"
                style="background:#f7f1e8;border:1px solid #ddd3c7;border-radius:14px;"
              >
                <tr>
                  <td style="padding:14px 16px 6px;color:#625c6c;font-size:9px;text-transform:uppercase;letter-spacing:1.4px;">
                    Registration
                  </td>

                  <td align="right" style="padding:14px 16px 6px;color:#c9314c;font-size:13px;font-weight:700;">
                    ${registrationRef}
                  </td>
                </tr>

                <tr>
                  <td style="padding:5px 16px 13px;color:#625c6c;font-size:9px;text-transform:uppercase;letter-spacing:1.4px;border-bottom:1px solid #e1d7ca;">
                    Country
                  </td>

                  <td align="right" style="padding:5px 16px 13px;color:#17142b;font-size:13px;border-bottom:1px solid #e1d7ca;">
                    ${country}
                  </td>
                </tr>

                <tr>
                  <td style="padding:13px 16px 5px;color:#625c6c;font-size:9px;text-transform:uppercase;letter-spacing:1.4px;">
                    Saturday · 7 Nov
                  </td>

                  <td align="right" style="padding:13px 16px 5px;color:#c9314c;font-size:14px;font-weight:700;">
                    5:00 PM
                  </td>
                </tr>

                <tr>
                  <td style="padding:5px 16px 13px;color:#625c6c;font-size:9px;text-transform:uppercase;letter-spacing:1.4px;border-bottom:1px solid #e1d7ca;">
                    Sunday · 8 Nov
                  </td>

                  <td align="right" style="padding:5px 16px 13px;color:#c9314c;font-size:14px;font-weight:700;border-bottom:1px solid #e1d7ca;">
                    9:00 AM
                  </td>
                </tr>

                <tr>
                  <td colspan="2" style="padding:13px 16px 14px;">
                    <div style="font-size:9px;color:#625c6c;text-transform:uppercase;letter-spacing:1.4px;">
                      Venue
                    </div>

                    <div style="margin-top:5px;color:#17142b;font-size:14px;font-weight:700;">
                      Faith Center
                    </div>

                    <div style="margin-top:3px;color:#575160;font-size:12px;line-height:1.45;">
                      62 Eastern Rd, Browns Plains QLD 4118
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td align="center" style="padding:2px 26px 22px;">
              <a href="${invitationUrl}" style="display:inline-block;background:#c9314c;color:#ffffff;text-decoration:none;padding:13px 22px;border-radius:999px;font-size:13px;font-weight:700;">
                Open digital invitation & QR
              </a>

            </td>
          </tr>

          <tr>
            <td align="center" style="padding:0 26px 24px;">
              <div style="margin-bottom:8px;color:#625c6c;font-size:11px;line-height:1.5;">
                Show your friends you’re attending.
              </div>

              <a href="${photoFrameUrl}" style="display:inline-block;border:1px solid #453b7a;color:#453b7a;text-decoration:none;padding:11px 19px;border-radius:999px;font-size:12px;font-weight:700;">
                Create Your Photo Frame
              </a>
            </td>
          </tr>

          <tr>
            <td align="center" style="padding:15px 26px;border-top:1px solid #e6ddd2;color:#756e78;font-size:9px;line-height:1.5;">
              Mighty Works Conference 2026 · Everwinning Faith Ministries Australia
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`

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
          attachments: [
            {
              filename:
                "mighty-works-checkin-qr.png",
              content:
                input.qrPngBase64,
              content_type:
                "image/png",
            },
          ],
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
