"use client";

import { motion } from "framer-motion";

export function Scripture() {
  return (
    <section className="relative flex min-h-[85vh] items-center overflow-hidden px-6 py-28 lg:px-12">
      <div className="scripture-glow absolute left-1/2 top-1/2 h-[38rem] w-[38rem] -translate-x-1/2 -translate-y-1/2 rounded-full" />

      <div className="relative z-10 mx-auto max-w-6xl text-center">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="section-kicker"
        >
          The promise
        </motion.p>

        <motion.blockquote
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.9 }}
          className="mt-10 font-serif text-[clamp(2.6rem,6vw,6.7rem)] leading-[1.02] tracking-[-0.045em] text-white"
        >
          “The works that I do
          <span className="glory-text"> shall he do also;</span>
          and greater works than these shall he do.”
        </motion.blockquote>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.25 }}
          className="mt-10 text-xs font-semibold uppercase tracking-[0.42em] text-white/40"
        >
          John 14:12
        </motion.p>
      </div>
    </section>
  );
}
