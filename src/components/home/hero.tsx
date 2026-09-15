"use client";

import {
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import { ArrowDown, CalendarDays, MapPin } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef } from "react";
import { MightyPortal } from "./mighty-portal";

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const reducedMotion = useReducedMotion();

  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  const contentY = useTransform(
    scrollYProgress,
    [0, 1],
    [0, reducedMotion ? 0 : -90]
  );

  const contentOpacity = useTransform(
    scrollYProgress,
    [0, 0.72, 1],
    [1, 0.88, 0]
  );

  useEffect(() => {
    function handlePointerMove(event: PointerEvent) {
      pointerX.set(event.clientX / window.innerWidth - 0.5);
      pointerY.set(event.clientY / window.innerHeight - 0.5);
    }

    window.addEventListener("pointermove", handlePointerMove, {
      passive: true,
    });

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
    };
  }, [pointerX, pointerY]);

  return (
    <section
      ref={sectionRef}
      className="hero-shell relative flex min-h-[100svh] items-center overflow-hidden px-6 py-16 lg:px-12"
    >
      <div className="hero-grid absolute inset-0" />
      <div className="hero-vignette absolute inset-0" />
      <div className="hero-depth-glow absolute inset-0" />

      <motion.div
        className="hero-orb hero-orb-one"
        animate={
          reducedMotion
            ? undefined
            : {
                x: [0, 65, -30, 0],
                y: [0, -35, 45, 0],
                scale: [1, 1.13, 0.96, 1],
              }
        }
        transition={{
          duration: 19,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <div className="relative z-10 mx-auto grid w-full max-w-[1400px] items-center gap-8 xl:grid-cols-[0.95fr_1.05fr]">
        <motion.div
          style={{
            y: contentY,
            opacity: contentOpacity,
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="mb-6"
          >
            <div className="ministry-brand-lockup">
              <Image
                src="/brand/Logo.png"
                alt="Everwinning Faith Ministries Australia"
                width={1080}
                height={1080}
                priority
                className="ministry-brand-logo"
              />
            </div>
          </motion.div>

          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.42em] text-[var(--brand-red)] sm:text-sm">
            8th Edition
          </p>

          <h1 className="hero-title max-w-[760px] text-[clamp(4rem,8.7vw,9rem)] font-black uppercase leading-[0.76] tracking-[-0.07em]">
            <span className="block text-white">Mighty</span>
            <span className="glory-text block">Works</span>
          </h1>

          <div className="mt-7">
            <p className="text-xs font-bold uppercase tracking-[0.38em] text-white/38 sm:text-sm">
              Conference 2026
            </p>

            <p className="hero-statement mt-5 text-xl font-medium uppercase tracking-[0.02em] text-white sm:text-2xl">
              The works continue.
            </p>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/register" className="primary-cta">
              Register now
            </Link>

            <Link href="#experience" className="secondary-cta">
              Enter the experience
            </Link>
          </div>

          <div className="mt-8 flex flex-wrap gap-x-7 gap-y-3 text-xs text-white/45 sm:text-sm">
            <div className="flex items-center gap-2">
              <CalendarDays size={16} />
              <span>7–8 November 2026</span>
            </div>

            <div className="flex items-center gap-2">
              <MapPin size={16} />
              <span>Brisbane, Australia</span>
            </div>
          </div>
        </motion.div>

        <div className="relative mx-auto w-full max-w-[570px]">
          <MightyPortal
            pointerX={pointerX}
            pointerY={pointerY}
            scrollProgress={scrollYProgress}
          />
        </div>
      </div>

      <motion.a
        href="#experience"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-5 left-1/2 z-30 hidden -translate-x-1/2 flex-col items-center gap-1.5 text-white/28 lg:flex"
      >
        <span className="text-[9px] uppercase tracking-[0.4em]">
          Continue
        </span>

        <motion.span
          animate={
            reducedMotion
              ? undefined
              : {
                  y: [0, 7, 0],
                }
          }
          transition={{
            duration: 1.8,
            repeat: Infinity,
          }}
        >
          <ArrowDown size={15} />
        </motion.span>
      </motion.a>
    </section>
  );
}
