# LLM Council Transcript — Nahirna Villa Landing Architecture
**Date:** 2026-06-03 · **Question:** 5 architecture decisions for the cinematic scroll-driven lead-gen landing (`apps/nahirna`).

## Framed Question
Cinematic scroll-driven LEAD-GEN landing to sell ONE $270k riverside villa (Vinnytsia, Southern Bug). Stack LOCKED: Next.js 15 App Router + TS + Tailwind + Lenis (lerp 0.08) + GSAP (ScrollTrigger, SplitText), next/font, next/image. NO WebGL. #1 goal = phone calls/callbacks. Perf SACRED: LCP<2.5s, INP<200ms, CLS<0.1, 60fps desktop/≥40fps mobile. reduced-motion + mobile fallback mandatory every section.

**Five decisions:** (1) repo placement in-place-at-root vs MOVE to `apps/nahirna`; (2) hero day→night crossfade engine — layered next/image+GSAP opacity vs canvas drawImage; (3) frame-sequence "walk-through" tour — preload/decode/eviction to avoid black-flash + memory blowup; (4) interactive floorplan — hand-redraw SVG vs PNG+hotspot-divs vs inline-export; (5) location map with UNKNOWN POI distances — static vs interactive vs defer.

---

## Advisor Responses

### The Contrarian
(1) In-place forks Vercel config; moved assets must keep the `public/` path or `next/image` 404s on Vercel's case-sensitive FS — git mv + grep refs. (2) Hero Option A, but "muddy middle" is the WRONG fear — opaque photos don't grey out, only additive blend does; the real flaw is both full-res layers composited every frame = mobile GPU overdraw, and lerp 0.08 will overshoot frame boundaries; use ease:none and fade ONLY the night layer 0→1 over the day. Reject canvas. (3) "Where the project dies": not 1.4GB but mobile tab-kill ~400MB; createImageBitmap GUARANTEES decoded bitmaps in RAM; sliding window ~12-15, evict + .close() or leak GPU; mobile drop to ~60 frames @1280w; clamp scrub velocity; render last-decoded on miss. (4) Floorplan A but trap is "exact areas" — hand-redrawn paths drift; trace over flattened reference, label from PDF's real numbers; reject inline export. (5) Map C, hard — inventing distances on a $270k legal sale is liability; hide behind a flag, not a visible TODO; Leaflet = tile-fetch LCP grenade.

### The First Principles Thinker
(1) False framing, 5-min reversible — apps/nahirna, git mv, done. (2) You invented the muddy middle — keep day at full opacity beneath, fade night 0→1 on top; Option A, day as priority LCP element; a buyer feels day-to-night, cannot perceive a blend curve. (3) Memory math is fantasy — never decode 180 at once; window current±8, .close() outside, ~20-30MB resident; decode-starvation is the ONLY real risk — snap to nearest decoded frame, never block; 1920w is desktop vanity, ship 1280w ~90 frames. (4) Gold-plating — nobody clicks 14 zones on a phone; ship 3-4 hotspots MAX on the rooms that sell. (5) Static frame NOW (fastest LCP); distances are a content blocker. Net: 2,3,4 over-scoped — the phone call is the product.

### The Expansionist
(1) MOVE to apps/nahirna → reusable cinematic-villa ENGINE inheriting Vercel parity + Telegram-lead pipeline + OG; villa #3 becomes a fork. (2) Option A layered, never canvas the hero; kill the muddy middle with a THIRD mid-dusk golden-hour frame — most screenshot-able moment; CTA fades in at full night. (3) Window ~40, decode-ahead in scroll direction; UPSIDE: end the walkthrough on the riverbank at golden hour + sticky "Book a private viewing" the instant it completes = peak emotional arousal. (4) Option A hand-redrawn; click room reveals area + photo, doubles as gallery. (5) Option A static map with POIs as TIME not distance. Two additions: persistent magnetic "Call now/Request callback" pill after the water story; one scarcity line.

### The Outsider (the buyer)
Doesn't know the jargon, neither will the buyer. (1) Internal plumbing — stop discussing. (2) Only notice if broken/muddy ("cheap"); don't lose a week. (3) The scroll-film is the ONE thing that could make me CALL (yard→water golden hour = imagining living there) BUT a black-flash/stutter screams "amateurs, trust them with $270k?" — broken centerpiece worse than none. (4) Care only that I tap a room and see 18m² + what it overlooks; drawing method irrelevant; numbers correct. (5) THE BIG ONE — leave the map OUT rather than fake/vague; made-up distances = "hiding something" → distrust the price; missing map unnoticed, dishonest map kills the deal. Phone number top + bottom + following button.

