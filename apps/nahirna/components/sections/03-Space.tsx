"use client";

import { Reveal } from "@/components/ui/Reveal";
import { GalleryCard, type Card } from "@/components/ui/GalleryCard";

// 03 · ПРОСТІР — «Серце дому, 45 м²». Interactive gallery (council/kickoff F2): cards "come alive"
// on click — the terrace plays a water cinemagraph, the interior crossfades day→evening (lights on,
// same room — can't morph, can't lie). NOT empty→furnished (buyer: staging an unfinished house reads
// as "played"). The "walk the house" CTA opens the tour overlay. Reduced-motion → static grid.
const CARDS: Card[] = [
  { src: "/images/terrace.webp", title: "Тераса над водою", meta: "29,8 м²", span: "md:col-span-5 md:row-span-2", alt: "Тераса з виходом до Південного Бугу", video: "/video/cinemagraph/terrace-water-loop.mp4" },
  { src: "/images/living-day.webp", title: "Кухня-вітальня", meta: "45 м²", span: "md:col-span-7", alt: "Кухня-вітальня вдень: відкритий простір, панорамні вікна на воду", night: "/images/living-evening.webp" },
  { src: "/images/water-terrace-golden.webp", title: "Золота година", meta: "вид з тераси", span: "md:col-span-7", alt: "Вид з тераси на воду в золоту годину", night: "/images/night/night-terrace.png" },
  { src: "/images/exterior-day-2.webp", title: "Фасад серед зелені", meta: "приватність", span: "md:col-span-12", alt: "Фасад вілли серед дерев — приватна ділянка" },
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

        {/* Interactive gallery — click a card to bring it alive (cinemagraph / day→evening). */}
        <Reveal className="grid grid-cols-1 gap-4 md:grid-cols-12 md:auto-rows-[clamp(170px,21vh,230px)]" stagger={0.14}>
          {CARDS.map((c) => (
            <GalleryCard key={c.src} c={c} />
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
