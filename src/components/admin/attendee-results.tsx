import Link from "next/link";

import {
  type AdminAttendeeListRow,
} from "@/lib/admin/attendees";
import {
  countryFlag,
  formatAdminDate,
} from "@/lib/admin/display";

export function AttendeeResults({
  rows,
}: {
  rows:
    AdminAttendeeListRow[];
}) {
  if (!rows.length) {
    return (
      <div className="mw-admin-attendee-empty">
        No registrations match
        the current filters.
      </div>
    );
  }

  return (
    <div className="mw-admin-registration-table-wrap">
      <table className="mw-admin-registration-table mw-admin-directory-table">
        <thead>
          <tr>
            <th>
              Attendee
            </th>

            <th>
              Contact
            </th>

            <th>
              Nation
            </th>

            <th>
              Mode
            </th>

            <th>
              Party
            </th>

            <th>
              Invite
            </th>

            <th>
              Registered
            </th>

            <th />
          </tr>
        </thead>

        <tbody>
          {rows.map(
            (row) => (
              <tr
                key={
                  row.id
                }
              >
                <td>
                  <strong>
                    {
                      row.name
                    }
                  </strong>

                  <span>
                    {
                      row.registrationRef
                    }
                  </span>
                </td>

                <td>
                  <strong className="mw-admin-contact-email">
                    {
                      row.email
                    }
                  </strong>

                  <span>
                    {
                      row.phone ??
                      "No phone"
                    }
                  </span>
                </td>

                <td>
                  <span className="mw-admin-nation-cell">
                    <b>
                      {countryFlag(
                        row.countryCode
                      )}
                    </b>

                    {
                      row.country
                    }
                  </span>
                </td>

                <td>
                  <span className="mw-admin-mode-pill">
                    {row.ticketType ===
                    "in_person"
                      ? "In person"
                      : "Livestream"}
                  </span>
                </td>

                <td>
                  <span className="mw-admin-party-size">
                    {
                      row.partySize
                    }
                  </span>
                </td>

                <td>
                  <span
                    className={[
                      "mw-admin-email-pill",
                      `is-${
                        row.invitationStatus ??
                        "none"
                      }`,
                    ].join(
                      " "
                    )}
                  >
                    {row.invitationStatus ??
                      "Not sent"}
                  </span>
                </td>

                <td>
                  <span className="mw-admin-date-cell">
                    {formatAdminDate(
                      row.createdAt
                    )}
                  </span>
                </td>

                <td>
                  <Link
                    href={
                      `/admin/registrations/${row.id}`
                    }
                    className="mw-admin-view-link"
                  >
                    View
                  </Link>
                </td>
              </tr>
            )
          )}
        </tbody>
      </table>
    </div>
  );
}
