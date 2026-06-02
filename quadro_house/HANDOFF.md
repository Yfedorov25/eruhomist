# HANDOFF — QUADRO HOUSE (для нового чату)

> Прочитай це повністю перед будь-якою дією. Тут весь контекст: що це, де код, які рішення
> ухвалені й чому, що зроблено, що далі, які команди плагінів запускати на яких фазах.
> Дата хендофу: 2026-06-02. Гілка: `feat/quadro-house`.

---

## 0. TL;DR
QUADRO HOUSE — кінематографічний scroll-сайт нерухомості (клубний дім на 4 квартири, Вінниця).
Збудований у `apps/quadro/` (Next 16 + Lenis + GSAP, **БЕЗ WebGL** — лише 2D-canvas hero + DOM).
Базовий сайт (7 секцій) + 5 фаз ERA-апгрейду готові. Наступна — **Фаза 6** (preloader + фінальний поліш/QA).
Деплой ще не робили (push на Vercel — дія користувача).

---

## 1. Що це / структура репо
- **Корінь:** `/Users/yehorfedorov/Downloads/eruhomist` (git, гілка `feat/quadro-house`, base = `main`).
- **`apps/quadro/`** — ЦЕ робочий сайт QUADRO HOUSE (Next 16, React 19, TS, Tailwind v4).
- **`apps/eruhomist/`** — ІНШИЙ, окремий, уже задеплоєний сайт. **НЕ ЧІПАТИ.** (Звідти ми позичили
  паттерн 2D-canvas декодера й Telegram-екшн.)
- **`quadro_house/`** — vault брифу+асетів (НЕ код): TZ_QUADRO.md, CLAUDE.md (бренд-бар),
  рецепти R01/R04/R05/R11/R23, recipe-methodology.md, uk.json (фінальний UK-копірайт),
  UPGRADE_TO_ERA.md (майстер-план ERA-фаз), ARCHITECTURE_AUDIT.md (baseline),
  poi-candidates.js (25 точок для Фази 5), public/ (videos + renders + assets).
- Дев: `cd apps/quadro && PORT=3210 npx next start` (після build) або `npx next dev`. Дивись `localhost:3210/uk`.

## 2. Бренд-бар (з quadro_house/CLAUDE.md) — НЕ порушувати
«$10k feeling», рівень era.estate / Lusion. **AI-slop заборонено** (і візуал, і копірайт).
Кожна анімація або кінематографічна, або видаляється. Reveal-темп luxury **1.5–3s**, НЕ 0.9s.
Easing ніколи linear на UI (power3.out/expo.out). Lenis lerp 0.1. prefers-reduced-motion завжди fallback.
**Копірайт фінальний у messages/uk.json — НЕ генерувати новий, питати користувача** (правило було порушене
Gemini раніше — користувач на цьому обпікся). EN — стаб, не генерувати.

## 3. Стек (apps/quadro) — точний
Залежності: **gsap, lenis, next, react, react-dom** (і все — Three.js/R3F/drei ВИДАЛЕНІ, див. §5).
- Next 16.2.6, React 19.2.4, TS, Tailwind v4 (CSS-variable тема), Cormorant (display, Cyrillic) + Manrope (body).
- Lenis (lerp 0.1) + GSAP ScrollTrigger + SplitText. Один rAF (lenis через gsap.ticker). Чистий teardown.
- i18n: власний хук (`lib/i18n.ts`), `app/[locale]/`, uk verbatim, en стаб (fallback на uk, перемикач схований).
- Форма S7: Telegram server-action (`app/[locale]/actions/sendLead.ts`), чесний fallback (не вдає успіх без креди).

## 4. Файли (apps/quadro) — мапа
- `app/[locale]/page.tsx` — збирає 7 секцій; S2–S7 загорнуті в `.content-surface` (стабільна вечірня поверхня).
- `app/globals.css` — тема (day→night по `--scroll-progress`), `--scrim` токен читабельності, `.hero-grain`,
  `.hero-window-glow`, `.hero-aberration`, `.content-surface`, `--ink/--ink-muted` (текст контенту).
