"use client";

import { Reveal } from "@/components/ui/Reveal";
import { DrawAccent } from "@/components/ui/DrawAccent";
import { GalleryCard, type Card } from "@/components/ui/GalleryCard";
import { typo } from "@/lib/typo";

// 03 · ПРОСТІР — «Серце дому, 45 м²». Two hero spaces, each a day→evening pair on the SAME
// composition (click «увімкнути вечір» — lights come on, can't morph, can't lie). Uniform
// interaction across both cards. The section FILLS one screen so you "land" on it before
// scrolling on (award base: pin only key sections, otherwise full-viewport occupancy + a
// scroll-cue create the pause — NOT CSS scroll-snap, which the base flags as a junior trap).
const CARDS: Card[] = [
  { src: "/images/terrace.webp", title: "Тераса над водою", meta: "29,8 м²", span: "md:col-span-1", alt: "Тераса з виходом до Південного Бугу", night: "/images/night/night-terrace.png" },
  { src: "/images/living-day.webp", title: "Кухня-вітальня", meta: "45 м²", span: "md:col-span-1", alt: "Кухня-вітальня: відкритий простір, панорамні вікна на воду", night: "/images/living-evening.webp" },
];

export default function Space() {
  return (
    <section
      className="relative flex min-h-[86svh] flex-col justify-center bg-night py-[8vh]"
      aria-label="Простір — кухня-вітальня 45 м²"
    >
      <div className="mx-auto w-full max-w-6xl px-6">
        <Reveal className="mb-7 max-w-3xl">
          <p data-reveal-child className="mb-3 text-[11px] uppercase tracking-[0.34em] text-[var(--color-warm)]/80">
            Серце дому
          </p>
          <DrawAccent className="mb-4" />
          <h2
            data-reveal-child
            className="text-balance text-[clamp(1.9rem,4.4vw,3rem)] font-normal leading-[1.1] tracking-[-0.02em] text-[var(--color-text)]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Кухня, де вода в кадрі, поки вариться кава
          </h2>
          <p data-reveal-child className="mt-4 max-w-2xl text-[15px] leading-relaxed text-[var(--color-text-muted)] md:text-base">
            {typo("45 квадратів без жодної стіни всередині. З кухні видно вітальню, з вітальні терасу, а з тераси Південний Буг. Натисніть на фото, щоб увімкнути вечір.")}
          </p>
        </Reveal>

        {/* Two hero spaces — each toggles day → evening on click. Cards clip-wipe in (data-clip). */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:h-[clamp(300px,46vh,460px)]">
          {CARDS.map((c) => (
            <GalleryCard key={c.src} c={c} />
          ))}
        </div>

        {/* Honesty (Творець): house sells unfinished — these visualise the potential. */}
        <Reveal className="mt-6">
          <p
            data-reveal-child
            className="inline-flex items-center gap-2.5 rounded-full border border-[var(--color-warm)]/25 px-4 py-2 text-[13px] text-[var(--color-warm)]/90"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-warm)]" aria-hidden />
            {typo("Будинок продається без ремонту. На фото показано, яким може стати простір.")}
          </p>
        </Reveal>
      </div>

    </section>
  );
}
