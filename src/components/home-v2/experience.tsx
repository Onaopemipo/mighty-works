"use client";

import {
  BookOpen,
  Music2,
  Sparkles,
  UsersRound,
} from "lucide-react";

import {
  motion,
  useReducedMotion,
} from "framer-motion";

const experiences = [
  {
    number: "01",
    title: "Worship",
    copy:
      "A global sound of unity and adoration.",
    statement:
      "One sound. One people. One King.",
    icon: Music2,
    className: "worship",
  },
  {
    number: "02",
    title: "Word",
    copy:
      "Biblical truth for today's nations.",
    statement:
      "Truth that transforms how we live.",
    icon: BookOpen,
    className: "word",
  },
  {
    number: "03",
    title: "Prayer",
    copy:
      "A people who seek. A world that changes.",
    statement:
      "We seek God. He changes everything.",
    icon: Sparkles,
    className: "prayer",
  },
  {
    number: "04",
    title: "Impartation",
    copy:
      "Be equipped. Be empowered. Go further.",
    statement:
      "Receive. Be equipped. Go further.",
    icon: UsersRound,
    className: "impartation",
  },
];

export function ExperienceGrid() {
  const reducedMotion =
    useReducedMotion();

  return (
    <section
      id="experience"
      className="mw-experience-v3"
      aria-labelledby="mw-experience-v3-title"
    >
      <div
        className="mw-experience-v3-atmosphere"
        aria-hidden="true"
      >
        <div className="mw-experience-v3-glow" />
        <div className="mw-experience-v3-orbit mw-experience-v3-orbit-one" />
        <div className="mw-experience-v3-orbit mw-experience-v3-orbit-two" />
        <div className="mw-experience-v3-grid-field" />
      </div>

      <div className="mw-experience-v3-shell">
        <header className="mw-experience-v3-opening">
          <div className="mw-experience-v3-opening-meta">
            <p>
              Experience Mighty Works
            </p>

            <span>
              04 movements
            </span>
          </div>

          <h2 id="mw-experience-v3-title">
            This is the
            <span>
              experience.
            </span>
          </h2>

          <div className="mw-experience-v3-opening-foot">
            <p>
              Encounter God.
              <br />
              Be equipped.
              <br />
              Go further.
            </p>

            <span>
              Not spectators.
              <br />
              Participants.
            </span>
          </div>
        </header>

        <div className="mw-experience-v3-story">
          <aside className="mw-experience-v3-manifesto">
            <div className="mw-experience-v3-manifesto-sticky">
              <p>
                What happens
                <br />
                when we gather?
              </p>

              <div className="mw-experience-v3-manifesto-line">
                <i />
              </div>

              <span>
                Worship
                <br />
                Word
                <br />
                Prayer
                <br />
                Impartation
              </span>
            </div>
          </aside>

          <div className="mw-experience-v3-movements">
            {experiences.map(
              (
                item,
                index
              ) => {
                const Icon =
                  item.icon;

                return (
                  <motion.article
                    key={
                      item.title
                    }
                    className={`mw-experience-v3-movement ${item.className}`}
                    initial={
                      reducedMotion
                        ? undefined
                        : {
                            opacity: 0.2,
                            y: 58,
                          }
                    }
                    whileInView={{
                      opacity: 1,
                      y: 0,
                    }}
                    viewport={{
                      amount: 0.46,
                      margin:
                        "-8% 0px -10% 0px",
                    }}
                    transition={{
                      duration: 0.72,
                      delay:
                        reducedMotion
                          ? 0
                          : index *
                            0.02,
                      ease: [
                        0.22,
                        1,
                        0.36,
                        1,
                      ],
                    }}
                  >
                    <div className="mw-experience-v3-movement-top">
                      <span className="mw-experience-v3-number">
                        {
                          item.number
                        }
                      </span>

                      <div className="mw-experience-v3-rule">
                        <i />
                      </div>

                      <div className="mw-experience-v3-icon">
                        <Icon
                          size={30}
                          strokeWidth={
                            1.45
                          }
                        />
                      </div>
                    </div>

                    <div className="mw-experience-v3-movement-body">
                      <p className="mw-experience-v3-kicker">
                        Movement{" "}
                        {
                          item.number
                        }
                      </p>

                      <h3>
                        {
                          item.title
                        }
                      </h3>

                      <p className="mw-experience-v3-statement">
                        {
                          item.statement
                        }
                      </p>

                      <p className="mw-experience-v3-copy">
                        {
                          item.copy
                        }
                      </p>
                    </div>

                    <div
                      className="mw-experience-v3-movement-orbit"
                      aria-hidden="true"
                    />
                  </motion.article>
                );
              }
            )}
          </div>
        </div>

        <motion.footer
          className="mw-experience-v3-finale"
          initial={
            reducedMotion
              ? undefined
              : {
                  opacity: 0,
                  y: 38,
                }
          }
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: true,
            amount: 0.45,
          }}
          transition={{
            duration: 0.75,
            ease: [
              0.22,
              1,
              0.36,
              1,
            ],
          }}
        >
          <p>
            And then
          </p>

          <h3>
            The nations
            <span>
              gather.
            </span>
          </h3>

          <div className="mw-experience-v3-finale-line">
            <i />
          </div>
        </motion.footer>
      </div>

      <div
        className="mw-experience-v3-nations-handoff"
        aria-hidden="true"
      />
    </section>
  );
}
