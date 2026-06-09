"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import Image from "next/image";
import { Reveal } from "@/components/ui/Reveal";
import { DrawAccent } from "@/components/ui/DrawAccent";
import { Lightbox, type Shot } from "@/components/ui/Lightbox";
import { typo } from "@/lib/typo";

// 05 · ГАЛЕРЕЯ — «Подивіться на дім ближче». Built on the developer's request: more photos of the
// project, something to swipe through. Mechanic = ERA imageZoom idiom (swipe strip + fullscreen
// lightbox) — no scroll pin (perf-doctrine: never pin what doesn't need it), pure native scroll-
// snap so touch is the native scroller. Lives on the established engine: Reveal entrance, air ease,
// data-cursor label, DecodeAhead auto-prefetches the <img>s. Drag-to-scroll on desktop.
const SHOTS: Shot[] = [
  { src: "/images/gallery/exterior-day-hero.webp", title: "Дім з під'їзду", meta: "Екстер'єр, день", alt: "Будинок на Нагірній удень: повний ракурс, темна клінкерна цегла, шатровий дах, кулі-самшити" },
  { src: "/images/gallery/corner-columns-day.webp", title: "Кут із колонами", meta: "Деталь, день", alt: "Кут будинку: цегляні колони з білим каменем на базі й капітелі" },
  { src: "/images/gallery/terrace-porch-day.webp", title: "Ганок тераси", meta: "Фасад, день", alt: "Ганок і фасад тераси: панорамне скління, глибокі звиси даху" },
  { src: "/images/gallery/front-facade-day.webp", title: "Фронтальний фасад", meta: "Екстер'єр, день", alt: "Фронтальний фасад будинку з туями й панорамними вікнами" },
  { src: "/images/gallery/side-wide-day.webp", title: "Збоку, вдень", meta: "Екстер'єр, день", alt: "Будинок збоку: широкий ракурс, дах і скління" },
  { src: "/images/gallery/aerial-roof-day.webp", title: "З висоти", meta: "Екстер'єр, день", alt: "Будинок з висоти: шатровий дах, навіс і двір" },
  { src: "/images/gallery/from-gate-day.webp", title: "Від воріт", meta: "Екстер'єр, день", alt: "Будинок від воріт у зелені, гравійна доріжка" },
  { src: "/images/gallery/corner-clinker-day.webp", title: "Клінкер зблизька", meta: "Деталь, день", alt: "Кут будинку зблизька: фактура темної клінкерної цегли й білий камінь" },
  { src: "/images/gallery/behind-fence-day.webp", title: "З-за паркану", meta: "Екстер'єр, день", alt: "Будинок з-за паркану: приватна ділянка в глухому куті" },
  { src: "/images/gallery/riverbank-day.webp", title: "Власний берег", meta: "Природа, день", alt: "Берег Південного Бугу біля будинку: вода, латаття, дерева" },
  { src: "/images/gallery/garden-umbrellas-day.webp", title: "Сад із парасолями", meta: "Подвір'я, день", alt: "Сад біля будинку: парасолі, лежаки, підстрижені самшити" },
  { src: "/images/gallery/loungers-day.webp", title: "Лежаки під деревами", meta: "Подвір'я, день", alt: "Зона відпочинку з лежаками під деревами" },
  { src: "/images/gallery/firepit-day.webp", title: "Зона з вогнищем", meta: "Подвір'я, день", alt: "Лаунж-зона з вогнищем і кріслами вдень" },
  { src: "/images/gallery/pergola-garland-day.webp", title: "Пергола з гірляндою", meta: "Подвір'я, день", alt: "Пергола з гірляндою над зоною відпочинку вдень" },
  { src: "/images/gallery/facade-night.webp", title: "Фасад уночі", meta: "Екстер'єр, ніч", alt: "Фасад будинку вночі: підсвітка карнизів, тепле світло вікон, зоряне небо" },
  { src: "/images/gallery/facade-night-warm.webp", title: "Тепле світло", meta: "Екстер'єр, ніч", alt: "Будинок уночі: тепле світло у вікнах і підсвітка карнизів" },
  { src: "/images/gallery/firepit-night.webp", title: "Вогнище під зорями", meta: "Подвір'я, ніч", alt: "Зона з вогнищем уночі під зоряним небом" },
];

