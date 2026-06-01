"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Section } from "../Section";
import type { Messages } from "@/lib/i18n";

gsap.registerPlugin(ScrollTrigger);

// S6 — Specs. Numbers, no adjectives. Only the 4 numeric items count up (apartments,
// totalArea, plot, yard); the 6 string/date items just reveal. The count-up preserves
// the value's prefix/suffix (e.g. "300 м²", "≈3,5 сотки") and the decimal comma.
const NUMERIC_KEYS = new Set(["apartments", "totalArea", "plot", "yard"]);

export function Specs({ m }: { m: Messages }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const items = Object.entries(m.specs.items) as Array<
    [string, { label: string; value: string }]
  >;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const ctx = gsap.context(() => {
      // reveal all
      if (!reduced) {
        gsap.from(el.querySelectorAll("[data-reveal]"), {
          y: 24,
          opacity: 0,
          duration: 1.2,
          ease: "power3.out",
          stagger: 0.07,
          scrollTrigger: { trigger: el, start: "top 78%" },
        });
      }
      // count-up the numeric values once
      el.querySelectorAll<HTMLElement>("[data-count]").forEach((node) => {
        const raw = node.dataset.count || "";
        const match = raw.match(/(\d+(?:[.,]\d+)?)/);
        if (!match) return;
        const target = parseFloat(match[1].replace(",", "."));
        const decimals = match[1].includes(",") || match[1].includes(".") ? 1 : 0;
        const prefix = raw.slice(0, match.index);
        const suffix = raw.slice((match.index ?? 0) + match[1].length);
        if (reduced) {
          node.textContent = raw;
          return;
        }
        const obj = { v: 0 };
        gsap.to(obj, {
          v: target,
          duration: 1.6,
          ease: "power2.out",
          scrollTrigger: { trigger: el, start: "top 70%" },
          onUpdate: () => {
            const shown = obj.v.toFixed(decimals).replace(".", ",");
            node.textContent = `${prefix}${shown}${suffix}`;
          },
        });
      });
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <Section id="specs" className="mx-auto max-w-5xl">
      <div ref={ref}>
        <h2 data-reveal className="font-display text-3xl md:text-5xl">
          {m.specs.h2}
        </h2>
        <dl className="mt-14 grid grid-cols-1 gap-x-12 gap-y-8 sm:grid-cols-2">
          {items.map(([key, item]) => {
            const numeric = NUMERIC_KEYS.has(key);
            return (
              <div
                key={key}
                data-reveal
                className="flex flex-col border-t border-[var(--fg-muted)]/20 pt-4"
              >
                <dt className="text-xs uppercase tracking-[0.2em] text-[var(--fg-muted)]">
                  {item.label}
                </dt>
                <dd
                  className="font-display mt-2 text-2xl md:text-3xl"
                  data-count={numeric ? item.value : undefined}
                >
                  {item.value}
                </dd>
              </div>
            );
          })}
        </dl>
      </div>
    </Section>
  );
}
