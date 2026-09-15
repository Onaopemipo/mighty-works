import {
  ArrowLeft,
  CalendarClock,
  CheckCircle2,
  CircleUserRound,
  Globe2,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  UsersRound,
} from "lucide-react";
import Link from "next/link";
import {
  notFound,
  redirect,
} from "next/navigation";

import {
  getAdminSession,
} from "@/lib/admin/session";
import {
  getAdminAttendeeDetail,
} from "@/lib/admin/attendees";
import {
  countryFlag,
  formatAdminDate,
} from "@/lib/admin/display";
import {
  ResendInvitationButton,
} from "@/components/admin/resend-invitation-button";
import {
  AttendanceAction,
} from "@/components/admin/attendance-action";

export const dynamic =
  "force-dynamic";

function DetailItem({
  label,
  value,
  icon,
}: {
  label: string;
  value:
    React.ReactNode;
  icon:
    React.ReactNode;
}) {
  return (
    <div className="mw-admin-detail-item">
      <div>
        {icon}
      </div>

      <span>
        {label}
      </span>

      <strong>
        {value}
      </strong>
    </div>
  );
}

export default async function AdminRegistrationDetailPage({
  params,
}: {
  params: Promise<{
    id: string;
  }>;
}) {
  const session =
    await getAdminSession();

  if (!session) {
    redirect(
      "/admin/login"
    );
  }

  const {
    id,
  } = await params;

  const attendee =
    await getAdminAttendeeDetail(
      id
    );

  if (!attendee) {
    notFound();
  }

  return (
    <main className="mw-admin-shell">
      <header className="mw-admin-detail-header">
        <Link
          href="/admin"
        >
          <ArrowLeft
            size={16}
          />

          Back to command centre
        </Link>

        <div>
          <p>
            Registration detail
          </p>

          <h1>
            {
              attendee.name
            }
          </h1>

          <span>
            {
              attendee.registrationRef
            }
          </span>
        </div>
      </header>

      <section className="mw-admin-detail-status">
        <div>
          <ShieldCheck
            size={19}
          />

          <span>
            {
              attendee.registrationStatus
            }
          </span>
        </div>

        <div>
          <CheckCircle2
            size={19}
          />

          <span>
            {attendee.attendanceComplete
              ? "Full party checked in"
              : attendee.attendancePartial
                ? `${attendee.checkedInCount} of ${attendee.partySize} checked in`
                : "Not checked in"}
          </span>
        </div>
      </section>

      <section className="mw-admin-operational-actions">
        <div>
          <p>
            Venue operations
          </p>

          <strong>
            Attendance control
          </strong>

          <span>
            Check the attendee in or reverse an accidental check-in.
          </span>
        </div>

        <AttendanceAction
          registrationId={
            attendee.id
          }
          partySize={
            attendee.partySize
          }
          checkedInCount={
            attendee.checkedInCount
          }
          remainingCount={
            attendee.remainingCount
          }
        />
      </section>

      <section className="mw-admin-detail-grid">
        <article className="mw-admin-panel">
          <header>
            <div>
              <p>
                Attendee
              </p>

              <h2>
                Contact & identity
              </h2>
            </div>

            <CircleUserRound
              size={22}
            />
          </header>

          <div className="mw-admin-detail-list">
            <DetailItem
              label="Full name"
              value={
                attendee.name
              }
              icon={
                <CircleUserRound
                  size={17}
                />
              }
            />

            <DetailItem
              label="Email"
              value={
                attendee.email
              }
              icon={
                <Mail
                  size={17}
                />
              }
            />

            <DetailItem
              label="Phone"
              value={
                attendee.phone ??
                "Not supplied"
              }
              icon={
                <Phone
                  size={17}
                />
              }
            />

            <DetailItem
              label="Nation"
              value={
                <>
                  {countryFlag(
                    attendee.countryCode
                  )}{" "}
                  {
                    attendee.country
                  }
                </>
              }
              icon={
                <Globe2
                  size={17}
                />
              }
            />

            <DetailItem
              label="Location"
              value={
                [
                  attendee.city,
                  attendee.stateRegion,
                ]
                  .filter(
                    Boolean
                  )
                  .join(
                    ", "
                  ) ||
                "Not supplied"
              }
              icon={
                <MapPin
                  size={17}
                />
              }
            />
          </div>
        </article>

        <article className="mw-admin-panel">
          <header>
            <div>
              <p>
                Conference
              </p>

              <h2>
                Registration
              </h2>
            </div>

            <UsersRound
              size={22}
            />
          </header>

          <div className="mw-admin-detail-list">
            <DetailItem
              label="Attendance"
              value={
                attendee.ticketType ===
                "in_person"
                  ? "In person"
                  : "Livestream"
              }
              icon={
                <UsersRound
                  size={17}
                />
              }
            />

            <DetailItem
              label="Attendee type"
              value={
                attendee.attendeeType ??
                "General attendee"
              }
              icon={
                <UsersRound
                  size={17}
                />
              }
            />

            <DetailItem
              label="Present now"
              value={
                `${attendee.checkedInCount} / ${attendee.partySize}`
              }
              icon={
                <CheckCircle2
                  size={17}
                />
              }
            />

            <DetailItem
              label="Party size"
              value={
                attendee.partySize
              }
              icon={
                <UsersRound
                  size={17}
                />
              }
            />

            <DetailItem
              label="Church / ministry"
              value={
                attendee.churchMinistry ??
                "Not supplied"
              }
              icon={
                <ShieldCheck
                  size={17}
                />
              }
            />

            <DetailItem
              label="Registered"
              value={
                formatAdminDate(
                  attendee.createdAt
                )
              }
              icon={
                <CalendarClock
                  size={17}
                />
              }
            />

            <DetailItem
              label="Venue check-in"
              value={
                attendee.checkedInAt
                  ? formatAdminDate(
                      attendee.checkedInAt
                    )
                  : "Not checked in"
              }
              icon={
                <CheckCircle2
                  size={17}
                />
              }
            />
          </div>
        </article>

        <article className="mw-admin-panel mw-admin-invite-detail-panel">
          <header>
            <div>
              <p>
                Digital invitation
              </p>

              <h2>
                Delivery
              </h2>
            </div>

            <Mail
              size={22}
            />
          </header>

          {attendee.invitation ? (
            <div className="mw-admin-detail-list">
              <DetailItem
                label="Status"
                value={
                  attendee
                    .invitation
                    .emailStatus
                }
                icon={
                  <Mail
                    size={17}
                  />
                }
              />

              <DetailItem
                label="Attempts"
                value={
                  attendee
                    .invitation
                    .emailAttempts
                }
                icon={
                  <Mail
                    size={17}
                  />
                }
              />

              <DetailItem
                label="Last sent"
                value={
                  attendee
                    .invitation
                    .emailSentAt
                    ? formatAdminDate(
                        attendee
                          .invitation
                          .emailSentAt
                      )
                    : "Not sent"
                }
                icon={
                  <CalendarClock
                    size={17}
                  />
                }
              />

              <DetailItem
                label="Expires"
                value={
                  formatAdminDate(
                    attendee
                      .invitation
                      .expiresAt
                  )
                }
                icon={
                  <CalendarClock
                    size={17}
                  />
                }
              />

              {attendee
                .invitation
                .lastEmailError ? (
                <div className="mw-admin-invite-error">
                  {
                    attendee
                      .invitation
                      .lastEmailError
                  }
                </div>
              ) : null}
            </div>
          ) : (
            <div className="mw-admin-attendee-empty">
              No invitation has
              been generated yet.
            </div>
          )}

          <ResendInvitationButton
            registrationId={
              attendee.id
            }
          />
        </article>
      </section>
    </main>
  );
}
