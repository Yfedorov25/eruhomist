# HANDOFF — «Дім на Нагірній» (стан станом на 2026-06-03)

> Цей файл + `PROBLEMS.md` + `COPY_REBUILD_BRIEF.md` + `REDESIGN_PROMPT.md` — повний пакет
> для глибокої сесії редизайну. Прочитай усі 4. Це лідген-сайт для продажу вілли.

---

## 0. TL;DR
Кінематографічний scroll-driven лендинг для продажу однієї приватної вілли ($270k, вул. Нагірна,
Вінниця, власний берег Південного Бугу). **Збудовано повністю (10 секцій), задеплоєно** на
`https://nahirna.vercel.app`. Працює, перф відмінний (LCP 1.4s, CLS 0). **АЛЕ** є системні проблеми
дизайну/копірайту/читабельності (див. `PROBLEMS.md`) — потрібен не патч, а переосмислення кількох
екранів «набагато крутіше і дорожче» + повний rebuild копірайту в стилі Федоріва.

**Що ОК і чіпати обережно:** Hero (00) — майже добре; Простір (03 «Кухня, де вода в кадрі») —
ЕТАЛОН, користувачу подобається; Тур (05) — технічно працює бездоганно; перф/SEO/безпека/Telegram —
все добре. **Що переробити:** Архітектура (02) — повністю; Карта (06) — сира; Loader — плаский;
копірайт — скрізь; читабельність тексту — у багатьох місцях.

---

## 1. СТЕК (зафіксовано клієнтом, не міняти без дозволу)
- **Next.js 16.2.6** App Router + TypeScript, **React 19.2.4**
- **Tailwind v4** (CSS-first, `@import "tailwindcss"`, `@tailwindcss/postcss`, НЕ tailwind.config.js)
- **Lenis 1.3.11** (smooth scroll, lerp 0.08) + **GSAP 3.15** (ScrollTrigger, SplitText) + **@gsap/react**
- **next/font** (Lora display + Inter body, обидва cyrillic), **next/image** (WebP, `unoptimized:true`)
- **БЕЗ Three.js/WebGL** — явна заборона клієнта. Тур = frame-sequence на 2D canvas.
- Монорепо: `apps/nahirna` (сиблінг `apps/quadro`, `apps/eruhomist`). npm (project-local `.npm-cache`).

## 2. ЗАПУСК
```bash
cd apps/nahirna
npm install --cache ./.npm-cache    # якщо чистий клон
npm run dev                          # → http://localhost:3001 (3000 зайнятий quadro)
npm run build && PORT=3010 npm run start   # prod-перевірка
npm run frames                       # перегенерувати кадри туру (FFmpeg, FPS=10 → 181 кадр)
```
Деплой (як quadro): `apps/quadro/node_modules/.bin/vercel --prod --yes --scope yehor-s-projects3`
(vercel CLI поки тільки в quadro; auth у `~/Library/Application Support/com.vercel.cli/auth.json`).

## 3. ФАЙЛОВА СТРУКТУРА
```
apps/nahirna/
  app/
    layout.tsx            SSR shell, Lora+Inter, metadata/OG, JSON-LD SingleFamilyResidence,
                          GA4+Clarity (no-op без env), preload hero day-image (LCP)
    page.tsx              збирає <Hero/><Water/>…<CTA/></main><Footer/><CallPill/><Cursor/>
    globals.css           CSS-токени з CLAUDE.md (--color-night/brick/roof/warm/plaster/text/accent),
                          .grain (вимк. на mobile+reduced), .scrim-text, reduced-motion guard
    opengraph-image.jpg   (hero-night, у корені app/ — Vercel prerender інваріант)
    icon.tsx              favicon "Н" монограма
    actions/sendLead.ts   "use server" — форма → Telegram (той самий бот що quadro/eruhomist),
                          3 поля name/when/phone + PDPL consent, чесний fallback (не фейкає успіх)
  components/
    sections/00-Hero … 09-Footer.tsx   (одна секція = один файл)
    ui/ Reveal · CountUp · MagneticButton · CallPill · Cursor.tsx
  lib/
    SmoothScrollProvider.tsx   Lenis(lerp 0.08) ↔ gsap.ticker (autoRaf off), lagSmoothing(500,33),
                               [data-parallax], ScrollTrigger.refresh on fonts.ready, повний cleanup
    useFrameSequence.ts        ДЕКОДЕР ТУРУ (див. §5) — sliding-window, nearest-on-miss, 1280px canvas
    useReducedMotion.ts · analytics.ts · jsonld.ts · site.ts · tour-frames.ts
  public/
    images/*.webp (14)   hero day/night desktop+mobile, living-day/evening, terrace,
                         water-terrace-golden, water-finale, exterior-day-1/2, exterior-night-1/2,
                         exterior-terrace-columns. Усі 1920×1071 (hero/interior/water) або 1706×2560
                         (exterior verticals). hero-day-mobile=768×1376, hero-night-mobile=1080×1935.
    videos/tour/*.mp4 (3)   scene1_arrival (9.58s двір→ганок→поріг), scene2_living (5.04s наїзд у
                            вітальню), scene3_water (5.04s тераса→берег золота година). 1928×1076.
    frames/tour/{desktop 1920w, mobile 1080w}/0001..0181.webp   (181 кадрів, з FFmpeg)
    plan/floorplan.png   2400×1697, інвертований Archicad-план (в CSS filter)
    noise.svg            грейн-текстура
  content/COPY_nahirna.md   УВЕСЬ текст (джерело правди для копірайту — але він і є проблемою, див.
                            COPY_REBUILD_BRIEF.md)
  specs/00..09 + _README.md  оригінальні ТЗ по секціях (читати для наміру кожної секції)
  CLAUDE.md                  головне джерело правди (токени, факти, motion-мова, заборони)
  council-report-*.html      вердикт ради 5 радників по архітектурі (вже застосовано)
```

