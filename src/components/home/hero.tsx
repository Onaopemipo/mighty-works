"use client";

import { motion, useMotionValue, useSpring } from "framer-motion";
import { ArrowDown, CalendarDays, MapPin } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

export function Hero() {
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);

  const rotateX = useSpring(pointerY, {
    stiffness: 70,
    damping: 25,
  });

  const rotateY = useSpring(pointerX, {
    stiffness: 70,
    damping: 25,
  });

  useEffect(() => {
    function handlePointerMove(event: PointerEvent) {
      const x = event.clientX / window.innerWidth - 0.5;
      const y = event.clientY / window.innerHeight - 0.5;

      pointerX.set(x * 8);
      pointerY.set(y * -8);
    }

    window.addEventListener("pointermove", handlePointerMove);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
    };
  }, [pointerX, pointerY]);

  return (
    <section className="hero-shell relative flex min-h-screen items-center overflow-hidden px-6 pb-16 pt-28 lg:px-12">
      <div className="hero-grid absolute inset-0" />

      <motion.div
        className="hero-orb hero-orb-one"
        animate={{
          x: [0, 70, -20, 0],
          y: [0, -40, 40, 0],
          scale: [1, 1.12, 0.95, 1],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <motion.div
        className="hero-orb hero-orb-two"
        animate={{
          x: [0, -60, 30, 0],
          y: [0, 50, -30, 0],
          scale: [1, 0.9, 1.1, 1],
        }}
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <div className="relative z-10 mx-auto grid w-full max-w-7xl items-center gap-14 lg:grid-cols-[1.15fr_0.85fr]">
        <div>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="mb-8 inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 backdrop-blur-xl"
          >
            <span className="h-2 w-2 rounded-full bg-[var(--gold)] shadow-[0_0_20px_var(--gold)]" />

            <span className="text-xs font-semibold uppercase tracking-[0.28em] text-white/65">
              Everwinning Faith Ministries Australia
            </span>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25, duration: 0.8 }}
            className="mb-4 text-sm font-semibold uppercase tracking-[0.42em] text-[var(--gold)]"
          >
            11th Edition
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 45 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: 0.2,
              duration: 0.9,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="max-w-5xl text-[clamp(4rem,10vw,9.5rem)] font-black uppercase leading-[0.78] tracking-[-0.07em]"
          >
            <span className="block text-white">Mighty</span>
            <span className="glory-text block">Works</span>
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65, duration: 0.7 }}
            className="mt-9 max-w-2xl"
          >
            <p className="text-sm font-bold uppercase tracking-[0.35em] text-white/45">
              Conference 2026
            </p>

            <p className="mt-6 max-w-xl text-lg leading-8 text-white/65 sm:text-xl">
              A gathering for those who believe the words of Jesus still stand:
              greater works are possible.
            </p>

            <p className="mt-4 font-serif text-xl italic text-white/80">
              “He that believeth on me, the works that I do shall he do also;
              and greater works than these shall he do.”
            </p>

            <p className="mt-2 text-sm uppercase tracking-[0.3em] text-white/35">
              John 14:12
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.85, duration: 0.7 }}
            className="mt-10 flex flex-col gap-4 sm:flex-row"
          >
            <Link href="#register" className="primary-cta">
              Register now
            </Link>

            <Link href="#experience" className="secondary-cta">
              Enter the experience
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.05, duration: 0.8 }}
            className="mt-12 flex flex-wrap gap-x-8 gap-y-4 text-sm text-white/50"
          >
            <div className="flex items-center gap-2">
              <CalendarDays size={17} />
              <span>7–8 November 2026</span>
            </div>

            <div className="flex items-center gap-2">
              <MapPin size={17} />
              <span>Brisbane, Australia</span>
            </div>
          </motion.div>
        </div>

        <motion.div
          style={{
            rotateX,
            rotateY,
            transformPerspective: 1200,
          }}
          initial={{ opacity: 0, scale: 0.9, y: 60 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{
            delay: 0.35,
            duration: 1.1,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="relative mx-auto hidden aspect-square w-full max-w-[520px] lg:block"
        >
          <div className="absolute inset-[8%] rounded-full border border-white/10" />
          <div className="absolute inset-[18%] rounded-full border border-white/[0.08]" />
          <div className="absolute inset-[29%] rounded-full border border-white/[0.06]" />

          <motion.div
            animate={{ rotate: 360 }}
            transition={{
              duration: 32,
              repeat: Infinity,
              ease: "linear",
            }}
            className="absolute inset-[4%] rounded-full border border-dashed border-[var(--gold)]/25"
          />

          <motion.div
            animate={{ rotate: -360 }}
            transition={{
              duration: 21,
              repeat: Infinity,
              ease: "linear",
            }}
            className="absolute inset-[22%] rounded-full border border-dashed border-white/15"
          />

          <div className="hero-portal absolute inset-[30%] flex items-center justify-center rounded-full">
            <div className="text-center">
              <p className="text-[5rem] font-black leading-none text-white">11</p>
              <p className="mt-2 text-xs uppercase tracking-[0.38em] text-[var(--gold)]">
                Editions
              </p>
            </div>
          </div>

          <motion.div
            animate={{ y: [-10, 12, -10] }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute bottom-[8%] left-[8%] rounded-2xl border border-white/10 bg-black/30 px-5 py-4 backdrop-blur-xl"
          >
            <p className="text-xs uppercase tracking-[0.3em] text-white/40">
              Two days
            </p>

            <p className="mt-1 text-lg font-semibold text-white">
              One encounter.
            </p>
          </motion.div>
        </motion.div>
      </div>

      <motion.a
        href="#experience"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4 }}
        className="absolute bottom-7 left-1/2 z-20 hidden -translate-x-1/2 flex-col items-center gap-2 text-white/35 md:flex"
      >
        <span className="text-[10px] uppercase tracking-[0.36em]">
          Discover
        </span>

        <motion.span
          animate={{ y: [0, 8, 0] }}
          transition={{
            duration: 1.7,
            repeat: Infinity,
          }}
        >
          <ArrowDown size={17} />
        </motion.span>
      </motion.a>
    </section>
  );
}
