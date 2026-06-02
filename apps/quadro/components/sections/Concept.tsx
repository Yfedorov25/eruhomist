"use client";

import { Section } from "../Section";
import { CrossfadeMedia } from "../CrossfadeMedia";
import { SplitReveal } from "../SplitReveal";
import { richText, paragraphs } from "@/lib/format";
import { useReveal } from "@/lib/useReveal";
import type { Messages } from "@/lib/i18n";

// S2 — Onlyness (R04 depth-parallax). The facade cross-fades day -> evening as you
// scroll (render_05 -> render_N_02) with two-plane parallax and a warm light-leak that
// arrives with dusk — the section's single heroic moment. The H2 rises line-by-line
// (SplitText) as the copy reveals beside it.
export function Concept({ m }: { m: Messages }) {
  const ref = useReveal<HTMLDivElement>();
  return (
    <Section id="concept" className="mx-auto max-w-7xl">
      <div ref={ref} className="grid items-center gap-12 md:grid-cols-2 md:gap-20 lg:gap-24">
        <div>
          <SplitReveal
            as="h2"
            className="font-display text-4xl leading-[1.1] md:text-6xl"
          >
            {richText(m.concept.h2)}
          </SplitReveal>
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
