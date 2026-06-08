"use client";

import { useState } from "react";
import Image from "next/image";
import { Reveal } from "@/components/ui/Reveal";
import { typo } from "@/lib/typo";

// 04 · ПЛАН — explore the real home, room by room. The architect's actual floor plan is the
// navigator; clicking a room shows its characteristics AND, where we have one, the real
// professional render of that exact space (kitchen-living, terrace, carport/exterior).
// Truth over CGI: every photo here is a render of THIS villa, not a hand-built model.
// x,y = % position of each room on the 2400×1697 floorplan.png (calibrated to the real plan).
type Room = {
  id: string;
  name: string;
  area: number;
  x: number;
  y: number;
  sells?: boolean;
  img?: string;
  imgAlt?: string; // optional 2nd state (e.g. evening)
  look?: string;
  desc: string;
};

const ROOMS: Room[] = [
  { id: "kitchen", name: "Кухня-вітальня", area: 45.0, x: 68, y: 42, sells: true, img: "/images/living-day.webp", imgAlt: "/images/living-evening.webp", look: "на терасу й Буг", desc: "Відкрита кухня з островом, обідня зона і вітальня в одному об'ємі. Панорамне скління, річка перед очима, вихід просто на терасу." },
  { id: "terrace", name: "Тераса", area: 29.83, x: 85, y: 41, sells: true, img: "/images/terrace.webp", imgAlt: "/images/night/night-terrace.png", look: "на воду", desc: "Критий простір майже 30 м² біля самої води, для обідів просто неба й довгих вечорів над Бугом." },
  { id: "master", name: "Майстер-спальня", area: 16.65, x: 33, y: 26, sells: true, look: "власний санвузол + гардероб", desc: "Окрема приватна зона: власний санвузол і гардеробна. Тихі вікна у двір." },
  { id: "bed2", name: "Спальня", area: 14.43, x: 50, y: 26, look: "у двір", desc: "Світла спальня з вікнами у двір, для дитини або гостей." },
  { id: "room", name: "Кімната", area: 13.41, x: 33, y: 64, look: "у двір", desc: "Гнучка кімната під ваш сценарій: кабінет, дитяча чи гостьова." },
  { id: "carport", name: "Навіс під авто", area: 36.92, x: 14, y: 41, img: "/images/exterior-day-1.webp", look: "окремо від будинку", desc: "Окремий критий навіс на авто. Машина завжди під дахом і в тіні, не займає місця в будинку." },
  { id: "corridor", name: "Коридор", area: 17.53, x: 42, y: 46, desc: "Зв'язує всі зони дому. Рівно стільки, щоб дійти, ні метра намарне." },
  { id: "wardrobe-c", name: "Гардероб", area: 9.36, x: 52, y: 41, desc: "Центральна гардеробна, 9 м² спокійного зберігання поза спальнями." },
  { id: "porch", name: "Ганок", area: 9.02, x: 49, y: 77, desc: "Вхідна група під дахом, захищений вхід у будь-яку погоду." },
  { id: "hall", name: "Прихожа", area: 6.21, x: 46, y: 64, desc: "Вхідна зона з місцем для верхнього одягу." },
  { id: "boiler", name: "Топкова", area: 6.15, x: 29, y: 51, desc: "Технічне приміщення: котел і комунікації окремо від житла." },
  { id: "bath1", name: "Санвузол", area: 6.09, x: 52, y: 64, desc: "Гостьовий санвузол поряд із вхідною зоною." },
  { id: "bath-m", name: "Санвузол (майстер)", area: 5.82, x: 26, y: 41, desc: "Власний санвузол при майстер-спальні." },
  { id: "wardrobe-m", name: "Гардероб (майстер)", area: 5.48, x: 31, y: 41, desc: "Гардеробна при майстер-спальні." },
];

const WITH_IMG = ROOMS.filter((r) => r.img);

