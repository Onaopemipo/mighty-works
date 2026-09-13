"use client";

import { motion } from "framer-motion";

const moments = [
  {
    number: "01",
    title: "Encounter",
    text: "A spiritual atmosphere designed for worship, revelation and response.",
  },
  {
    number: "02",
    title: "Equipping",
    text: "Biblical teaching that moves beyond inspiration into practical faith and action.",
  },
  {
    number: "03",
    title: "Commission",
    text: "Leave prepared to carry the works of Christ into homes, churches, communities and nations.",
  },
];

export function Experience() {
  return (
    <section
      id="experience"
      className="relative overflow-hidden px-6 py-32 lg:px-12 lg:py-44"
    >
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8 }}
          className="max-w-3xl"
        >
          <p className="section-kicker">Not another conference</p>

          <h2 className="section-heading mt-6">
            Step into the story,
            <span className="glory-text block">not just the programme.</span>
          </h2>

          <p className="mt-8 max-w-2xl text-lg leading-8 text-white/55">
            Mighty Works is being shaped as an experience rather than a sequence
            of sessions. Every part of the weekend should move people from
            expectation to encounter, and from encounter to action.
          </p>
        </motion.div>

        <div className="mt-20 grid gap-5 lg:grid-cols-3">
          {moments.map((moment, index) => (
            <motion.article
              key={moment.number}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{
                delay: index * 0.12,
                duration: 0.7,
              }}
              whileHover={{ y: -10 }}
              className="experience-card group"
            >
              <span className="text-sm font-semibold tracking-[0.35em] text-[var(--gold)]">
                {moment.number}
              </span>

              <h3 className="mt-12 text-4xl font-semibold tracking-[-0.04em] text-white">
                {moment.title}
              </h3>

              <p className="mt-5 leading-7 text-white/50">
                {moment.text}
              </p>

              <div className="mt-12 h-px w-full bg-gradient-to-r from-[var(--gold)]/50 to-transparent opacity-50 transition-opacity duration-500 group-hover:opacity-100" />
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
