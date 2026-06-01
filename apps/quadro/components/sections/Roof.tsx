"use client";

import { Section } from "../Section";
import { richText, paragraphs } from "@/lib/format";
import { useReveal } from "@/lib/useReveal";
import type { Messages } from "@/lib/i18n";

// S5 — Roof / lake view (R04). Terrace renders with parallax depth + the page's primary
// CTA (scrolls to the form). NOTE: a dedicated lake-view render is still a TODO (Nano
// Banana); render_terasa_03 (rooftop pergola) stands in as the hero image for now.
export function Roof({ m }: { m: Messages }) {
  const ref = useReveal<HTMLDivElement>();
  return (
    <Section id="roof" className="mx-auto max-w-7xl">
      <div ref={ref} className="grid items-center gap-12 md:grid-cols-2 md:gap-16">
        <div>
          <h2 data-reveal className="font-display text-4xl leading-[1.1] md:text-6xl">
            {richText(m.roof.h2)}
          </h2>
          <div className="mt-8 space-y-5 text-lg leading-relaxed text-[var(--fg-muted)] md:text-xl">
            {paragraphs(m.roof.body).map((p, i) => (
              <p key={i} data-reveal>
                {richText(p)}
              </p>
            ))}
          </div>
          <a
            data-reveal
            href="#contact"
            className="mt-10 inline-block border border-[var(--accent)] px-8 py-4 text-sm uppercase tracking-[0.2em] text-[var(--accent)] transition-colors hover:bg-[var(--accent)] hover:text-[var(--deep)]"
          >
            {m.roof.cta}
          </a>
        </div>
        <div className="grid gap-3">
          {/* eslint-disable @next/next/no-img-element */}
          {/* TODO(lake view): replace with the dedicated lake render once generated. */}
          <img
            data-reveal
            src="/renders/render_terasa_03.jpg"
            alt="Дах QUADRO HOUSE із перголою"
            loading="lazy"
            className="aspect-[16/10] w-full rounded-sm object-cover"
          />
          <div className="grid grid-cols-2 gap-3">
            <img
              data-reveal
              data-parallax="16"
              src="/renders/render_terasa_04.jpg"
              alt="Lounge-зона на даху"
              loading="lazy"
              className="aspect-[4/3] w-full rounded-sm object-cover"
            />
            <img
              data-reveal
              data-parallax="26"
              src="/renders/render_terasa_05.jpg"
              alt="Дах згори"
              loading="lazy"
              className="aspect-[4/3] w-full rounded-sm object-cover"
            />
          </div>
          {/* eslint-enable @next/next/no-img-element */}
        </div>
      </div>
    </Section>
  );
}
