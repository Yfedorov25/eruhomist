"use client";

import { useState } from "react";
import Image from "next/image";
import { Reveal } from "@/components/ui/Reveal";

// 04 · ПЛАН — interactive floorplan. PNG underlay (from the Archicad PDF) + absolutely-positioned
// hotspot buttons over the real rooms; tap/hover shows area + what the room overlooks (council:
// label all real zones from EXACT areas, lead the eye to the two that sell — terrace + master).
// Accessible: buttons, aria-pressed, keyboard. Mobile: tap, panel docks below. No hand-redraw.
type Hotspot = {
  id: string;
  name: string;
  area: number;
  look?: string;
  x: number; // % center of label in the 2400×1697 plan image
  y: number;
  sells?: boolean;
};

const HOTSPOTS: Hotspot[] = [
  { id: "kitchen", name: "Кухня-вітальня", area: 45.0, look: "на терасу й Буг", x: 68, y: 42, sells: true },
  { id: "terrace", name: "Тераса", area: 29.83, look: "на воду", x: 85, y: 41, sells: true },
  { id: "master", name: "Майстер-спальня", area: 16.65, look: "власний санвузол + гардероб", x: 33, y: 26, sells: true },
  { id: "bed2", name: "Спальня", area: 14.43, look: "у двір", x: 50, y: 26 },
  { id: "room", name: "Кімната", area: 13.41, look: "у двір", x: 33, y: 64 },
  { id: "corridor", name: "Коридор", area: 17.53, x: 42, y: 46 },
  { id: "carport", name: "Навіс під авто", area: 36.92, look: "окремо від будинку", x: 14, y: 41 },
  { id: "wardrobe-c", name: "Гардероб", area: 9.36, x: 52, y: 41 },
  { id: "porch", name: "Ганок", area: 9.02, x: 49, y: 77 },
  { id: "hall", name: "Прихожа", area: 6.21, x: 46, y: 64 },
  { id: "boiler", name: "Топкова", area: 6.15, x: 29, y: 51 },
  { id: "bath1", name: "Санвузол", area: 6.09, x: 52, y: 64 },
  { id: "bath-m", name: "Санвузол (майстер)", area: 5.82, x: 26, y: 41 },
  { id: "wardrobe-m", name: "Гардероб (майстер)", area: 5.48, x: 31, y: 41 },
];

