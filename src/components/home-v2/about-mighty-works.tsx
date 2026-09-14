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
    number: "11",
    label: "2025",
    title: "Greater Exploits",
    body:
      "A culmination and a launching pad—God calling His people into realms beyond previous experiences.",
  },
  {
    number: "12",
    label: "2026",
    title: "Greater Things",
    scripture: "Psalm 112:1–2",
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
      className="mw-about"
    >
      <div className="mw-about-background" />

      <div className="mw-about-shell">
        <aside className="mw-about-intro">
          <p className="homev2-kicker">
            About Mighty Works Conference
          </p>

          <h2>
            A mandate
            <em>
              unfolding.
            </em>
          </h2>

          <p className="mw-about-intro-copy">
            From Psalm 112 to a global
            gathering of believers, Mighty
            Works exists to raise people whose
            lives produce results that can only
            be attributed to God.
          </p>

          <div className="mw-about-progress">
            <span>
              2019
            </span>

            <i />

            <strong>
              2026
            </strong>
          </div>
        </aside>

        <div className="mw-about-story">
          {chapters.map(
            (
              chapter,
              index
            ) => (
              <motion.article
                key={
                  chapter.number
                }
                initial={
                  reducedMotion
                    ? undefined
                    : {
                        opacity: 0.2,
                        y: 54,
                      }
                }
                whileInView={{
                  opacity: 1,
                  y: 0,
                }}
                viewport={{
                  amount: 0.48,
                  margin:
                    "-8% 0px -8% 0px",
                }}
                transition={{
                  duration: 0.65,
                  ease: [
                    0.22,
                    1,
                    0.36,
                    1,
                  ],
                }}
                className={[
                  "mw-about-chapter",
                  /^20\d{2}$/.test(
                    chapter.label
                  )
                    ? "is-year"
                    : "",
                  chapter.label ===
                  "2026"
                    ? "is-current"
                    : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                <div className="mw-about-chapter-index">
                  <span>
                    {
                      chapter.number
                    }
                  </span>

                  <i />

                  <strong>
                    {
                      chapter.label
                    }
                  </strong>
                </div>

                <div className="mw-about-chapter-content">
                  <h3>
                    {
                      chapter.title
                    }
                  </h3>

                  {chapter.scripture ? (
                    <p className="mw-about-scripture">
                      {
                        chapter.scripture
                      }
                    </p>
                  ) : null}

                  {chapter.quote ? (
                    <blockquote>
                      “
                      {
                        chapter.quote
                      }
                      ”
                    </blockquote>
                  ) : null}

                  <p>
                    {
                      chapter.body
                    }
                  </p>
                </div>

                {index <
                chapters.length -
                  1 ? (
                  <div className="mw-about-next-line" />
                ) : null}
              </motion.article>
            )
          )}
        </div>
      </div>
    </section>
  );
}
