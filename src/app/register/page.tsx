import type { Metadata } from "next";

import { RegistrationExperience } from "@/components/registration/registration-experience";

export const metadata: Metadata = {
  title:
    "Register | Mighty Works Conference 2026",
  description:
    "Register for Mighty Works Conference 2026, 7–8 November in Brisbane, Australia.",
};

export default function RegisterPage() {
  return <RegistrationExperience />;
}
