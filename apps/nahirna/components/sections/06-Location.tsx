"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

// 06 · ЛОКАЦІЯ — «Здається, що за містом». SELF-DRAWING map (kickoff ⭐): the map DRAWS ITSELF on
// scroll — river, streets, POIs and labels appear in sequence via stroke-dashoffset driven by a
// pinned ScrollTrigger scrub. The visitor "draws" their own map. All geometry is from REAL OSM data
// (docs/MAP_DATA): river south, infrastructure N/W, centre NE ~2.5km. Pin on the DISTRICT (privacy).
// After drawing, the river flows (animated dash) so it's never static. reduced-motion → static final.
//
// SVG space: 1200×800, home (вул. Нагірна) near bottom-centre. North = up. Scale tuned so the full
// real spread fits: центр (~2516m NE) sits near the top, the school/садок/банк cluster (~1050m N)
// lands mid-map, and the river stays just below home. POI positions = real relative offsets
// (m, +x E / +y N). Horizontal exaggerated ×1.7 so the W/E POIs don't collapse onto the vertical axis.
const HOME = { x: 560, y: 660 };
const MY = 0.245; // metres → px, north/south
const MX = 0.42; // metres → px, east/west (exaggerated so lateral POIs read)
const pos = (eastM: number, northM: number) => ({ x: HOME.x + eastM * MX, y: HOME.y - northM * MY });

// dx/dy = manual label nudge (px) to de-collide the tight real-world clusters (school/садок/банк
// sit within ~20m of each other in OSM → fan their labels out so they read).
const POIS = [
  { e: 2, n: 6, label: "Зупинка", note: "150 м", kind: "stop", dx: 0, dy: 16, anchor: "middle" },
  { e: -861, n: 44, label: "Клініка", note: "", kind: "infra", dx: -8, dy: 0, anchor: "end" },
  { e: -910, n: 107, label: "Аптека", note: "", kind: "infra", dx: -8, dy: 0, anchor: "end" },
  { e: -911, n: 250, label: "Парк", note: "", kind: "park", dx: -8, dy: 0, anchor: "end" },
  { e: 912, n: 156, label: "Магазини", note: "", kind: "infra", dx: 8, dy: 0, anchor: "start" },
  { e: -582, n: 1042, label: "Банк", note: "", kind: "infra", dx: 9, dy: 8, anchor: "start" },
  { e: -583, n: 1080, label: "Школа", note: "", kind: "infra", dx: -9, dy: -2, anchor: "end" },
  { e: -584, n: 1117, label: "Садок", note: "", kind: "infra", dx: 9, dy: -8, anchor: "start" },
  { e: 793, n: 2516, label: "Центр Вінниці", note: "кілька хв", kind: "center", dx: 0, dy: -10, anchor: "middle" },
] as const;

// Mobile shows fewer POIs (kickoff): stop, school, shop, centre.
const MOBILE_KEEP = new Set(["Зупинка", "Школа", "Магазини", "Центр Вінниці"]);

const kindColor: Record<string, string> = {
  stop: "#E8C9A0",
  infra: "#7d8a93",
  park: "#5f8a5f",
  center: "#E8C9A0",
};

