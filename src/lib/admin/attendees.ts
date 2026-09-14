import "server-only";

import {
  createAdminClient,
} from "@/lib/supabase/admin";

export type AdminAttendeeFilters = {
  search: string;
  country: string;
  mode: string;
  emailStatus: string;
  page: number;
  pageSize: number;
};

export type AdminAttendeeListRow = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  country: string;
  countryCode: string | null;
  ticketType: string;
  attendeeType: string | null;
  partySize: number;
  registrationRef: string;
  registrationStatus: string;
  createdAt: string;
  invitationStatus:
    | "pending"
    | "sent"
    | "failed"
    | "skipped"
    | null;
};

export type AdminAttendeeDetail = {
  id: string;
  name: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
  phone: string | null;
  country: string;
  countryCode: string | null;
  city: string | null;
  stateRegion: string | null;
  churchMinistry: string | null;
  attendeeType: string | null;
  ticketType: string;
  partySize: number;
  registrationRef: string;
  registrationStatus: string;
  consentPrivacy: boolean;
  consentUpdates: boolean;
  checkedIn: boolean;
  checkedInAt: string | null;
  createdAt: string;
  invitation: {
    emailStatus:
      | "pending"
      | "sent"
      | "failed"
      | "skipped";
    emailAttempts: number;
    emailSentAt: string | null;
    emailProviderId: string | null;
    lastEmailError: string | null;
    expiresAt: string;
    updatedAt: string;
  } | null;
};

type RegistrationRow = {
  id: string;
  name: string;
  first_name: string | null;
  last_name: string | null;
  email: string;
  phone: string | null;
  country: string;
  country_code: string | null;
  city: string | null;
  state_region: string | null;
  church_ministry: string | null;
  attendee_type: string | null;
  ticket_type: string;
  party_size: number;
  registration_ref: string | null;
  registration_status: string;
  consent_privacy: boolean;
  consent_updates: boolean;
  checked_in: boolean;
  checked_in_at: string | null;
  created_at: string;
};

type InvitationRow = {
  registration_id: string;
  email_status:
    | "pending"
    | "sent"
    | "failed"
    | "skipped";
  email_attempts: number;
  email_sent_at: string | null;
  email_provider_id: string | null;
  last_email_error: string | null;
  expires_at: string;
  updated_at: string;
};

function normalizePage(
  value: number
) {
  if (
    !Number.isFinite(value) ||
    value < 1
  ) {
    return 1;
  }

  return Math.floor(value);
}

function normalizePageSize(
  value: number
) {
  if (
    !Number.isFinite(value)
  ) {
    return 25;
  }

  return Math.min(
    Math.max(
      Math.floor(value),
      10
    ),
    100
  );
}

export async function getAdminAttendeeList(
  filters: AdminAttendeeFilters
) {
  const admin =
    createAdminClient();

  const page =
    normalizePage(
      filters.page
    );

  const pageSize =
    normalizePageSize(
      filters.pageSize
    );

  let query =
    admin
      .from("registrations")
      .select(
        [
          "id",
          "name",
          "first_name",
          "last_name",
          "email",
          "phone",
          "country",
          "country_code",
          "city",
          "state_region",
          "church_ministry",
          "attendee_type",
          "ticket_type",
          "party_size",
          "registration_ref",
          "registration_status",
          "consent_privacy",
          "consent_updates",
          "checked_in",
          "checked_in_at",
          "created_at",
        ].join(",")
      )
      .eq(
        "registration_status",
        "confirmed"
      );

  const search =
    filters.search.trim();

  if (search) {
    const safeSearch =
      search
        .replaceAll(",", " ")
        .replaceAll("%", "")
        .trim();

    if (safeSearch) {
      query =
        query.or(
          [
            `name.ilike.%${safeSearch}%`,
            `email.ilike.%${safeSearch}%`,
            `phone.ilike.%${safeSearch}%`,
            `registration_ref.ilike.%${safeSearch}%`,
          ].join(",")
        );
    }
  }

  if (
    filters.country &&
    filters.country !== "all"
  ) {
    query =
      query.eq(
        "country_code",
        filters.country
      );
  }

  if (
    filters.mode &&
    filters.mode !== "all"
  ) {
    query =
      query.eq(
        "ticket_type",
        filters.mode
      );
  }

  const result =
    await query.order(
      "created_at",
      {
        ascending: false,
      }
    );

  if (result.error) {
    throw new Error(
      `Unable to load attendees: ${result.error.message}`
    );
  }

  const registrations =
    (
      result.data ??
      []
    ) as unknown as RegistrationRow[];

  const registrationIds =
    registrations.map(
      (row) => row.id
    );

  let invitations:
    InvitationRow[] = [];

  if (registrationIds.length) {
    const invitationResult =
      await admin
        .from(
          "registration_invitations"
        )
        .select(
          [
            "registration_id",
            "email_status",
            "email_attempts",
            "email_sent_at",
            "email_provider_id",
            "last_email_error",
            "expires_at",
            "updated_at",
          ].join(",")
        )
        .in(
          "registration_id",
          registrationIds
        );

    if (
      invitationResult.error
    ) {
      throw new Error(
        `Unable to load invitation status: ${invitationResult.error.message}`
      );
    }

    invitations =
      (
        invitationResult.data ??
        []
      ) as unknown as InvitationRow[];
  }

  const invitationMap =
    new Map(
      invitations.map(
        (row) => [
          row.registration_id,
          row,
        ]
      )
    );

  let rows =
    registrations.map(
      (
        registration
      ): AdminAttendeeListRow => ({
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
        attendeeType:
          registration.attendee_type,
        partySize:
          registration.party_size,
        registrationRef:
          registration.registration_ref ??
          "—",
        registrationStatus:
          registration.registration_status,
        createdAt:
          registration.created_at,
        invitationStatus:
          invitationMap.get(
            registration.id
          )?.email_status ??
          null,
      })
    );

  if (
    filters.emailStatus &&
    filters.emailStatus !== "all"
  ) {
    rows =
      rows.filter(
        (row) =>
          (
            row.invitationStatus ??
            "none"
          ) ===
          filters.emailStatus
      );
  }

  const total =
    rows.length;

  const from =
    (page - 1) *
    pageSize;

  const pagedRows =
    rows.slice(
      from,
      from +
        pageSize
    );

  return {
    rows:
      pagedRows,
    page,
    pageSize,
    total,
  };
}

