"use client";

import { motion } from "framer-motion";

export function SchedulePreview() {
  return (
    <section className="px-6 py-28 lg:px-12 lg:py-40">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-16 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="section-kicker">Two days</p>

            <h2 className="section-heading mt-5">
              One unfolding
              <span className="block text-white/35">journey.</span>
            </h2>
          </div>

          <div className="space-y-4">
            {[
              {
                day: "Friday",
                date: "7 November",
                time: "5:00 PM",
                copy: "Opening night — worship, expectation and the beginning of the encounter.",
              },
              {
                day: "Saturday",
                date: "8 November",
                time: "Programme to follow",
                copy: "A full conference journey of teaching, prayer, worship and commissioning.",
              },
            ].map((item, index) => (
              <motion.div
                key={item.day}
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{
                  delay: index * 0.14,
                  duration: 0.7,
                }}
                className="schedule-row"
              >
                <div>
                  <p className="text-xs uppercase tracking-[0.32em] text-[var(--gold)]">
                    {item.date}
                  </p>

                  <h3 className="mt-3 text-4xl font-semibold tracking-[-0.04em] text-white">
                    {item.day}
                  </h3>
                </div>

                <div className="lg:text-right">
                  <p className="text-sm font-semibold text-white/80">
                    {item.time}
                  </p>

                  <p className="mt-3 max-w-xl leading-7 text-white/45 lg:ml-auto">
                    {item.copy}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
