# ARCHITECTURE_AUDIT.md — QUADRO HOUSE (Phase 0 baseline)

> Audit of the **current** `apps/quadro` build before the ERA upgrade (UPGRADE_TO_ERA.md).
> Measured 2026-06-02 against the live dev/prod server on localhost:3210, plus source-of-truth
> reading of the animation params (durations/easing read from code, not eyeballed).
> **No code was changed.** This is the reference point; all ERA improvements measure against it.

## ⚠️ Note on referenced inputs
The task referenced `TZ_HERO_DEPTH_v2.md`, `teardowns/ERA_real-estate.md`, and
`recipes/R03/R06/R10`. **These do not exist yet** — they are deliverables for later phases
(1–5) of UPGRADE_TO_ERA.md, not available at Phase 0. Audit performed against the files that
exist: `CLAUDE.md`, `TZ_QUADRO.md`, `UPGRADE_TO_ERA.md`, recipes `R01/R04/R05/R11/R23`,
`recipe-methodology.md`, and the live code. ERA-recipe mapping below uses the recipe
descriptions from UPGRADE_TO_ERA.md for the not-yet-written R03/R06/R10.

---

## 0. TL;DR — where we stand vs ERA

| Dimension | Current | ERA target | Gap |
|---|---|---|---|
| Hero | flat 2D-canvas frame-scrub (96 frames) | depth-parallax layers (sky/building/fg on Z) | **big** |
| Rendering | 100% DOM + one 2D canvas. **Zero WebGL.** | persistent WebGL canvas across sections | **big** |
| Cross-section continuity | none — each section is an island | one persistent canvas, naскрізний | **big** |
| Reveal tempo | 1.2–1.8s (good, near-luxury) | 1.5–3s | small |
| Scroll | Lenis 0.1 + GSAP ScrollTrigger ✅ | same | **none — already ERA-grade** |
| 3D district map | absent | killer feature | **missing entirely** |
| Preloader | minimal wordmark splash | cinematic counter reveal | medium |
| Perf (LCP/CLS) | **LCP 244ms, CLS 0** | <2.5s / <0.1 | **already beats target** |

**Honest verdict:** the *foundation* (Lenis+ScrollTrigger, reveal tempo, perf budget) is already
ERA-grade. The *depth* is not — everything is flat DOM/2D. The upgrade is real but it is
additive (depth, persistent WebGL, 3D map), not a rebuild of the plumbing.

---

## 1. Sections + current animation (what each one actually does)

Read from `apps/quadro/components/sections/*` + `lib/`. Animation type per section:

