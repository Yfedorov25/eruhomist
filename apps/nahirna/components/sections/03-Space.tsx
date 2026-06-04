"use client";

import Image from "next/image";
import { Reveal } from "@/components/ui/Reveal";

// 03 · ПРОСТІР — «Серце дому, 45 м²». A gallery of the open kitchen-living + terrace. Cards
// reveal with a stagger on enter and lift gently on hover (transform/shadow only). Not pinned
// → light, lazy, below-the-fold. The "walk the house" CTA lives here and opens the tour overlay
// (section 05) via a window event the overlay listens for. Reduced-motion → static grid (Reveal
// handles that); hover effects degrade to nothing on touch.
const CARDS = [
  { src: "/images/terrace.webp", title: "Тераса над водою", meta: "29,8 м²", span: "md:col-span-5 md:row-span-2", alt: "Тераса з виходом до Південного Бугу" },
  { src: "/images/living-day.webp", title: "Кухня-вітальня", meta: "45 м²", span: "md:col-span-7", alt: "Кухня-вітальня вдень: відкритий простір, панорамні вікна на воду" },
  { src: "/images/living-evening.webp", title: "Вечірнє світло", meta: "тепла підсвітка", span: "md:col-span-7", alt: "Кухня-вітальня ввечері з теплим освітленням" },
  { src: "/images/water-terrace-golden.webp", title: "Золота година", meta: "вид з тераси", span: "md:col-span-12", alt: "Вид з тераси на воду в золоту годину" },
];

export default function Space() {
  const openTour = () => window.dispatchEvent(new CustomEvent("open-tour"));

  return (
    <section className="relative bg-night py-[14vh]" aria-label="Простір — кухня-вітальня 45 м²">
      <div className="mx-auto max-w-6xl px-6">
        <Reveal className="mb-12 max-w-3xl">
          <p data-reveal-child className="mb-5 text-[11px] uppercase tracking-[0.34em] text-[var(--color-warm)]/80">
            Серце дому
          </p>
          <h2
            data-reveal-child
            className="text-balance text-[clamp(2rem,5vw,3.4rem)] font-normal leading-[1.12] tracking-[-0.02em] text-[var(--color-text)]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Кухня, де вода в кадрі, поки вариться кава
          </h2>
          <p data-reveal-child className="mt-6 max-w-2xl text-base leading-relaxed text-[var(--color-text-muted)] md:text-lg">
            45 квадратів без стін усередині: готуєте — і бачите вітальню, вітальню — і бачите терасу,
            терасу — і бачите Буг. Панорамні вікна тримають воду в кадрі від світанку до вечері.
          </p>
          {/* Honesty (Творець): the house sells unfinished — these are visualisations of the
              potential, not a finished interior. Stated plainly so it builds trust, not doubt. */}
          <p
            data-reveal-child
            className="mt-5 inline-flex items-center gap-2.5 rounded-full border border-[var(--color-warm)]/25 px-4 py-2 text-sm text-[var(--color-warm)]/90"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-warm)]" aria-hidden />
            Будинок продається без ремонту. Так він може виглядати — простір уже готовий до цього.
          </p>
        </Reveal>

        {/* Gallery */}
        <Reveal className="grid grid-cols-1 gap-4 md:grid-cols-12 md:auto-rows-[clamp(170px,21vh,230px)]" stagger={0.14}>
          {CARDS.map((c) => (
            <figure
              key={c.src}
              data-reveal-child
              className={`group relative aspect-[4/3] overflow-hidden rounded-sm md:aspect-auto md:h-full ${c.span}`}
            >
              <Image
                src={c.src}
                alt={c.alt}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                loading="lazy"
                className="object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] will-change-transform group-hover:scale-[1.05]"
              />
              {/* Caption scrim */}
              <div
                className="pointer-events-none absolute inset-0"
                style={{ background: "linear-gradient(to top, rgba(15,15,14,0.78) 0%, transparent 48%)" }}
                aria-hidden
              />
              <figcaption className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-5">
                <span
                  className="text-lg text-[var(--color-text)] md:text-xl"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {c.title}
                </span>
                <span className="shrink-0 text-xs uppercase tracking-[0.18em] text-[var(--color-warm)]/90">
                  {c.meta}
                </span>
              </figcaption>
            </figure>
          ))}
        </Reveal>

        {/* Walk-the-house CTA → opens the tour overlay (section 05). */}
        <Reveal className="mt-12 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
          <button
            type="button"
            onClick={openTour}
            className="group inline-flex items-baseline gap-4 text-[var(--color-text)]"
          >
            <span
              className="text-[clamp(1.4rem,2.2vw,1.9rem)] leading-none tracking-[-0.01em] [text-decoration-line:underline] [text-decoration-thickness:1px] [text-underline-offset:8px] decoration-[var(--color-warm)]/45 transition-[text-decoration-color,letter-spacing] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:tracking-[0] group-hover:decoration-[var(--color-warm)]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Пройтись будинком
            </span>
            <span className="text-[10px] uppercase tracking-[0.34em] text-[var(--color-warm)]/80">
              відкрити тур
            </span>
          </button>
          <span className="text-sm text-[var(--color-text-muted)]">
            Від воріт — через ганок і коридор у вітальню, а звідти на терасу, до самої води.
          </span>
        </Reveal>
      </div>
    </section>
  );
}
