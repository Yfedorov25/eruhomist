"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Section } from "../Section";
import { SplitReveal } from "../SplitReveal";
import { richText, paragraphs } from "@/lib/format";
import { useReveal } from "@/lib/useReveal";
import type { Messages } from "@/lib/i18n";

gsap.registerPlugin(ScrollTrigger);

// S5 — Roof / lake view (R04). The GOLDEN-HOUR CLIMAX (council verdict): every section
// above has crossfaded into night (the page travels day->night), but the rooftop is the
// ONE place still holding the last warm daylight — the exhale, the "sun hasn't set up here
// yet" beat. No day->evening crossfade (no night render exists, and the asymmetry IS the
// design). To make that asymmetry *visible* (a section that just looks dark fails the beat),
// a warm golden-hour wash floods the whole SECTION as you arrive — the temperature change is
// felt on the canvas, not only inside the photos. The terrace is one feathered hero plate
// + one floating detail (real depth, not a thumbnail grid). reduced-motion -> static;
// mobile -> lighter yPercent (global [data-parallax]).
// Hero = render_lake_terasa.jpg: the terrace at golden hour overlooking the lake — the
// literal payoff of "a rooftop with a lake view" (resolves the earlier placeholder TODO).
export function Roof({ m }: { m: Messages }) {
  const ref = useReveal<HTMLDivElement>();
  const washRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const wash = washRef.current;
    if (!wash) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.set(wash, { opacity: 1 });
      return;
    }
    const ctx = gsap.context(() => {
      // golden-hour wash gathers over the whole section as it enters — warm light
      // arriving, the page's one held-daylight moment after the night sections above.
      gsap.fromTo(
        wash,
        { opacity: 0 },
        {
          opacity: 1,
          ease: "power1.in",
          scrollTrigger: { trigger: wash, start: "top 85%", end: "center 60%", scrub: 1 },
        },
      );
    }, wash);
    return () => ctx.revert();
  }, []);

  const featherMask =
    "linear-gradient(to bottom, transparent 0%, #000 7%, #000 86%, transparent 100%)," +
    "linear-gradient(to right, transparent 0%, #000 4%, #000 97%, transparent 100%)";

  return (
    <Section id="roof" className="overflow-hidden">
      {/* Section-wide golden-hour wash — the climax made visible. A warm amber gradient
          biased to the top-right (the lingering sun) + a faint base lift, both fading in on
          scroll so the viewer FEELS the temperature change before parsing the imagery. */}
      <div
        ref={washRef}
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0"
        style={{
          background:
            "radial-gradient(70% 80% at 82% 8%, rgba(245,188,118,0.22) 0%, transparent 60%)," +
            "linear-gradient(180deg, rgba(245,190,120,0.07) 0%, transparent 55%)",
        }}
      />

      <div
        ref={ref}
        className="relative mx-auto grid max-w-7xl items-center gap-12 md:grid-cols-2 md:gap-20 lg:gap-24"
      >
        <div>
          {/* H2 bumped one step over S2/S4 — this is the page's apex, the type should say so. */}
          <SplitReveal
            as="h2"
            className="font-display text-[2.75rem] leading-[1.05] md:text-[4.5rem]"
          >
            {richText(m.roof.h2)}
          </SplitReveal>
          {/* warm hairline accent under the headline — a single luminous mark for the climax */}
          <div
            data-reveal
            aria-hidden
            className="mt-6 h-px w-24 origin-left bg-gradient-to-r from-[var(--accent)] to-transparent"
          />
          <div className="mt-8 space-y-5 text-lg leading-relaxed text-[var(--ink-muted)] md:text-xl">
            {paragraphs(m.roof.body).map((p, i) => (
              <p key={i} data-reveal>
                {richText(p)}
              </p>
            ))}
          </div>
          {/* solid warm CTA (vs the outlined CTAs elsewhere) — the apex gets the decisive button */}
          <a
            data-reveal
            href="#contact"
            className="mt-10 inline-block bg-[var(--accent)] px-8 py-4 text-sm uppercase tracking-[0.2em] text-[var(--deep)] transition-transform duration-300 hover:-translate-y-0.5"
          >
            {m.roof.cta}
          </a>
        </div>

        {/* Terrace depth: one feathered hero plate + ONE floating detail (z-offset + faster
            parallax) — cinematic depth, not a 3-up thumbnail strip. */}
        <div className="relative">
          <div className="relative aspect-[16/10] w-full overflow-hidden rounded-sm">
            {/* eslint-disable @next/next/no-img-element */}
            <img
              data-reveal
              src="/renders/render_lake_terasa.jpg"
              alt="Дах QUADRO HOUSE із перголою та видом на озеро на заході сонця"
              loading="lazy"
              className="absolute inset-0 h-full w-full scale-[1.06] object-cover"
              style={{
                maskImage: featherMask,
                WebkitMaskImage: featherMask,
                maskComposite: "intersect",
                WebkitMaskComposite: "source-in",
              }}
            />
          </div>
          {/* floating detail — offset over the hero's lower-right, soft shadow, faster drift */}
          <img
            data-reveal
            data-parallax="22"
            src="/renders/render_terasa_04.jpg"
            alt="Lounge-зона на даху"
            loading="lazy"
            className="absolute -bottom-10 right-2 z-10 hidden aspect-[4/3] w-2/5 rounded-sm object-cover shadow-[0_24px_60px_-12px_rgba(0,0,0,0.65)] ring-1 ring-white/10 md:block"
          />
          {/* eslint-enable @next/next/no-img-element */}
        </div>
      </div>
    </Section>
  );
}
