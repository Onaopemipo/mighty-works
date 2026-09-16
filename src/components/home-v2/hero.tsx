"use client";

import {
  motion,
  useReducedMotion,
} from "framer-motion";
import {
  CalendarDays,
  Globe2,
  MapPin,
  Radio,
} from "lucide-react";
import Link from "next/link";

import Image from "next/image";
export function HeroV2() {
  const reducedMotion =
    useReducedMotion();

  return (
    <section
      id="top"
      className="mw26-hero"
    >
      <div className="mw26-hero-grid" />
      <div className="mw26-stars" />
      <div className="mw26-hero-glow mw26-hero-glow-red" />
      <div className="mw26-hero-glow mw26-hero-glow-violet" />

      <div className="mw26-hero-inner">
        <div className="mw26-hero-copy">
          <motion.div
            initial={{
              opacity: 0,
              y: 18,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.65,
            }}
            className="mw26-theme-eyebrow"
          >
            <i />
            <span>
              The 2026 Theme ·
              John 14:12
            </span>
          </motion.div>

          <motion.div
            initial={{
              opacity: 0,
              y: 34,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.82,
              delay: 0.06,
            }}
            className="mw26-theme-title"
          >
            <span>
              Greater
            </span>

            <em>
              Things
            </em>
          </motion.div>

          <motion.div
            initial={{
              opacity: 0,
              y: 22,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.18,
              duration: 0.7,
            }}
            className="mw26-hero-message"
          >
            <strong>
              Bring your faith.
            </strong>

            <span>
              Make room for greater.
            </span>
          </motion.div>

          <div className="mw26-mobile-globe-slot">
            <GlobeComposition />
          </div>

          <motion.div
            initial={{
              opacity: 0,
              y: 10,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.3,
              duration: 0.7,
            }}
            className="mw26-host-signature"
          >
            <span>Hosted by</span>

            <Image
              src="/images/brand/everwinning-host-transparent.png"
              alt="Everwinning Faith Ministries Australia"
              width={250}
              height={170}
            />
          </motion.div>

          <motion.div
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.26,
              duration: 0.7,
            }}
            className="mw26-hero-quick-meta"
          >
            <span>
              <CalendarDays
                size={16}
              />
              7–8 November
              2026
            </span>

            <span>
              <Radio
                size={16}
              />
              In person +
              online
            </span>

            <span>
              <Globe2
                size={16}
              />
              An invitation
              to every nation
            </span>
          </motion.div>

          <motion.div
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.34,
              duration: 0.7,
            }}
            className="mw26-hero-actions"
          >
            <Link
              href="#register-interest"
              className="mw26-hero-primary"
            >
              I’m coming
              <span>↗</span>
            </Link>

            <Link
              href="#about"
              className="mw26-hero-secondary"
            >
              Enter the story
              <span>↓</span>
            </Link>
          </motion.div>
        </div>

        <div className="mw26-desktop-globe-slot">
          <GlobeComposition />
        </div>
      </div>

      <div className="mw26-hero-bottom">
        <span>
          One faith.
          Every nation.
        </span>

        <div className="mw26-scroll-indicator">
          <i />
        </div>
      </div>
    </section>
  );

  function GlobeComposition() {
    return (
      <div className="mw26-globe-composition">
        <div className="mw26-globe-aura" />

        <motion.div
          animate={
            reducedMotion
              ? undefined
              : {
                  rotate: 360,
                }
          }
          transition={{
            duration: 54,
            repeat:
              Infinity,
            ease: "linear",
          }}
          className="mw26-globe-orbit mw26-globe-orbit-a"
        />

        <motion.div
          animate={
            reducedMotion
              ? undefined
              : {
                  rotate:
                    -360,
                }
          }
          transition={{
            duration: 37,
            repeat:
              Infinity,
            ease: "linear",
          }}
          className="mw26-globe-orbit mw26-globe-orbit-b"
        />

        <motion.div
          animate={
            reducedMotion
              ? undefined
              : {
                  rotateY:
                    [0, 360],
                }
          }
          transition={{
            duration: 42,
            repeat:
              Infinity,
            ease: "linear",
          }}
          className="mw26-globe"
        >
          <div className="mw26-earth-image">
            <Image
              src="/images/hero/mighty-works-earth.jpg"
              alt=""
              fill
              priority
              sizes="(max-width: 900px) 88vw, 48vw"
            />
          </div>

          <div
            className="mw26-earth-atmosphere"
            aria-hidden="true"
          />

          <div
            className="mw26-earth-orbit orbit-one"
            aria-hidden="true"
          />

          <div
            className="mw26-earth-orbit orbit-two"
            aria-hidden="true"
          />
        </motion.div>

        <motion.div
          animate={
            reducedMotion
              ? undefined
              : {
                  y: [
                    0,
                    -10,
                    0,
                  ],
                  rotate:
                    [
                      -7,
                      -4,
                      -7,
                    ],
                }
          }
          transition={{
            duration: 5,
            repeat:
              Infinity,
            ease:
              "easeInOut",
          }}
          className="mw26-sticker mw26-theme-sticker"
        >
          <span>
            The 2026 Theme
          </span>

          <strong>
            Greater
            <br />
            Things.
          </strong>

          <small>
            John 14:12
          </small>
        </motion.div>

        <motion.div
          animate={
            reducedMotion
              ? undefined
              : {
                  y: [
                    0,
                    8,
                    0,
                  ],
                  rotate:
                    [
                      6,
                      3,
                      6,
                    ],
                }
          }
          transition={{
            duration: 5.8,
            repeat:
              Infinity,
            ease:
              "easeInOut",
          }}
          className="mw26-sticker mw26-date-sticker"
        >
          <CalendarDays
            size={23}
          />

          <strong>
            7–8
            <br />
            Nov 2026
          </strong>

          <span>
            5 PM AEST
            <br />
            each evening
          </span>
        </motion.div>

        <motion.div
          animate={
            reducedMotion
              ? undefined
              : {
                  y: [
                    0,
                    -7,
                    0,
                  ],
                  rotate:
                    [
                      5,
                      8,
                      5,
                    ],
                }
          }
          transition={{
            duration: 6.3,
            repeat:
              Infinity,
            ease:
              "easeInOut",
          }}
          className="mw26-sticker mw26-location-sticker"
        >
          <MapPin
            size={24}
          />

          <strong>
            Faith Center
          </strong>

          <span>
            62 Eastern Rd
            <br />
            Browns Plains QLD 4118
          </span>
        </motion.div>

        <motion.div
          animate={
            reducedMotion
              ? undefined
              : {
                  rotate:
                    [4, 7, 4],
                }
          }
          transition={{
            duration: 6,
            repeat:
              Infinity,
          }}
          className="mw26-edition-sticker"
        >
          <span>
            Mighty Works
          </span>

          <strong>
            8
            <sup>
              th
            </sup>
          </strong>

          <small>
            Edition · 2026
          </small>
        </motion.div>
      </div>
    );
  }
}
