"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Section } from "../Section";
import { SplitReveal } from "../SplitReveal";
import { DrawAccent } from "../DrawAccent";
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
          {/* warm self-drawing accent under the headline — a single luminous mark for the climax,
              drawn in (scaleX) to tie the apex type into the motion language */}
          <DrawAccent className="mt-6 !w-24" />
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

        {/* The lake-view hero owns the golden-hour climax SOLO (council verdict). A second small
            floating image used to sit cornered over it with a ring+shadow — a stock "feature card"
            tell that clashed (cool daytime lounge over a warm dusk lake) and split the held breath
            the wash is built to deliver. Removed; render_terasa_04 will be re-homed to its own calm
            full-width beat elsewhere (follow-up). One feathered plate + the wash is the apex. */}
        <div className="relative" data-cursor="дивитися">
          <div
            data-clip="up"
            className="relative aspect-[16/10] w-full overflow-hidden rounded-sm"
          >
            {/* eslint-disable @next/next/no-img-element */}
            {/* data-parallax drives a gentle trailing drift via the global dual-rate handler
                (scale-[1.06] gives the headroom; overflow-hidden parent crops it). Real depth on
                the apex plate — desktop-only, transform-only, no conflict with the clip reveal. */}
            <img
              data-parallax="12"
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
            {/* eslint-enable @next/next/no-img-element */}
          </div>
        </div>
      </div>
    </Section>
  );
}
