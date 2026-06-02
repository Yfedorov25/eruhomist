"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Section } from "../Section";
import { SplitReveal } from "../SplitReveal";
import { richText } from "@/lib/format";
import type { Messages } from "@/lib/i18n";
import { POI, QUADRO, CATEGORIES, type Poi, type PoiCategory } from "@/lib/poi";

gsap.registerPlugin(ScrollTrigger);

// S6 — District map (Phase 5 killer feature). DOM-only 2.5D, NO WebGL (autoplan 3/3 verdict:
// webgl-guard can't catch a black-painted context; tilting a flat painted top-down is a visual
// downgrade; WebGL isn't worth the risk for 8 dots on a PNG). The premium feel comes from a
// subtle CSS perspective tilt + pointer-parallax on the plate, a slow warm "breathing" QUADRO
// halo, and staggered marker reveals — zero new deps, zero black-screen risk, keyboard-a11y free.
// layout {x,z} (-1..1, placed by composition on the painted map) maps to left/top %.
// reduced-motion -> flat, static. mobile -> tap, no tilt/parallax.

const pct = (v: number) => `${50 + v * 46}%`; // -1..1 -> ~4..96% (keep markers off the edges)

function Stars({ rating }: { rating: number }) {
  const full = Math.round(rating);
  return (
    <span aria-label={`${rating} з 5`} className="text-[var(--accent)]">
      {"★".repeat(full)}
      <span className="opacity-30">{"★".repeat(5 - full)}</span>
    </span>
  );
}

