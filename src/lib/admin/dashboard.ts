import "server-only";

import {
  createAdminClient,
} from "@/lib/supabase/admin";

import {
  resolvePartyAttendance,
} from "@/lib/checkin/attendance";

export type AdminRegistrationRow = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  country: string;
  countryCode: string | null;
  ticketType:
    | "in_person"
    | "livestream";
  partySize: number;
  registrationRef: string;
  createdAt: string;
  invitationEmailStatus:
    | "pending"
    | "sent"
    | "failed"
    | "skipped"
    | null;
};

export type AdminCountryRow = {
  country: string;
  countryCode: string | null;
  registrations: number;
  attendees: number;
};

export type AdminDashboardData = {
  metrics: {
    registrations: number;
    attendees: number;
    nations: number;
    inPerson: number;
    livestream: number;
    emailsSent: number;
    emailsFailed: number;
    checkedInRegistrations: number;
    checkedInAttendees: number;
    expectedInPersonAttendees: number;
    attendancePercent: number;
  };
  recent: AdminRegistrationRow[];
  countries: AdminCountryRow[];
  recentCheckIns: {
    id: string;
    name: string;
    registrationRef: string;
    country: string;
    countryCode: string | null;
    checkedInAt: string;
    partySize: number;
    checkedInCount: number;
    remainingCount: number;
  }[];
  countryArrivals: {
    country: string;
    countryCode: string | null;
    expectedAttendees: number;
    checkedInAttendees: number;
  }[];
  scanOperations: {
    successfulScans: number;
    duplicateScans: number;
    checkOuts: number;
    scansLastHour: number;
    latestEvents: {
      id: string;
      registrationId: string;
      eventType:
        | "check_in"
        | "duplicate_scan"
        | "check_out";
      source:
        | "scanner"
        | "admin_manual";
      actorEmail: string;
      credentialVersion:
        number | null;
      scannedAt: string;
      attendeeName: string;
      registrationRef: string;
      country: string;
      countryCode:
        string | null;
    }[];
  };
  activity: {
    date: string;
    registrations: number;
    attendees: number;
  }[];
};

type RegistrationRecord = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  country: string;
  country_code: string | null;
  ticket_type:
    | "in_person"
    | "livestream";
  party_size: number;
  registration_ref: string | null;
  checked_in: boolean;
  checked_in_at: string | null;
  checked_in_count:
    number | null;
  created_at: string;
};

type InvitationRecord = {
  registration_id: string;
  email_status:
    | "pending"
    | "sent"
    | "failed"
    | "skipped";
};

type CheckInEventRecord = {
  id: string;
  registration_id: string;
  credential_version:
    number | null;
  event_type:
    | "check_in"
    | "duplicate_scan"
    | "check_out";
  source:
    | "scanner"
    | "admin_manual";
  actor_email: string;
  scanned_at: string;
};

function dayKey(
  value: string
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
  ).format(
    new Date(value)
  );
}