export default function Gallery() {
  const strip = useRef<HTMLDivElement>(null);
  const cards = useRef<(HTMLButtonElement | null)[]>([]);
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState<number | null>(null);

  // Exact dot tracking: which card is most centered in the strip drives the active dot
  // (IntersectionObserver against the strip's own viewport — precise to the last card,
  // unlike scrollLeft/maxScroll rounding which never lights the final dot).
  useEffect(() => {
    const root = strip.current;
    if (!root) return;
    const io = new IntersectionObserver(
      (entries) => {
        let best = -1;
        let bestRatio = 0;
        for (const e of entries) {
          const i = cards.current.indexOf(e.target as HTMLButtonElement);
          if (e.intersectionRatio > bestRatio) {
            bestRatio = e.intersectionRatio;
            best = i;
          }
        }
        if (best >= 0 && bestRatio > 0.5) setActive((prev) => (prev === best ? prev : best));
      },
      { root, threshold: [0.5, 0.75, 1] },
    );
    cards.current.forEach((c) => c && io.observe(c));
    return () => io.disconnect();
  }, []);

  // Drag-to-scroll (desktop pointer). Touch uses native scroll.
  const drag = useRef<{ down: boolean; x: number; left: number }>({ down: false, x: 0, left: 0 });
  const onDown = (e: React.PointerEvent) => {
    if (e.pointerType === "touch") return;
    drag.current = { down: true, x: e.clientX, left: strip.current!.scrollLeft };
  };
  const onMove = (e: React.PointerEvent) => {
    if (!drag.current.down) return;
    strip.current!.scrollLeft = drag.current.left - (e.clientX - drag.current.x);
  };
  const onUp = () => (drag.current.down = false);

  const step = useCallback(
    (dir: 1 | -1) => setOpen((i) => (i === null ? i : (i + dir + SHOTS.length) % SHOTS.length)),
    [],
  );

  return (
    <section className="relative bg-night py-[12vh]" aria-label="Галерея будинку">
      <div className="mx-auto w-full max-w-6xl px-6">
        <Reveal className="mb-8 max-w-3xl">
          <p data-reveal-child className="mb-3 text-[11px] uppercase tracking-[0.34em] text-[var(--color-warm)]/80">
            Галерея проєкту
          </p>
          <DrawAccent className="mb-4" />
          <h2
            data-reveal-child
            className="text-balance text-[clamp(1.9rem,4.4vw,3rem)] font-normal leading-[1.1] tracking-[-0.02em] text-[var(--color-text)]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Подивіться на дім ближче
          </h2>
          <p data-reveal-child className="mt-4 max-w-2xl text-[15px] leading-relaxed text-[var(--color-text-muted)] md:text-base">
            {typo("Кожен ракурс будинку й ділянки. Гортайте вбік, натисніть на фото, щоб роздивитися на весь екран.")}
          </p>
        </Reveal>
      </div>

      {/* Swipe strip — full-bleed so cards run to the edge (cinematic). Native scroll-snap. */}
      <Reveal>
        <div
          ref={strip}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerLeave={onUp}
          data-cursor="дивитись"
          className="hide-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto px-6 pb-2 [scrollbar-width:none] md:gap-5 md:px-[max(1.5rem,calc((100vw-72rem)/2))]"
          style={{ cursor: "grab" }}
        >
          {SHOTS.map((s, i) => (
            <button
              key={s.src}
              ref={(el) => { cards.current[i] = el; }}
              onClick={() => setOpen(i)}
              aria-label={`Відкрити: ${s.title}`}
              className="group relative aspect-[4/3] w-[78vw] shrink-0 snap-start overflow-hidden rounded-sm border border-[var(--color-warm)]/10 bg-[var(--color-night-raised)] md:w-[clamp(340px,38vw,460px)]"
            >
              <Image
                src={s.src}
                alt={s.alt}
                fill
                sizes="(max-width: 768px) 78vw, 460px"
                loading={i < 3 ? "eager" : "lazy"}
                className="object-cover transition-transform duration-700 ease-[var(--ease-signature)] group-hover:scale-[1.05]"
              />
              <span className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/55 to-transparent px-4 pb-3 pt-10 text-left">
                <span className="block text-[10px] uppercase tracking-[0.18em] text-[var(--color-warm)]/90">{s.meta}</span>
                <span className="block text-[15px] text-[var(--color-text)]" style={{ fontFamily: "var(--font-display)" }}>
                  {s.title}
                </span>
              </span>
            </button>
          ))}
        </div>
      </Reveal>

      {/* Progress dots — the active card widens to a warm bar. */}
      <div className="mx-auto mt-5 flex max-w-6xl justify-center gap-2 px-6" aria-hidden>
        {SHOTS.map((s, i) => (
          <span
            key={s.src}
            className={
              "h-1.5 rounded-full transition-all duration-500 ease-[var(--ease-signature)] " +
              (i === active ? "w-6 bg-[var(--color-warm)]" : "w-1.5 bg-white/20")
            }
          />
        ))}
      </div>

      <Lightbox shots={SHOTS} index={open} onClose={() => setOpen(null)} onStep={step} />
    </section>
  );
}
