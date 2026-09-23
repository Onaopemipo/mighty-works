import type { Metadata } from "next";

import {
  AttendingShell,
} from "@/components/attending/attending-shell";

import "./attending.css";

export const metadata: Metadata = {
  title:
    "I Am Attending | Mighty Works Conference 2026",

  description:
    "Upload your photo and create your personal I Am Attending graphic for Mighty Works Conference 2026.",

  alternates: {
    canonical: "/attending",
  },

  openGraph: {
    title:
      "I Am Attending | Mighty Works Conference 2026",

    description:
      "Create your personal Mighty Works Conference 2026 attendee graphic.",

    url: "/attending",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",

    title:
      "I Am Attending | Mighty Works Conference 2026",

    description:
      "Create your personal Mighty Works Conference 2026 attendee graphic.",
  },
};

export default function AttendingPage() {
  return <AttendingShell />;
}