export async function getAdminDashboardData():
  Promise<AdminDashboardData> {
  const admin =
    createAdminClient();

  const [
    registrationsResult,
    invitationsResult,
    countriesResult,
    checkInEventsResult,
  ] = await Promise.all([
    admin
      .from("registrations")
      .select(
        [
          "id",
          "name",
          "email",
          "phone",
          "country",
          "country_code",
          "ticket_type",
          "party_size",
          "registration_ref",
          "checked_in",
          "checked_in_at",
          "checked_in_count",
          "created_at",
        ].join(",")
      )
      .eq(
        "registration_status",
        "confirmed"
      )
      .order(
        "created_at",
        {
          ascending: false,
        }
      ),

    admin
      .from(
        "registration_invitations"
      )
      .select(
        "registration_id,email_status"
      ),

    admin
      .from(
        "country_registration_stats"
      )
      .select(
        "country,country_code,registration_count,attendee_count"
      )
      .order(
        "attendee_count",
        {
          ascending: false,
        }
      ),
    admin
      .from(
        "registration_checkin_events"
      )
      .select(
        [
          "id",
          "registration_id",
          "credential_version",
          "event_type",
          "source",
          "actor_email",
          "scanned_at",
        ].join(",")
      )
      .order(
        "scanned_at",
        {
          ascending: false,
        }
      )
      .limit(250),
  ]);

  if (
    registrationsResult.error
  ) {
    throw new Error(
      `Unable to load registrations: ${registrationsResult.error.message}`
    );
  }

  if (
    invitationsResult.error
  ) {
    throw new Error(
      `Unable to load invitation status: ${invitationsResult.error.message}`
    );
  }

  if (
    countriesResult.error
  ) {
    throw new Error(
      `Unable to load country statistics: ${countriesResult.error.message}`
    );
  }

  if (
    checkInEventsResult.error
  ) {
    throw new Error(
      `Unable to load check-in operations: ${checkInEventsResult.error.message}`
    );
  }

  const registrations =
    (
      registrationsResult.data ??
      []
    ) as unknown as RegistrationRecord[];

  const invitations =
    (
      invitationsResult.data ??
      []
    ) as unknown as InvitationRecord[];

  const invitationByRegistration =
    new Map(
      invitations.map(
        (item) => [
          item.registration_id,
          item.email_status,
        ]
      )
    );

  const checkInEvents =
    (
      checkInEventsResult.data ??
      []
    ) as unknown as CheckInEventRecord[];

  const registrationById =
    new Map(
      registrations.map(
        (registration) => [
          registration.id,
          registration,
        ]
      )
    );

  const hourAgo =
    Date.now() -
    60 * 60 * 1000;

  const successfulScans =
    checkInEvents.filter(
      (event) =>
        event.event_type ===
          "check_in" &&
        event.source ===
          "scanner"
    ).length;

  const duplicateScans =
    checkInEvents.filter(
      (event) =>
        event.event_type ===
          "duplicate_scan" &&
        event.source ===
          "scanner"
    ).length;

  const checkOuts =
    checkInEvents.filter(
      (event) =>
        event.event_type ===
        "check_out"
    ).length;

  const scansLastHour =
    checkInEvents.filter(
      (event) =>
        event.source ===
          "scanner" &&
        (
          event.event_type ===
            "check_in" ||
          event.event_type ===
            "duplicate_scan"
        ) &&
        new Date(
          event.scanned_at
        ).getTime() >=
          hourAgo
    ).length;

  const latestEvents =
    checkInEvents
      .slice(
        0,
        20
      )
      .flatMap(
        (event) => {
          const registration =
            registrationById.get(
              event.registration_id
            );

          if (!registration) {
            return [];
          }

          return [
            {
              id:
                event.id,
              registrationId:
                event.registration_id,
              eventType:
                event.event_type,
              source:
                event.source,
              actorEmail:
                event.actor_email,
              credentialVersion:
                event.credential_version,
              scannedAt:
                event.scanned_at,
              attendeeName:
                registration.name,
              registrationRef:
                registration.registration_ref ??
                "—",
              country:
                registration.country,
              countryCode:
                registration.country_code,
            },
          ];
        }
      );

  const totalAttendees =
    registrations.reduce(
      (
        total,
        registration
      ) =>
        total +
        Math.max(
          registration.party_size ??
            1,
          1
        ),
      0
    );

  const inPerson =
    registrations.filter(
      (registration) =>
        registration.ticket_type ===
        "in_person"
    ).length;

  const livestream =
    registrations.filter(
      (registration) =>
        registration.ticket_type ===
        "livestream"
    ).length;

  const emailsSent =
    invitations.filter(
      (invitation) =>
        invitation.email_status ===
        "sent"
    ).length;

  const emailsFailed =
    invitations.filter(
      (invitation) =>
        invitation.email_status ===
        "failed"
    ).length;
  const attendanceByRegistration =
    new Map(
      registrations.map(
        (registration) => {
          const attendance =
            resolvePartyAttendance({
              partySize:
                registration.party_size ??
                1,
              checkedInCount:
                registration.checked_in_count,
              legacyCheckedIn:
                registration.checked_in,
            });

          return [
            registration.id,
            attendance,
          ] as const;
        }
      )
    );

  const checkedInRegistrations =
    registrations.filter(
      (registration) =>
        attendanceByRegistration.get(
          registration.id
        )?.checkedIn ??
        false
    ).length;
  const checkedInAttendees =
    registrations.reduce(
      (
        total,
        registration
      ) =>
        total +
        (
          attendanceByRegistration.get(
            registration.id
          )?.checkedInCount ??
          0
        ),
      0
    );

  const expectedInPersonAttendees =
    registrations.reduce(
      (
        total,
        registration
      ) =>
        total +
        (
          registration.ticket_type ===
          "in_person"
            ? Math.max(
                registration.party_size ??
                  1,
                1
              )
            : 0
        ),
      0
    );

  const attendancePercent =
    expectedInPersonAttendees > 0
      ? Math.round(
          (
            checkedInAttendees /
            expectedInPersonAttendees
          ) *
            100
        )
      : 0;

  const recentCheckIns =
    registrations
      .filter(
        (registration) =>
          (
            attendanceByRegistration.get(
              registration.id
            )?.checkedIn ??
            false
          ) &&
          Boolean(
            registration.checked_in_at
          )
      )
      .sort(
        (a, b) =>
          new Date(
            b.checked_in_at ??
              0
          ).getTime() -
          new Date(
            a.checked_in_at ??
              0
          ).getTime()
      )
      .slice(0, 12)
      .map(
        (registration) => {
          const attendance =
            attendanceByRegistration.get(
              registration.id
            );

          if (!attendance) {
            throw new Error(
              "Attendance state missing for registration."
            );
          }

          return {
            id:
              registration.id,
            name:
              registration.name,
            registrationRef:
              registration.registration_ref ??
              "—",
            country:
              registration.country,
            countryCode:
              registration.country_code,
            checkedInAt:
              registration.checked_in_at!,
            partySize:
              attendance.partySize,
            checkedInCount:
              attendance.checkedInCount,
            remainingCount:
              attendance.remainingCount,
          };
        }
      );

  const countryArrivalMap =
    new Map<
      string,
      {
        country: string;
        countryCode:
          string | null;
        expectedAttendees:
          number;
        checkedInAttendees:
          number;
      }
    >();

  for (
    const registration
    of registrations
  ) {
    if (
      registration.ticket_type !==
      "in_person"
    ) {
      continue;
    }

    const key =
      registration.country_code ??
      registration.country;

    const current =
      countryArrivalMap.get(
        key
      ) ?? {
        country:
          registration.country,
        countryCode:
          registration.country_code,
        expectedAttendees: 0,
        checkedInAttendees: 0,
      };

    const partySize =
      Math.max(
        registration.party_size ??
          1,
        1
      );

    current.expectedAttendees +=
      partySize;

    current.checkedInAttendees +=
      attendanceByRegistration.get(
        registration.id
      )?.checkedInCount ??
      0;

    countryArrivalMap.set(
      key,
      current
    );
  }

  const countryArrivals =
    Array.from(
      countryArrivalMap.values()
    ).sort(
      (a, b) =>
        b.checkedInAttendees -
        a.checkedInAttendees
    );

  const activityMap =
    new Map<
      string,
      {
        registrations: number;
        attendees: number;
      }
    >();

  for (
    const registration
    of registrations
  ) {
    const date =
      dayKey(
        registration.created_at
      );

    const current =
      activityMap.get(date) ?? {
        registrations: 0,
        attendees: 0,
      };

    current.registrations +=
      1;

    current.attendees +=
      Math.max(
        registration.party_size ??
          1,
        1
      );

    activityMap.set(
      date,
      current
    );
  }

  const activity =
    Array.from(
      activityMap.entries()
    )
      .map(
        ([
          date,
          values,
        ]) => ({
          date,
          registrations:
            values.registrations,
          attendees:
            values.attendees,
        })
      )
      .sort(
        (a, b) =>
          a.date.localeCompare(
            b.date
          )
      )
      .slice(-14);

  return {
    metrics: {
      registrations:
        registrations.length,
      attendees:
        totalAttendees,
      nations:
        countriesResult.data
          ?.length ?? 0,
      inPerson,
      livestream,
      emailsSent,
      emailsFailed,
      checkedInRegistrations,
      checkedInAttendees,
      expectedInPersonAttendees,
      attendancePercent,
    },

    recentCheckIns,
    countryArrivals,

    scanOperations: {
      successfulScans,
      duplicateScans,
      checkOuts,
      scansLastHour,
      latestEvents,
    },

    recent:
      registrations
        .slice(0, 12)
        .map(
          (registration) => ({
            id:
              registration.id,
            name:
              registration.name,
            email:
              registration.email,
            phone:
              registration.phone,
            country:
              registration.country,
            countryCode:
              registration.country_code,
            ticketType:
              registration.ticket_type,
            partySize:
              registration.party_size,
            registrationRef:
              registration.registration_ref ??
              "—",
            createdAt:
              registration.created_at,
            invitationEmailStatus:
              invitationByRegistration.get(
                registration.id
              ) ?? null,
          })
        ),

    countries:
      (
        countriesResult.data ??
        []
      ).map(
        (country) => ({
          country:
            country.country,
          countryCode:
            country.country_code,
          registrations:
            country.registration_count,
          attendees:
            country.attendee_count,
        })
      ),

    activity,
  };
}