export default function Floorplan() {
  const [active, setActive] = useState("kitchen");
  const [evening, setEvening] = useState(false);
  const current = ROOMS.find((r) => r.id === active) ?? ROOMS[0];

  return (
    <section className="relative bg-night py-[14vh]" aria-label="Інтерактивний план будинку">
      <div className="mx-auto max-w-6xl px-6">
        {/* Intro */}
        <Reveal className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between md:gap-12">
          <div className="max-w-xl">
            <p data-reveal-child className="mb-5 text-[11px] uppercase tracking-[0.34em] text-[var(--color-warm)]/80">
              Планування
            </p>
            <h2
              data-reveal-child
              className="text-balance text-[clamp(1.8rem,3.6vw,2.6rem)] font-normal leading-[1.12] tracking-[-0.015em] text-[var(--color-text)]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Дім, де продумано кожен метр.
            </h2>
            <p data-reveal-child className="mt-5 max-w-md text-base leading-relaxed text-[var(--color-text-muted)]">
              {typo("Натисніть на кімнату, щоб побачити її площу, призначення і, де є, справжнє фото цього простору.")}
            </p>
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

        <div className="grid gap-8 lg:grid-cols-[0.92fr_1.08fr] lg:items-start lg:gap-10">
          {/* PLAN navigator */}
          <Reveal className="order-2 lg:order-1">
            <div data-cursor="обрати" className="relative aspect-[2400/1697] w-full overflow-hidden rounded-sm border border-[var(--color-warm)]/10 bg-[var(--color-night-raised)]">
              <Image
                src="/plan/floorplan.png"
                alt="План будинку: 150 м² на одному поверсі — кухня-вітальня 45 м², тераса 29,83 м², три спальні, гардероби й санвузли"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                loading="lazy"
                className="object-contain opacity-100 [filter:invert(1)_brightness(1.05)_sepia(0.28)_hue-rotate(338deg)_saturate(0.7)]"
              />
              {ROOMS.map((r) => {
                const isActive = r.id === active;
                return (
                  <button
                    key={r.id}
                    type="button"
                    aria-pressed={isActive}
                    aria-label={`${r.name}, ${r.area.toLocaleString("uk")} м²${r.img ? ", є фото" : ""}`}
                    onClick={() => { setActive(r.id); setEvening(false); }}
                    onMouseEnter={() => setActive(r.id)}
                    className="absolute z-10 -translate-x-1/2 -translate-y-1/2 rounded-full outline-none transition-all duration-300 focus-visible:ring-2 focus-visible:ring-[var(--color-warm)]"
                    style={{ left: `${r.x}%`, top: `${r.y}%` }}
                  >
                    <span
                      className={`block rounded-full transition-all duration-300 ${
                        isActive
                          ? "h-4 w-4 bg-[var(--color-warm)] shadow-[0_0_0_6px_rgba(232,201,160,0.28)] outline outline-1 outline-[var(--color-warm)]/70"
                          : r.img
                            ? "h-3 w-3 bg-[var(--color-warm)] shadow-[0_0_8px_rgba(232,201,160,0.6)] hover:scale-110"
                            : r.sells
                              ? "h-2.5 w-2.5 bg-[var(--color-warm)]/70 hover:bg-[var(--color-warm)]"
                              : "h-2 w-2 bg-[var(--color-text-muted)]/60 hover:bg-[var(--color-warm)]"
                      }`}
                    />
                  </button>
                );
              })}
            </div>
            <p className="mt-4 flex flex-wrap items-baseline gap-x-5 gap-y-1 text-xs text-[var(--color-text-muted)]">
              <span>Будинок 150 м². Навіс на авто окремо, 37 м².</span>
              <span className="inline-flex items-center gap-1.5 text-[var(--color-warm)]/80">
                <span className="h-2 w-2 rounded-full bg-[var(--color-warm)] shadow-[0_0_6px_rgba(232,201,160,0.6)]" />
                тут є справжнє фото простору
              </span>
            </p>
          </Reveal>

          {/* VIEWER: real render where we have one, else editorial spec card. Clip-wipes in (data-clip). */}
          <div className="order-1 lg:order-2 lg:sticky lg:top-24">
            <div data-clip="left" className="relative aspect-[16/10] w-full overflow-hidden rounded-sm border border-[var(--color-warm)]/10 bg-[var(--color-night-raised)]">
              {/* day render layers (crossfade) */}
              {WITH_IMG.map((r) => {
                const show = r.id === active && !(evening && r.imgAlt);
                return (
                  <Image
                    key={r.id}
                    src={r.img!}
                    alt={`${r.name} — реальний рендер простору`}
                    fill
                    sizes="(max-width: 1024px) 100vw, 55vw"
                    loading="lazy"
                    className={`object-cover transition-opacity duration-700 ${show ? "opacity-100" : "opacity-0"}`}
                  />
                );
              })}
              {/* evening render layers (any room with an evening asset) */}
              {ROOMS.filter((r) => r.imgAlt).map((r) => (
                <Image
                  key={`${r.id}-eve`}
                  src={r.imgAlt!}
                  alt={`${r.name} — ввечері, реальний рендер`}
                  fill
                  sizes="(max-width: 1024px) 100vw, 55vw"
                  loading="lazy"
                  className={`object-cover transition-opacity duration-700 ${active === r.id && evening ? "opacity-100" : "opacity-0"}`}
                />
              ))}

              {/* spec-only state (rooms without a render) */}
              <div
                className={`absolute inset-0 flex flex-col justify-center px-8 transition-opacity duration-500 ${
                  current.img ? "opacity-0" : "opacity-100"
                }`}
              >
                <p className="text-[clamp(3.4rem,7vw,5.5rem)] font-light leading-none text-[var(--color-warm)] tabular-nums">
                  {current.area.toLocaleString("uk")}
                  <span className="ml-2 align-top text-[0.28em] tracking-[0.1em] text-[var(--color-warm)]/70">м²</span>
                </p>
                <p className="mt-4 text-[1.5rem] text-[var(--color-text)]" style={{ fontFamily: "var(--font-display)" }}>
                  {current.name}
                </p>
                <p className="mt-3 max-w-sm text-sm leading-relaxed text-[var(--color-text-muted)]">{typo(current.desc)}</p>
              </div>

              {/* caption overlay for photo rooms */}
              {current.img ? (
                <>
                  <div
                    className="pointer-events-none absolute inset-0"
                    style={{ background: "linear-gradient(to top, rgba(15,15,14,0.85) 0%, rgba(15,15,14,0.1) 42%, transparent 65%)" }}
                    aria-hidden
                  />
                  <div className="absolute inset-x-0 bottom-0 z-10 flex items-end justify-between gap-3 p-4 md:p-6">
                    <div className="max-w-md">
                      <p className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                        <span className="text-[1.9rem] font-light leading-none text-[var(--color-warm)] tabular-nums md:text-[2.4rem]">
                          {current.area.toLocaleString("uk")}
                        </span>
                        <span className="text-xs text-[var(--color-warm)]/70 md:text-sm">м²</span>
                        <span className="ml-1 text-[1.1rem] leading-tight text-[var(--color-text)] md:text-[1.4rem]" style={{ fontFamily: "var(--font-display)" }}>
                          {current.name}
                        </span>
                      </p>
                      <p className="mt-1.5 text-[13px] leading-snug text-[var(--color-text)]/85 md:text-sm">{typo(current.desc)}</p>
                    </div>
                    {current.imgAlt ? (
                      <button
                        type="button"
                        onClick={() => setEvening((v) => !v)}
                        className="shrink-0 self-end rounded-full border border-[var(--color-warm)]/40 px-3 py-1.5 text-[11px] uppercase tracking-[0.12em] text-[var(--color-warm)] transition-colors hover:bg-[var(--color-warm)]/10 md:px-4 md:py-2 md:text-xs"
                      >
                        {evening ? "День" : "Вечір"}
                      </button>
                    ) : null}
                  </div>
                </>
              ) : null}
            </div>

            {/* features line under viewer */}
            {current.look ? (
              <p className="mt-4 text-sm leading-relaxed text-[var(--color-text-muted)]">
                Вид з вікон: <span className="text-[var(--color-text)]">{current.look}</span>.
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
