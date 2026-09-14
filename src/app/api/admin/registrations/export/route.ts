import {
  NextResponse,
} from "next/server";

import {
  getAdminSession,
} from "@/lib/admin/session";
import {
  getAdminAttendeeExport,
} from "@/lib/admin/attendees";

export const runtime =
  "nodejs";

export const dynamic =
  "force-dynamic";

function csvCell(
  value:
    | string
    | number
    | null
    | undefined
) {
  const text =
    String(
      value ?? ""
    );

  return `"${text.replaceAll(
    '"',
    '""'
  )}"`;
}

export async function GET(
  request: Request
) {
  const session =
    await getAdminSession();

  if (!session) {
    return NextResponse.json(
      {
        ok: false,
      },
      {
        status: 401,
      }
    );
  }

  const url =
    new URL(
      request.url
    );

  const rows =
    await getAdminAttendeeExport({
      search:
        url.searchParams.get(
          "q"
        ) ?? "",
      country:
        url.searchParams.get(
          "country"
        ) ?? "all",
      mode:
        url.searchParams.get(
          "mode"
        ) ?? "all",
      emailStatus:
        url.searchParams.get(
          "emailStatus"
        ) ?? "all",
    });

  const header = [
    "Registration Reference",
    "Name",
    "Email",
    "Phone",
    "Country",
    "Country Code",
    "Attendance Mode",
    "Party Size",
    "Invitation Status",
    "Registered At",
  ];

  const csvRows = [
    header.map(
      csvCell
    ).join(","),
    ...rows.map(
      (row) =>
        [
          row.registrationRef,
          row.name,
          row.email,
          row.phone,
          row.country,
          row.countryCode,
          row.ticketType ===
            "in_person"
            ? "In person"
            : "Livestream",
          row.partySize,
          row.invitationStatus ??
            "Not sent",
          row.createdAt,
        ]
          .map(
            csvCell
          )
          .join(",")
    ),
  ];

  const csv =
    "\uFEFF" +
    csvRows.join(
      "\r\n"
    );

  const date =
    new Date()
      .toISOString()
      .slice(
        0,
        10
      );

  return new NextResponse(
    csv,
    {
      status: 200,
      headers: {
        "Content-Type":
          "text/csv; charset=utf-8",
        "Content-Disposition":
          `attachment; filename="mighty-works-registrations-${date}.csv"`,
        "Cache-Control":
          "no-store",
      },
    }
  );
}