export default function Location() {
  const wrap = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const root = wrap.current!;

      // Prime drawable paths: set dasharray = length so dashoffset can hide → reveal them.
      const drawables = root.querySelectorAll<SVGPathElement>("[data-draw]");
      drawables.forEach((p) => {
        const len = p.getTotalLength();
        p.style.strokeDasharray = String(len);
        p.style.strokeDashoffset = reduced ? "0" : String(len);
      });

      if (reduced) {
        gsap.set("[data-fade]", { opacity: 1 });
        gsap.set("[data-pop]", { opacity: 1, scale: 1 });
        return;
      }

      // Pinned scrub timeline — the visitor draws the map as they scroll.
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: root,
          start: "top top",
          end: "+=220%",
          scrub: true,
          pin: ".loc-stage",
          anticipatePin: 1,
        },
      });

      // 0.0–0.1 — ВІННИЦЯ label
      tl.to(".loc-vinnytsia", { opacity: 0.5, duration: 0.1 }, 0);
      // 0.1–0.4 — RIVER draws L→R + fills + label
      tl.to(".loc-river-line", { strokeDashoffset: 0, ease: "none", duration: 0.3 }, 0.1);
      tl.to(".loc-river-fill", { opacity: 0.95, duration: 0.15 }, 0.28);
      tl.to(".loc-bug-label", { opacity: 0.8, duration: 0.1 }, 0.33);
      // 0.4–0.5 — вул. Нагірна short line to the river
      tl.to(".loc-street", { strokeDashoffset: 0, ease: "none", duration: 0.1 }, 0.4);
      // 0.5–0.6 — district PIN + label
      tl.to(".loc-pin", { opacity: 1, scale: 1, ease: "back.out(2)", duration: 0.1 }, 0.5);
      tl.to(".loc-pin-label", { opacity: 1, duration: 0.08 }, 0.56);
      // 0.6–0.8 — POIs stagger in
      tl.to(".loc-poi", { opacity: 1, scale: 1, ease: "power2.out", duration: 0.04, stagger: 0.025 }, 0.6);
      // 0.8–0.9 — dashed line to centre
      tl.to(".loc-centre-line", { strokeDashoffset: 0, ease: "none", duration: 0.1 }, 0.8);
      // 0.9–1.0 — the "0 хвилин" phrase
      tl.to(".loc-phrase", { opacity: 1, y: 0, duration: 0.1 }, 0.9);

      // After draw: the river "flows" forever (slow dash drift on a top current line).
      gsap.to(".loc-river-current", {
        strokeDashoffset: -40,
        duration: 6,
        ease: "none",
        repeat: -1,
      });
    },
    { scope: wrap },
  );

  const street = pos(2, -180); // a short stub from home down toward the river (south)
  const centre = pos(793, 2516);

  return (
    <section ref={wrap} className="relative bg-night" aria-label="Локація — вул. Нагірна, Вінниця">
      <div className="loc-stage relative flex h-[100svh] min-h-[100svh] w-full items-center overflow-hidden">
        <div className="mx-auto grid w-full max-w-6xl gap-8 px-6 lg:grid-cols-[1.55fr_1fr] lg:items-center">
          {/* The drawable map */}
          <div className="relative aspect-[1200/800] w-full overflow-hidden rounded-sm border border-[var(--color-warm)]/10 bg-[#100d09]">
            {/* soft aerial vignette so it isn't a flat fill */}
            <div
              className="pointer-events-none absolute inset-0"
              style={{ background: "radial-gradient(130% 110% at 50% 40%, #181309 0%, #100d09 60%, #0c0a07 100%)" }}
              aria-hidden
            />
            <svg viewBox="0 0 1200 800" className="absolute inset-0 h-full w-full"
                 role="img" aria-label="Карта розташування: вул. Нагірна біля Південного Бугу у Вінниці, з орієнтирами">
              {/* faint district street hatching (static, atmospheric) */}
              <g stroke="#3a3026" strokeWidth="0.8" opacity="0.35">
                {Array.from({ length: 11 }).map((_, i) => (
                  <line key={`h${i}`} x1="0" y1={60 + i * 64} x2="1200" y2={60 + i * 64} />
                ))}
                {Array.from({ length: 16 }).map((_, i) => (
                  <line key={`v${i}`} x1={40 + i * 76} y1="0" x2={40 + i * 76} y2="800" />
                ))}
              </g>

              {/* ВІННИЦЯ background label */}
              <text className="loc-vinnytsia" x="64" y="80" fill="#9B978F" opacity="0" style={{ opacity: 0, letterSpacing: "0.3em", fontSize: 22, fontWeight: 600 }}>
                ВІННИЦЯ
              </text>

              {/* RIVER — south band. Draws L→R, then fills, then a flowing current line. */}
              <path
                className="loc-river-fill"
                d="M-40 712 C 220 686, 430 742, 660 720 S 1010 676, 1240 706 L1240 820 L-40 820 Z"
                fill="#16323d"
                opacity="0"
              />
              <path
                data-draw
                className="loc-river-line"
                d="M-40 712 C 220 686, 430 742, 660 720 S 1010 676, 1240 706"
                fill="none"
                stroke="#2a5562"
                strokeWidth="3"
              />
              <path
                className="loc-river-current"
                d="M-40 718 C 220 692, 430 748, 660 726 S 1010 682, 1240 712"
                fill="none"
                stroke="#E8C9A0"
                strokeWidth="1.5"
                strokeDasharray="3 9"
                opacity="0.5"
              />
              <text className="loc-bug-label" x="1140" y="760" textAnchor="end" fill="#E8C9A0" opacity="0" style={{ opacity: 0, letterSpacing: "0.22em", fontSize: 13 }}>
                ПІВДЕННИЙ БУГ
              </text>

              {/* вул. Нагірна — short street stub down to the river */}
              <path
                data-draw
                className="loc-street"
                d={`M ${HOME.x} ${HOME.y} L ${street.x} ${street.y}`}
                fill="none"
                stroke="#7a6647"
                strokeWidth="3"
                strokeLinecap="round"
              />

              {/* dashed line to the centre (NE) */}
              <path
                data-draw
                className="loc-centre-line"
                d={`M ${HOME.x} ${HOME.y} L ${centre.x} ${Math.max(centre.y, 28)}`}
                fill="none"
                stroke="#E8C9A0"
                strokeWidth="1.4"
                strokeDasharray="2 7"
                opacity="0.6"
              />

              {/* POIs — dot + de-collided label (dx/dy/anchor per real-world cluster). */}
              {POIS.map((p) => {
                const { x, y } = pos(p.e, p.n);
                const yc = Math.max(24, Math.min(792, y));
                const labelY = p.dy >= 0 ? 4 + p.dy + 11 : p.dy - 6;
                return (
                  <g key={p.label} className="loc-poi" data-pop style={{ opacity: 0, transformBox: "fill-box", transformOrigin: "center" }} transform={`translate(${x},${yc})`}>
                    <circle r={p.kind === "center" ? 5.5 : 3.5} fill={kindColor[p.kind]} />
                    {p.kind === "center" ? <circle r="5.5" fill="none" stroke="#0f0f0e" strokeWidth="1.5" /> : null}
                    <text
                      x={p.dx}
                      y={labelY}
                      textAnchor={p.anchor}
                      fill={p.kind === "center" || p.kind === "stop" ? "#E8C9A0" : "#cfc9bf"}
                      style={{ fontSize: p.kind === "center" ? 12 : 11 }}
                    >
                      {p.label}{p.note ? ` · ${p.note}` : ""}
                    </text>
                  </g>
                );
              })}

              {/* District PIN (gold, pulsing) + label — on the DISTRICT, near home */}
              <g className="loc-pin" data-pop transform={`translate(${HOME.x},${HOME.y})`} style={{ opacity: 0, transformBox: "fill-box", transformOrigin: "center" }}>
                <circle r="26" fill="#E8C9A0" opacity="0.14">
                  <animate attributeName="r" values="18;30;18" dur="3.2s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.16;0.04;0.16" dur="3.2s" repeatCount="indefinite" />
                </circle>
                <circle r="6.5" fill="#E8C9A0" />
                <circle r="6.5" fill="none" stroke="#0f0f0e" strokeWidth="2" />
              </g>
              <text className="loc-pin-label" x={HOME.x} y={HOME.y + 22} textAnchor="middle" fill="#EDEAE3" opacity="0" style={{ opacity: 0, fontSize: 12 }}>
                вул. Нагірна
              </text>

              {/* The "0 хвилин" phrase, lower-left over the river */}
              <g className="loc-phrase" data-fade transform="translate(64,610)" style={{ opacity: 0 }}>
                <text fill="#E8C9A0" style={{ fontSize: 40, fontWeight: 300 }}>0 хвилин</text>
                <text y="26" fill="#EDEAE3" style={{ fontSize: 15 }}>до власного берега — він просто внизу ↓</text>
              </g>
            </svg>
          </div>

          {/* Right column — headline + honest copy on real OSM data */}
          <div>
            <p className="mb-5 text-[11px] uppercase tracking-[0.34em] text-[var(--color-warm)]/80">Локація</p>
            <h2
              className="text-balance text-[clamp(1.9rem,4.2vw,3rem)] font-normal leading-[1.12] tracking-[-0.02em] text-[var(--color-text)]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Здається, що за містом. Насправді — у Вінниці.
            </h2>
            <p className="mt-6 text-base leading-relaxed text-[var(--color-text-muted)] md:text-lg">
              Зупинка — за 150 метрів. Аптека, клініка, парк — менш ніж за кілометр. Школа, садок,
              магазини — в межах пів години пішки. Центр Вінниці — кілька хвилин автівкою.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-[var(--color-text-muted)]/85">
              А точний час у дорозі назвемо на перегляді — без округлень.
            </p>
            <p className="mt-6 border-l border-[var(--color-warm)]/25 pl-5 text-sm text-[var(--color-text-muted)]">
              Точну адресу показуємо серйозним покупцям на перегляді — задля приватності власника.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