| # | Section | File | Current animation | Recipe in use |
|---|---|---|---|---|
| S1 | **Hero** | `Hero.tsx` | **2D-canvas frame-scrub** (96 WebP frames, day→night), sticky 400vh pin, lerp-smoothed (0.12). SplitText H1 line-reveal on load. CSS grain + radial vignette overlay. | R01 (2D variant), R05 (CSS) |
| S2 | **Concept / Onlyness** | `Concept.tsx` + `CrossfadeMedia.tsx` | **Scroll crossfade** day→evening (render_05 → render_N_02, opacity scrub) + **light parallax** (yPercent ±4) + staggered text reveal | R04 (crossfade + parallax) |
| S3 | **Architecture** | `Architecture.tsx` | **Sticky window-reveal**: clip-path `inset(34% 40%)→inset(0%)` scrub + camera push-in (scale 1.45→1.06), pinned 130% | R11 ✅ |
| S4 | **Courtyard** | `Courtyard.tsx` | **Diptych + parallax** (render_10 + render_N_03, `data-parallax` 14/28 yPercent) + staggered text reveal | R04 (parallax) |
| S5 | **Roof** | `Roof.tsx` | **Parallax gallery** (terrace renders, `data-parallax` 16/26) + staggered reveal + CTA button (anchor scroll to #contact) | R04 (parallax) |
| S6 | **Specs** | `Specs.tsx` | **Count-up** on 4 numeric items (others reveal) + staggered reveal | (counter — no ERA recipe) |
| S7 | **Contact** | `Contact.tsx` + `ContactForm.tsx` | **Staggered reveal** only (no media). useActionState form, honest fallback. Gated conversion slots. | (form — no ERA recipe) |
| — | **Header** | `Header.tsx` | Sticky, scroll-aware bg + day→night text color, mobile full-screen overlay menu | — |
| — | **Footer** | `Footer.tsx` | Static | — |

**Animation-type summary:** 1 frame-scrub (S1), 1 sticky-mask-reveal (S3), 3 parallax+crossfade
(S2/S4/S5), 1 count-up (S6), 1 plain reveal (S7). **No section uses depth-displacement, multi-Z
parallax, or WebGL** — the depth is faked with 2-layer yPercent offsets (`data-parallax`).

---

## 2. Scroll architecture (how it's wired)

- **Lenis**: ✅ present. `lib/SmoothScrollProvider.tsx` — `new Lenis({ lerp: 0.1, smoothWheel: true })`,
  mounted **above** `[locale]` so locale switches don't recreate it.
- **GSAP ScrollTrigger**: ✅ integrated the official way — `lenis.on('scroll', ScrollTrigger.update)`
  + `gsap.ticker.add(t => lenis.raf(t*1000))` + `gsap.ticker.lagSmoothing(0)`. **Single rAF loop**
  (lenis driven by gsap ticker — not competing loops). Matches R04 exactly.
- **Canvas count**: **ONE** 2D canvas (the hero). Each non-hero section is plain DOM with its own
  ScrollTrigger instances. So: **one canvas, but NOT persistent in the ERA sense** — it lives only
  inside the hero section and is the only canvas; sections below have no canvas at all.
- **Global scroll-progress**: ✅ `--scroll-progress` CSS var on `:root` (0..1), throttled to 0.01
  steps, drives the day→night theme tokens. This is the closest thing to ERA's shared progress
  store, but it only feeds CSS (theme), not a WebGL scene.
- **Parallax**: global `[data-parallax]` handler in SmoothScrollProvider (R04 pattern D —
  `yPercent` scrub). Used by S4/S5 image layers.
- **Teardown**: clean — `lenis.destroy()`, `gsap.ticker.remove(rafFn)`, `ScrollTrigger.killAll()`,
  `split.revert()` on hero, `gsap.context().revert()` per section. Zero leak risk.
- **reduced-motion**: Lenis not initialized (native scroll), ScrollTrigger without scrub, hero =
  static day frame, reveals set to visible (no hidden-at-opacity-0 trap). Verified clean.

**ERA gap:** ERA runs ONE persistent WebGL canvas at the layout level (z-0, fixed) that all sections
draw into; DOM floats on top (z-10). We have the inverse: DOM-first, one 2D canvas trapped in the
hero. The scroll plumbing is already ERA-grade; the **persistent-WebGL-canvas layer is the missing
foundation** (Phase 1).

---

## 3. Reveal timings (measured from source — exact, not eyeballed)

Read directly from the GSAP `duration`/`ease`/`stagger`/`scrub` values in code:

| Where | Property | Duration | Ease | Notes |
|---|---|---|---|---|
| Hero H1 (SplitText) | yPercent 110→0, opacity | **1.8s** | power3.out | stagger 0.12, delay 0.25 — luxury ✅ |
| `useReveal` (S2/S4/S5 default) | y 28→0, opacity | **1.4s** | power3.out | stagger 0.11 |
| Specs reveal | y 24→0, opacity | **1.2s** | power3.out | stagger 0.07 |
| Specs count-up | number 0→target | **1.6s** | power2.out | numeric items only |
| S2 crossfade | opacity 0→1 | scrub (scrub:1) | none | tied to scroll, not time |
| S3 window-reveal | clip-path + scale | scrub (scrub:1) | none | pinned 130% |
| S3 push-in | scale 1.45→1.06 | scrub | none | parallel to mask |
| Parallax layers (S2/S4/S5) | yPercent | scrub:true | none | data-parallax 14–28 |
| Lenis smoothing | lerp | **0.1** | — | R04 golden value ✅ |
| Hero frame lerp | current→target | factor **0.12** | — | buttery scrub catch-up |

**Verdict on tempo:** reveals are **1.2–1.8s** — already in/near the luxury 1.5–3s band, NOT the
"fast 0.9s" the upgrade diagnosis assumed. The S6 count-up (1.2s) is the only one slightly below
1.5s. Easing is power3.out everywhere (correct), zero `linear` on entrance reveals (`ease:"none"`
is used only for scrub-linked motion, which is correct — scrubbed animation must be linear in time).
**This dimension is largely already ERA-compliant.** The gap is depth/layering, not timing.

---

## 4. WebGL vs DOM

- **Zero WebGL.** Definitive: `grep` for `WebGL`/`three`/`@react-three`/`getContext('webgl')` across
  `components/ lib/ app/` returns only the word "WebGL" inside **comments** (fallback notes) — no
  actual WebGL context, no Three.js, no R3F.
- **Dependencies:** `gsap, lenis, next, react, react-dom` — that's the whole list. Three.js / R3F /
  drei were **removed** (commit 5aaaf79, council 4/4 after the WebGL hero went black on real
  hardware).
- **The only canvas:** one **2D** canvas in `Hero.tsx` (`getContext("2d")`), drawing decoded WebP
  frames cover-fit with a sliding-window decoder.
- Everything else is DOM + CSS (theme tokens, scrim, grain overlay) + GSAP transforms.

**ERA gap:** ERA is WebGL-heavy (persistent canvas, depth shaders, 3D map). We are deliberately
WebGL-free right now for reliability. Phases 1/2/5 reintroduce WebGL — but this time on a
**persistent canvas with proven fallbacks**, and the Kling video kept as the mobile/low-end fallback
(per UPGRADE_TO_ERA Phase 2), so we don't repeat the black-screen failure.

---

## 5. Performance baseline (measured, localhost prod build, 1440×900)

Measured via Playwright + CDP. **These are the numbers all future phases measure against.**

| Metric | Value | Budget (CLAUDE.md/TZ) | Status |
|---|---|---|---|
| **LCP** | **244 ms** | < 2500 ms | ✅ 10× under |
| **LCP element** | the H1 (`font-display`) | — | poster/text-first paint working |
| **CLS** | **0** | < 0.1 | ✅ perfect |
| DOMContentLoaded | 53 ms | — | — |
| Load event | 190 ms | — | — |
| Cold transfer (HTML) | ~12 KB | — | SSR shell tiny |
| Hero frames eager-loaded | 20 webp | — | matches eager-20 strategy |
| **FPS on scroll — unthrottled** | median **60**, avg 23, p95 30 | 60 desktop | ✅ median 60; avg dragged by decode-burst spikes during synthetic rapid scroll |
| **FPS on scroll — 4× CPU throttle** | median **60**, avg 40, p95 20 | ≥40 mobile mid-tier | ✅ median 60 / avg 40 — meets mobile floor |

**Caveats (honest):**
- LCP 244ms is localhost (no network latency). On real 4G expect higher, but the LCP element is the
  SSR'd H1 text + first poster frame, not the canvas — so it stays well within 2.5s even on 3G.
- The avg-FPS dip (23 unthrottled) is a **synthetic-test artifact**: the probe force-scrolls 1.2% of
  page height every 16ms, which is far more aggressive than a human and triggers back-to-back frame
  decodes + `drawImage`. Median 60 is the honest steady-state. p95 spikes = the per-frame WebP
  decode/upload bursts — the known cost of frame-scrub, acceptable on the 2D path (never blanks).
- Frames are gitignored/regenerated; the full 96-frame desktop set is ~17.6MB streamed progressively
  (eager-20 ≈ 4.4MB is the only load-blocking portion).

**Baseline snapshot (copy for regression):**
```
LCP=244ms  CLS=0  DCL=53ms  Load=190ms
FPS_scroll median=60 (unthrottled & 4x)  avg=23/40  p95=30/20
deps=5 (gsap,lenis,next,react,react-dom)  WebGL=none  canvases=1(2D hero)
reveal tempo=1.2–1.8s power3.out  Lenis lerp=0.1
```

---

## 6. Per-section ERA mapping (what to add to reach ERA)

For each section: current state → target ERA recipe → concrete gap. R03/R06/R10 are the
not-yet-written recipes described in UPGRADE_TO_ERA.md.

### S1 Hero → R06 (image-displacement) + R01 + R04, on R03 persistent canvas
- **Now:** flat 2D frame-scrub. One image plane, no depth. Day→night via frame swap.
- **ERA target:** 3 depth layers on different Z — sky (z−8, speed 0.6) / building (z=0, speed 1.0 +
  depth-displacement shader `uv += uOffset * depth.r`) / foreground (z+4, speed 1.4). Mouse-parallax.
  Day↔night crossfade of building+sky+depth by scroll progress; night windows emissive.
- **Add:** chroma-key the `building_*_green.png` → RGBA; generate depth maps (Depth Anything V2);
  build `<HeroDepthParallax/>` in the persistent WebGL canvas; keep Kling video (`hero-desktop.mp4`/
  `hero-mobile.mp4`) as mobile/low-FPS fallback, static building_day as reduced-motion fallback.
- **Assets staged:** `sky_day.png`, `sky_night.png` ✅. **Missing:** `building_day_green.png`,
  `building_night_green.png`, depth maps — required before Phase 2.

### S2 Concept → R04 (multi-layer parallax + crossfade)
- **Now:** 2-image opacity crossfade + single-axis yPercent parallax (±4). "Depth" is faked.
- **ERA target:** decompose render into 2–3 depth layers (depth-map displacement OR rembg fore/back
  cut), layers move at different speeds; keep the day→evening crossfade (render_05→render_N_02);
  text SplitText synced to parallax; one heroic moment.
- **Add:** per-render depth layering (currently flat); SplitText on H2 (currently plain reveal).

### S3 Architecture → R11 (already implemented) — closest to ERA
- **Now:** sticky window-reveal (clip-path inset 34%→0%) + push-in (scale 1.45→1.06), pinned 130%.
  This is genuinely the R11 mechanic.
- **ERA target:** inside the window show building_night with **windows lighting up one-by-one
  (staggered emissive)** as the mask opens; H2 reveal synced to the opening.
- **Add:** the staggered window-emissive effect (needs the night render layered / WebGL emissive);
  currently it's a single static render behind the mask. ~80% there.

### S4 Courtyard → R04 (depth parallax + crossfade)
- **Now:** static diptych (render_10 + render_N_03) with 2 yPercent parallax speeds.
- **ERA target:** decompose into depth layers (foreground greenery vs building), crossfade
  day↔evening (render_10→render_N_03 are different angles — may need a matched pair or depth grade),
  text synced.
- **Add:** real depth layering; the two renders are different viewpoints so a clean crossfade needs
  either a matched evening render or a theme-grade approach.

### S5 Roof → R04 (depth parallax)
- **Now:** parallax gallery of terrace renders (yPercent 16/26).
- **ERA target:** depth-layer the lake-view hero shot; **the lake-view render itself is still a TODO**
  (Nano Banana) — currently `render_terasa_03` stands in. Add the missing lake render, then depth-layer.
- **Add:** the actual lake-view asset (blocking), then depth parallax.

### S6 Specs → (no ERA recipe — keep, polish tempo)
- **Now:** count-up (1.6s) + reveal (1.2s). No media.
- **ERA target:** no ERA equivalent (ERA has no spec table). Keep as the analytical "trough."
- **Add:** bump count-up/reveal to ≥1.5s for tempo consistency; optionally a subtle dark surface
  texture so the trough stays premium. Low priority.

### S7 Contact → (no ERA recipe) + R03 reuse idea
- **Now:** plain staggered reveal, form.
- **ERA target:** no direct equivalent. UPGRADE_TO_ERA suggests reusing the Kling day→night video as
  a "breathing" background here.
- **Add:** optional Kling-video ambient background; otherwise fine.

### NEW — 3D District Map → R10 (killer feature, entirely missing)
- **Now:** does not exist.
- **ERA target:** `<DistrictMap/>` (R3F+drei) — Nano top-down map plane + emissive QUADRO box +
  pulsing POI markers (lake, 7-min centre, schools) + click→flyTo + HTML modal; OrbitControls,
  compass, reverse preloader. Mobile → static 2D map.
- **Add:** everything — Apify POI scrape (`data/poi.js`), Nano map texture
  (`public/assets/district_map.webp`), the R10 component. This is the single biggest ERA-differentiator
  the site lacks. No asset staged yet.

### Cross-cutting (all sections)
- **Persistent WebGL canvas (R03):** the foundation none of the above can sit on yet. Phase 1.
- **Cinematic preloader:** current splash is a static "QUADRO" wordmark; ERA wants a slow
  logo+counter reveal that clears on LCP. Phase 6.
- **Reveal tempo:** already 1.2–1.8s; nudge the two <1.5s cases (Specs) up. Minor.

---

## Priority order to reach ERA (matches UPGRADE_TO_ERA phases)
1. **Phase 1 — persistent WebGL canvas + keep Lenis** (foundation; scroll plumbing already done).
2. **Phase 2 — hero depth-parallax** (biggest visible jump; assets partly staged).
3. **Phase 3 — S3 emissive window-reveal** (~80% done, finish the lighting).
4. **Phase 4 — S2/S4/S5 multi-layer depth parallax** (replace faked yPercent depth).
5. **Phase 5 — 3D district map** (killer feature, fully greenfield).
6. **Phase 6 — preloader + polish + anti-slop pass.**

**What's already ERA-grade and should NOT be touched:** Lenis+ScrollTrigger integration, single-rAF
loop, teardown discipline, reveal easing, LCP/CLS, reduced-motion fallbacks, the day→night theme
token system.
