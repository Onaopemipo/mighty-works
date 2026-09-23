import {
  ArrowUpRight,
  Camera,
  Move,
  Share2,
} from "lucide-react";
import Link from "next/link";

import "./photo-frame-promo.css";

export function PhotoFramePromo() {
  return (
    <section
      className="mw-photo-frame-promo"
      aria-labelledby="mw-photo-frame-promo-title"
    >
      <div
        className="mw-photo-frame-promo-glow"
        aria-hidden="true"
      />

      <div className="mw-photo-frame-promo-inner">
        <div className="mw-photo-frame-promo-copy">
          <div className="mw-photo-frame-promo-kicker">
            <Camera
              size={15}
              aria-hidden="true"
            />
            Mighty Works Photo Frame
          </div>

          <h2 id="mw-photo-frame-promo-title">
            Show the world
            <span>
              you&apos;re attending.
            </span>
          </h2>

          <p>
            Upload your photo, choose your
            favourite frame and share your
            excitement for Greater Things.
          </p>

          <Link
            href="/attending"
            className="mw-photo-frame-promo-action"
          >
            Create Your Photo Frame

            <ArrowUpRight
              size={17}
              aria-hidden="true"
            />
          </Link>
        </div>

        <div
          className="mw-photo-frame-promo-visual"
          aria-hidden="true"
        >
          <div className="mw-photo-frame-promo-frame">
            <div className="mw-photo-frame-promo-frame-top">
              <span>I AM</span>
              <strong>ATTENDING</strong>
            </div>

            <div className="mw-photo-frame-promo-photo">
              <div className="mw-photo-frame-promo-person">
                <span />
                <b />
              </div>
            </div>

            <div className="mw-photo-frame-promo-frame-bottom">
              <strong>
                MIGHTY WORKS
              </strong>

              <span>
                CONFERENCE 2026
              </span>
            </div>
          </div>

          <div className="mw-photo-frame-promo-chip mw-photo-frame-promo-chip-move">
            <Move size={14} />
            Position
          </div>

          <div className="mw-photo-frame-promo-chip mw-photo-frame-promo-chip-share">
            <Share2 size={14} />
            Share
          </div>
        </div>
      </div>
    </section>
  );
}
