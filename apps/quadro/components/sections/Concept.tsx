"use client";

import { Section } from "../Section";
import { CrossfadeMedia } from "../CrossfadeMedia";
import { richText, paragraphs } from "@/lib/format";
import { useReveal } from "@/lib/useReveal";
import type { Messages } from "@/lib/i18n";

// S2 — Onlyness (R04). Day->evening crossfade of the building (render_05 -> render_N_02)
// with parallax, beside the manifesto copy. One heroic moment: the lights coming on.
export function Concept({ m }: { m: Messages }) {
  const ref = useReveal<HTMLDivElement>();
  return (
    <Section id="concept" className="mx-auto max-w-7xl">
      <div ref={ref} className="grid items-center gap-12 md:grid-cols-2 md:gap-16">
        <div>
          <h2 data-reveal className="font-display text-4xl leading-[1.1] md:text-6xl">
            {richText(m.concept.h2)}
          </h2>
          <div className="mt-8 space-y-5 text-lg leading-relaxed text-[var(--ink-muted)] md:text-xl">
            {paragraphs(m.concept.body).map((p, i) => (
              <p key={i} data-reveal>
                {richText(p)}
              </p>
            ))}
          </div>
        </div>
        <CrossfadeMedia
          day="/renders/render_05.jpg"
          evening="/renders/render_N_02.jpg"
          alt="Фасад QUADRO HOUSE удень і ввечері"
          className="aspect-[4/3] w-full rounded-sm"
        />
      </div>
    </Section>
  );
}
