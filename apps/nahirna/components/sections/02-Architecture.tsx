"use client";

import { useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useReducedMotion } from "@/lib/useReducedMotion";

gsap.registerPlugin(ScrollTrigger, useGSAP);

// 02 · АРХІТЕКТУРА — «Крізь скло». Sticky reveal: the exterior (day) is framed by a window
// aperture that OPENS on scroll (clip-path inset shrinks to 0), revealing the interior behind
// it — outside → inside, "looking through the glass". Material detail captions stagger in.
// clip-path is GPU-composited; only the inset animates (no layout). Reduced-motion → two static
// frames stacked; mobile → simple fade (no aperture).
const DETAILS = [
  { k: "d1", label: "Клінкерна цегла", sub: "темна, шоколадна — надовго" },
  { k: "d2", label: "Панорамне скління", sub: "вода в кадрі від світанку" },
  { k: "d3", label: "Глибокі звиси даху", sub: "ховають вікна від полудня" },
];

export default function Architecture() {
  const root = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      if (reduced) {
        gsap.set(".arch-aperture", { clipPath: "inset(0% 0% 0% 0%)" });
        gsap.set(".arch-interior", { opacity: 1 });
        gsap.set(".arch-detail", { opacity: 1, x: 0 });
        gsap.set(".arch-copy", { opacity: 1, y: 0 });
        return;
      }

      const mm = gsap.matchMedia();

      // Desktop: the window aperture opens (exterior frame retracts to edges → interior fills).
      mm.add("(min-width: 769px)", () => {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: root.current,
            start: "top top",
            end: "+=160%",
            scrub: true,
            pin: ".arch-stage",
            anticipatePin: 1,
          },
        });

        // Exterior layer is clipped from full → a centered window slot, revealing interior.
        // We animate the EXTERIOR's clip to a window (inset grows), so interior shows through.
        tl.fromTo(
          ".arch-exterior",
          { clipPath: "inset(0% 0% 0% 0%)" },
          { clipPath: "inset(12% 16% 12% 16%)", ease: "power2.inOut" },
          0,
        );
        // Interior fades up behind as the window opens.
        tl.fromTo(".arch-interior", { opacity: 0, scale: 1.08 }, { opacity: 1, scale: 1, ease: "none" }, 0);
        // Detail captions stagger in over the second half.
        tl.from(
          ".arch-detail",
          { opacity: 0, x: -28, duration: 0.18, stagger: 0.12, ease: "power3.out" },
          0.4,
        );
        tl.from(".arch-copy", { opacity: 0, y: 24, duration: 0.2, ease: "power3.out" }, 0.3);
      });

      // Mobile: no aperture — cross-fade exterior → interior, captions just reveal on enter.
      mm.add("(max-width: 768px)", () => {
        gsap.set(".arch-exterior", { clipPath: "inset(0% 0% 0% 0%)" });
        const tl = gsap.timeline({
          scrollTrigger: { trigger: root.current, start: "top top", end: "+=120%", scrub: true, pin: ".arch-stage" },
        });
        tl.fromTo(".arch-interior", { opacity: 0 }, { opacity: 1, ease: "none" }, 0);
        gsap.from(".arch-detail", {
          opacity: 0,
          y: 18,
          stagger: 0.12,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: { trigger: ".arch-copy", start: "top 80%", once: true },
        });
        gsap.from(".arch-copy", {
          opacity: 0,
          y: 20,
          duration: 1.2,
          ease: "power3.out",
          scrollTrigger: { trigger: ".arch-copy", start: "top 82%", once: true },
        });
      });
    },
    { scope: root, dependencies: [reduced] },
  );

  return (
    <section ref={root} className="relative bg-night" aria-label="Архітектура крізь скло">
      <div className="arch-stage relative flex h-[100svh] min-h-[100svh] w-full items-center overflow-hidden">
        {/* Interior (behind) — revealed through the opening window. */}
        <div className="arch-interior absolute inset-0">
          <Image
            src="/images/living-day.webp"
            alt="Інтер'єр кухні-вітальні вдень: панорамне скління з виглядом на воду"
            fill
            sizes="100vw"
            loading="lazy"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-[var(--color-night)]/35" aria-hidden />
        </div>

        {/* Exterior (front) — clipped open on scroll. */}
        <div className="arch-exterior absolute inset-0" style={{ clipPath: "inset(0% 0% 0% 0%)" }}>
          <Image
            src="/images/exterior-day-1.webp"
            alt="Фасад будинку вдень: темна клінкерна цегла, колони з білим каменем на базі й капітелі, олівковий шатровий дах"
            fill
            sizes="100vw"
            loading="lazy"
            className="object-cover"
          />
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "linear-gradient(90deg, rgba(15,15,14,0.78) 0%, rgba(15,15,14,0.62) 28%, rgba(15,15,14,0.20) 48%, transparent 62%)",
            }}
            aria-hidden
          />
        </div>

        {/* Copy + material details (front-most). */}
        <div className="relative z-10 mx-auto w-full max-w-6xl px-6">
          <div className="max-w-xl">
            <div className="arch-copy">
              <p className="mb-5 text-[11px] uppercase tracking-[0.34em] text-[var(--color-warm)]/80">
                Матеріали
              </p>
              <h2
                className="scrim-text text-[clamp(2.1rem,5.2vw,3.6rem)] font-medium leading-[1.05] tracking-[-0.025em] text-[var(--color-text)]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Удень — строгий.
                <br />
                Надвечір — теплий.
              </h2>
              <p className="scrim-text mt-6 max-w-md text-base leading-relaxed text-[var(--color-text)]/90 md:text-lg">
                Темна клінкерна цегла. Білий камінь на колонах. Глибокі навіси ховають вікна від
                полуденного сонця, а коли надворі темніє — уздовж карнизів вмикається підсвітка, і
                фасад теплішає просто на очах.
              </p>
              <p className="scrim-text mt-5 max-w-md text-base italic leading-relaxed text-[var(--color-warm)]/90">
                Один поверх. Між Вами і ранковою кавою на терасі — жодної сходинки.
              </p>
            </div>

            {/* Detail chips */}
            <ul className="mt-9 space-y-3">
              {DETAILS.map((d) => (
                <li key={d.k} className="arch-detail flex items-baseline gap-3 scrim-text">
                  <span className="mt-2 h-px w-10 shrink-0 bg-[var(--color-warm)]/45" aria-hidden />
                  <span className="text-sm text-[var(--color-text)] md:text-base">
                    <strong className="font-medium text-[var(--color-text)]">{d.label}</strong>
                    <span className="text-[var(--color-text-muted)]"> — {d.sub}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
