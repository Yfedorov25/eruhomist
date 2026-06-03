"use client";

import { useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useReducedMotion } from "@/lib/useReducedMotion";

gsap.registerPlugin(ScrollTrigger, useGSAP);

// 01 · ВОДА — «Власний берег». Pinned scroll-story: the water image holds while three text
// beats cross-fade through it (enter → proof → landing). The emotional heart of the site —
// the concept word «власний берег». Two backdrops cross-fade across the pin (terrace→shore)
// for a slow sense of moving toward the water. Reduced-motion → a normal stacked block.
const BEATS = [
  { key: "b1", text: "За огорожею закінчується місто." },
  {
    key: "b2",
    text: "Власний берег. Близько чотирьох соток лінії води — рівно стільки, щоб поставити пірс, розпалити мангал, спустити човен. І щоб нікому не пояснювати, чому Ви тут.",
  },
  {
    key: "b3",
    text: "Тут не чути сусідів. Чути воду.",
  },
];

export default function Water() {
  const root = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      if (reduced) {
        gsap.set(".water-beat", { opacity: 1, y: 0 });
        gsap.set(".water-shore", { opacity: 1 });
        return;
      }

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: root.current,
          start: "top top",
          end: "+=200%",
          scrub: true,
          pin: ".water-stage",
          anticipatePin: 1,
        },
      });

      // Backdrop drift: terrace (golden) → shore (finale). Resolve the cross-fade by ~45% of
      // the pin so beats 2–3 sit on a single clean backdrop (no lingering double-exposure).
      tl.fromTo(".water-shore", { opacity: 0 }, { opacity: 1, ease: "none", duration: 0.45 }, 0);
      // Gentle scale on the backdrop for a slow push-in across the whole pin (transform only).
      tl.fromTo(".water-bg", { scale: 1.06 }, { scale: 1.0, ease: "none", duration: 1 }, 0);

      // Three beats: each fades in, holds, fades out — sequenced across progress.
      const beats = gsap.utils.toArray<HTMLElement>(".water-beat");
      beats.forEach((beat, i) => {
        const seg = 1 / beats.length; // 0..0.33, 0.33..0.66, 0.66..1
        const inAt = i * seg;
        gsap.set(beat, { opacity: 0, y: 26 });
        tl.to(beat, { opacity: 1, y: 0, ease: "power2.out", duration: seg * 0.4 }, inAt);
        // hold, then fade out (except the last beat, which stays to the end).
        if (i < beats.length - 1) {
          tl.to(beat, { opacity: 0, y: -22, ease: "power2.in", duration: seg * 0.35 }, inAt + seg * 0.6);
        }
      });
    },
    { scope: root, dependencies: [reduced] },
  );

  return (
    <section ref={root} className="relative bg-night" aria-label="Власний берег Південного Бугу">
      <div className="water-stage relative flex h-[100svh] min-h-[100svh] w-full items-center justify-center overflow-hidden">
        {/* Backdrops */}
        <div className="water-bg absolute inset-0">
          <Image
            src="/images/water-terrace-golden.webp"
            alt="Тераса будинку з виходом на Південний Буг у золоту годину"
            fill
            sizes="100vw"
            loading="lazy"
            className="object-cover"
          />
          <Image
            src="/images/water-finale.webp"
            alt="Власний берег Південного Бугу — ріка й дерева у золоту годину"
            fill
            sizes="100vw"
            loading="lazy"
            className="water-shore absolute inset-0 object-cover"
          />
        </div>

        {/* Scrim for legibility — strong center band where the beats live. */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(110% 90% at 50% 50%, rgba(15,15,14,0.62), rgba(15,15,14,0.30) 55%, rgba(15,15,14,0.66) 100%)",
          }}
          aria-hidden
        />

        {/* Beats — stacked on top of each other; cross-faded by the timeline. */}
        <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
          {/* Section eyebrow */}
          <p className="mb-8 text-[11px] uppercase tracking-[0.34em] text-[var(--color-warm)]/80">
            Власний берег
          </p>

          <div className="relative min-h-[8.5rem] md:min-h-[7.5rem]">
            {BEATS.map((b, i) => (
              <p
                key={b.key}
                className={`water-beat scrim-text text-balance font-light leading-snug text-[var(--color-text)] ${
                  i === 1
                    ? "mx-0 max-w-xl text-left text-xl md:text-[1.6rem] md:leading-[1.45]"
                    : "mx-auto max-w-3xl text-center text-2xl md:text-[2.2rem] md:leading-[1.25]"
                } ${i === 0 ? "relative" : "absolute inset-x-0 top-0"}`}
                style={{ fontFamily: "var(--font-display)" }}
              >
                {b.text}
              </p>
            ))}
          </div>
        </div>

        {/* Fact strip — pinned to the bottom of the stage, always present. */}
        <p className="absolute inset-x-0 bottom-8 z-10 px-6 text-center text-xs uppercase tracking-[0.2em] text-[var(--color-warm)]/65 md:text-sm">
          Ділянка 10 соток + ~4 сотки берега · тупікова вулиця
        </p>
      </div>
    </section>
  );
}
