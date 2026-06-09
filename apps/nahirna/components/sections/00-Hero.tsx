"use client";

import { useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { Scrim } from "@/components/ui/Scrim";
import { typo } from "@/lib/typo";

gsap.registerPlugin(ScrollTrigger, useGSAP);

// 00 · HERO — day→night on scroll-scrub (proto-D «Один день»). STILLS only: the day and night
// renders share the EXACT composition, so the crossfade keeps the house pinned in place. (The
// living-video pair was removed — the day/night clips were different shots, so the house jumped
// position and the loops reset visibly mid-scrub.) Layers (bottom→top):
//   1. day STILL  — priority, the LCP element (instant paint, SSR). Dispatches hero-ready.
//   2. night STILL — lazy; opacity 0→1 on scrub (works on every device, no video cost).
export default function Hero() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      // ---- Reduced motion: fully static (day shown, night hidden, text visible). ----
      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(".hero-night-still", { opacity: 0 });
        gsap.set([".hero-line", ".hero-kicker", ".hero-sub", ".hero-hint"], { opacity: 1, yPercent: 0 });
      });

      // ---- DESKTOP motion: pinned day→night scrub on the STILLS only (identical composition, so
      // the house never shifts and nothing loops/resets — the video pair drifted, removed). ----
      mm.add("(min-width: 768px) and (prefers-reduced-motion: no-preference)", () => {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: root.current,
            start: "top top",
            end: "+=110%",
            scrub: 1,
            pin: true,
            pinSpacing: true,
            anticipatePin: 1,
          },
        });
        tl.fromTo(".hero-night-still", { opacity: 0 }, { opacity: 1, ease: "none" }, 0);
        tl.fromTo(".hero-glow", { opacity: 0 }, { opacity: 1, ease: "power1.in" }, 0);
        tl.fromTo(".hero-day-scrim", { opacity: 1 }, { opacity: 0.35, ease: "none" }, 0);
        tl.to(".hero-hint", { opacity: 0, ease: "none", duration: 0.1 }, 0);

        // Intro reveals (once, not tied to scrub).
        const intro = gsap.timeline({ defaults: { ease: "expo.out" } });
        intro
          .from(".hero-kicker", { opacity: 0, y: 16, duration: 1.2, delay: 0.2 })
          .from(".hero-line", { opacity: 0, yPercent: 110, duration: 1.6, stagger: 0.12 }, "-=0.9")
          .from(".hero-sub", { opacity: 0, y: 18, duration: 1.4 }, "-=1.0")
          .from(".hero-hint", { opacity: 0, duration: 1.0 }, "-=0.8");
      });

      // ---- MOBILE motion: NO pin. The day→night crossfade is still scroll-linked (scrub) but the
      // section is NOT pinned — native touch just scrolls past it while the night fades in. Pinning
      // on touch was a jank source; an un-pinned scrub rides native momentum cleanly. ----
      mm.add("(max-width: 767px) and (prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          ".hero-night-still",
          { opacity: 0 },
          {
            opacity: 1,
            ease: "none",
            scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: 0.5 },
          },
        );
        gsap.fromTo(
          ".hero-glow",
          { opacity: 0 },
          {
            opacity: 1,
            ease: "none",
            scrollTrigger: { trigger: root.current, start: "top top", end: "bottom center", scrub: 0.5 },
          },
        );
        // Intro reveals (once on load).
        const intro = gsap.timeline({ defaults: { ease: "expo.out" } });
        intro
          .from(".hero-kicker", { opacity: 0, y: 16, duration: 1.2, delay: 0.2 })
          .from(".hero-line", { opacity: 0, yPercent: 110, duration: 1.6, stagger: 0.12 }, "-=0.9")
          .from(".hero-sub", { opacity: 0, y: 18, duration: 1.4 }, "-=1.0")
          .from(".hero-hint", { opacity: 0, duration: 1.0 }, "-=0.8");
      });

      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      className="relative h-screen w-full overflow-hidden bg-night"
      aria-label="Дім на Нагірній — головний екран"
    >
      {/* 1 · DAY STILL — LCP-critical (priority, eager). Fires hero-ready for the Preloader. */}
      <Image
        src="/images/hero-day-desktop.webp"
        alt="Дім на Нагірній удень: темна клінкерна цегла, колони з білими капітелями, оливковий дах, панорамне скління серед зелені"
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

      {/* 2 · NIGHT STILL — EAGER (it's the scrubbed crossfade layer; lazy = it decodes mid-scrub
          and the day→night drag stutters). Loads right after the priority day image. */}
      <div className="hero-night-still absolute inset-0">
        <Image src="/images/hero-night-desktop.webp" alt="" fill loading="eager" sizes="100vw" aria-hidden className="hidden object-cover md:block" />
        <Image src="/images/hero-night-mobile.webp" alt="" fill loading="eager" sizes="100vw" aria-hidden className="object-cover md:hidden" />
      </div>

      {/* Warm window glow — narrow radial over the night window band. */}
      <div
        className="hero-glow pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(60% 35% at 58% 56%, rgba(232,201,160,0.14), transparent 70%)" }}
        aria-hidden
      />

      {/* Legibility: bottom-up gradient scrim. */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: "linear-gradient(to top, rgba(15,15,14,0.72) 0%, rgba(15,15,14,0.28) 32%, transparent 60%)" }}
        aria-hidden
      />
      {/* Day-scrim over the text band — strong while bright, faded as night arrives (scrubbed). */}
      <div
        className="hero-day-scrim pointer-events-none absolute inset-0"
        style={{ background: "linear-gradient(180deg, rgba(15,15,14,0) 0%, rgba(15,15,14,0) 38%, rgba(15,15,14,0.5) 64%, rgba(15,15,14,0.74) 100%)" }}
        aria-hidden
      />
      <Scrim direction="top" strength={0.5} />

      {/* Content */}
      <div className="relative z-10 mx-auto flex h-full max-w-6xl flex-col justify-end px-6 pb-[16vh] md:pb-[18vh]">
        <p className="hero-kicker mb-6 inline-flex w-fit flex-col gap-1 self-start rounded-full bg-[rgba(15,15,14,0.32)] px-4 py-2 text-[10px] uppercase tracking-[0.18em] text-[var(--color-plaster)] backdrop-blur-[2px] md:mb-7 md:flex-row md:items-center md:gap-3 md:text-[11px] md:tracking-[0.2em]">
          <span style={{ textShadow: "0 1px 10px rgba(0,0,0,0.7)" }}>вул. Нагірна, Вінниця</span>
          <span aria-hidden className="hidden h-px w-6 bg-[var(--color-plaster)]/40 md:block" />
          <span className="text-[var(--color-warm)]" style={{ textShadow: "0 1px 10px rgba(0,0,0,0.7)" }}>
            перша лінія до Південного Бугу
          </span>
        </p>

        <h1 className="scrim-text max-w-[15ch] text-[clamp(2.8rem,8.5vw,7rem)] font-normal leading-[0.94] tracking-[-0.035em] text-[var(--color-text)]">
          {["Прокидатися", "від води,", "не від сусідів"].map((line, i) => (
            <span key={line} className="block overflow-hidden pt-[0.02em] pb-[0.05em]">
              <span className={`hero-line block ${i === 2 ? "text-[var(--color-warm)]/90" : ""}`}>{line}</span>
            </span>
          ))}
        </h1>

        <p className="hero-sub scrim-text mt-7 max-w-[34rem] text-base leading-relaxed text-[var(--color-text)]/95 md:text-lg">
          {typo("Тупікова вулиця, далі тільки річка й дерева. Найближче сусідське вікно аж за садом.")}
        </p>
      </div>

      <div className="hero-hint absolute inset-x-0 bottom-6 z-10 flex justify-center text-[var(--color-text-muted)]">
        <span className="text-[10px] uppercase tracking-[0.32em] opacity-70">гортайте, настає вечір</span>
      </div>
    </section>
  );
}
