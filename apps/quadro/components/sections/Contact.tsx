"use client";

import { Section } from "../Section";
import { richText } from "@/lib/format";
import { useReveal } from "@/lib/useReveal";
import type { Messages } from "@/lib/i18n";
import { conversion } from "@/lib/conversion";
import { ContactForm } from "./ContactForm";

// S7 — CTA / footer block at the dark (evening) end of the page.
// Conversion slots (price / phone / developer) render only when the user supplies the
// content in lib/conversion.ts — nothing is invented or placeheld.
export function Contact({ m }: { m: Messages }) {
  const ref = useReveal<HTMLDivElement>();
  const { priceFrom, phone, telegram, developer } = conversion;

  return (
    <Section id="contact" className="mx-auto max-w-4xl">
      <div ref={ref}>
        <h2 data-reveal className="font-display text-3xl leading-tight md:text-5xl">
          {richText(m.cta.h2)}
        </h2>
        <p data-reveal className="mt-6 max-w-xl text-lg leading-relaxed text-[var(--fg-muted)]">
          {richText(m.cta.body)}
        </p>

        {priceFrom && (
          <p data-reveal className="font-display mt-8 text-2xl text-[var(--accent)] md:text-3xl">
            {priceFrom}
          </p>
        )}

        <div className="mt-12" data-reveal>
          <ContactForm m={m} />
        </div>

        {(phone || telegram) && (
          <div data-reveal className="mt-8 flex flex-wrap gap-6 text-lg">
            {phone && (
              <a href={`tel:${phone.replace(/[^+\d]/g, "")}`} className="text-[var(--accent)]">
                {phone}
              </a>
            )}
            {telegram && (
              <a
                href={`https://t.me/${telegram.replace(/^@/, "")}`}
                className="text-[var(--accent)]"
              >
                {telegram}
              </a>
            )}
          </div>
        )}

        {developer.name && (
          <div
            data-reveal
            className="mt-14 border-t border-[var(--fg-muted)]/15 pt-8 text-[var(--fg-muted)]"
          >
            <p className="text-sm uppercase tracking-[0.2em]">{developer.name}</p>
            {developer.blurb && <p className="mt-3 max-w-xl leading-relaxed">{developer.blurb}</p>}
          </div>
        )}
      </div>
    </Section>
  );
}
