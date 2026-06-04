"use client";

import { useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { Scrim } from "@/components/ui/Scrim";

gsap.registerPlugin(ScrollTrigger, useGSAP);

// 00 · HERO — day→night crossfade on scroll-scrub (council: Option A, two layered images).
// The DAY layer sits at full opacity beneath; the NIGHT layer fades 0→1 on top with ease:none
// over the whole pin. No "muddy middle" (opaque photos don't grey) and no canvas (day stays the
// LCP element, SSR-rendered). H1 is real text (in SSR for LCP/SEO), revealed line-by-line.
export default function Hero() {
  const root = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      if (reduced) {
        // Static: night hidden, day shown, text fully visible. No pin, no scrub.
        gsap.set(".hero-night", { opacity: 0 });
        gsap.set([".hero-line", ".hero-kicker", ".hero-sub"], { opacity: 1, yPercent: 0 });
        gsap.set(".hero-hint", { opacity: 1 });
        return;
      }

      // Pin the hero for ~150vh and scrub day→night across it.
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: root.current,
          start: "top top",
          end: "+=150%",
          scrub: true,
          pin: true,
          pinSpacing: true,
          anticipatePin: 1,
        },
      });

      // Crossfade: night layer 0→1 over the full pin, linear (a blend curve is imperceptible).
      tl.fromTo(".hero-night", { opacity: 0 }, { opacity: 1, ease: "none" }, 0);
      // Warm window glow grows slightly faster than the sky darkens — the house "wakes up".
      tl.fromTo(".hero-glow", { opacity: 0 }, { opacity: 1, ease: "power1.in" }, 0);
      // Day-scrim: the bright sky needs a top veil for kicker legibility; the night photo
      // carries its own contrast, so fade the day-scrim down (not out) as night arrives.
      tl.fromTo(".hero-day-scrim", { opacity: 1 }, { opacity: 0.35, ease: "none" }, 0);

      // Scroll hint fades out almost immediately (first ~10%).
      tl.to(".hero-hint", { opacity: 0, ease: "none", duration: 0.1 }, 0);

      // --- Entrance reveals (run once on load, NOT tied to the scrub) ---------------------
      const intro = gsap.timeline({ defaults: { ease: "expo.out" } });
      intro
        .from(".hero-kicker", { opacity: 0, y: 16, duration: 1.2, delay: 0.2 })
        .from(
          ".hero-line",
          { opacity: 0, yPercent: 110, duration: 1.6, stagger: 0.12 },
          "-=0.9",
        )
        .from(".hero-sub", { opacity: 0, y: 18, duration: 1.4 }, "-=1.0")
        .from(".hero-hint", { opacity: 0, duration: 1.0 }, "-=0.8");
    },
    { scope: root, dependencies: [reduced] },
  );

  return (
    <section
      ref={root}
      className="relative h-screen w-full overflow-hidden bg-night"
      aria-label="Дім на Нагірній — головний екран"
    >
      {/* DAY layer — LCP-critical: eager + priority, full opacity beneath. onLoad fires the
          hero-ready signal so the Preloader veil lifts at the LCP moment (not before). */}
      <Image
        src="/images/hero-day-desktop.webp"
        alt="Дім на Нагірній удень: темна клінкерна цегла, колони з білими капітелями, олівковий дах, панорамне скління серед зелені"
        fill
        priority
        sizes="100vw"
        onLoad={() => window.dispatchEvent(new Event("nahirna:hero-ready"))}
        className="hidden object-cover md:block"
      />
      <Image
        src="/images/hero-day-mobile.webp"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover md:hidden"
        aria-hidden
      />

      {/* NIGHT layer — fades in on scroll. Lazy: revealed only on scrub, never the LCP element. */}
      <div className="hero-night absolute inset-0">
        <Image
          src="/images/hero-night-desktop.webp"
          alt=""
          fill
          loading="lazy"
          sizes="100vw"
          aria-hidden
          className="hidden object-cover md:block"
        />
        <Image
          src="/images/hero-night-mobile.webp"
          alt=""
          fill
          loading="lazy"
          sizes="100vw"
          aria-hidden
          className="object-cover md:hidden"
        />
      </div>

      {/* Warm window glow — narrow radial on the window band of the night photo (58%/56%),
          off the driveway, low alpha so the render's own bloom leads (not a fake vignette). */}
      <div
        className="hero-glow pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(60% 35% at 58% 56%, rgba(232,201,160,0.14), transparent 70%)",
        }}
        aria-hidden
      />

      {/* Legibility: bottom-up gradient scrim so text reads on both day and night. */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(to top, rgba(15,15,14,0.72) 0%, rgba(15,15,14,0.28) 32%, transparent 60%)",
        }}
        aria-hidden
      />

      {/* Day-scrim: extra veil over the text band, strong while the sky is bright, faded
          (not removed) as night arrives. Scrubbed in the timeline. */}
      <div
        className="hero-day-scrim pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(15,15,14,0) 0%, rgba(15,15,14,0) 38%, rgba(15,15,14,0.5) 64%, rgba(15,15,14,0.74) 100%)",
        }}
        aria-hidden
      />

      {/* Top scrim — guarantees the kicker reads against the bright daytime sky (readability fix). */}
      <Scrim direction="top" strength={0.5} />

      {/* Content */}
      <div className="relative z-10 mx-auto flex h-full max-w-6xl flex-col justify-end px-6 pb-[16vh] md:pb-[18vh]">
        {/* Kicker: address + river on two spans. Sits high over the bright sky, so it carries its
            OWN local backdrop (soft dark blur + hairline) — guarantees legibility without darkening
            the whole photo. The river clause is the one warm-gold beat. */}
        <p className="hero-kicker mb-6 inline-flex w-fit flex-col gap-1 self-start rounded-full bg-[rgba(15,15,14,0.32)] px-4 py-2 text-[10px] uppercase tracking-[0.18em] text-[var(--color-plaster)] backdrop-blur-[2px] md:mb-7 md:flex-row md:items-center md:gap-3 md:text-[11px] md:tracking-[0.2em]">
          <span style={{ textShadow: "0 1px 10px rgba(0,0,0,0.7)" }}>вул. Нагірна, Вінниця</span>
          <span aria-hidden className="hidden h-px w-6 bg-[var(--color-plaster)]/40 md:block" />
          <span className="text-[var(--color-warm)]" style={{ textShadow: "0 1px 10px rgba(0,0,0,0.7)" }}>
            власний берег Південного Бугу
          </span>
        </p>

        <h1 className="scrim-text max-w-3xl text-[clamp(2.4rem,7vw,5.2rem)] font-normal leading-[1.02] tracking-[-0.025em] text-[var(--color-text)]">
          {["Прокидатися", "від води,", "не від сусідів"].map((line, i) => (
            <span key={line} className="block overflow-hidden pt-[0.02em] pb-[0.05em]">
              <span className={`hero-line block ${i === 2 ? "text-[var(--color-warm)]/90" : ""}`}>
                {line}
              </span>
            </span>
          ))}
        </h1>

        <p className="hero-sub scrim-text mt-7 max-w-[34rem] text-base leading-relaxed text-[var(--color-text)]/95 md:text-lg">
          Тупікова вулиця. За огорожею — ріка й дерева, більше нічого. Найближче вікно сусіда — за садом.
        </p>
      </div>

      {/* Scroll hint — typographic only, no animated cliché. The day→night scrub IS the cue. */}
      <div className="hero-hint absolute inset-x-0 bottom-6 z-10 flex justify-center text-[var(--color-text-muted)]">
        <span className="text-[10px] uppercase tracking-[0.32em] opacity-70">
          гортайте — настає вечір
        </span>
      </div>
    </section>
  );
}