## 4. ДИЗАЙН-ТОКЕНИ (globals.css, з CLAUDE.md — НЕ міняти палітру)
```
--color-night #0F0F0E   --color-brick #2C2622 (шоколадна клінкерна цегла)
--color-roof #4F5048    --color-warm/accent #E8C9A0 (тепле золото — акцент, СТРИМАНО)
--color-plaster #EDEAE3 --color-text #EDEAE3   --color-text-muted #9B978F
```
Шрифти: **Lora** (display serif) + **Inter** (body). Тема темна (ніч/шоколад), теплі золоті акценти.
Grain поверх усього (вимк. mobile+reduced). Анімації ТІЛЬКИ transform/opacity/clip.

## 5. ЯК ПРАЦЮЄ ТУР (секція 05) — найскладніше, працює добре
`lib/useFrameSequence.ts` (адаптовано з робочого hero-декодера apps/quadro):
- Overlay відкривається подією `window` `open-tour` (диспатчиться з §03 CTA і з кнопки в §05).
- Overlay = `position:fixed`, всередині **власний скрол-контейнер** (500vh spacer) + `<canvas fixed>`.
- **Кадр читається ПРЯМО зі `scroller.scrollTop`** у rAF-циклі + один low-pass лерп 0.18.
  (НЕ ScrollTrigger — кастомний скролер з ним конфліктував, кадр не рухався. Це був баг, виправлено.)
- Sliding window: тримає декодованими `current −6 .. +16` (~22 кадри ≈ 160MB), `.close()` на евікт.
- `nearestDecoded()` → на miss малює найближчий готовий кадр, **НІКОЛИ не чорний екран**.
- Кросфейд двох сусідніх кадрів (alpha=frac) → плавно, не «клац-клац».
- Canvas backing-store обмежено 1280px (↓6× GPU-аплоад, нема commit-лагу).
- Climax CTA зʼявляється при progress>0.9 (золота година — пік емоції).
- Закриття (X/Esc) → звільняє всі bitmaps, відновлює body scroll. reduced-motion → статичний 1-й кадр.
- **Loader зараз = просто текст «Заходимо…»** (це і є проблема — треба глибший, див. PROBLEMS.md).

## 6. КОНВЕРСІЯ / АНАЛІТИКА
- `lib/analytics.ts` — GA4+Clarity, події: tel_click, form_submit, scroll_90, cta_click, lead_intent.
  Ключове: трекає ЯКА СЕКЦІЯ на екрані коли стався дзвінок (`setActiveSection` з IntersectionObserver
  у CallPill). Без env-ключів — no-op.
- `CallPill` — sticky пігулка дзвінка, зʼявляється після секції Вода, дімиться над CTA.
- Форма → `sendLead.ts` → Telegram (env `TELEGRAM_BOT_TOKEN`/`CHAT_ID` НЕ виставлені на Vercel ще —
  форма показує чесний fallback «зателефонуйте»). Прогнано psych-scanner (підпис власника, порядок
  полів, consent під кнопкою — застосовано).

## 7. TODO КЛІЄНТА (показано чесно як «уточнюється», свап в ОДНОМУ файлі lib/site.ts)
Реальний телефон · відстані POI до центру/школи · ім'я господаря (`CONTACT.ownerName`) ·
рік завершення · Telegram/Viber. Anti-slop: НЕ вигадувати ці числа.

## 8. ЗАЛІЗНІ ПРАВИЛА (CLAUDE.md — діють і в редизайні)
- Колони цегляні з білими базою/капітеллю — НЕ суцільно білі (це про опис, фото не міняти).
- Ціна/площа/адреса точні. LCP<2.5/INP<200/CLS<0.1, 60fps desktop/≥40 mobile — святе.
- prefers-reduced-motion + mobile fallback у КОЖНІЙ секції. tel: клікабельний скрізь.
- Заборона: generic AI-естетика, linear easing, WebGL, lorem/вигадані факти, жертвувати LCP заради вау.

## 9. ВІДОМІ ТЕХ-НЮАНСИ
- Playwright MCP headless має баг капчури (DPR 0.9 обрізає pinned-секції) → для скрінів використовуй
  gstack `/browse` daemon (`~/.claude/skills/gstack/browse/dist/browse`), він знімає чисто.
- npm global cache має root-owned файли → завжди `--cache ./.npm-cache`.
