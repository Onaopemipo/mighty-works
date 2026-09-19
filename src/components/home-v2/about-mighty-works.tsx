"use client";

import {
  motion,
  useReducedMotion,
} from "framer-motion";

const chapters = [
  {
    number: "01",
    label: "The anchor",
    title: "Mighty upon the earth.",
    scripture: "Psalm 112:1–2",
    body:
      "The anchor scripture for this mandate is Psalm 112:1–2, which declares that those who fear the Lord and delight greatly in His commandments shall be mighty upon the earth. God’s plan, therefore, is to raise a people who are daily producers of mighty works—believers whose lives radiate uncommon testimonies, undeniable results, and manifestations that cannot be explained by natural reasoning.",
  },
  {
    number: "02",
    label: "The platform",
    title: "Empowered for incredible works.",
    body:
      "He chose this conference as a platform to empower His children to become doers of incredible works and producers of infallible proofs. Here, God equips His people to operate at dimensions of grace that provoke wonders—testimonies that question conventional wisdom, results that defy human limitation, and exploits that point unmistakably to the hand of God.",
  },
  {
    number: "03",
    label: "The mandate",
    title: "Power. Depth. Character. Stature.",
    quote:
      "To build a people of power, depth, character, and spiritual stature—men and women who will take charge of events and circumstances that can only be described as Miracles.",
    body:
      "Since its inception, this mandate has remained consistent.",
  },
  {
    number: "04",
    label: "The journey",
    title: "A mandate unfolding.",
    body:
      "The Mighty Works Conference formally began in 2019, and through each year, the Lord has unfolded dimensions of His agenda.",
  },
  {
    number: "05",
    label: "2019",
    title: "Made for More",
    body:
      "A call to recognise our divine capacity and spiritual potential.",
  },
  {
    number: "06",
    label: "2020",
    title: "Spread Out",
    body:
      "A charge to enlarge territories despite global uncertainty.",
  },
  {
    number: "07",
    label: "2021",
    title: "Increase",
    body:
      "A prophetic release of expansion, multiplication, and fruitfulness.",
  },
  {
    number: "08",
    label: "2022",
    title: "Greatness",
    body:
      "A season of ascending into God’s higher purpose and kingdom influence.",
  },
  {
    number: "09",
    label: "2023",
    title: "Next Level",
    body:
      "A call to rise beyond previous dimensions and step into higher levels of spiritual capacity, influence and impact.",
  },
  {
    number: "10",
    label: "2024",
    title: "Majesty — The Rise of Kings",
    body:
      "A season of kingdom identity, authority and dominion—raising men and women who understand their royal mandate and take their place in God’s purpose.",
  },
  {
    number: "8",
    label: "2025",
    title: "Greater Exploits",
    body:
      "A culmination and a launching pad—God calling His people into realms beyond previous experiences.",
  },
  {
    number: "12",
    label: "2026",
    title: "Greater Things",
    scripture: "John 14:12",
    body:
      "The mandate continues: raising a people whose lives produce mighty works, undeniable results, infallible proofs and testimonies that point unmistakably to the hand of God.",
  },
];

