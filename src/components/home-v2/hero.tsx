"use client";

import {
  motion,
  useReducedMotion,
} from "framer-motion";
import {
  CalendarDays,
  Clock3,
  MapPin,
} from "lucide-react";
import Image from "next/image";

const HERO_ASSET_ROOT =
  "/images/hero-2026";

export function HeroV2() {
  const reducedMotion =
    useReducedMotion();

  const reveal = (
    delay = 0,
    distance = 24
  ) =>
    reducedMotion
      ? {}
      : {
          initial: {
            opacity: 0,
            y: distance,
          },
          animate: {
            opacity: 1,
            y: 0,
          },
          transition: {
            duration: 0.85,
            delay,
            ease: [
              0.22,
              1,
              0.36,
              1,
            ] as const,
          },
        };

  return (
    <section
      id="top"
      className="mw-hero-v3"
      aria-labelledby="mw-hero-v3-title"
    >
      <div
        className="mw-hero-v3-cosmos"
        aria-hidden="true"
      >
        <div className="mw-hero-v3-nebula mw-hero-v3-nebula-left" />
        <div className="mw-hero-v3-nebula mw-hero-v3-nebula-right" />
        <div className="mw-hero-v3-stars" />
        <div className="mw-hero-v3-light-beam" />
      </div>

      <motion.div
        className="mw-hero-v3-earth"
        aria-hidden="true"
        animate={
          reducedMotion
            ? undefined
            : {
                y: [0, -8, 0],
                scale: [
                  1,
                  1.018,
                  1,
                ],
              }
        }
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <div className="mw-hero-v3-earth-glow" />

        <Image
          src={`${HERO_ASSET_ROOT}/earth.png`}
          alt=""
          fill
          priority
          fetchPriority="high"
          sizes="(max-width: 767px) 112vw, (max-width: 1199px) 86vw, 72vw"
        />
      </motion.div>

      <div className="mw-hero-v3-host-glow" />

      <div className="mw-hero-v3-hosts">
        <motion.figure
          className="mw-hero-v3-host mw-hero-v3-host-pastor"
          {...reveal(
            0.12,
            34
          )}
        >
          <Image
            src={`${HERO_ASSET_ROOT}/pastor-olakunle-akingbehin.png`}
            alt="Pastor Olakunle Akingbehin"
            fill
            priority
            sizes="(max-width: 767px) 55vw, (max-width: 1199px) 38vw, 32vw"
          />

          <figcaption>
            <span>
              Host
            </span>

            <strong>
              Pastor Olakunle
              <br />
              Akingbehin
            </strong>
          </figcaption>
        </motion.figure>

        <motion.figure
          className="mw-hero-v3-host mw-hero-v3-host-foluke"
          {...reveal(
            0.2,
            34
          )}
        >
          <Image
            src={`${HERO_ASSET_ROOT}/mrs-foluke-akingbehin.png`}
            alt="Mrs. Foluke Akingbehin"
            fill
            priority
            sizes="(max-width: 767px) 55vw, (max-width: 1199px) 38vw, 32vw"
          />

          <figcaption>
            <span>
              Host
            </span>

            <strong>
              Mrs. Foluke
              <br />
              Akingbehin
            </strong>
          </figcaption>
        </motion.figure>
      </div>

      <div
        className="mw-hero-v3-energy"
        aria-hidden="true"
      >
        <div className="mw-hero-v3-energy-ribbon ribbon-one" />
        <div className="mw-hero-v3-energy-ribbon ribbon-two" />
      </div>

      <div className="mw-hero-v3-content">
        <motion.div
          className="mw-hero-v3-edition"
          {...reveal(
            0.12,
            14
          )}
        >
          <strong>
            8th
          </strong>
          <span>
            Edition
          </span>
        </motion.div>

        <motion.div
          className="mw-hero-v3-theme"
          {...reveal(
            0.3,
            38
          )}
        >
          <p>
            Theme
          </p>

          <h1 id="mw-hero-v3-title">
            <span>
              Greater
            </span>

            <em>
              Things
            </em>
          </h1>

          <div
            className="mw-hero-v3-cross"
            aria-hidden="true"
          >
            <i />
          </div>

          <div className="mw-hero-v3-conference-line">
            <span>
              Mighty Works
              Conference 2026
            </span>

            <strong>
              John 14:12
            </strong>
          </div>
        </motion.div>

        <motion.blockquote
          className="mw-hero-v3-scripture"
          {...reveal(
            0.42,
            18
          )}
        >
          <p>
            “He who believes in Me
            will also do the works
            that I do; and greater
            works than these he will
            do.”
          </p>

          <cite>
            John 14:12
          </cite>
        </motion.blockquote>

        <motion.div
          className="mw-hero-v3-event-panel"
          {...reveal(
            0.48,
            22
          )}
        >
          <div className="mw-hero-v3-date">
            <CalendarDays
              size={21}
            />

            <div>
              <span>
                Sat. Nov. 7,
                2026
              </span>

              <strong>
                <Clock3
                  size={15}
                />
                5:00 PM
              </strong>
            </div>
          </div>

          <div className="mw-hero-v3-date">
            <CalendarDays
              size={21}
            />

            <div>
              <span>
                Sun. Nov. 8,
                2026
              </span>

              <strong>
                <Clock3
                  size={15}
                />
                9:00 AM
              </strong>
            </div>
          </div>

          <div className="mw-hero-v3-venue">
            <MapPin
              size={22}
            />

            <div>
              <strong>
                Faith Center
              </strong>

              <span>
                62 Eastern Rd,
                Browns Plains QLD
                4118
              </span>
            </div>
          </div>
        </motion.div>

      </div>

      <div className="mw-hero-v3-motif">
        <span>
          People
        </span>
        <i />
        <span>
          Prayer
        </span>
        <i />
        <span>
          Purpose
        </span>
        <i />
        <span>
          Power
        </span>
      </div>

      <div
        className="mw-hero-v3-bottom-fade"
        aria-hidden="true"
      />
    </section>
  );
}
