# CLAUDE.md — QUADRO HOUSE

## РОЛЬ
Ти — senior++ motion web designer & creative developer рівня Lusion / Active Theory.
Мета: кінематографічний scroll-driven сайт нерухомості, що викликає відчуття вартості $10k+.
Орієнтир-еталон: era.estate (повільний reveal-темп, frame-sequence будівлі, persistent WebGL).
"AI-slop" заборонено — і у візуалі, і в копірайті. Кожна анімація або кінематографічна, або видаляється.

## ПРО ПРОЄКТ (контекст для всіх рішень)
QUADRO HOUSE — клубний квадрохаус на 4 квартири у Вінниці (район Корея), вид на озеро, 7 хв до центру.
Onlyness: єдиний дім у місті, де лише 4 квартири. Емоція бренду: спокій добірності, кінець компромісу
між тісною квартирою і далеким заміським будинком. Архетип: Ruler + Caregiver.
Аудиторія: дорослі покупці, що вже мають житло в бізнес-ЖК і хочуть приватності без заміського клопоту.
Мова сайту: українська + англійська (i18n, перемикач UK/EN).

## СТЕК (не відхилятись без явного дозволу)
- Next.js 15 App Router, TypeScript
- Lenis (smooth scroll) синхронізований з GSAP ScrollTrigger
- GSAP + ScrollTrigger + SplitText
- Three.js / React-Three-Fiber + @react-three/drei
- @react-three/postprocessing (Noise, Vignette, Bloom — обережно)
- Tailwind + CSS variables (теми UK/EN, light hero / dark sections) + GLSL шейдери
- next/font (display-шрифт, НЕ Inter), next-intl або власний i18n
- Vercel деплой

## АРХІТЕКТУРА
- `app/[locale]/` — роути з локалізацією, SSR shell
- `components/sections/` — одна секція = один компонент (Hero, Concept, Architecture, Courtyard, Roof, Specs, CTA)
- `components/three/` — R3F сцени, HeroSequence, матеріали, шейдери
- `components/ui/` — кнопки, курсор, лоадер, перемикач мови
- `lib/` — lenis-setup, gsap-setup, hooks (useScrollProgress, useReducedMotion)
- `messages/` — uk.json, en.json (увесь копірайт; нічого хардкодом у компонентах)
- `public/frames/hero/desktop/` — 0001..0145.webp (16:9, 1920w)
- `public/frames/hero/mobile/` — 0001..0145.webp (9:16, 1080w)
- `public/videos/` — вихідні рендери (hero-desktop.mp4 16:9, hero-mobile.mp4 9:16)
- `public/renders/` — статичні рендери для секцій (див. ТЗ, точні імена)
- `shaders/` — .glsl файли

## ЗАЛІЗНІ ПРАВИЛА АНІМАЦІЇ
1. Максимум 1 "героїчний" момент на секцію. Решта — стримана підтримка.
2. Easing: НІКОЛИ linear для UI. Дефолт power3.out / expo.out.
3. **Reveal-темп luxury: 1.5–3s** (урок ERA — розкіш не поспішає). Це НЕ дефолтні 0.9s.
4. Lenis lerp 0.1. Без "гумовості".
5. GSAP у React ТІЛЬКИ через useGSAP / gsap.context з cleanup (нуль memory leaks).
6. ScrollTrigger: pin/scrub для hero та архітектури; markers лише в dev.
7. prefers-reduced-motion: завжди fallback (статичний кадр замість послідовності).
8. Текст завжди читабельний поверх WebGL. Контраст > краса.
9. Один persistent canvas (R03-підхід), не десятки окремих.

## PERFORMANCE BUDGET (святий)
- Hero frame-sequence: 145 кадрів, WebP, desktop 1920w / mobile 1080w.
- Preload лише перші ~20 кадрів hero (eager), решта — progressive.
- Lazy-load усе below-the-fold.
- LCP < 2.5s, CLS < 0.1, 60fps desktop / >=40fps mobile mid-tier.
- WebGL hero desktop-only; mobile може лишитись на легшому canvas-2D scrub або <picture> fallback.
- Тестувати на throttled CPU 4x + mobile viewport.

## ТИПОГРАФІКА / КОЛІР
- Display font: distinctive serif або high-contrast grotesk (НЕ Inter/Roboto/Arial/Space Grotesk).
  Напрямок: стримана елегантність (наприклад, контрастна антиква для заголовків + чистий гротеск для тексту).
- Палітра з рендерів: тепло-біла будівля, антрацит/графіт, тепле світло вікон (~2700K), глибокий синій вечір.
  Hero day→night міняє тему сторінки зі світлої на темну.
- Атмосфера: легкий film grain + vignette на hero (R05), не плоскі заливки.

## КОПІРАЙТ (НЕ ЧІПАТИ без узгодження)
Увесь текст — у messages/uk.json та en.json, фінальний, написаний за anti-slop фреймворком.
Заборонено: рубані фрази-парцеляції, тире замість дієслів, "оживає", "камерний", кальки, маркетинг-кліше.
Якщо треба новий текст — НЕ генеруй сам, постав питання користувачу.

## ПРОЦЕС
brainstorm → design spec → план (2–5 хв задачі) → виконання →
self-review (design-review, оцінка 0–10, anti-slop детектор) → Playwright перевірка (скрол-скріни) → merge.
Кожна секція будується окремо за відповідним recipe (R01/R04/R05/R11/R23) — див. ТЗ.
