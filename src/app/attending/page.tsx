import type { Metadata } from "next";

import {
  AttendingShell,
} from "@/components/attending/attending-shell";

import "./attending.css";

export const metadata: Metadata = {
  title:
    "Photo Frame | Mighty Works Conference 2026",

  description:
    "Create your Mighty Works Conference 2026 Photo Frame. Upload your photo, choose a design and share that you’re attending.",

  alternates: {
    canonical: "/attending",
  },

  openGraph: {
    title:
      "Photo Frame | Mighty Works Conference 2026",

    description:
      "Create and share your Mighty Works Conference 2026 Photo Frame.",

    url: "/attending",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",

    title:
      "Photo Frame | Mighty Works Conference 2026",

    description:
      "Create and share your Mighty Works Conference 2026 Photo Frame.",
  },
};

export default function AttendingPage() {
  return <AttendingShell />;
}