export function AboutMightyWorks() {
  const reducedMotion =
    useReducedMotion();

  return (
    <section
      id="about"
      className="mw-story-v3"
      aria-labelledby="mw-story-v3-title"
    >
      <div
        className="mw-story-v3-atmosphere"
        aria-hidden="true"
      >
        <div className="mw-story-v3-orbit mw-story-v3-orbit-one" />
        <div className="mw-story-v3-orbit mw-story-v3-orbit-two" />
        <div className="mw-story-v3-glow" />
        <div className="mw-story-v3-grain" />
      </div>

      <div className="mw-story-v3-shell">
        <header className="mw-story-v3-opening">
          <div className="mw-story-v3-opening-meta">
            <p className="mw-story-v3-kicker">
              The story of Mighty Works
            </p>

            <span>
              2019 — 2026
            </span>
          </div>

          <h2 id="mw-story-v3-title">
            More than
            <span>
              a conference.
            </span>
          </h2>

          <div className="mw-story-v3-opening-foot">
            <p>
              Mighty Works is a mandate to
              raise people whose lives produce
              results that point unmistakably
              to the hand of God.
            </p>

            <div
              className="mw-story-v3-scroll-cue"
              aria-hidden="true"
            >
              <span>
                Follow the story
              </span>

              <i />
            </div>
          </div>
        </header>

        <div className="mw-story-v3-journey">
          <aside className="mw-story-v3-rail">
            <div className="mw-story-v3-rail-sticky">
              <p>
                The journey
              </p>

              <div className="mw-story-v3-year-range">
                <strong>
                  2019
                </strong>

                <div>
                  <i />
                </div>

                <strong>
                  2026
                </strong>
              </div>

              <p className="mw-story-v3-rail-copy">
                One mandate.
                <br />
                Unfolding dimensions.
              </p>
            </div>
          </aside>

          <div className="mw-story-v3-chapters">
            {chapters.map(
              (
                chapter,
                index
              ) => {
                const isYear =
                  /^20\d{2}$/.test(
                    chapter.label
                  );

                const isCurrent =
                  chapter.label ===
                  "2026";

                return (
                  <motion.article
                    key={
                      `${chapter.label}-${chapter.title}`
                    }
                    initial={
                      reducedMotion
                        ? undefined
                        : {
                            opacity: 0.22,
                            y: 64,
                          }
                    }
                    whileInView={{
                      opacity: 1,
                      y: 0,
                    }}
                    viewport={{
                      amount: 0.42,
                      margin:
                        "-10% 0px -12% 0px",
                    }}
                    transition={{
                      duration: 0.72,
                      ease: [
                        0.22,
                        1,
                        0.36,
                        1,
                      ],
                    }}
                    className={[
                      "mw-story-v3-chapter",
                      isYear
                        ? "is-year"
                        : "",
                      isCurrent
                        ? "is-current"
                        : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    <div className="mw-story-v3-chapter-marker">
                      <span>
                        {isYear
                          ? chapter.label
                          : String(
                              index + 1
                            ).padStart(
                              2,
                              "0"
                            )}
                      </span>

                      <i />
                    </div>

                    <div className="mw-story-v3-chapter-body">
                      <p className="mw-story-v3-chapter-kicker">
                        {isCurrent
                          ? "The story continues"
                          : isYear
                            ? "A chapter in the journey"
                            : "The mandate"}
                      </p>

                      <h3>
                        {
                          chapter.title
                        }
                      </h3>

                      {chapter.scripture ? (
                        <p className="mw-story-v3-scripture">
                          {
                            chapter.scripture
                          }
                        </p>
                      ) : null}

                      {chapter.quote ? (
                        <blockquote>
                          <span
                            aria-hidden="true"
                          >
                            “
                          </span>

                          {
                            chapter.quote
                          }
                        </blockquote>
                      ) : null}

                      <p className="mw-story-v3-body-copy">
                        {
                          chapter.body
                        }
                      </p>
                    </div>

                    {isCurrent ? (
                      <div
                        className="mw-story-v3-current-orbit"
                        aria-hidden="true"
                      />
                    ) : null}
                  </motion.article>
                );
              }
            )}
          </div>
        </div>

        <motion.footer
          className="mw-story-v3-finale"
          initial={
            reducedMotion
              ? undefined
              : {
                  opacity: 0,
                  y: 42,
                }
          }
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: true,
            amount: 0.4,
          }}
          transition={{
            duration: 0.8,
            ease: [
              0.22,
              1,
              0.36,
              1,
            ],
          }}
        >
          <p>
            2026
          </p>

          <h3>
            Greater
            <span>
              Things.
            </span>
          </h3>

          <div className="mw-story-v3-finale-meta">
            <span>
              John 14:12
            </span>

            <i />

            <span>
              The journey continues
            </span>
          </div>
        </motion.footer>
      </div>

      <div
        className="mw-story-v3-handoff"
        aria-hidden="true"
      />
    </section>
  );
}
