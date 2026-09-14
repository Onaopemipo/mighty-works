export const ATTENDEE_TYPES = [
  "General Attendee",
  "Pastor / Minister",
  "Church Leader",
  "Youth / Young Adult",
  "Volunteer / Worker",
  "Guest",
  "Other",
] as const;

export type AttendeeType =
  (typeof ATTENDEE_TYPES)[number];

export type AttendanceMode =
  | "in_person"
  | "livestream";

export type RegistrationPayload = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  countryCode: string;
  city: string;
  stateRegion: string;
  churchMinistry: string;
  attendeeType: AttendeeType;
  attendanceMode: AttendanceMode;
  partySize: number;
  consentPrivacy: boolean;
  consentUpdates: boolean;
  website?: string;
};

export type RegistrationSuccess = {
  ok: true;
  registrationRef: string;
  firstName: string;
  country: string;
  countryCode: string;
};

export type RegistrationFailure = {
  ok: false;
  error: string;
  code?:
    | "VALIDATION"
    | "DUPLICATE"
    | "RATE_LIMITED"
    | "SERVER";
};

export type RegistrationResponse =
  | RegistrationSuccess
  | RegistrationFailure;
