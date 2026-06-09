"use client";

import { useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { typo } from "@/lib/typo";

gsap.registerPlugin(ScrollTrigger, useGSAP);

// 01 · ВОДА — «Перша лінія до берега». Pinned scroll-story. Backdrop = two golden-hour STILLS that
// crossfade (golden terrace → riverbank) under a slow Ken-Burns zoom, all driven by the pinned
// scroll. NO video / NO canvas: both the living-video and the frame-scrub versions fought the
// scrub (visible loop-restart / decode-jank / load hangs). Stills + transform are buttery and
// bulletproof. The 3 text beats ride the SAME scroll progress. Exact copy preserved.
const BEATS = [
  { key: "b1", text: "За огорожею закінчується місто." },
  {
    key: "b2",
    text: "Перша лінія до берега. Близько чотирьох соток лінії води. Рівно стільки, щоб поставити пірс, розпалити вогнище, спустити човен. І нікому не пояснювати, чому Ви тут.",
  },
  { key: "b3", text: "Тут не чути сусідів. Чути воду." },
];

export default function Water() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(".water-beat", { opacity: 1, y: 0 });
        gsap.set(".water-shore", { opacity: 1 });
      });

      // Pinned 3-beat story (on touch, Lenis syncTouch keeps the pin+snap locked to scroll).
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: root.current,
            start: "top top",
            end: "+=260%",
            scrub: 1,
            pin: ".water-stage",
            anticipatePin: 1,
            snap: { snapTo: [0.17, 0.57, 0.9], duration: { min: 0.2, max: 0.6 }, delay: 0.05, ease: "power1.inOut" },
          },
        });

        // Backdrop: golden terrace → riverbank crossfade + slow Ken-Burns zoom (transform/opacity only).
        tl.fromTo(".water-shore", { opacity: 0 }, { opacity: 1, ease: "none", duration: 0.5 }, 0);
        tl.fromTo(".water-bg", { scale: 1.06 }, { scale: 1.0, ease: "none", duration: 1 }, 0);

        // Three beats — weighted fade in / hold / out (long middle beat gets the most room).
        const beats = gsap.utils.toArray<HTMLElement>(".water-beat");
        const weights = beats.length === 3 ? [1.0, 1.5, 0.7] : beats.map(() => 1);
        const total = weights.reduce((a, b) => a + b, 0);
        let cursor = 0;
        beats.forEach((beat, i) => {
          const seg = weights[i] / total;
          const inAt = cursor;
          gsap.set(beat, { opacity: 0, y: 26 });
          tl.to(beat, { opacity: 1, y: 0, ease: "power2.out", duration: seg * 0.26 }, inAt);
          if (i < beats.length - 1) {
            tl.to(beat, { opacity: 0, y: -22, ease: "power2.in", duration: seg * 0.16 }, inAt + seg * 0.82);
          }
          cursor += seg;
        });
      });

      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section ref={root} className="relative bg-night" aria-label="Перша лінія до берега Південного Бугу">
      <div className="water-stage relative flex h-[100svh] min-h-[100svh] w-full items-center justify-center overflow-hidden">
        <div className="water-bg absolute inset-0 will-change-transform">
          <Image src="/images/water-terrace-golden.webp" alt="Тераса будинку з виходом на Південний Буг у золоту годину" fill sizes="100vw" loading="lazy" className="object-cover" />
          <Image src="/images/water-finale.webp" alt="Берег Південного Бугу — ріка й дерева у золоту годину" fill sizes="100vw" loading="lazy" className="water-shore absolute inset-0 object-cover" />
        </div>

        {/* Scrim for legibility — strong center band where the beats live. */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: "radial-gradient(110% 90% at 50% 50%, rgba(15,15,14,0.62), rgba(15,15,14,0.30) 55%, rgba(15,15,14,0.66) 100%)" }}
          aria-hidden
        />

        {/* Beats — stacked, cross-faded by the timeline. */}
        <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
          <p className="mb-8 text-[11px] uppercase tracking-[0.34em] text-[var(--color-warm)]/80">Перша лінія до берега</p>
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
                {typo(b.text)}
              </p>
            ))}
          </div>
        </div>

        {/* Fact strip — always present. */}
        <p className="absolute inset-x-0 bottom-8 z-10 px-6 text-center text-xs uppercase tracking-[0.2em] text-[var(--color-warm)]/65 md:text-sm">
          Ділянка 10 соток + ~4 сотки берега · тупікова вулиця
        </p>
      </div>
    </section>
  );
}
