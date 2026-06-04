"use client";

import { useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { Reveal } from "@/components/ui/Reveal";

gsap.registerPlugin(ScrollTrigger, useGSAP);

// 03b · ЖИТТЯ НА ВЛАСНОМУ БЕРЕЗІ — the emotional "life you own" beat (kickoff 🆕, between 03 and the
// floorplan). Pinned story: the firepit zone DAY→NIGHT crossfades on scroll (fire glows, path lights
// on, stars come out — "coming home" — the highest-leverage feeling per council). Then lounge +
// riverbank reveal beside the copy. Landscape sells the LIFE, not the drywall.
// ⚠️ House sells unfinished → landscape is a visualisation of the potential (disclosure below).
export default function Landscape() {
  const root = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      if (reduced) {
        gsap.set(".ls-night", { opacity: 1 });
        gsap.set(".ls-beat", { opacity: 1, y: 0 });
        return;
      }

      // Pinned day→night crossfade of the firepit zone.
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: ".ls-stage",
          start: "top top",
          end: "+=180%",
          scrub: true,
          pin: ".ls-stage",
          anticipatePin: 1,
        },
      });
      tl.fromTo(".ls-night", { opacity: 0 }, { opacity: 1, ease: "none" }, 0);
      // gentle push-in on both layers
      tl.fromTo(".ls-media", { scale: 1.06 }, { scale: 1.0, ease: "none", duration: 1 }, 0);
      // copy beats cross-fade: day beat out, night beat in around the midpoint
      tl.to(".ls-beat-day", { opacity: 0, y: -16, ease: "power1.in", duration: 0.35 }, 0.4);
      tl.fromTo(".ls-beat-night", { opacity: 0, y: 16 }, { opacity: 1, y: 0, ease: "power2.out", duration: 0.35 }, 0.5);
    },
    { scope: root, dependencies: [reduced] },
  );

  return (
    <section ref={root} className="relative bg-night" aria-label="Життя на власному березі">
      {/* Pinned firepit day→night stage */}
      <div className="ls-stage relative flex h-[100svh] min-h-[100svh] w-full items-end overflow-hidden">
        <div className="ls-media absolute inset-0 will-change-transform">
          {/* DAY — portrait render; bias the crop LOW so the firepit + lounge chairs are in frame
              (the emotional payload), not just the treetops. */}
          <Image
            src="/images/landscape/firepit-day-wide.webp"
            alt="Зона вогнища вдень: лаунж-крісла навколо багаття, доглянутий сад, дерева"
            fill
            sizes="100vw"
            loading="lazy"
            className="object-cover [object-position:50%_72%]"
          />
          {/* NIGHT — crossfades in on scroll */}
          <Image
            src="/images/landscape/firepit-night-stars.webp"
            alt="Зона вогнища вночі: вогонь горить, підсвітка доріжок, зорі"
            fill
            sizes="100vw"
            loading="lazy"
            className="ls-night absolute inset-0 object-cover [object-position:50%_72%]"
          />
        </div>

        {/* bottom scrim for legibility */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: "linear-gradient(to top, rgba(15,15,14,0.82) 0%, rgba(15,15,14,0.2) 38%, transparent 60%)" }}
          aria-hidden
        />

        <div className="relative z-10 mx-auto w-full max-w-6xl px-6 pb-[14vh]">
          <p className="mb-5 text-[11px] uppercase tracking-[0.34em] text-[var(--color-warm)]/80">
            Життя на березі
          </p>
          {/* Day/night copy beats (crossfade with the image). */}
          <div className="relative min-h-[7rem] max-w-2xl">
            <h2
              className="ls-beat-day scrim-text text-[clamp(2rem,5vw,3.4rem)] font-normal leading-[1.1] tracking-[-0.02em] text-[var(--color-text)]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Удень — сад, у якому хочеться залишитися.
            </h2>
            <h2
              className="ls-beat-night scrim-text absolute inset-0 text-[clamp(2rem,5vw,3.4rem)] font-normal leading-[1.1] tracking-[-0.02em] text-[var(--color-warm)]"
              style={{ fontFamily: "var(--font-display)", opacity: 0 }}
            >
              А ввечері — вогонь, зорі й тиша над водою.
            </h2>
          </div>
        </div>
      </div>

      {/* Lounge + riverbank reveals beside copy (not pinned). */}
      <div className="mx-auto max-w-6xl px-6 py-[14vh]">
        <Reveal className="grid items-center gap-10 md:grid-cols-2">
          <div data-reveal-child className="relative aspect-[4/5] overflow-hidden rounded-sm">
            <Image
              src="/images/landscape/lounge-pergola-garland.webp"
              alt="Лаунж-зона під перголою з гірляндою — місце для вечорів"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              loading="lazy"
              className="object-cover"
            />
          </div>
          <div data-reveal-child>
            <h3
              className="text-[clamp(1.6rem,3.4vw,2.4rem)] font-normal leading-[1.15] tracking-[-0.02em] text-[var(--color-text)]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Кожен метр ділянки — щоб бути надворі.
            </h3>
            <p className="mt-5 max-w-md text-base leading-relaxed text-[var(--color-text-muted)] md:text-lg">
              Перголи й лаунж для довгих вечорів. Вогнище, біля якого збираються. Газон, що збігає до
              самої води. Це не подвір'я між парканами — це продовження дому надвір.
            </p>
          </div>
        </Reveal>

        <Reveal className="mt-16 grid items-center gap-10 md:grid-cols-2">
          <div data-reveal-child className="order-2 md:order-1">
            <h3
              className="text-[clamp(1.6rem,3.4vw,2.4rem)] font-normal leading-[1.15] tracking-[-0.02em] text-[var(--color-text)]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              А там, де закінчується сад — починається Буг.
            </h3>
            <p className="mt-5 max-w-md text-base leading-relaxed text-[var(--color-text-muted)] md:text-lg">
              Очерет, латаття, тиха вода. Берег, на якому Ви — єдиний господар. Сюди не дійде ні
              чужий погляд, ні чужий шум.
            </p>
            {/* Disclosure: landscape is a visualisation of the potential (house sells unfinished). */}
            <p className="mt-6 inline-flex items-center gap-2.5 rounded-full border border-[var(--color-warm)]/25 px-4 py-2 text-sm text-[var(--color-warm)]/90">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-warm)]" aria-hidden />
              Ландшафт наведений як візуалізація потенціалу ділянки.
            </p>
          </div>
          <div data-reveal-child className="relative order-1 aspect-[3/2] overflow-hidden rounded-sm md:order-2">
            <Image
              src="/images/landscape/riverbank-reeds-lilies.webp"
              alt="Берег Південного Бугу: очерет, латаття, тиха вода біля будинку"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              loading="lazy"
              className="object-cover"
            />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