export function DistrictMap({ m }: { m: Messages }) {
  const wrap = useRef<HTMLDivElement | null>(null);
  const stage = useRef<HTMLDivElement | null>(null);
  const plate = useRef<HTMLDivElement | null>(null);
  const [active, setActive] = useState<Record<PoiCategory, boolean>>(() =>
    Object.fromEntries(Object.keys(CATEGORIES).map((c) => [c, true])) as Record<PoiCategory, boolean>,
  );
  const [selected, setSelected] = useState<Poi | null>(null);

  // staggered marker reveal + subtle pointer parallax (desktop, motion-OK only)
  useEffect(() => {
    const el = wrap.current;
    const st = stage.current;
    const pl = plate.current;
    if (!el || !st || !pl) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fine = window.matchMedia("(min-width: 768px) and (pointer: fine)").matches;

    const ctx = gsap.context(() => {
      // markers rise + fade in as the map enters (luxury tempo)
      if (!reduced) {
        gsap.from(el.querySelectorAll("[data-marker]"), {
          opacity: 0,
          y: 16,
          scale: 0.9,
          duration: 1.2,
          ease: "power3.out",
          stagger: 0.08,
          scrollTrigger: { trigger: el, start: "top 70%" },
        });
      }

      // pointer-parallax: tilt the plate a few degrees toward the cursor (desktop fine-pointer).
      if (!reduced && fine) {
        const rotX = gsap.quickTo(pl, "rotationX", { duration: 0.6, ease: "power2.out" });
        const rotY = gsap.quickTo(pl, "rotationY", { duration: 0.6, ease: "power2.out" });
        const onMove = (e: PointerEvent) => {
          const r = st.getBoundingClientRect();
          const dx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2); // -1..1
          const dy = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
          rotX(6 - dy * 2.5); // base 6deg tilt, eased toward cursor
          rotY(dx * 3);
        };
        const onLeave = () => {
          rotX(6);
          rotY(0);
        };
        st.addEventListener("pointermove", onMove);
        st.addEventListener("pointerleave", onLeave);
        gsap.set(pl, { rotationX: 6 });
        return () => {
          st.removeEventListener("pointermove", onMove);
          st.removeEventListener("pointerleave", onLeave);
        };
      }
    }, el);
    return () => ctx.revert();
  }, []);

  // close modal on Escape
  useEffect(() => {
    if (!selected) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setSelected(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selected]);

  const toggle = (c: PoiCategory) => {
    // never let the user turn the last category off (empty map reads as broken)
    setActive((prev) => {
      const next = { ...prev, [c]: !prev[c] };
      if (!Object.values(next).some(Boolean)) return prev;
      return next;
    });
  };

  return (
    <Section id="map" className="mx-auto max-w-7xl">
      <div ref={wrap}>
        {m.map.h2 && (
          <SplitReveal as="h2" className="font-display text-4xl leading-[1.1] md:text-6xl">
            {richText(m.map.h2)}
          </SplitReveal>
        )}
        {m.map.body && (
          <p data-reveal className="mt-6 max-w-xl text-lg leading-relaxed text-[var(--ink-muted)] md:text-xl">
            {richText(m.map.body)}
          </p>
        )}

        {/* The map stage. perspective on the stage, tilt on the plate (so markers ride the tilt). */}
        <div
          ref={stage}
          className="relative mt-10 aspect-square w-full max-w-3xl"
          style={{ perspective: "1400px" }}
        >
          <div
            ref={plate}
            className="relative h-full w-full overflow-hidden rounded-sm"
            style={{ transformStyle: "preserve-3d", willChange: "transform" }}
          >
            {/* eslint-disable @next/next/no-img-element */}
            <img
              src="/assets/district_map.webp"
              alt="Карта району навколо QUADRO HOUSE"
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover"
              draggable={false}
            />
            {/* eslint-enable @next/next/no-img-element */}

            {/* QUADRO — slow warm breathing halo at center (the brand light, not a HUD pulse) */}
            <div
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: pct(QUADRO.layout.x), top: pct(QUADRO.layout.z) }}
            >
              <span className="quadro-halo absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full" />
              <span className="relative block h-3.5 w-3.5 rounded-full bg-[var(--accent)] shadow-[0_0_0_4px_rgba(224,169,109,0.25)]" />
              <span className="absolute left-1/2 top-5 -translate-x-1/2 whitespace-nowrap font-display text-xs uppercase tracking-[0.25em] text-[#f1efea] [text-shadow:0_1px_8px_rgba(0,0,0,0.7)]">
                QUADRO
              </span>
            </div>

            {/* POI markers */}
            {POI.map((p) => (
              <button
                key={p.id}
                type="button"
                data-marker
                onClick={() => setSelected(p)}
                aria-label={`${p.title} — ${p.km} км`}
                className="group absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-opacity duration-300 focus:outline-none"
                style={{
                  left: pct(p.layout.x),
                  top: pct(p.layout.z),
                  opacity: active[p.cat] ? 1 : 0,
                  pointerEvents: active[p.cat] ? "auto" : "none",
                }}
              >
                {/* dark backing disc keeps the dot legible where it overlaps the warm lake/park fills */}
                <span className="absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#0a1018]/55 blur-[1px]" />
                <span className="absolute left-1/2 top-1/2 h-7 w-7 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[rgba(245,243,238,0.5)] transition-transform duration-300 group-hover:scale-125 group-focus-visible:scale-125" />
                <span className="relative block h-2.5 w-2.5 rounded-full bg-[var(--accent)] ring-2 ring-[#0a1018]/70" />
                <span className="pointer-events-none absolute left-1/2 top-4 -translate-x-1/2 whitespace-nowrap text-[11px] tracking-wide text-[#f1efea] opacity-0 transition-opacity duration-300 [text-shadow:0_1px_6px_rgba(0,0,0,0.8)] group-hover:opacity-100 group-focus-visible:opacity-100">
                  {CATEGORIES[p.cat].icon} {p.title}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Category filter — sits close under the map, in the same warm light system */}
        <div data-reveal className="mt-5 flex flex-wrap gap-2.5">
          {(Object.keys(CATEGORIES) as PoiCategory[]).map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => toggle(c)}
              aria-pressed={active[c]}
              className={`rounded-full border px-4 py-2 text-sm tracking-wide transition-colors ${
                active[c]
                  ? "border-[var(--accent)]/70 bg-[var(--accent)]/10 text-[var(--accent)]"
                  : "border-[var(--ink-muted)]/25 text-[var(--ink-muted)] hover:border-[var(--ink-muted)]/45"
              }`}
            >
              {CATEGORIES[c].icon} {CATEGORIES[c].label}
            </button>
          ))}
        </div>
      </div>

      {/* Modal */}
      {selected && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={selected.title}
          className="fixed inset-0 z-[60] flex items-center justify-center p-6"
          onClick={() => setSelected(null)}
        >
          <div className="absolute inset-0 bg-[rgba(6,8,14,0.78)] backdrop-blur-sm" />
          <div
            className="relative w-full max-w-md overflow-hidden rounded-md bg-[#0e131c] text-[var(--ink)] shadow-2xl ring-1 ring-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            {/* photo or warm gradient placeholder (4 POIs have no photo) */}
            <div className="relative aspect-[16/10] w-full">
              {selected.photo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={`/poi/${selected.id}.jpg`}
                  alt={selected.title}
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover"
                  onError={(e) => (e.currentTarget.style.display = "none")}
                />
              ) : null}
              <div
                aria-hidden
                className="absolute inset-0"
                style={{
                  background:
                    "radial-gradient(120% 90% at 70% 20%, rgba(224,169,109,0.32) 0%, transparent 60%), linear-gradient(160deg, #16202e 0%, #0c121b 100%)",
                }}
              />
              {/* faint map texture so the card feels cut from the same world as the plate */}
              <div
                aria-hidden
                className="absolute inset-0 opacity-[0.12] mix-blend-luminosity"
                style={{
                  backgroundImage: "url('/assets/district_map.webp')",
                  backgroundSize: "180%",
                  backgroundPosition: "center",
                }}
              />
              {/* category icon at a real size, anchored — reads as designed, not placeholder */}
              <span className="absolute bottom-4 left-5 text-5xl drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]">
                {CATEGORIES[selected.cat].icon}
              </span>
              <button
                type="button"
                aria-label="Закрити"
                onClick={() => setSelected(null)}
                className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-lg text-white/90 hover:bg-black/60"
              >
                ✕
              </button>
            </div>

            <div className="p-6">
              <h3 className="font-display text-2xl leading-tight">{selected.title}</h3>
              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-[var(--ink-muted)]">
                <span>{selected.km} км</span>
                {selected.walkMin != null && <span>{selected.walkMin} {m.map.minWalk}</span>}
                {selected.driveMin != null && <span>{selected.driveMin} {m.map.minDrive}</span>}
                <Stars rating={selected.rating} />
              </div>
              <p className="mt-4 leading-relaxed text-[rgba(241,239,234,0.85)]">{selected.text}</p>
              {m.map.modalCta && (
                <a
                  href="#contact"
                  onClick={() => setSelected(null)}
                  className="mt-6 inline-block bg-[var(--accent)] px-6 py-3 text-sm uppercase tracking-[0.18em] text-[var(--deep)] transition-transform duration-300 hover:-translate-y-0.5"
                >
                  {m.map.modalCta}
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </Section>
  );
}
