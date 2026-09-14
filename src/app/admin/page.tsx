import {
  Activity,
  CircleAlert,
  Clock3,
  DoorOpen,
  Globe2,
  LogOut,
  MailCheck,
  Radio,
  ShieldCheck,
  UserCheck,
  UsersRound,
} from "lucide-react";
import {
  redirect,
} from "next/navigation";

import {
  getAdminSession,
} from "@/lib/admin/session";
import {
  getAdminDashboardData,
} from "@/lib/admin/dashboard";
import {
  countryFlag,
  formatAdminDate,
} from "@/lib/admin/display";
import {
  getAdminAttendeeList,
} from "@/lib/admin/attendees";
import {
  AttendeeFilters,
} from "@/components/admin/attendee-filters";
import {
  AttendeeResults,
} from "@/components/admin/attendee-results";
import {
  AdminAutoRefresh,
} from "@/components/admin/admin-auto-refresh";

export const dynamic =
  "force-dynamic";

function MetricCard({
  label,
  value,
  note,
  icon,
}: {
  label: string;
  value: number;
  note: string;
  icon:
    React.ReactNode;
}) {
  return (
    <article className="mw-admin-metric-card">
      <div className="mw-admin-metric-top">
        <span>
          {label}
        </span>

        <div>
          {icon}
        </div>
      </div>

      <strong>
        {value.toLocaleString()}
      </strong>

      <p>
        {note}
      </p>
    </article>
  );
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    country?: string;
    mode?: string;
    emailStatus?: string;
    page?: string;
  }>;
}) {
  const session =
    await getAdminSession();

  if (!session) {
    redirect(
      "/admin/login"
    );
  }

  const query =
    await searchParams;

  const [
    data,
    attendeeDirectory,
  ] =
    await Promise.all([
      getAdminDashboardData(),
      getAdminAttendeeList({
        search:
          query.q ?? "",
        country:
          query.country ??
          "all",
        mode:
          query.mode ??
          "all",
        emailStatus:
          query.emailStatus ??
          "all",
        page:
          Number(
            query.page ??
            "1"
          ),
        pageSize: 25,
      }),
    ]);

  const maxActivity =
    Math.max(
      ...data.activity.map(
        (item) =>
          item.registrations
      ),
      1
    );

  return (
    <main className="mw-admin-shell">
      <header className="mw-admin-header">
        <div>
          <p>
            Mighty Works · 2026
          </p>

          <h1>
            Registration
            <br />
            Command Centre
          </h1>
        </div>

        <div className="mw-admin-header-actions">
          <AdminAutoRefresh />

          <span>
            <ShieldCheck
              size={16}
            />

            {session.email}
          </span>

          <form
            action="/api/admin/logout"
            method="post"
          >
            <button
              type="submit"
            >
              <LogOut
                size={16}
              />
              Logout
            </button>
          </form>
        </div>
      </header>

      <section className="mw-admin-command-status">
        <div>
          <i />

          <span>
            Live operations
          </span>
        </div>

        <p>
          Registration intelligence
          · Brisbane time
        </p>
      </section>

      <section className="mw-admin-metric-grid">
        <MetricCard
          label="Registrations"
          value={
            data.metrics
              .registrations
          }
          note="Confirmed registrations"
          icon={
            <UsersRound
              size={20}
            />
          }
        />

        <MetricCard
          label="Attendees"
          value={
            data.metrics
              .attendees
          }
          note="Including party sizes"
          icon={
            <Activity
              size={20}
            />
          }
        />

        <MetricCard
          label="Nations"
          value={
            data.metrics
              .nations
          }
          note="Countries represented"
          icon={
            <Globe2
              size={20}
            />
          }
        />

        <MetricCard
          label="In person"
          value={
            data.metrics
              .inPerson
          }
          note="Venue registrations"
          icon={
            <ShieldCheck
              size={20}
            />
          }
        />

        <MetricCard
          label="Livestream"
          value={
            data.metrics
              .livestream
          }
          note="Online registrations"
          icon={
            <Radio
              size={20}
            />
          }
        />
      </section>

      <section className="mw-admin-venue-ops">
        <article className="mw-admin-venue-hero">
          <div className="mw-admin-venue-copy">
            <p>
              Venue operations
            </p>

            <h2>
              Live attendance
            </h2>

            <span>
              Real-time operational view of arrivals and expected in-person attendance.
            </span>
          </div>

          <div className="mw-admin-attendance-ring">
            <div
              style={{
                "--attendance":
                  `${
                    Math.min(
                      data.metrics
                        .attendancePercent,
                      100
                    )
                  }%`,
              } as React.CSSProperties}
            >
              <strong>
                {
                  data.metrics
                    .attendancePercent
                }%
              </strong>

              <span>
                arrived
              </span>
            </div>
          </div>
        </article>

        <article className="mw-admin-venue-stat">
          <UserCheck
            size={21}
          />

          <span>
            Checked in
          </span>

          <strong>
            {
              data.metrics
                .checkedInAttendees
          }
          </strong>

          <p>
            {
              data.metrics
                .checkedInRegistrations
            } registrations
          </p>
        </article>

        <article className="mw-admin-venue-stat">
          <DoorOpen
            size={21}
          />

          <span>
            Expected
          </span>

          <strong>
            {
              data.metrics
                .expectedInPersonAttendees
            }
          </strong>

          <p>
            In-person attendees
          </p>
        </article>
      </section>

      <section className="mw-admin-live-ops-grid">
        <article className="mw-admin-panel">
          <header>
            <div>
              <p>
                Arrival feed
              </p>

              <h2>
                Latest check-ins
              </h2>
            </div>

            <Clock3
              size={22}
            />
          </header>

          <div className="mw-admin-arrival-feed">
            {data.recentCheckIns.length ? (
              data.recentCheckIns.map(
                (arrival) => (
                  <div
                    key={
                      arrival.id
                    }
                  >
                    <b>
                      {countryFlag(
                        arrival.countryCode
                      )}
                    </b>

                    <div>
                      <strong>
                        {
                          arrival.name
                        }
                      </strong>

                      <span>
                        {
                          arrival.registrationRef
                        }
                        {" · "}
                        {
                          arrival.partySize
                        } attendee
                        {arrival.partySize ===
                        1
                          ? ""
                          : "s"}
                      </span>
                    </div>

                    <time>
                      {new Intl.DateTimeFormat(
                        "en-AU",
                        {
                          timeZone:
                            "Australia/Brisbane",
                          hour:
                            "numeric",
                          minute:
                            "2-digit",
                        }
                      ).format(
                        new Date(
                          arrival.checkedInAt
                        )
                      )}
                    </time>
                  </div>
                )
              )
            ) : (
              <div className="mw-admin-empty">
                No venue arrivals yet.
              </div>
            )}
          </div>
        </article>

        <article className="mw-admin-panel">
          <header>
            <div>
              <p>
                Country arrivals
              </p>

              <h2>
                Nations on site
              </h2>
            </div>

            <Globe2
              size={22}
            />
          </header>

          <div className="mw-admin-country-arrivals">
            {data.countryArrivals.length ? (
              data.countryArrivals
                .slice(
                  0,
                  10
                )
                .map(
                  (country) => {
                    const percent =
                      country.expectedAttendees >
                      0
                        ? Math.round(
                            (
                              country.checkedInAttendees /
                              country.expectedAttendees
                            ) *
                              100
                          )
                        : 0;

                    return (
                      <div
                        key={
                          country.countryCode ??
                          country.country
                        }
                      >
                        <div>
                          <b>
                            {countryFlag(
                              country.countryCode
                            )}
                          </b>

                          <strong>
                            {
                              country.country
                            }
                          </strong>

                          <span>
                            {
                              country.checkedInAttendees
                            }
                            /
                            {
                              country.expectedAttendees
                            }
                          </span>
                        </div>

                        <div className="mw-admin-country-progress">
                          <i
                            style={{
                              width:
                                `${Math.min(
                                  percent,
                                  100
                                )}%`,
                            }}
                          />
                        </div>
                      </div>
                    );
                  }
                )
            ) : (
              <div className="mw-admin-empty">
                No in-person registrations yet.
              </div>
            )}
          </div>
        </article>
      </section>

      <section className="mw-admin-dashboard-grid">
        <article className="mw-admin-panel mw-admin-activity-panel">
          <header>
            <div>
              <p>
                Registration velocity
              </p>

              <h2>
                Daily activity
              </h2>
            </div>

            <span>
              Last 14 active days
            </span>
          </header>

          {data.activity.length ? (
            <div className="mw-admin-activity-chart">
              {data.activity.map(
                (item) => {
                  const height =
                    Math.max(
                      (
                        item.registrations /
                        maxActivity
                      ) *
                        100,
                      8
                    );

                  return (
                    <div
                      key={
                        item.date
                      }
                      className="mw-admin-activity-column"
                    >
                      <div className="mw-admin-activity-value">
                        {
                          item.registrations
                        }
                      </div>

                      <div className="mw-admin-activity-track">
                        <i
                          style={{
                            height:
                              `${height}%`,
                          }}
                        />
                      </div>

                      <span>
                        {new Intl.DateTimeFormat(
                          "en-AU",
                          {
                            day:
                              "numeric",
                            month:
                              "short",
                          }
                        ).format(
                          new Date(
                            `${item.date}T00:00:00+10:00`
                          )
                        )}
                      </span>
                    </div>
                  );
                }
              )}
            </div>
          ) : (
            <div className="mw-admin-empty">
              No registration
              activity yet.
            </div>
          )}
        </article>

        <article className="mw-admin-panel mw-admin-email-panel">
          <header>
            <div>
              <p>
                Invitation delivery
              </p>

              <h2>
                Email health
              </h2>
            </div>

            <MailCheck
              size={22}
            />
          </header>

          <div className="mw-admin-email-health">
            <div>
              <span>
                Sent
              </span>

              <strong>
                {
                  data.metrics
                    .emailsSent
                }
              </strong>
            </div>

            <div>
              <span>
                Failed
              </span>

              <strong>
                {
                  data.metrics
                    .emailsFailed
                }
              </strong>
            </div>
          </div>

          {data.metrics
            .emailsFailed >
          0 ? (
            <div className="mw-admin-warning">
              <CircleAlert
                size={17}
              />

              Some invitation
              emails require
              attention.
            </div>
          ) : (
            <div className="mw-admin-good">
              <ShieldCheck
                size={17}
              />

              No failed invitation
              deliveries.
            </div>
          )}
        </article>
      </section>

      <section className="mw-admin-dashboard-grid mw-admin-secondary-grid">
        <article className="mw-admin-panel mw-admin-country-panel">
          <header>
            <div>
              <p>
                Global gathering
              </p>

              <h2>
                Nations
              </h2>
            </div>

            <Globe2
              size={22}
            />
          </header>

          <div className="mw-admin-country-list">
            {data.countries
              .slice(0, 10)
              .map(
                (
                  country,
                  index
                ) => (
                  <div
                    key={
                      country.country
                    }
                  >
                    <span className="mw-admin-country-rank">
                      {String(
                        index + 1
                      ).padStart(
                        2,
                        "0"
                      )}
                    </span>

                    <b>
                      {countryFlag(
                        country.countryCode
                      )}
                    </b>

                    <strong>
                      {
                        country.country
                      }
                    </strong>

                    <span>
                      {
                        country.attendees
                      }{" "}
                      attendee
                      {country.attendees ===
                      1
                        ? ""
                        : "s"}
                    </span>
                  </div>
                )
              )}
          </div>
        </article>

        <article className="mw-admin-panel mw-admin-recent-panel">
          <header>
            <div>
              <p>
                Latest activity
              </p>

              <h2>
                Recent registrations
              </h2>
            </div>

            <span>
              {
                data.recent
                  .length
              }{" "}
              shown
            </span>
          </header>

          <div className="mw-admin-registration-table-wrap">
            <table className="mw-admin-registration-table">
              <thead>
                <tr>
                  <th>
                    Attendee
                  </th>
                  <th>
                    Nation
                  </th>
                  <th>
                    Mode
                  </th>
                  <th>
                    Invite
                  </th>
                  <th>
                    Registered
                  </th>
                </tr>
              </thead>

              <tbody>
                {data.recent.map(
                  (registration) => (
                    <tr
                      key={
                        registration.id
                      }
                    >
                      <td>
                        <strong>
                          {
                            registration.name
                          }
                        </strong>

                        <span>
                          {
                            registration.registrationRef
                          }
                        </span>
                      </td>

                      <td>
                        <span className="mw-admin-nation-cell">
                          <b>
                            {countryFlag(
                              registration.countryCode
                            )}
                          </b>

                          {
                            registration.country
                          }
                        </span>
                      </td>

                      <td>
                        <span className="mw-admin-mode-pill">
                          {registration.ticketType ===
                          "in_person"
                            ? "In person"
                            : "Livestream"}
                        </span>
                      </td>

                      <td>
                        <span
                          className={[
                            "mw-admin-email-pill",
                            `is-${
                              registration.invitationEmailStatus ??
                              "none"
                            }`,
                          ].join(
                            " "
                          )}
                        >
                          {registration.invitationEmailStatus ??
                            "Not sent"}
                        </span>
                      </td>

                      <td>
                        <span className="mw-admin-date-cell">
                          {formatAdminDate(
                            registration.createdAt
                          )}
                        </span>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        </article>
      </section>

      <section className="mw-admin-directory-section">
        <header>
          <div>
            <p>
              Attendee directory
            </p>

            <h2>
              Registrations
            </h2>
          </div>

          <span>
            {
              attendeeDirectory.total
                .toLocaleString()
            } total
          </span>
        </header>

        <AttendeeFilters
          countries={
            data.countries
              .filter(
                (country) =>
                  Boolean(
                    country.countryCode
                  )
              )
              .map(
                (country) => ({
                  code:
                    country.countryCode!,
                  name:
                    country.country,
                })
              )
          }
        />

        <AttendeeResults
          rows={
            attendeeDirectory.rows
          }
        />
      </section>
    </main>
  );
}
