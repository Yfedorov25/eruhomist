# LLM Council — Nahirna Redesign (Map + Loader) · 2026-06-03

**Question:** 2 redesign decisions for the live villa landing — (D1) location map: cheap schematic → static satellite vs illustrated; (D2) loader: flat text → water-rises-to-reveal-hero. Lead-gen, perf sacred (LCP<2.5s), Creator/Heritage anti-slop, privacy.

## Advisors (one-line each)
- **Contrarian:** No satellite (dim/legal/privacy-breadcrumb) → stylized illustrated map. Kill loader (couples LCP to frame-preload = self-inflicted >2.5s; 2021 slop).
- **First Principles:** Not a map — buyer needs to FEEL private/real not render; illustration can't leak a yard. Loader produces nothing; skip; poster-frame IS the LCP element. "Two skips beat two builds."
- **Expansionist:** Riverbank as hero, gold "your shore" line; wanted real satellite ("it exists") + dashed parcel boundary + water loader with crest sound. ← flagged by ALL reviewers as the blind spot.
- **Outsider (buyer):** Cartoon map = "cutting corners"; district pin trusted IF you say why; **"distances at viewing" is evasive — just say "~15 min to Vinnytsia."** Loader: kill or instant, "show the house."
- **Executor:** Both already shipped in apps/quadro (stylized DistrictMap + LCP-safe Preloader). Port them, build nothing. Only real gap = POI photos.

## Peer review convergence
- **Strongest: E ×3, B ×1, D ×1.** (E grounded in shipped reality; B in principle; D = the only buyer voice.)
- **Biggest blind spot: C (Expansionist) ×5 unanimous** — water loader + sound = LCP self-harm + slop under an anti-slop brief; "water IS the thesis" = builder in love with the artifact.
- **All missed (unanimous):** D1 is a CONTENT problem disguised as STYLE — POI photos + honest "~15 min" line beat any rendering technique; nobody cited a measured number on a lead-gen page; satellite-ToS claim asserted-not-cited; a wrong distance is worse than silence.

## CHAIRMAN VERDICT (decisive)

**D1 MAP → stylized, NOT satellite.** Port quadro's `DistrictMap.tsx` technique. Bug river bend is the hero (gold line on chocolate, drawn on scroll); city = faint context; district glow not exact yard (privacy-safe by construction). The map's job is INFORMATION not cartography: add honest drive-time POI labels (round numbers OK, silence/dodge not) + real POI photos. Privacy as copy ("Точна адреса — серйозним покупцям на показі"), NOT a dashed parcel boundary (leaks/misstates). Every number gets `// TODO(owner): verify` until confirmed true. No satellite (legal + dim + privacy + slop, zero offsetting lift). No audio.

**D2 LOADER → port quadro's LCP-safe `Preloader.tsx`, kill water-rising.** Hero painted underneath, lift on hero-ready (~180ms LCP), MIN 900ms floor, 5s cap, reduced-motion + session skip. No clip-path water, no counter, no LCP-coupling, no crest audio. If a signature beat is demanded: 400-600ms gold wordmark/light-bloom fade that never blocks the hero `<img>`. **Water stays in §03** (the keeper) where it costs no LCP.

**Cross-cutting:** §03 + perf stay sacred (validate LCP<2.5/CLS<0.1/60fps each change). INSTRUMENT live (Amplitude: field LCP, loader skip-rate, scroll-to-form, form-submit) — the map's right style is unknowable without data; form-fill is the only score. Two ports, zero rebuilds.

**ONE THING FIRST:** measure live (Lighthouse + field LCP + form-submit + is the map above the fold) before touching anything — then port the two proven components, don't rebuild the riskier versions.

## Verified against repo
- `apps/quadro/components/sections/DistrictMap.tsx` + `public/assets/district_map.webp` (stylized octagonal map, chocolate+gold+glowing-lake, gorgeous) — EXISTS. ✓
- `apps/quadro/components/Preloader.tsx` — LCP-safe (hero-ready, MIN_MS 900, SAFETY_MS 5000, reduced-motion+session skip) — EXISTS, matches council description exactly. ✓
- nahirna currently has NEITHER (cheap SVG schematic + flat tour-only loader).
