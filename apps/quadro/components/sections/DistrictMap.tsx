"use client";

import { useState } from "react";
import { SplitReveal } from "../SplitReveal";
import { richText } from "@/lib/format";
import type { Messages } from "@/lib/i18n";
import { MapIconSprite, MapIcon } from "./MapIcons";
import { MAP, INFRA, PLACES, type InfraCat } from "@/lib/districtMap.generated";

// S6 — District map, rebuilt 1:1 to AIR / aircenter.space/location: a MONOCHROME real-geography
// plan of the QUADRO district (real OpenStreetMap streets + building blocks, no color, no map API),
// with AIR's exact UX: a right-side LOCATIONS / INFRASTRUCTURE panel, the "QUADRO" speech bubble on
// the building, a dotted route + a big "X ХВ ПІШКИ · X.X КМ" card, and unlabeled square category
// pins with "40+" cluster badges. All geometry is baked into districtMap.generated.ts (Overpass);
// nothing hits a tile server at runtime.

const CX = MAP.quadro.x;
const CY = MAP.quadro.y;

const INFRA_ORDER: { cat: InfraCat; label: string; icon: string }[] = [
  { cat: "park", label: "Парки", icon: "ic-park" },
  { cat: "sport", label: "Спорт", icon: "ic-sport" },
  { cat: "bank", label: "Банки", icon: "ic-bank" },
  { cat: "mall", label: "Супермаркети", icon: "ic-mall" },
  { cat: "service", label: "Сервіси", icon: "ic-service" },
  { cat: "food", label: "Ресторани та кава", icon: "ic-food" },
];

const PLACE_ICON: Record<string, string> = {
  water: "ic-water", park: "ic-park", sport: "ic-sport",
  food: "ic-food", mall: "ic-mall", kids: "ic-kids",
};

const badge = (n: number) => (n > 40 ? "40+" : String(n));

