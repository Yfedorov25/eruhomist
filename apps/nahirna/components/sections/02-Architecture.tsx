"use client";

import { useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { TextShelf } from "@/components/ui/TextShelf";
import { typo } from "@/lib/typo";

gsap.registerPlugin(ScrollTrigger, useGSAP);

// 02 · АРХІТЕКТУРА — «Зроблено для тих, що залишаються». REBUILT (council + product specs):
// old "window-reveal крізь скло" removed (read as a glitch). New: TEXT-SHELF DIPTYCH — text on a
// solid chocolate panel (always legible) beside a media window that DISSOLVES day→night on scroll
// (NOT a pixel crossfade-morph of mismatched frames: opacity 0→1 + gentle scale = "the same house
// at another hour", deliberate). The shelf H2 swaps day→night copy in sync. Detail row beneath.
const DETAILS = [
  { k: "d1", label: "Клінкер.", body: "Темна шоколадна цегла. З роками тільки темнішає й стає благороднішою." },
  { k: "d2", label: "Колона.", body: "Цегляна основа, білий камінь на базі й капітелі. Не пофарбовано, а складено." },
  { k: "d3", label: "Дах.", body: "Глибокі звиси, олівковий тон. Тінь у спеку, сухі стіни в дощ." },
];

export default function Architecture() {
  const root = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      if (reduced) {
        // Static: show the night frame (more dramatic) + night copy + details visible.
        gsap.set(".arch-night", { opacity: 1 });
        gsap.set(".arch-h2-day", { opacity: 0 });
        gsap.set(".arch-h2-night", { opacity: 1 });
        gsap.set(".arch-detail", { opacity: 1, y: 0 });
        return;
      }

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: root.current,
          start: "top top",
          end: "+=150%",
          scrub: 1,
          pin: ".arch-stage",
          anticipatePin: 1,
          // settle on day or night, not a half-faded middle
          snap: { snapTo: [0, 1], duration: { min: 0.2, max: 0.5 }, delay: 0.05, ease: "power1.inOut" },
        },
      });

      // Day → night dissolve in the media window (opacity + gentle scale, both layers).
      tl.fromTo(".arch-night", { opacity: 0 }, { opacity: 1, ease: "none" }, 0);
      // Parallax-in-frame (base E13): scale stays >1 to keep a cover-margin, yPercent drifts the
      // media slowly inside its overflow-hidden window → depth on the architecture hero shot.
      tl.fromTo(".arch-media-inner", { scale: 1.05 }, { scale: 1.1, ease: "none" }, 0);
      tl.fromTo(".arch-media-inner", { yPercent: -2 }, { yPercent: 2, ease: "none" }, 0);
      // H2 copy swaps day→night through the midpoint (fade-through, not abrupt).
      tl.to(".arch-h2-day", { opacity: 0, ease: "none", duration: 0.4 }, 0.3);
      tl.fromTo(".arch-h2-night", { opacity: 0 }, { opacity: 1, ease: "none", duration: 0.4 }, 0.45);
    },
    { scope: root, dependencies: [reduced] },
  );

  // Detail row reveal (separate, on enter — not tied to the pin scrub).
  useGSAP(
    () => {
      if (reduced) return;
      // Media window uncovers with a clip-path curtain on first enter (base E7 — "revealed,
      // not just there"). Runs on the outer window; the inner scrub transforms are untouched.
      gsap.fromTo(
        ".arch-reveal",
        { clipPath: "inset(100% 0% 0% 0%)" },
        {
          clipPath: "inset(0% 0% 0% 0%)",
          duration: 1.4,
          ease: "expo.out",
          scrollTrigger: { trigger: ".arch-stage", start: "top 72%", once: true },
        },
      );
      gsap.from(".arch-detail", {
        opacity: 0,
        y: 22,
        duration: 1.5,
        ease: "power3.out",
        stagger: 0.14,
        scrollTrigger: { trigger: ".arch-details", start: "top 80%", once: true },
      });
    },
    { scope: root, dependencies: [reduced] },
  );

  const mediaWindow = (
    <div className="arch-reveal relative h-[42vh] w-full overflow-hidden md:h-full">
      <div className="arch-media-inner absolute inset-0 will-change-transform">
        {/* DAY */}
        <Image
          src="/images/gallery/exterior-day-hero.webp"
          alt="Будинок на Нагірній удень: повний ракурс, темна клінкерна цегла, білий камінь на колонах, шатровий дах"
          fill
          sizes="(max-width: 768px) 100vw, 60vw"
          loading="lazy"
          className="object-cover"
        />
        {/* NIGHT — dissolves in on scroll */}
        <Image
          src="/images/exterior-night-1.webp"
          alt="Фасад вілли вночі: тепле світло вікон, підсвітка карнизів, кулі-самшити, зоряне небо"
          fill
          sizes="(max-width: 768px) 100vw, 60vw"
          loading="lazy"
          className="arch-night absolute inset-0 object-cover"
        />
      </div>
    </div>
  );

  return (
    <section ref={root} className="relative bg-night" aria-label="Архітектура — матеріали">
      <div className="arch-stage relative h-[100svh] min-h-[100svh] w-full overflow-hidden">
        <div className="flex h-full flex-col">
          <TextShelf
            className="flex-1"
            shelfSide="left"
            media={mediaWindow}
            shelf={
              <div>
                <p className="mb-5 text-[11px] uppercase tracking-[0.34em] text-[var(--color-warm)]/80">
                  матеріали
                </p>
                {/* H2 — day/night copy swap in sync with the media dissolve. */}
                <div className="grid">
                  <h2
                    className="arch-h2-day [grid-area:1/1] text-[clamp(2rem,3.4vw,3rem)] font-medium leading-[1.08] tracking-[-0.025em] text-[var(--color-text)]"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    Удень цей дім про камінь.
                  </h2>
                  <h2
                    className="arch-h2-night [grid-area:1/1] text-[clamp(2rem,3.4vw,3rem)] font-medium leading-[1.08] tracking-[-0.025em] text-[var(--color-warm)]"
                    style={{ fontFamily: "var(--font-display)", opacity: 0 }}
                  >
                    А коли темніє, цей дім про світло.
                  </h2>
                </div>

                <p className="mt-6 max-w-md text-base leading-relaxed text-[var(--color-text)]/85 md:text-lg">
                  {typo("Темна клінкерна цегла, білий камінь на колонах. Такі матеріали не оновлюють кожні п'ять років. Вони просто гарнішають із часом. Цей дім будували для тих, хто лишається надовго.")}
                </p>
                <p className="mt-5 max-w-md text-base italic leading-relaxed text-[var(--color-warm)]/90">
                  {typo("Один поверх. Від ліжка до ранкової кави на терасі жодної сходинки.")}
                </p>
              </div>
            }
          />

          {/* Detail row — full tezas on the chocolate base, never clipped. */}
          <div className="arch-details grid grid-cols-1 gap-6 bg-[var(--color-night-raised)] px-6 pt-8 pb-24 md:grid-cols-3 md:px-12 md:pb-24">
            {DETAILS.map((d) => (
              <div key={d.k} className="arch-detail flex items-baseline gap-3">
                <span className="mt-2 h-px w-8 shrink-0 bg-[var(--color-warm)]/45" aria-hidden />
                <p className="text-sm leading-relaxed text-[var(--color-text-muted)] md:text-base">
                  <strong className="font-medium text-[var(--color-text)]">{d.label}</strong> {typo(d.body)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
