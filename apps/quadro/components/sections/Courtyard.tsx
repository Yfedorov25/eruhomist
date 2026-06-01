"use client";

import { Section } from "../Section";
import { richText, paragraphs } from "@/lib/format";
import { useReveal } from "@/lib/useReveal";
import type { Messages } from "@/lib/i18n";

// S4 — Courtyard (R04). A day/evening diptych of the shared yard with depth parallax,
// beside the copy. Day aerial (render_10) + evening pergola with path-lights (render_N_03)
// shown together — "the yard you want to step into in the evening."
export function Courtyard({ m }: { m: Messages }) {
  const ref = useReveal<HTMLDivElement>();
  return (
    <Section id="courtyard" className="mx-auto max-w-7xl">
      <div ref={ref} className="grid items-center gap-12 md:grid-cols-[1.1fr_0.9fr] md:gap-16">
        <div className="grid grid-cols-2 gap-3">
          {/* eslint-disable @next/next/no-img-element */}
          <img
            data-reveal
            data-parallax="14"
            src="/renders/render_10.jpg"
            alt="Спільний двір QUADRO HOUSE удень"
            loading="lazy"
            className="aspect-[3/4] w-full rounded-sm object-cover"
          />
          <img
            data-reveal
            data-parallax="28"
            src="/renders/render_N_03.jpg"
            alt="Двір із перголою ввечері"
            loading="lazy"
            className="mt-10 aspect-[3/4] w-full rounded-sm object-cover"
          />
          {/* eslint-enable @next/next/no-img-element */}
        </div>
        <div>
          <h2 data-reveal className="font-display text-4xl leading-[1.1] md:text-6xl">
            {richText(m.courtyard.h2)}
          </h2>
          <div className="mt-8 space-y-5 text-lg leading-relaxed text-[var(--ink-muted)] md:text-xl">
            {paragraphs(m.courtyard.body).map((p, i) => (
              <p key={i} data-reveal>
                {richText(p)}
              </p>
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
}
