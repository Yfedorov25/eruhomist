"use client";

import { useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { CONTACT, phoneReady } from "@/lib/site";
import { trackCall, trackCta } from "@/lib/analytics";
import { typo } from "@/lib/typo";

gsap.registerPlugin(ScrollTrigger, useGSAP);

// 06 · ЛОКАЦІЯ — «Близько до міста. Далеко від усіх.» (user-picked V3 «аеро-спуск»).
// Background = a CINEMATIC AERIAL DESCENT video (Higgsfield, golden-hour drone gliding down to a
// private river bend). It plays in place — NOT scrubbed, NO scale — so it never "recedes" as you
// scroll; the scroll only drives the copy choreography. The kept mechanic (user loves it):
//   DESKTOP+motion → pinned beat: LEFT copy + honest OSM distances DIM as focus shifts right;
//     RIGHT the count-down lands on "0 хвилин" and the payoff blooms (peak). The aerial = mood.
//   MOBILE / reduced-motion → static stacked panels (aerial still + distances, then riverbank +
//     payoff), each with its own scrim. No pin/scrub/video (light). Reads expensive AT REST.
// CTA sits at the "0 хвилин" peak (lead-gen). Privacy: district-level only, no street, no map link.
// Honesty: the aerial is an atmospheric establishing shot (a river bend), not a geo-exact map —
// the factual claims (distances, privacy) live in the copy.

// Honest distances — REAL OSM data (docs/MAP_DATA). NEVER fake exact drive-times: "≈/<" stay.
const DISTANCES = [
  { place: "Центр Вінниці", value: "≈ 2.5 км", note: "кілька хв автомобілем" },
  { place: "Зупинка", value: "≈ 150 м", note: "" },
  { place: "Аптека, клініка, парк", value: "< 1 км", note: "" },
  { place: "Школа, садок, магазини", value: "пішки", note: "" },
] as const;

function DistanceList() {
  return (
    <ul className="mt-7 max-w-md space-y-3">
      {DISTANCES.map((d) => (
        <li
          key={d.place}
          className="flex items-baseline justify-between gap-4 border-b border-[var(--color-warm)]/15 pb-2.5"
        >
          <span className="text-[15px] text-[var(--color-text)] md:text-base">
            {d.place}
            {d.note ? (
              // Mobile: note drops to its own line so it never crowds the distance value.
              <span className="mt-0.5 block text-[13px] text-[var(--color-text-muted)] md:mt-0 md:ml-2 md:inline">
                <span className="hidden md:inline">· </span>{d.note}
              </span>
            ) : null}
          </span>
          <span
            className="shrink-0 text-[15px] tracking-[0.01em] text-[var(--color-warm)] md:text-base"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {d.value}
          </span>
        </li>
      ))}
    </ul>
  );
}

function CtaButton({ ready, label }: { ready: boolean; label: string }) {
  return ready ? (
    <a
      href={`tel:${CONTACT.phoneTel}`}
      onClick={() => trackCall("location")}
      className="mt-7 inline-flex items-center gap-2.5 rounded-full bg-[var(--color-warm)] px-7 py-3.5 text-sm font-medium text-[var(--color-night)] transition-transform duration-300 hover:scale-[1.04]"
    >
      {label}
    </a>
  ) : (
    <a
      href="#cta"
      onClick={() => trackCta("location_callback")}
      className="mt-7 inline-flex items-center gap-2.5 rounded-full bg-[var(--color-warm)] px-7 py-3.5 text-sm font-medium text-[var(--color-night)] transition-transform duration-300 hover:scale-[1.04]"
    >
      Приїхати на берег
    </a>
  );
}

function Payoff({ ready, big }: { ready: boolean; big?: boolean }) {
  return (
    <div className="loc-payoff">
      <p
        className="text-[clamp(1.5rem,3vw,2.1rem)] font-normal leading-[1.15] tracking-[-0.02em] text-[var(--color-warm)]"
        style={{ fontFamily: "var(--font-display)" }}
      >
        А річка просто внизу.
      </p>

      <div className="mt-3 flex items-end gap-3">
        <span
          className={`loc-count font-light leading-[0.85] text-[var(--color-warm)] ${
            big ? "text-[clamp(3.5rem,8vw,5.5rem)]" : "text-[3.5rem]"
          }`}
          style={{ fontFamily: "var(--font-display)" }}
        >
          0
        </span>
        <span className="pb-2 text-lg leading-tight text-[var(--color-text)]">
          хвилин
          <br />
          до власного берега
        </span>
      </div>

      <p className="mt-4 max-w-sm text-[15px] leading-relaxed text-[var(--color-text)]">
        <span className="text-[var(--color-warm)]">{typo("Чотири сотки власного берега.")}</span> {typo("Не вид на річку, а сама річка. Ні сусідів, ні чужих поглядів.")}
      </p>

      <CtaButton ready={ready} label="Подзвонити й приїхати на берег" />
    </div>
  );
}

// Bottom-weighted scrim used on both photos so copy always reads over them.
const SCRIM =
  "linear-gradient(to top, rgba(15,15,14,0.92) 0%, rgba(15,15,14,0.6) 32%, rgba(15,15,14,0.15) 60%, transparent 80%)";

export default function Location() {
  const root = useRef<HTMLElement>(null);
  const ready = phoneReady();

  useGSAP(
    () => {
      // The choreography is DESKTOP + motion only. The mobile/reduced markup is static by default
      // (no GSAP needed) — it renders as a plain stacked composition. matchMedia guarantees the pin
      // never registers on mobile (that's exactly where scrub/pin janks).
      const mm = gsap.matchMedia();

      mm.add("(min-width: 768px) and (prefers-reduced-motion: no-preference)", () => {
        // Background = the cinematic AERIAL DESCENT video (Higgsfield), playing in place. It is
        // NOT scrubbed and has NO scale animation, so it never "recedes" as you scroll — it just
        // glides down toward the water on its own. The scroll only drives the copy choreography.
        const v = root.current!.querySelector<HTMLVideoElement>(".loc-aerial-video");
        if (v) {
          v.preload = "auto";
          // Play the descent ONCE as the section arrives, then hold the last frame. No loop →
          // no jump back to the start (which read as the drone "reversing" mid-flight).
          ScrollTrigger.create({
            trigger: ".loc-stage",
            start: "top 75%",
            once: true,
            onEnter: () => {
              gsap.to(v, { opacity: 1, duration: 1.0, ease: "power2.out" });
              v.play().catch(() => {});
            },
          });
          // Pause off-screen (no decode work while not visible); resume if scrolled back in.
          ScrollTrigger.create({
            trigger: ".loc-stage",
            start: "top bottom",
            end: "bottom top",
            onLeave: () => v.pause(),
            onLeaveBack: () => v.pause(),
            onEnterBack: () => { if (!v.ended) v.play().catch(() => {}); },
          });
        }
        gsap.set(".loc-city", { autoAlpha: 1 });
        gsap.set(".loc-d-payoff", { autoAlpha: 0, y: 24 });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: ".loc-stage",
            start: "top top",
            end: "+=120%", // short pin — the buyer scans, doesn't ride
            scrub: 1,
            pin: ".loc-pin-target",
            anticipatePin: 1,
          },
        });

        // left copy dims (focus shifts right) — exactly as before.
        tl.to(".loc-city", { autoAlpha: 0.2, y: -10, ease: "power1.in" }, 0.0);
        // count down 10 → 0 in WHOLE integers on the right (10 9 8 … 0), gold payoff blooms.
        // Integer ticks read like a countdown; tenths (1.6 1.5…) read like a stopwatch glitch.
        const counter = { v: 10 };
        const num = root.current!.querySelector<HTMLElement>(".loc-d-payoff .loc-count");
        if (num) num.textContent = "10"; // start integer so the pin-engage doesn't flash 0→10
        tl.to(
          counter,
          {
            v: 0,
            ease: "none",
            onUpdate: () => {
              if (num) num.textContent = String(Math.max(0, Math.round(counter.v)));
            },
          },
          0.0,
        );
        tl.to(".loc-d-payoff", { autoAlpha: 1, y: 0, ease: "power2.out" }, 0.2);
      });

      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section ref={root} className="relative bg-night" aria-label="Локація — вул. Нагірна, Вінниця">
      {/* ════════ DESKTOP — pinned gate→water crossfade (the ONE wow beat) ════════ */}
      <div className="loc-stage relative hidden md:block">
        <div className="loc-pin-target relative flex min-h-[100svh] w-full items-end overflow-hidden">
          <div className="loc-media absolute inset-0">
            {/* poster / base — the aerial still (instant, also the load-in frame) */}
            <Image
              src="/video/living/web/aerial-river.png"
              alt="Аеро-вид на вигин річки серед лісу — приватний берег"
              fill
              sizes="100vw"
              loading="lazy"
              className="object-cover"
            />
            {/* AERIAL DESCENT video — plays in place, no scroll-scrub, no scale (never recedes) */}
            <video
              data-living
              className="loc-aerial-video absolute inset-0 h-full w-full object-cover opacity-0"
              muted
              playsInline
              preload="none"
              poster="/video/living/web/aerial-river.png"
              aria-hidden
            >
              <source src="/video/living/web/aerial-descent.mp4" type="video/mp4" />
            </video>
          </div>

          <div className="pointer-events-none absolute inset-0" style={{ background: SCRIM }} aria-hidden />

          <div className="relative z-10 mx-auto w-full max-w-6xl px-6 pb-[10vh]">
            <p className="mb-5 text-[11px] uppercase tracking-[0.34em] text-[var(--color-warm)]/80">
              Локація
            </p>
            <div className="grid items-end gap-10 md:grid-cols-[1.05fr_0.95fr]">
              <div className="loc-city">
                <h2
                  className="scrim-text text-balance text-[clamp(2rem,4.6vw,3.2rem)] font-normal leading-[1.1] tracking-[-0.02em] text-[var(--color-text)]"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Близько до міста.
                  <br />
                  Далеко від усіх.
                </h2>
                <DistanceList />
                <p className="mt-5 max-w-md text-[13px] leading-relaxed text-[var(--color-text-muted)]">
                  {typo("Скільки хвилин до міста й школи, скажемо на зустрічі. Точну адресу називаємо тим, хто планує приїхати, щоб зберегти спокій власника.")}
                </p>
              </div>
              <div className="loc-d-payoff md:pb-1">
                <Payoff ready={ready} big />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ════════ MOBILE / reduced-motion — stacked two-panel composition (the scan product) ════════
          Panel 1: gate photo + claim + honest distances. Panel 2: water photo + the 0-хвилин payoff.
          Each panel has its own scrim so every line is legible (no copy stranded over bright water). */}
      <div className="md:hidden">
        {/* Panel 1 — aerial establishing (the river bend) + distances */}
        <div className="relative flex min-h-[88svh] w-full items-end overflow-hidden">
          <Image
            src="/video/living/web/aerial-river.png"
            alt="Аеро-вид на вигин річки серед лісу — приватний берег"
            fill
            sizes="100vw"
            loading="lazy"
            className="object-cover"
          />
          <div className="pointer-events-none absolute inset-0" style={{ background: SCRIM }} aria-hidden />
          <div className="relative z-10 w-full px-6 pb-[8vh]">
            <p className="mb-4 text-[11px] uppercase tracking-[0.34em] text-[var(--color-warm)]/80">
              Локація
            </p>
            <h2
              className="text-balance text-[clamp(2rem,9vw,2.6rem)] font-normal leading-[1.08] tracking-[-0.02em] text-[var(--color-text)]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Близько до міста. Далеко від усіх.
            </h2>
            <DistanceList />
            <p className="mt-5 text-[13px] leading-relaxed text-[var(--color-text-muted)]">
              {typo("Скільки хвилин до міста й школи, скажемо на зустрічі. Точну адресу називаємо тим, хто планує приїхати, щоб зберегти спокій власника.")}
            </p>
          </div>
        </div>

        {/* Panel 2 — the water (it's yours) + payoff + CTA */}
        <div className="relative flex min-h-[88svh] w-full items-end overflow-hidden">
          <Image
            src="/images/landscape/riverbank-reeds-lilies.webp"
            alt="Берег Південного Бугу біля будинку: спокійна вода й дерева"
            fill
            sizes="100vw"
            loading="lazy"
            className="object-cover [object-position:50%_50%]"
          />
          <div className="pointer-events-none absolute inset-0" style={{ background: SCRIM }} aria-hidden />
          <div className="relative z-10 w-full px-6 pb-[10vh]">
            <Payoff ready={ready} />
          </div>
        </div>
      </div>
    </section>
  );
}
