import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mighty Works Conference 2026",
  description:
    "Mighty Works Conference 2026 — the 8th edition hosted by Everwinning Faith Ministries Australia, 7–8 November 2026.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
