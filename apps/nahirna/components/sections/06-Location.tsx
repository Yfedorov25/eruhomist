"use client";

import { Reveal } from "@/components/ui/Reveal";
import { POIS } from "@/lib/site";

// 06 · ЛОКАЦІЯ — «Вінниця, вул. Нагірна». Council: NO Leaflet (LCP grenade + no data), and
// NEVER invent distances (a fake/vague map kills trust on a $270k sale). So this is a static,
// stylized SVG "map" — a dead-end street ending at the river, with the villa pin. Only VERIFIED
// POIs render (the "власний берег · 0 хв" line is true today); unverified center/school stay
// hidden behind POIS[].verified until the client confirms. POIs are framed as TIME, not distance.
export default function Location() {
  const verified = POIS.filter((p) => p.verified);
  const pending = POIS.filter((p) => !p.verified);

  return (
    <section className="relative bg-night py-[14vh]" aria-label="Локація — вул. Нагірна, Вінниця">
      <div className="mx-auto max-w-6xl px-6">
        <Reveal className="mb-12 max-w-3xl">
          <p data-reveal-child className="mb-5 text-[11px] uppercase tracking-[0.34em] text-[var(--color-warm)]/80">
            Локація
          </p>
          <h2
            data-reveal-child
            className="text-balance text-[clamp(2rem,5vw,3.4rem)] font-normal leading-[1.12] tracking-[-0.02em] text-[var(--color-text)]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Здається, що за містом. Насправді — у Вінниці.
          </h2>
          <p data-reveal-child className="mt-6 max-w-2xl text-base leading-relaxed text-[var(--color-text-muted)] md:text-lg">
            Тупікова вулиця тримає Вас осторонь від руху й шуму, але до міста — рукою подати.
          </p>
        </Reveal>

        <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr] lg:items-center">
          {/* Stylized map — dead-end street → riverbank, villa pin. SVG, no tiles, no SDK. */}
          <Reveal>
            <div className="relative aspect-[16/11] w-full overflow-hidden rounded-sm border border-[var(--color-warm)]/10 bg-[#14110e]">
              <svg viewBox="0 0 320 220" className="h-full w-full" role="img" aria-label="Схема розташування: тупікова вулиця, що виходить до берега Південного Бугу">
                {/* river band (bottom) */}
                <path d="M0 168 C 60 156, 120 180, 200 170 S 300 158, 320 166 L320 220 L0 220 Z" fill="#1d2a2e" />
                <path d="M0 168 C 60 156, 120 180, 200 170 S 300 158, 320 166" fill="none" stroke="#3a5560" strokeWidth="0.8" opacity="0.6" />
                {/* faint water highlight */}
                <path d="M30 188 C 110 180, 180 196, 290 186" fill="none" stroke="#56808c" strokeWidth="0.6" opacity="0.4" />

                {/* the dead-end street (from town edge, top-left, curving down to the plot) */}
                <path
                  d="M-10 40 C 70 50, 90 90, 150 110 S 210 140, 220 150"
                  fill="none"
                  stroke="#3a342c"
                  strokeWidth="9"
                  strokeLinecap="round"
                />
                <path
                  d="M-10 40 C 70 50, 90 90, 150 110 S 210 140, 220 150"
                  fill="none"
                  stroke="#5b5347"
                  strokeWidth="1"
                  strokeDasharray="3 5"
                  opacity="0.7"
                />

                {/* the plot — between street end and the water */}
                <rect x="196" y="138" width="56" height="34" rx="2" fill="#2c2622" stroke="#e8c9a0" strokeOpacity="0.35" />

                {/* neighbouring town blocks (top-left) — abstract, muted */}
                <g opacity="0.28" fill="#2a2620">
                  <rect x="6" y="18" width="26" height="18" rx="1" />
                  <rect x="40" y="14" width="22" height="16" rx="1" />
                  <rect x="10" y="44" width="20" height="14" rx="1" />
                </g>

                {/* villa pin */}
                <g transform="translate(224,150)">
                  <circle r="13" fill="#e8c9a0" opacity="0.16">
                    <animate attributeName="r" values="10;16;10" dur="3s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.18;0.04;0.18" dur="3s" repeatCount="indefinite" />
                  </circle>
                  <circle r="4.5" fill="#e8c9a0" />
                  <circle r="4.5" fill="none" stroke="#0f0f0e" strokeWidth="1" />
                </g>
              </svg>

              {/* labels over the svg */}
              <span className="absolute left-4 top-4 text-[10px] uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
                Вінниця
              </span>
              <span className="absolute bottom-4 right-4 text-[10px] uppercase tracking-[0.2em] text-[var(--color-warm)]/70">
                Південний Буг
              </span>
              <span
                className="absolute text-[11px] text-[var(--color-text)]"
                style={{ left: "calc(224 / 320 * 100%)", top: "calc(150 / 220 * 100% + 14px)", transform: "translateX(-50%)" }}
              >
                вул. Нагірна
              </span>
            </div>
          </Reveal>

          {/* POI list — verified only render; framed as time. */}
          <Reveal className="space-y-6" stagger={0.14}>
            {verified.map((p) => (
              <div key={p.id} data-reveal-child className="border-l border-[var(--color-warm)]/25 pl-5">
                <p className="text-[2rem] font-light leading-none text-[var(--color-warm)]">{p.value}</p>
                <p className="mt-2 text-base text-[var(--color-text)]">{p.label}</p>
                {p.note ? <p className="mt-1 text-sm text-[var(--color-text-muted)]">{p.note}</p> : null}
              </div>
            ))}

            {/* Honest placeholder for the rest — shown as "уточнюється", NOT a fake number.
                When the client confirms a distance, flip POIS[].verified and it renders above. */}
            {pending.length > 0 ? (
              <div data-reveal-child className="border-l border-[var(--color-text-muted)]/20 pl-5">
                <p className="text-sm leading-relaxed text-[var(--color-text-muted)]">
                  Час до центру міста, школи й садка{" "}
                  <span className="text-[var(--color-text)]">уточнюємо</span> — назвемо точні
                  хвилини на перегляді, без округлень.
                </p>
              </div>
            ) : null}
          </Reveal>
        </div>
      </div>
    </section>
  );
}
