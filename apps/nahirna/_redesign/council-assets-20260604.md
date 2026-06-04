# LLM Council — Asset-Generation Strategy (3D tour / gallery / map) · 2026-06-04

**Q:** How to spec an orchestrator-Claude to generate AI assets (nano-banana + Kling) for F1 smooth 3D tour + day/night, F2 §03 gallery, F3 senior++ map — given assets MUST match the consistent CGI villa and the house sells UNFINISHED.

## QA facts that triggered this
- Tour = 181 frames from 18.6s source @ ~10fps → MEASURED CHOPPY (same frame repeats across 6 scroll steps). Decoder is SOUND (no black flash) — problem is source density/coverage.

## Advisors
- **Contrarian:** drift (not framerate) is the disease; lock every clip start/end to the 14 renders; perf cap (500×2 frames = LCP death); hand-author SVG map not AI (geographic fiction); consistency = pipeline property + 10-frame reject gate.
- **First Principles:** choppiness is a 181-frame problem; buyer doesn't need 540-frame walk; 3-4 SHORT locked shots, native 24fps, cut between; CONSISTENCY BIBLE + visualisation label.
- **Expansionist:** "a day you own" — scroll = time → NIGHT-from-water = single highest-leverage asset (unfinished house sells the life not drywall); empty→furnished gallery; flowing-river scarcity. 2 assets move calls: night-from-water + gold flowing shore.
- **Outsider (buyer):** walkthrough sells the LAND; polished interiors on a raw house = "played" = fastest lost sale → label "delivered as shell" UP FRONT; jerky NOT a dealbreaker; gallery shimmer = don't care (want tap→big→swipe); map looks HONEST, SHOW the real minutes (poi already has them); call-drivers = real distances + unfinished truth + developer track record.
- **Executor:** hybrid — re-shoot clips as start→end interpolated pinned to renders; 12 night stills via nano-banana (seed+reference); DE-RISK FIRST with $3/20min single clip; every job names pin/seed/res/fps/loop.

## Peer review
- **Strongest: E ×5** (only runnable spec + $3 de-risk gate), scaffolded by **A's drift diagnosis**.
- **Blind spot: E+C** (generate polished interiors with NO disclosure label = buyer's exact trust-bomb).
- **All missed (unanimous):** legal disclosure as a REQUIRED asset (not UX); source-of-truth decay (renders go stale when real house finishes); developer name+track-record (top call-driver, nobody spec'd); budget/regen cap; FPS/LCP acceptance numbers + named device.

## CHAIRMAN VERDICT (strategy excellent; NOTE: chairman cited QUADRO files by mistake — corrected for nahirna below)
- **Priority (buyer's reweighting = law):** P0 FREE no-AI first — (1) disclosure line up front, (2) developer name+track-record, (3) real POI distances on first read. THEN P1 AI: F1-derisk→F1→F3→F2.
- **F1:** 4 discrete locked shots, CUT between (not one morph), native ≥24fps, ~120 frames total (NOT 540, NOT 900 — perf). Day/night = same locked camera in 2 states, crossfaded. Night-from-water (S-D) = the hero asset + OG. Pin every clip to real renders. Consistency Bible approved before any batch.
- **F2:** day↔night crossfade per card (reuse night pins, 0 new gen) + EXACTLY ONE cinemagraph (terrace water). empty→furnished FORBIDDEN.
- **F3:** keep stylized base + animated SVG river overlay (GSAP stroke) + answer-surface (real distances) OR one nano aerial only if base reads junior. Privacy: district pin, no address.
- **Cross-cutting:** Consistency Bible (approved pre-gen), provenance/regeneration, legal disclosure, developer-trust block, 3-regen cap, prod-only LCP/CLS/fps acceptance.
- **ONE THING FIRST:** write Consistency Bible + disclosure copy, THEN $3 de-risk gate (1 night-from-water still + 1 interpolated clip, eyeball drift). Holds → greenlight F1.

## NAHIRNA factual corrections (chairman conflated with quadro)
- nahirna tour = **181 frames** (quadro=96); nahirna map = **SVG we generated** (quadro=raster webp); nahirna POI = **TODO_CLIENT placeholders** (quadro HAS real distances in poi.ts); nahirna hero = **2 layered next/image** (quadro=CrossfadeMedia); no conversion.ts. Strategy transfers; file names differ.

→ Full orchestrator spec: `NAHIRNA_ORCHESTRATOR_ТЗ.md` (repo root / ~/Downloads).
