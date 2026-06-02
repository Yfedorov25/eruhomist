"use client";

import { Section } from "../Section";
import { SplitReveal } from "../SplitReveal";
import { richText } from "@/lib/format";
import { useReveal } from "@/lib/useReveal";
import type { Messages } from "@/lib/i18n";

// "Як ми тут живемо" — the yard rules in a quiet "ми" voice (Caregiver intimacy). Follows
// the Courtyard so it reads as "here's the shared yard → here's how four families share it."
// Deliberately plain: no numbering, no icons, no bullets — each rule is one calm line that
// reveals in sequence, like a quiet agreement being read aloud. reduced-motion -> visible.
export function Rules({ m }: { m: Messages }) {
  const ref = useReveal<HTMLDivElement>({ stagger: 0.14, y: 22 });
  return (
    <Section id="rules" className="mx-auto max-w-3xl">
      <div ref={ref}>
        <SplitReveal as="h2" className="font-display text-4xl leading-[1.1] md:text-5xl">
          {richText(m.rules.h2)}
        </SplitReveal>
        <p
          data-reveal
          className="mt-6 max-w-2xl text-lg leading-relaxed text-[var(--ink-muted)] md:text-xl"
        >
          {richText(m.rules.intro)}
        </p>

        <ul className="mt-12 space-y-7">
          {m.rules.items.map((item, i) => (
            <li
              key={i}
              data-reveal
              className="border-t border-[var(--ink-muted)]/15 pt-7 text-lg leading-relaxed text-[var(--ink)] md:text-xl"
            >
              {richText(item)}
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}
