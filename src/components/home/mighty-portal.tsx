"use client";

import {
  motion,
  type MotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";

type MightyPortalProps = {
  pointerX: MotionValue<number>;
  pointerY: MotionValue<number>;
  scrollProgress: MotionValue<number>;
};

const PARTICLES = [
  { x: 10, y: 18, size: 2, delay: 0.2, duration: 6.5 },
  { x: 22, y: 72, size: 3, delay: 1.4, duration: 8.2 },
  { x: 31, y: 32, size: 2, delay: 2.1, duration: 7.4 },
  { x: 41, y: 82, size: 2, delay: 0.8, duration: 9.1 },
  { x: 50, y: 12, size: 3, delay: 1.9, duration: 7.9 },
  { x: 58, y: 68, size: 2, delay: 3.2, duration: 8.8 },
  { x: 66, y: 25, size: 2, delay: 0.4, duration: 6.9 },
  { x: 76, y: 76, size: 3, delay: 2.7, duration: 9.4 },
  { x: 82, y: 42, size: 2, delay: 1.1, duration: 7.3 },
  { x: 91, y: 63, size: 2, delay: 3.6, duration: 8.6 },
  { x: 16, y: 47, size: 2, delay: 2.4, duration: 7.8 },
  { x: 72, y: 8, size: 2, delay: 1.7, duration: 8.3 },
];

export function MightyPortal({
  pointerX,
  pointerY,
  scrollProgress,
}: MightyPortalProps) {
  const reducedMotion = useReducedMotion();

  const rotateXRaw = useTransform(pointerY, [-0.5, 0.5], [7, -7]);
  const rotateYRaw = useTransform(pointerX, [-0.5, 0.5], [-8, 8]);

  const rotateX = useSpring(rotateXRaw, {
    stiffness: 80,
    damping: 24,
  });

  const rotateY = useSpring(rotateYRaw, {
    stiffness: 80,
    damping: 24,
  });

  const portalScale = useTransform(
    scrollProgress,
    [0, 0.75, 1],
    [1, 1.08, 1.32]
  );

  const portalY = useTransform(
    scrollProgress,
    [0, 1],
    [0, 170]
  );

  const portalOpacity = useTransform(
    scrollProgress,
    [0, 0.72, 1],
    [1, 0.92, 0]
  );

  return (
    <motion.div
      style={{
        rotateX: reducedMotion ? 0 : rotateX,
        rotateY: reducedMotion ? 0 : rotateY,
        scale: reducedMotion ? 1 : portalScale,
        y: reducedMotion ? 0 : portalY,
        opacity: portalOpacity,
        transformPerspective: 1300,
        transformStyle: "preserve-3d",
      }}
      className="mighty-portal-stage relative mx-auto aspect-square w-full max-w-[570px]"
    >
      <div className="portal-ambient-glow absolute inset-[4%] rounded-full" />

      <div className="portal-particle-field absolute inset-0">
        {PARTICLES.map((particle, index) => (
          <motion.span
            key={index}
            className="portal-particle"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: particle.size,
              height: particle.size,
            }}
            animate={
              reducedMotion
                ? undefined
                : {
                    y: [0, -14, 6, 0],
                    opacity: [0.2, 0.85, 0.35, 0.2],
                    scale: [1, 1.8, 0.9, 1],
                  }
            }
            transition={{
              duration: particle.duration,
              delay: particle.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      <motion.div
        animate={reducedMotion ? undefined : { rotate: 360 }}
        transition={{
          duration: 38,
          repeat: Infinity,
          ease: "linear",
        }}
        className="portal-ring portal-ring-outer absolute inset-[1%]"
      />

      <motion.div
        animate={reducedMotion ? undefined : { rotate: -360 }}
        transition={{
          duration: 29,
          repeat: Infinity,
          ease: "linear",
        }}
        className="portal-ring portal-ring-mid absolute inset-[10%]"
      />

      <motion.div
        animate={reducedMotion ? undefined : { rotate: 360 }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear",
        }}
        className="portal-ring portal-ring-inner absolute inset-[20%]"
      />

      <motion.div
        animate={reducedMotion ? undefined : { rotate: 360 }}
        transition={{
          duration: 16,
          repeat: Infinity,
          ease: "linear",
        }}
        className="portal-energy-line absolute inset-[27%]"
      />

      <motion.div
        animate={
          reducedMotion
            ? undefined
            : {
                scale: [1, 1.045, 1],
              }
        }
        transition={{
          duration: 4.4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="portal-core absolute inset-[29%] flex items-center justify-center rounded-full"
      >
        <div className="portal-core-halo absolute inset-0 rounded-full" />

        <motion.div
          animate={
            reducedMotion
              ? undefined
              : {
                  y: [-4, 5, -4],
                }
          }
          transition={{
            duration: 5.2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="relative z-10 text-center"
        >
          <p className="portal-eleven">8</p>

          <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.48em] text-[var(--brand-red)] sm:text-xs">
            Editions
          </p>
        </motion.div>
      </motion.div>

      <div className="portal-beam portal-beam-one absolute" />
      <div className="portal-beam portal-beam-two absolute" />

      <motion.div
        animate={
          reducedMotion
            ? undefined
            : {
                y: [-8, 8, -8],
              }
        }
        transition={{
          duration: 5.8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="portal-caption absolute bottom-[8%] left-[3%]"
      >
        <p className="text-[10px] uppercase tracking-[0.36em] text-white/35">
          Eleven years
        </p>

        <p className="mt-1 text-sm font-semibold text-white sm:text-base">
          The works continue.
        </p>
      </motion.div>

      <motion.div
        animate={
          reducedMotion
            ? undefined
            : {
                y: [6, -8, 6],
              }
        }
        transition={{
          duration: 6.8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="portal-caption absolute right-[2%] top-[17%]"
      >
        <p className="text-[10px] uppercase tracking-[0.36em] text-white/35">
          Brisbane
        </p>

        <p className="mt-1 text-sm font-semibold text-white">
          7–8 Nov 2026
        </p>
      </motion.div>
    </motion.div>
  );
}
