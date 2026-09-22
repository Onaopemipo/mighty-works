import type {
  Metadata,
  Viewport,
} from "next";

import "./globals.css";

const SITE_URL =
  "https://mwc.everwinningaustralia.com.au";

export const metadata: Metadata = {
  metadataBase:
    new URL(SITE_URL),

  title: {
    default:
      "Mighty Works Conference 2026 | Greater Things",
    template:
      "%s | Mighty Works Conference 2026",
  },

  description:
    "Mighty Works Conference 2026 is the 11th edition of Everwinning Faith Ministries Australia's international conference, themed Greater Things, taking place 7–8 November 2026 in Brisbane, Australia.",

  applicationName:
    "Mighty Works Conference 2026",

  alternates: {
    canonical: "/",
  },

  openGraph: {
    type: "website",
    url: "/",
    siteName:
      "Mighty Works Conference 2026",
    title:
      "Mighty Works Conference 2026 | Greater Things",
    description:
      "Join the 11th edition of Mighty Works Conference on 7–8 November 2026 in Brisbane, Australia.",
    locale: "en_AU",
  },

  twitter: {
    card: "summary_large_image",
    title:
      "Mighty Works Conference 2026 | Greater Things",
    description:
      "7–8 November 2026 · Brisbane, Australia · 11th Edition",
  },

  robots: {
    index: true,
    follow: true,
  },

  icons: {
    icon: "/icon.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0A0916",
};

const eventJsonLd = {
  "@context": "https://schema.org",
  "@type": "Event",
  name: "Mighty Works Conference 2026",
  description:
    "The 11th edition of Mighty Works Conference, hosted by Everwinning Faith Ministries Australia and themed Greater Things.",
  startDate:
    "2026-11-07T17:00:00+10:00",
  endDate:
    "2026-11-08",
  eventStatus:
    "https://schema.org/EventScheduled",
  eventAttendanceMode:
    "https://schema.org/OfflineEventAttendanceMode",
  location: {
    "@type": "Place",
    name: "Faith Center",
    address: {
      "@type": "PostalAddress",
      streetAddress: "62 Eastern Rd",
      addressLocality: "Browns Plains",
      addressRegion: "QLD",
      postalCode: "4118",
      addressCountry: "AU",
    },
  },
  organizer: {
    "@type": "Organization",
    name:
      "Everwinning Faith Ministries Australia",
  },
  url:
    "https://mwc.everwinningaustralia.com.au",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-AU">
      <body>
        <a
          className="mw-skip-link"
          href="#main-content"
        >
          Skip to main content
        </a>

        {children}

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html:
              JSON.stringify(
                eventJsonLd
              ).replace(
                /</g,
                "\\u003c"
              ),
          }}
        />
      </body>
    </html>
  );
}
