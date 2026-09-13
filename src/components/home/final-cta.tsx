import Link from "next/link";

export function FinalCta() {
  return (
    <section
      id="register"
      className="relative overflow-hidden px-6 py-32 text-center lg:px-12 lg:py-44"
    >
      <div className="final-glow absolute inset-0" />

      <div className="relative z-10 mx-auto max-w-5xl">
        <p className="section-kicker">Mighty Works Conference 2026</p>

        <h2 className="mt-8 text-[clamp(3.6rem,9vw,9rem)] font-black uppercase leading-[0.82] tracking-[-0.07em] text-white">
          Be in
          <span className="glory-text block">the room.</span>
        </h2>

        <p className="mx-auto mt-10 max-w-2xl text-lg leading-8 text-white/55">
          7–8 November 2026 · Brisbane, Australia
        </p>

        <div className="mt-10">
          <Link href="/register" className="primary-cta">
            Register for Mighty Works
          </Link>
        </div>
      </div>
    </section>
  );
}
