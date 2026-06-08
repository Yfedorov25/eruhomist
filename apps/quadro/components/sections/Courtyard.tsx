"use client";

import { Section } from "../Section";
import { CrossfadeMedia } from "../CrossfadeMedia";
import { SplitReveal } from "../SplitReveal";
import { richText, paragraphs } from "@/lib/format";
import { useReveal } from "@/lib/useReveal";
import type { Messages } from "@/lib/i18n";

// S4 — Courtyard (R04 depth-parallax). The shared yard cross-fades day -> evening as you
// scroll (render_10 aerial -> render_N_03 pergola with path-lights), two-plane parallax
// + a warm light-leak that arrives with dusk — the section's single heroic moment:
// "the yard you want to step into in the evening." The H2 rises line-by-line beside it.
export function Courtyard({ m }: { m: Messages }) {
  const ref = useReveal<HTMLDivElement>();
  return (
    <Section id="courtyard" className="mx-auto max-w-7xl">
      <div
        ref={ref}
        className="grid items-center gap-12 md:grid-cols-[1.05fr_0.95fr] md:gap-20 lg:gap-24"
      >
        <div data-clip="up" data-cursor="дивитися" className="aspect-[4/3] w-full">
          <CrossfadeMedia
            day="/renders/render_10.jpg"
            evening="/renders/render_N_03.jpg"
            alt="Спільний двір QUADRO HOUSE удень і ввечері"
            // The daytime aerial is flat/low-contrast — lift it so the crossfade to the
            // warm evening pergola actually crosses temperature, not just swaps frames.
            dayFilter="brightness(1.1) saturate(1.08) contrast(1.04)"
            // The evening render's path-lights already carry the warmth; soften the added
            // light-leak so it doesn't double-expose them.
            glowIntensity={0.45}
            className="h-full w-full rounded-sm"
          />
        </div>
        <div>
          <SplitReveal
            as="h2"
            className="font-display text-4xl leading-[1.1] md:text-6xl"
          >
            {richText(m.courtyard.h2)}
          </SplitReveal>
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