export function DistrictMap({ m }: { m: Messages }) {
  const [mode, setMode] = useState<"loc" | "infra">("loc");
  const [activePlace, setActivePlace] = useState<string>("sky-park");
  const [activeCat, setActiveCat] = useState<InfraCat>("food");

  const place = PLACES.find((p) => p.id === activePlace) ?? PLACES[0];
  const cat = INFRA[activeCat];
  const pins = cat.pins;
  // cluster badge near the centroid of the shown pins
  const cz = pins.reduce((a, p) => ({ x: a.x + p.x, y: a.y + p.y }), { x: 0, y: 0 });
  const cc = pins.length ? { x: cz.x / pins.length, y: cz.y / pins.length } : { x: CX, y: CY };

  const bigNum = mode === "loc" ? (place.walkMin ?? place.driveMin ?? 0) : 0;
  const bigLabel = place.walkMin != null ? "хв пішки" : "хв авто";

  return (
    <section id="map" aria-label="Карта району">
      {/* compact intro band (quadro needs the claim; AIR itself has no heading) */}
      <div className="mx-auto max-w-7xl px-6">
        {m.map.h2 && (
          <SplitReveal as="h2" className="font-display text-4xl leading-[1.1] md:text-6xl">
            {richText(m.map.h2)}
          </SplitReveal>
        )}
        {m.map.body && (
          <p data-reveal className="mt-5 max-w-2xl text-lg leading-relaxed text-[var(--ink-muted)] md:text-xl">
            {richText(m.map.body)}
          </p>
        )}
      </div>

      {/* full-bleed AIR map block. Re-tinted from neutral black → the QUADRO evening-blue brand
          family (--deep #0a1018). AIR's location teardown rule is "намальований план у кольорах
          БРЕНДУ" — for AIR that brand is pure monochrome; QUADRO's brand is the day→night blue the
          whole page travels in, so the map matches the sister sections instead of reading as a
          generic black map widget. Warm --accent stays for the active route/dot/bubble (brand light). */}
      <div className="relative left-1/2 mt-10 h-[86vh] min-h-[600px] w-screen -translate-x-1/2 overflow-hidden bg-[#0a0e16] text-white">
        <MapIconSprite />

        <svg
          viewBox={MAP.viewBox}
          preserveAspectRatio="xMidYMid slice"
          className="absolute inset-0 h-full w-full"
          aria-hidden
        >
          {/* base: parks, blocks, streets — evening-blue ramp (each layer lifted from the --deep
              base toward a cool slate so streets/buildings stay legible on the dark plan). */}
          <rect x="0" y="0" width={MAP.W} height={MAP.H} fill="#0a0e16" />
          <g fill="#121829">{MAP.green.map((d, i) => <path key={i} d={d} />)}</g>
          <g fill="#1b2236">{MAP.buildings.map((d, i) => <path key={i} d={d} />)}</g>
          <g fill="none" stroke="#2b344a" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round">
            {MAP.streetsMinor.map((d, i) => <path key={i} d={d} />)}
          </g>
          <g fill="none" stroke="#47536e" strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round">
            {MAP.streetsMajor.map((d, i) => <path key={i} d={d} />)}
          </g>
          {/* street labels */}
          <g fill="#6a7488" fontSize="20" letterSpacing="2" style={{ fontFamily: "var(--font-sans, system-ui), sans-serif" }}>
            {MAP.labels.map((l, i) => (
              <text key={i} x={l.x} y={l.y} transform={`rotate(${l.a} ${l.x} ${l.y})`} textAnchor="middle">
                {l.n}
              </text>
            ))}
          </g>

          {/* ---- LOCATIONS overlay ---- */}
          {mode === "loc" && (
            <>
              {/* dotted route from QUADRO to active place — warm brand accent (the QUADRO light) */}
              <line
                x1={CX} y1={CY} x2={place.x} y2={place.y}
                stroke="var(--accent)" strokeWidth="2.4" strokeDasharray="2 10" strokeLinecap="round"
              />
              {/* all place dots; active highlighted in warm accent, others a cool muted blue-grey */}
              {PLACES.map((p) => {
                const on = p.id === activePlace;
                return (
                  <g key={p.id} transform={`translate(${p.x} ${p.y})`}>
                    <circle r={on ? 9 : 5} fill={on ? "var(--accent)" : "#5a6580"} />
                    {on && <circle r="16" fill="none" stroke="var(--accent)" strokeWidth="2" />}
                  </g>
                );
              })}
            </>
          )}

          {/* ---- INFRASTRUCTURE overlay ---- */}
          {mode === "infra" && (
            <>
              {pins.map((p, i) => (
                <g key={i} transform={`translate(${p.x - 23} ${p.y - 23})`}>
                  <rect width="46" height="46" rx="11" fill="#fff" />
                  <g transform="translate(11 11)" color="#0a0a0a">
                    <MapIcon id={INFRA_ORDER.find((o) => o.cat === activeCat)!.icon} className="h-6 w-6" />
                  </g>
                </g>
              ))}
              {/* cluster badge */}
              <g transform={`translate(${cc.x} ${cc.y - 44})`}>
                <circle r="26" fill="#0a0e16" stroke="#fff" strokeWidth="2" />
                <text textAnchor="middle" dominantBaseline="central" fill="#fff" fontSize="22" fontWeight="600"
                  style={{ fontFamily: "var(--font-sans, system-ui), sans-serif" }}>
                  {badge(cat.count)}
                </text>
              </g>
            </>
          )}

          {/* QUADRO speech bubble on the building (always). Widened to 200px and fontSize/tracking
              eased (40→34, 3→2) so "QUADRO" sits inside with even padding — at 40px+3 the serif caps
              overran the old 172px box and the trailing "O" clipped the right edge. Blue base to match
              the re-tinted plan; white stroke keeps the bubble crisp on the dark map. */}
          <g transform={`translate(${CX} ${CY})`}>
            <g transform="translate(-100 -96)">
              <rect width="200" height="74" rx="8" fill="#0a0e16" stroke="#fff" strokeWidth="2.5" />
              <path d="M84 74 L100 74 L92 92 Z" fill="#0a0e16" stroke="#fff" strokeWidth="2.5" strokeLinejoin="round" />
              <text x="100" y="50" textAnchor="middle" fill="#fff" fontSize="34" letterSpacing="2"
                style={{ fontFamily: "var(--font-display, serif)" }}>QUADRO</text>
            </g>
            <circle r="6" fill="#fff" />
          </g>
        </svg>

        {/* No decorative map-app chrome. The AIR location reference is "нуль Google-хрому" — the
            fake hamburger / heart / "+" buttons read as a generic map widget and cheapen the
            architectural-plan feel. Removed entirely; the wordmark below is the only brand mark. */}

        {/* top-right wordmark — a quiet brand tag (the decorative "+" map-app icon dropped) */}
        <div className="absolute right-5 top-5 z-20 hidden items-center rounded-lg bg-white px-5 py-3 text-[#0a0e16] md:flex">
          <span className="font-display text-sm tracking-[0.3em]">QUADRO HOUSE</span>
        </div>

        {/* big card (LOCATIONS active) */}
        {mode === "loc" && (
          <div className="pointer-events-none absolute bottom-10 left-6 z-10 w-[300px] max-w-[78vw] rounded-xl bg-white p-7 text-[#0a0a0a] shadow-2xl md:left-12">
            <div className="flex items-start justify-between">
              <span className="font-display text-7xl leading-none">{bigNum}</span>
              <span className="mt-2 text-sm tracking-wide text-[#0a0a0a]/60">{place.km} км</span>
            </div>
            <div className="mt-4 text-xs uppercase leading-snug tracking-[0.18em] text-[#0a0a0a]/70">
              {bigLabel}
            </div>
            <div className="mt-3 font-display text-lg leading-tight">{place.title}</div>
          </div>
        )}

        {/* right panel — blue-tinted to match the re-tinted plan (was neutral grey #141414) */}
        <div className="absolute right-5 top-1/2 z-20 flex max-h-[78%] w-[300px] max-w-[80vw] -translate-y-1/2 flex-col rounded-xl bg-[#0f1422]/85 p-6 ring-1 ring-white/10 backdrop-blur">
          {/* mode tabs */}
          <div className="mb-6 flex gap-5 text-[11px] uppercase tracking-[0.22em]">
            <button type="button" onClick={() => setMode("loc")}
              className={mode === "loc" ? "text-white" : "text-white/40 transition-colors hover:text-white/70"}>
              Локації
            </button>
            <button type="button" onClick={() => setMode("infra")}
              className={mode === "infra" ? "text-white" : "text-white/40 transition-colors hover:text-white/70"}>
              Інфраструктура
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {mode === "loc" ? (
              <ul className="space-y-1.5">
                {PLACES.map((p) => {
                  const on = p.id === activePlace;
                  return (
                    <li key={p.id}>
                      <button type="button" onClick={() => setActivePlace(p.id)} onMouseEnter={() => setActivePlace(p.id)}
                        className={`w-full text-left font-display text-[22px] leading-tight transition-colors ${
                          on ? "text-white" : "text-white/45 hover:text-white/75"
                        }`}>
                        {p.title}
                      </button>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <ul className="space-y-1.5">
                {INFRA_ORDER.map((o) => {
                  const on = o.cat === activeCat;
                  return (
                    <li key={o.cat}>
                      <button type="button" onClick={() => setActiveCat(o.cat)} onMouseEnter={() => setActiveCat(o.cat)}
                        className={`flex w-full items-center justify-between gap-3 text-left font-display text-[20px] leading-tight transition-colors ${
                          on ? "text-white" : "text-white/45 hover:text-white/75"
                        }`}>
                        <span className="flex items-center gap-2.5">
                          <MapIcon id={o.icon} className="h-4 w-4" />
                          {o.label}
                        </span>
                        <span className="text-xs tracking-wide text-white/35">{badge(INFRA[o.cat].count)}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