### The Executor
DE-RISK Decision 3 FIRST — build nothing else until proven; it can't be faked or swapped late. (3) Validate build-frames.sh: assert count 150-180, every frame 1920w, no zero-byte, eyeball 0/75/150, THEN overlay. Don't decode 180; preload blobs; sliding window ~24 decoded ImageBitmaps + .close() on eviction; draw nearest-ready frame so never black-flash; cap ~200MB. (1) MOVE to apps/nahirna, git mv the 25MB once. (2) Hero Option A — two next/image + GSAP opacity; canvas costs LCP + a day for an indistinguishable result. (4) Floorplan Option B (PNG underlay + positioned hotspot buttons) — already rendered PNG; accessible, keyboard-focusable, afternoon; hand-redraw = 2 days zero gain. (5) Map C now, A later — static frame + villa pin + TODO. Order: validate frames → git mv → scaffold → hero A → 01-04 → frame overlay → map stub → facts/CTA/footer.

---

## Peer Reviews (anonymization: A=Executor, B=Contrarian, C=Outsider, D=First-Principles, E=Expansionist)

- **R1:** Strongest D. Blind spot E (reusable engine + scope on a perf-constrained call site). ALL missed: prefers-reduced-motion / no-JS fallback for the tour; no measurable perf gate / named mid-tier Android.
- **R2:** Strongest D (sharpest strategically). Blind spot A (execution order, no interrogation of whether the heavy work should exist). ALL missed: call-conversion mechanics — no tel: spec, no call-tracking, no event logging of WHICH section converts (Amplitude team!); honest-map is a CONTENT blocker — get ONE true distance.
- **R3:** Strongest B (fears→specs: createImageBitmap RAM residency → window 12-15 + .close() → mobile 60@1280w + velocity clamp + render-last-decoded; distances = legal liability; Leaflet = LCP grenade). Blind spot E (window ~40 ≈ 3× safe size → mobile OOM). ALL missed: build-frames.sh as the decoder's contract; no real-device measurement; no reduced-motion fallback.
- **R4:** Strongest B (muddy-middle myth, tab-kill ~400MB, createImageBitmap/.close() GPU-leak, case-sensitive Vercel FS 404 on move, legal liability of invented distances). Blind spot E (upside-drunk, speculative abstraction before de-risk). ALL missed: actual ASSET REALITY — do source frames exist/are usable: count, resolution, zero-byte, COLOR CONSISTENCY between scenes (hue jump mid-scrub looks broken); no measurement gate.
- **R5:** Strongest D (kills muddy-middle + memory fictions, ships 1280w/90, demotes 2/3/4). Blind spot E ("lipstick on a crash"). ALL missed: total-decode-failure degraded path (slow 3G/data-saver/timeout) → static hero + CTA; who legally clears distance data; reduced-motion path; whether Lenis+GSAP scrub fires under iOS Low Power Mode.

---

## Chairman Verdict (cross-verified against the repo; [GROUND TRUTH] = facts that override advisor assumptions)

**Agreements (high-confidence):**
1. Hero → **Option A layered** (5/5). Day = full-opacity LCP element; fade night 0→1, ease:none. [GT: quadro hero already ships this — de-risked.]
2. Map → **never invent distances** (legal liability + trust). [GT: spec `06_location.md` already mandates this.]
3. Tour is THE product-defining risk → de-risk first; **render nearest-decoded on miss, never black**.
4. Repo → **`apps/nahirna`** (reversible). [GT: nahirna already at root; wire into monorepo like apps/quadro.]
5. **The phone number is the product** — tel: top + bottom + following pill.

**Clashes resolved:**
- **Floorplan:** buyer is indifferent to draw technique, cares about correct numbers + rooms that sell → **Option B (PNG/SVG underlay + positioned hotspot buttons)**, scoped by restraint. [GT: areas already exact for all 7 rooms + source is a PDF → label all 7 from real numbers, lead the eye to terrace 29.83 + master 16.65; no hand-redraw, no gallery scope.]
- **Scope war:** ADOPT Expansionist's conversion psychology (end-of-tour sticky CTA, magnetic call pill, honest scarcity line, dusk as hero beat) — REJECT its engineering ambition (window ~40, reusable "engine" abstraction, all-room gallery).

**Blind spots (now build requirements):**
1. reduced-motion / no-JS / **iOS Low Power Mode** fallback for the tour (untested risk).
2. **Total-decode-failure degraded path** = static golden-hour hero + CTA.
3. **Measurable perf gate on a named mid-tier Android**, merge-blocking.
4. **Call instrumentation** (tel: everywhere + Amplitude event of which section converts) — worst omission for this team.
5. **Frame COLOR CONSISTENCY** at the two crossfade seams (3 separate Kling clips).
6. **build-frames.sh is the contract** — and it's UNRUN. Script emits 1920w/1080w @30fps, ~150-180 total (trust the script, not the advisors' 1280w/90).
7. Distances = **content blocker the client owns**; [GT: one true line already exists — "own riverbank · 0 min"]. Get ONE headline distance to unblock honestly; express POIs as TIME.

**THE ONE THING FIRST:** Run `scripts/build-frames.sh`, then validate its output (count 150-180, correct widths, no zero-byte) and **eyeball the two crossfade seams for color/exposure jumps** — BEFORE writing any overlay code. The advisors' "validate frames Monday" was literally impossible: the frames don't exist yet (source is 3 mp4s).