- `components/sections/`: Hero, Concept(S2), Architecture(S3), Courtyard(S4), Roof(S5), Specs(S6), Contact(S7), ContactForm.
- `components/`: Header (sticky, day→night колір, мобільне overlay-меню), Footer, Section, CrossfadeMedia, LangSwitch.
- `lib/`: SmoothScrollProvider (Lenis+ScrollTrigger ядро + глобальний `[data-parallax]`), useReveal (staggered reveal),
  hero-frames (HERO_FRAME_COUNT=96), format (richText **bold**/*italic*), conversion (gated слоти),
  i18n, **webgl-guard** (для Фази 5, не для hero).
- `scripts/extract-frames.mjs` — ffmpeg pipeline (`npm run frames`), 96 кадрів desktop+mobile.

## 5. КЛЮЧОВІ РІШЕННЯ (чому так, не інакше)
1. **HERO = 2D-canvas frame-scrub, НЕ WebGL.** Спершу був WebGL (R3F) — **падав чорним екраном на
   реальному залізі** + нуль моушену на мобільному. Рада `/llm-council` 4/4 → перейшли на 2D-canvas
   sliding-window декодер (з apps/eruhomist): `fetch→blob→createImageBitmap`, 24-кадрове RAM-вікно,
   малює найближчий декодований кадр (НІКОЛИ не чорний), lerp scrub, sticky 400vh pin. Працює desktop+mobile.
   Commit `5aaaf79`. **НЕ повертати WebGL у hero.**
2. **Фаза 2 = R-CSS film-grade, НЕ depth-parallax.** `/autoplan` (3 рев'юери) розвернув план WebGL
   depth-parallax: будівля — один coplanar рендер (машини біля фасаду, спільні тіні) → шари дали б
   «картонні вирізки», дешевше за чистий scrub; WebGL знов = ризик чорного; і **frame-scrub І Є
   ERA-механіка** (era.estate hero = scrubbed sequence; UPGRADE_TO_ERA рядок 8 це помилково діагностує).
   Зробили grade чисто на CSS: warm window-glow (ramps з `--hero-night`), chromatic aberration на
   швидкості скролу (`--hero-aberration`), поверх grain+vignette. Нуль WebGL. Commit `ccfadc1`.
3. **day→night контраст:** контент S2–S7 на стабільній `.content-surface` (вечірня), світлий `--ink`,
   бо інакше текст і bg перетинались у сутінках (1.1:1). Тепер 9+:1. Commit `6178cfc`.
4. **Конверсійний контент (UC2):** ціна/4 планування/телефон/блок забудовника = слоти в `lib/conversion.ts`,
   КОНТЕНТ ВІД КОРИСТУВАЧА (нічого не вигадувати). Зараз порожні → сховані.
5. **webgl-guard.ts** існує для Фази 5 (3D-карта), НЕ для hero. capability() (tier зі статичних сигналів)
   + guardCanvas() (context-lost + first-paint watchdog). ВАЖЛИВО: watchdog ловить «не намалювалось», НЕ
   «намалювалось чорним» — для Фази 5 треба ще video-під-canvas + readPixels-чек.

## 6. СТАН: що зроблено
- ✅ Базовий сайт: 7 секцій, day→night, i18n, форма, header/footer, мобільне меню. QA пройдено
  (LCP 180ms, CLS 0, median 60fps, reduced-motion чисто). design-review A−/AI-slop A.
- ✅ Фаза 0 (аудит): `quadro_house/ARCHITECTURE_AUDIT.md` (+ копія в ~/Downloads).
- ✅ Фаза 1 (infra): `lib/webgl-guard.ts`. Scroll-ядро НЕ чіпали (вже ERA-рівня).
- ✅ Фаза 2 (hero grade R-CSS): warm-glow + aberration. LCP 180ms, без регресії.
- ✅ Фаза 3 (S3 reveal): вікно відкривається → day→night crossfade на світлу будівлю + glow «вмикається»
  + H2 SplitText синхронно + дарк-обрамлення #06080e. design-review clean.
- ✅ Фаза 4 (DOM-parallax S2/S4/S5): council 5/5 → **Option A** (multi-layer CSS parallax, restraint; БЕЗ
  WebGL, БЕЗ нових важких асетів, БЕЗ chroma-key плит). `CrossfadeMedia` розширено: 2-plane depth
  (media slow drift + warm light-leak fast drift), day→evening crossfade = героїчний момент, edge-feather
  mask (будівля розчиняється в поверхні, не «пласка плита»), glow що витікає за рамку на поверхню. Новий
  `SplitReveal` (line-mask reveal, fonts.ready, reduced-motion safe) на H2 S2/S4/S5. S2: render_05→N_02.
  S4: render_10→N_03 (+ dayFilter лифт експозиції дня, glowIntensity 0.45 бо path-lights уже теплі).
  S5 Roof = **golden-hour climax** (council): нічної версії нема → секція ТРИМАЄ денне світло поки все
  вище пішло в ніч; section-wide warm wash + 1 hero + 1 floating detail (z-offset/shadow/ring) + H2 на
  розмір більший + warm hairline + solid CTA. Mobile=yPercent only (matchMedia); reduced-motion=static.
  Гейти: browse CLS 0.0077 (real wheel input) / S2,S4,S5 isolated CLS=0 / idle 55fps / steady 58fps /
  0 console errors; /design-review S2 8.5, S4 8.2, S5 8.5 (усі ≥8). `npm run build` чисто.
  Баг виправлено: prop `glow` шадовив локальний DOM-ref `glow` → множення на HTMLDivElement (NaN);
  перейменовано на `glowIntensity`. Це означало що glow до фіксу взагалі не рендерився.

## 7. ЩО ДАЛІ (порядок з UPGRADE_TO_ERA)
- **✅ Фаза 4 — DOM-parallax секцій Суть(S2)/Двір(S4)/Дах(S5) — ЗРОБЛЕНО (див. §6).** Нижче — оригінальний план:
  Розкласти рендери на 2-3 шари глибини
  (CSS translate3d, driven by `--scroll-progress` / gsap.quickTo), crossfade день↔вечір де є нічна версія
  (S2: render_05→render_N_02; S4: render_10→render_N_03), reveal 1.5–3s power3.out, SplitText синхронно,
  1 героїчний момент/секцію. **БЕЗ WebGL.** mobile = легший parallax (тільки yPercent). reduced-motion=статика.
  Sky/key-асети (sky_day/night.png, building plates) МОЖНА сюди (глибина справжня на секціях).
  Команди: gsap-scrolltrigger + gsap-performance (transforms-only, will-change toggle) + SplitText +
  matchMedia. БЕЗ планувальних команд (мала фаза). Гейти: browse(CLS-чек) + /design-review ≥8/10.
- **✅ Фаза 5 — карта району (killer feature) — ЗРОБЛЕНО, але DOM-only, НЕ 3D/WebGL.** `/autoplan` (CEO+Design+Eng,
  Codex недоступний → single-model, 3/3 незалежно) розвернув план R3F: (1) webgl-guard НЕ ловить чорний
  екран (context що малює чорне все одно кличе markPainted) — false confidence; (2) нахил плоскої painted-карти =
  візуальний даунгрейд («cheap Google-Earth»), її преміум — саме пласкі чіткі лінії; (3) WebGL не вартий ризику
  для 8 точок на PNG для 4 квартир. Збудовано `components/sections/DistrictMap.tsx` (S6, DOM-only 2.5D):
  district_map.webp (оптимізовано до 215КБ WebP 2048²) + 8 маркерів з lib/poi.ts (layout{x,z}→%), CSS perspective
  tilt ~6° + pointer-parallax (gsap.quickTo, desktop fine-pointer), QUADRO = повільний теплий breathing halo
  (.quadro-halo у globals.css, НЕ HUD-пульс), staggered reveal маркерів, фільтр категорій (rail знизу, all-on,
  guard «не вимкнути останню»), клік→модалка (km/walk+drive/зірки/наратив з poi.ts + faint map-текстура в хедері
  + великий cat-icon) + CTA→#contact. **deps лишились 5, нуль WebGL, CLS=0, 59fps з tilt, keyboard-a11y
  (маркери=button, Enter відкриває), Escape закриває, reduced-motion=static, mobile=tap без tilt.** /design-review
  8.5/10. `npm run build` чисто. **ПОТРІБЕН КОПІРАЙТ ВІД КОРИСТУВАЧА:** map.h2 / map.body / map.modalCta / nav.map
  у messages/uk.json зараз ПОРОЖНІ (порожнє=сховано) — заголовок секції, CTA-лейбл і nav-лейбл чекають тексту.
  POI-фото: де photo:true очікує /public/poi/{id}.jpg (нема → graceful warm-gradient placeholder, onError ховає img).
  Озерний рендер: render_lake_terasa.jpg замінив плейсхолдер у S5.
- **Оригінальний план Фази 5 (3D R3F) — відхилено, лишаю для контексту:** ІЗОЛЬОВАНИЙ R3F-canvas через webgl-guard + fallback.
  КРОК 0: прочитати `quadro_house/poi-candidates.js` (25 точок), вивести список, ЗУПИНИТИСЬ — користувач
  обере ~10-12 точок + категорії. Тільки потім будувати. Текстура мапи: Nano (district_map.webp, ще нема).
  Команди: **/autoplan ПЕРЕД білдом** (WebGL!), gsap-timeline+CustomEase (flyTo proxy-таргет), gsap-react
  useGSAP. Гейти: browse fallback-чек (video-під-canvas + readPixels!) + /benchmark + /design-review.
- **Фаза 6 — preloader + поліш.** Splash, перевірити easing/темп усіх секцій, фінальний QA проти baseline.
  Гейти: /design-review + /review → /ship → /land-and-deploy → /canary.

## 8. КОМАНДИ ПЛАГІНІВ — toolmap (вердикт ради `/llm-council`)
**Спина: один білдер (головний агент) + один рев'юер (gstack /design-review).** НЕ віддавати білд
design-engineer frontend-implementer-агенту, НЕ запускати його /development+meta-orchestrator (конкурентний
пайплайн). Три «чи гарний дизайн» тули конфліктують → переможець ОДИН: **gstack /design-review**.
- **⚠️ НЕ брати GSAP ScrollSmoother** (дублює Lenis → jitter). З gsap-plugins лише SplitText + CustomEase.
- **GSAP по фазах:** scrolltrigger+utils(mapRange/clamp) скрізь; gsap-react useGSAP({scope}) для будь-якого
  mount/unmount (atomic teardown); gsap.quickTo для миші; gsap-timeline+CustomEase для flyTo (Ф5);
  **gsap-performance ПІСЛЯ КОЖНОЇ parallax/WebGL фази.**
- **psych-* — лише 2:** psych-time-perception (Ф4/Ф5 темп), psych-emotional-retention (день→ніч арка, карта).
- **/autoplan — лише Ф2(зроблено) і Ф5** (WebGL, найбільший blast radius). НЕ пофазно.
- **Два незмінні гейти КОЖНОЇ візуальної фази:** (1) browse+Playwright піксель+FPS+fallback-чек
  (firewall проти чорного екрану), (2) /design-review ≥8/10.
- **Ігнорувати:** design-engineer /development+meta-orchestrator, решта 9 psych-*, design-shotgun/consultation,
  ux-researcher, ScrollSmoother, gsap Flip/Observer. /office-hours/spec не треба (план є).
- **Користувач хоче скликати `/llm-council` на справжні trade-off рішення** (не пофазно).

## 9. ВАЖЛИВІ ТЕХ-УРОКИ (щоб не повторювати)
- ScrollTrigger-pinned секції мають `offsetTop=0` (всередині pin-spacer) → абсолютну позицію рахувати
  через `getBoundingClientRect().top + scrollY`.
- Discrete-jump скріншоти Playwright ловлять момент *виходу* з pin (виглядає «зламано») → judge через
  **browse `screenshot --viewport`** на mid-pin (`archTop + ~0.45*pinSpan`), або плавним скролом.
- npm cache мав root-owned файли (EACCES) → використовуй project-local `--cache "$PWD/.npm-cache"`.
- ffmpeg mobile-відео екстракція нестабільна (~136 замість 145 кадрів) — `scripts/extract-frames.mjs`
  робить subset проти фактично витягнутого, тож робастно. Mobile-encode повільний (~2хв), не pkill.
- Render-асети: `quadro_house/public/renders/` (НЕ apps/quadro/public). `building_plate_green.png` = ДЕНЬ
  (ТЗ кличе building_day_green), `building_night_green.png` = ніч. Тільки 2 нічні рендери (N_02, N_03).
  Озерний кадр для S5 — досі TODO (Nano Banana).

## 10. ВІДКРИТІ TODO (контент від користувача, не блокери)
- ✅ Озерний рендер для S5 — ЗРОБЛЕНО (render_lake_terasa.jpg, золота година, замінив плейсхолдер).
- EN-копірайт (перемикач схований).
- Telegram креди (TELEGRAM_BOT_TOKEN/CHAT_ID у Vercel).
- Конверсійний контент: ціна / 4 планування / телефон / блок забудовника (lib/conversion.ts).
- Деплой: push гілки + Vercel-проєкт root=apps/quadro (дія користувача, /ship→/land-and-deploy→/canary).

## 11. Артефакти (де що лежить)
- Плани/аудити: `~/.gstack/projects/Yfedorov25-eruhomist/` (design doc, test-plan, phase2-plan, council transcript, restore points).
- Пам'ять агента: `~/.claude/projects/-Users-yehorfedorov-Downloads-eruhomist/memory/` (MEMORY.md індекс +
  quadro-house-build.md, quadro-era-toolmap.md, use-council-for-decisions.md).
- Майстер-план фаз: `quadro_house/UPGRADE_TO_ERA.md`. Аудит: `quadro_house/ARCHITECTURE_AUDIT.md`.

## 12. PERF BASELINE (міряти регресії проти цього)
LCP=180–244ms · CLS≈0 · FPS median=60 (unthrottled & 4× CPU) · deps=5 · WebGL=none · 1 canvas (2D hero).
Reveal темп 1.2–1.8s power3.out · Lenis lerp 0.1.

---
**ПЕРШИЙ КРОК у новому чаті:** прочитати цей файл + `quadro_house/UPGRADE_TO_ERA.md` (Фаза 4) +
пам'ять. Потім почати Фазу 4 (DOM-parallax S2/S4/S5, без WebGL, без планувальних команд, два гейти наприкінці).
