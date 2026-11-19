import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  CalendarDays,
  CirclePlay,
  Heart,
  MapPin,
  Play,
  Sparkles,
} from "lucide-react";

import { PostEventNav } from "@/components/post-event/post-event-nav";

import "./post-event.css";

export const metadata: Metadata = {
  title: "MWC 2026 Highlights | Greater Things",
  description:
    "Relive Mighty Works Conference 2026 — two unforgettable days of worship, the Word, prayer and impartation in Brisbane, Australia.",
};

type Highlight = {
  day: string;
  date: string;
  title: string;
  summary: string;
  url?: string;
};

const highlights: Highlight[] = [
  {
    day: "Day One",
    date: "Saturday · 7 November 2026",
    title: "The gathering begins",
    summary:
      "The opening night set the atmosphere for Greater Things through worship, the Word, prayer and a room filled with expectation.",
    url: "https://www.youtube.com/watch?v=QXF5bd4NPSQ",
  },
  {
    day: "Day Two",
    date: "Sunday · 8 November 2026",
    title: "The grand finale",
    summary:
      "A powerful final gathering of faith, fellowship and impartation — carrying the message of Greater Things beyond the conference.",
    url: "https://www.youtube.com/watch?v=aCxFA5Xv4P4",
  },
];

function youtubeEmbed(url?: string) {
  if (!url) return null;

  try {
    const parsed = new URL(url);

    if (parsed.hostname === "youtu.be") {
      const id = parsed.pathname.slice(1).split("/")[0];
      return id ? { id, start: 0 } : null;
    }

    if (parsed.hostname.endsWith("youtube.com")) {
      if (parsed.pathname === "/watch") {
        const id = parsed.searchParams.get("v");
        const timestamp = parsed.searchParams.get("t") ?? "0";
        const start = Number.parseInt(timestamp, 10) || 0;
        return id ? { id, start } : null;
      }

      const parts = parsed.pathname.split("/").filter(Boolean);
      if (["embed", "live", "shorts"].includes(parts[0])) {
        return parts[1] ? { id: parts[1], start: 0 } : null;
      }
    }
  } catch {
    return null;
  }

  return null;
}

function HighlightCard({ highlight }: { highlight: Highlight }) {
  const video = youtubeEmbed(highlight.url);

  return (
    <article className="mwc-recap-card">
      <div className="mwc-recap-video">
        {video ? (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${video.id}?rel=0${video.start ? `&start=${video.start}` : ""}`}
            title={`${highlight.day} highlights — Mighty Works Conference 2026`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        ) : (
          <div className="mwc-recap-video-empty">
            <span className="mwc-recap-play" aria-hidden="true">
              <Play size={28} fill="currentColor" />
            </span>
            <p>{highlight.day} highlights</p>
            <span>Video premiere coming soon</span>
          </div>
        )}

        <span className="mwc-recap-day">{highlight.day}</span>
      </div>

      <div className="mwc-recap-copy">
        <p className="mwc-recap-date">{highlight.date}</p>
        <h3>{highlight.title}</h3>
        <p>{highlight.summary}</p>

        {highlight.url ? (
          <a
            className="mwc-recap-watch"
            href={highlight.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            <CirclePlay size={19} />
            Watch on YouTube
          </a>
        ) : null}
      </div>
    </article>
  );
}

export default function Home() {
  return (
    <main id="main-content" className="mwc-recap-page">
      <PostEventNav />

      <section id="top" className="mwc-recap-hero">
        <div className="mwc-recap-grid" aria-hidden="true" />
        <div className="mwc-recap-orbit mwc-recap-orbit-one" aria-hidden="true" />
        <div className="mwc-recap-orbit mwc-recap-orbit-two" aria-hidden="true" />

        <div className="mwc-recap-hero-inner">
          <div className="mwc-recap-hero-copy">
            <p className="mwc-recap-eyebrow">
              <Sparkles size={15} />
              The gathering lives on
            </p>

            <h1>
              What a
              <span>gathering.</span>
            </h1>

            <p className="mwc-recap-lead">
              Two unforgettable days of worship, the Word, prayer,
              fellowship and impartation. Thank you for being part of
              Mighty Works Conference 2026.
            </p>

            <div className="mwc-recap-actions">
              <Link href="#highlights" className="mwc-recap-primary">
                <Play size={17} fill="currentColor" />
                Watch the highlights
              </Link>
              <Link href="#legacy" className="mwc-recap-secondary">
                Relive the story
              </Link>
            </div>

            <div className="mwc-recap-meta" aria-label="Conference details">
              <span>
                <CalendarDays size={17} />
                7—8 November 2026
              </span>
              <span>
                <MapPin size={17} />
                Brisbane, Australia
              </span>
            </div>
          </div>

          <div className="mwc-recap-hero-art" aria-label="Mighty Works Conference 2026">
            <div className="mwc-recap-halo" aria-hidden="true" />
            <Image
              className="mwc-recap-logo"
              src="/images/hero-2026/mighty-works-conference.png"
              alt="Mighty Works Conference 2026"
              width={680}
              height={455}
              priority
            />
            <p>8th Edition · Greater Things</p>
          </div>
        </div>

        <p className="mwc-recap-scroll">Scroll to relive the moments</p>
      </section>

      <section id="highlights" className="mwc-recap-highlights">
        <div className="mwc-recap-section-heading">
          <div>
            <p className="mwc-recap-eyebrow">Conference highlights</p>
            <h2>Two days.<br />One story.</h2>
          </div>
          <p>
            Revisit the moments that shaped MWC 2026. Watch each day
            separately, share it with someone, and carry the message forward.
          </p>
        </div>

        <div className="mwc-recap-cards">
          {highlights.map((highlight) => (
            <HighlightCard key={highlight.day} highlight={highlight} />
          ))}
        </div>
      </section>

      <section id="legacy" className="mwc-recap-legacy">
        <div className="mwc-recap-legacy-copy">
          <p className="mwc-recap-eyebrow">Beyond the conference</p>
          <h2>The journey has only just begun.</h2>
          <p>
            MWC 2026 may be over, but the Word, encounters and relationships
            formed across the weekend continue. Rewatch the sessions, share
            the highlights and keep walking boldly into Greater Things.
          </p>
        </div>

        <blockquote>
          <span aria-hidden="true">“</span>
          <p>
            Greater works than these will he do, because I am going to the Father.
          </p>
          <cite>John 14:12</cite>
        </blockquote>
      </section>

      <section id="stay-connected" className="mwc-recap-connect">
        <div className="mwc-recap-connect-glow" aria-hidden="true" />
        <Heart size={30} />
        <p className="mwc-recap-eyebrow">Stay connected</p>
        <h2>Greater Things continue.</h2>
        <p>
          Keep up with Everwinning Faith Ministries Australia and be the first
          to hear what comes next.
        </p>
        <Link href="#highlights" className="mwc-recap-primary">
          <Play size={18} fill="currentColor" />
          Return to the highlights
        </Link>
      </section>

      <footer className="mwc-recap-footer">
        <div className="mwc-recap-footer-brand">
          <Image
            src="/images/hero-2026/everwinning-white.png"
            alt="Everwinning Faith Ministries Australia"
            width={230}
            height={154}
          />
          <p>Hosted by Everwinning Faith Ministries Australia</p>
        </div>
        <p>© 2026 Everwinning Faith Ministries Australia</p>
        <a href="https://bytesngigs.com.au" target="_blank" rel="noopener noreferrer">
          Designed &amp; developed by Bytes n Gigs
        </a>
      </footer>
    </main>
  );
}