export default function Floorplan() {
  const [active, setActive] = useState<string>("kitchen");
  const current = HOTSPOTS.find((h) => h.id === active) ?? HOTSPOTS[0];

  return (
    <section className="relative bg-night py-[14vh]" aria-label="Інтерактивний план будинку">
      <div className="mx-auto max-w-6xl px-6">
        {/* Lead with the area as a typographic display object (warm-gold) — breaks the
            eyebrow→H2→body repeat of the prior sections; a Signature + Squint win. */}
        <Reveal className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between md:gap-12">
          <div className="max-w-xl">
            <p data-reveal-child className="mb-5 text-[11px] uppercase tracking-[0.34em] text-[var(--color-warm)]/80">
              Планування
            </p>
            <h2
              data-reveal-child
              className="text-balance text-[clamp(1.7rem,3.4vw,2.4rem)] font-normal leading-[1.15] tracking-[-0.015em] text-[var(--color-text)]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Жодного зайвого квадрата.
            </h2>
          </div>
          <p
            data-reveal-child
            className="font-light leading-[0.9] tracking-[-0.04em] text-[clamp(4rem,8vw,7rem)] text-[var(--color-warm)] tabular-nums"
            style={{ fontFamily: "var(--font-display)" }}
            aria-label="150 квадратних метрів"
          >
            150
            <span className="ml-1 align-top text-[0.3em] uppercase tracking-[0.2em] text-[var(--color-warm)]/70">м²</span>
          </p>
        </Reveal>
        <Reveal className="mb-10 max-w-2xl">
          <p data-reveal-child className="text-base leading-relaxed text-[var(--color-text-muted)] md:text-lg">
            Один поверх, три спальні, дві гардеробні, два санвузли. Натисніть кімнату — покажемо
            площу й куди дивляться вікна.
          </p>
        </Reveal>

        <div className="grid gap-8 lg:grid-cols-[1fr_280px] lg:items-start">
          {/* Plan + hotspots */}
          <Reveal className="relative">
            <div className="relative aspect-[2400/1697] w-full overflow-hidden rounded-sm border border-[var(--color-warm)]/10 bg-[#1c1814]">
              {/* Underlay — invert the dark-on-white Archicad plan to read light-on-dark, on-brand.
                  Full invert + brightness so the linework and room labels stay legible on the warm
                  surface; a soft warm tint keeps it from looking like a cold blueprint. */}
              <Image
                src="/plan/floorplan.png"
                alt="План будинку: 150 м² на одному поверсі — три спальні, кухня-вітальня 45 м², тераса 29,83 м²"
                fill
                sizes="(max-width: 1024px) 100vw, 70vw"
                loading="lazy"
                className="object-contain opacity-100 [filter:invert(1)_brightness(1.05)_sepia(0.28)_hue-rotate(338deg)_saturate(0.7)]"
              />

              {/* Hotspots */}
              {HOTSPOTS.map((h) => {
                const isActive = h.id === active;
                return (
                  <button
                    key={h.id}
                    type="button"
                    aria-pressed={isActive}
                    aria-label={`${h.name}, ${h.area.toLocaleString("uk")} м²`}
                    onClick={() => setActive(h.id)}
                    onMouseEnter={() => setActive(h.id)}
                    className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full outline-none transition-all duration-300 focus-visible:ring-2 focus-visible:ring-[var(--color-warm)]"
                    style={{ left: `${h.x}%`, top: `${h.y}%` }}
                  >
                    <span
                      className={`block rounded-full transition-all duration-300 ${
                        isActive
                          ? "h-3.5 w-3.5 bg-[var(--color-warm)] shadow-[0_0_0_5px_rgba(232,201,160,0.32)] outline outline-1 outline-[var(--color-warm)]/60"
                          : h.sells
                            ? "h-2.5 w-2.5 bg-[var(--color-warm)]/70 hover:bg-[var(--color-warm)]"
                            : "h-2 w-2 bg-[var(--color-text-muted)]/60 hover:bg-[var(--color-warm)]"
                      }`}
                    />
                  </button>
                );
              })}
            </div>
            <p className="mt-4 flex flex-wrap items-baseline gap-x-5 gap-y-1 text-xs text-[var(--color-text-muted)]">
              <span>Будинок — 150 м². Навіс на авто — окремо, 37 м².</span>
              <span className="text-[var(--color-warm)]/70">Наведіть точку — побачите площу й вид з вікна.</span>
            </p>
          </Reveal>

          {/* Active-room readout — editorial pair on a warm hairline, not a boxed dashboard card. */}
          <Reveal className="lg:sticky lg:top-24">
            <div className="border-l border-[var(--color-warm)]/25 pl-7">
              <p
                className="text-[clamp(3rem,5vw,4.2rem)] font-light leading-none text-[var(--color-warm)] tabular-nums"
                aria-live="polite"
              >
                {current.area.toLocaleString("uk")}
                <span className="ml-1 align-top text-[0.4em] tracking-[0.1em] text-[var(--color-warm)]/70">м²</span>
              </p>
              <p
                className="mt-5 text-[1.6rem] leading-tight text-[var(--color-text)]"
                style={{ fontFamily: "var(--font-display)" }}
                aria-live="polite"
              >
                {current.name}
              </p>
              {current.look ? (
                <p className="mt-3 text-sm leading-relaxed text-[var(--color-text-muted)]">
                  Вікна — <span className="text-[var(--color-text)]">{current.look}</span>.
                </p>
              ) : null}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