export async function getAdminAttendeeDetail(
  id: string
): Promise<AdminAttendeeDetail | null> {
  const admin =
    createAdminClient();

  const {
    data,
    error,
  } = await admin
    .from("registrations")
    .select(
      [
        "id",
        "name",
        "first_name",
        "last_name",
        "email",
        "phone",
        "country",
        "country_code",
        "city",
        "state_region",
        "church_ministry",
        "attendee_type",
        "ticket_type",
        "party_size",
        "registration_ref",
        "registration_status",
        "consent_privacy",
        "consent_updates",
        "checked_in",
        "checked_in_at",
        "created_at",
      ].join(",")
    )
    .eq(
      "id",
      id
    )
    .maybeSingle();

  if (error) {
    throw new Error(
      `Unable to load attendee: ${error.message}`
    );
  }

  if (!data) {
    return null;
  }

  const registration =
    data as unknown as RegistrationRow;

  const {
    data: invitationData,
    error:
      invitationError,
  } = await admin
    .from(
      "registration_invitations"
    )
    .select(
      [
        "registration_id",
        "email_status",
        "email_attempts",
        "email_sent_at",
        "email_provider_id",
        "last_email_error",
        "expires_at",
        "updated_at",
      ].join(",")
    )
    .eq(
      "registration_id",
      id
    )
    .maybeSingle();

  if (
    invitationError
  ) {
    throw new Error(
      `Unable to load invitation: ${invitationError.message}`
    );
  }

  const invitation =
    invitationData
      ? (
          invitationData as unknown as InvitationRow
        )
      : null;

  return {
    id:
      registration.id,
    name:
      registration.name,
    firstName:
      registration.first_name,
    lastName:
      registration.last_name,
    email:
      registration.email,
    phone:
      registration.phone,
    country:
      registration.country,
    countryCode:
      registration.country_code,
    city:
      registration.city,
    stateRegion:
      registration.state_region,
    churchMinistry:
      registration.church_ministry,
    attendeeType:
      registration.attendee_type,
    ticketType:
      registration.ticket_type,
    partySize:
      registration.party_size,
    registrationRef:
      registration.registration_ref ??
      "—",
    registrationStatus:
      registration.registration_status,
    consentPrivacy:
      registration.consent_privacy,
    consentUpdates:
      registration.consent_updates,
    checkedIn:
      registration.checked_in,
    checkedInAt:
      registration.checked_in_at,
    createdAt:
      registration.created_at,
    invitation:
      invitation
        ? {
            emailStatus:
              invitation.email_status,
            emailAttempts:
              invitation.email_attempts,
            emailSentAt:
              invitation.email_sent_at,
            emailProviderId:
              invitation.email_provider_id,
            lastEmailError:
              invitation.last_email_error,
            expiresAt:
              invitation.expires_at,
            updatedAt:
              invitation.updated_at,
          }
        : null,
  };
}

export async function getAdminAttendeeExport(
  filters: Omit<
    AdminAttendeeFilters,
    "page" |
    "pageSize"
  >
) {
  const result =
    await getAdminAttendeeList({
      ...filters,
      page: 1,
      pageSize: 100,
    });

  /*
   * getAdminAttendeeList caps pageSize
   * at 100. Export must include all
   * matching rows, so walk the result
   * set deterministically.
   */
  if (
    result.total <=
    result.pageSize
  ) {
    return result.rows;
  }

  const pages =
    Math.ceil(
      result.total /
      result.pageSize
    );

  const remaining =
    await Promise.all(
      Array.from(
        {
          length:
            pages - 1,
        },
        (
          _,
          index
        ) =>
          getAdminAttendeeList({
            ...filters,
            page:
              index + 2,
            pageSize: 100,
          })
      )
    );

  return [
    ...result.rows,
    ...remaining.flatMap(
      (pageResult) =>
        pageResult.rows
    ),
  ];
}
