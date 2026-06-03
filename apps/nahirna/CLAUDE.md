# CLAUDE.md — «Дім на Нагірній» (cinematic real-estate, single villa)

> Цей файл — головне джерело правди для Claude Code. Прочитай його ПОВНІСТю перед будь-яким кодом.
> Поряд лежать ТЗ по секціях (`/specs/`), копірайт (`/content/COPY_nahirna.md`) та медіа (`/public/`).

---

## РОЛЬ
Ти — senior++ motion web designer & creative developer рівня Lusion / Active Theory / Immersive Garden.
Мета: кінематографічний scroll-driven односторінковий лендинг (Tier 3) для продажу приватної вілли
на березі Південного Бугу, що викликає відчуття вартості та ексклюзивності. Ціль сайту — **дзвінки/заявки**.
«AI-slop» заборонено. Кожна анімація або кінематографічна й працює на емоцію «власний берег», або видаляється.

Тип проєкту за діагностикою ScrollCraft: **ЕМОЦІЙНИЙ** (нерухомість, люкс, рідкісна дорога покупка,
довга воронка). → cinematic на повну, scroll-сторітелінг доречний, АЛЕ не коштом читабельності й швидкості.

---

## ПРО ОБ'ЄКТ (реальні факти — не вигадувати, не міняти)
- Приватний одноповерховий будинок, **150 м²**, вул. Нагірна, Вінниця.
- Ціна: **$270 000** (показуємо відкрито).
- Ділянка 10 соток + ~4 сотки приватного берега Південного Бугу. Глухий кут, без сусідів.
- Планування: майстер-спальня 16.65 м² (ensuite + гардероб), 2 спальні (14.43, 13.41 м²),
  центральний гардероб + санвузол, кухня-вітальня 45 м² з виходом на терасу 29.83 м² до води,
  навіс для авто 36.92 м².
- Архітектурне ДНА (КРИТИЧНО для консистентності візуалу):
  - темна шоколадна клінкерна цегла `#2C2622`;
  - колони: **темна цегла (шахта) + білий камінь лише база і капітель** (НЕ суцільно білі колони);
  - темно-олівковий/графітовий глазурований шатровий дах, глибокі звиси;
  - панорамне скління, тюль; 2 димарі з білими каповими завершеннями; підсвітка карнизів;
  - чорний BMW, кулі-самшити, світло-сіра кам'яна бруківка.

---

## СТЕК (не відхилятись без явного дозволу)
- **Next.js 15** App Router, TypeScript — SSR-shell, SEO (лідген), оптимізація зображень.
- **Lenis** (smooth scroll) синхронізований з GSAP ScrollTrigger.
- **GSAP** + ScrollTrigger + SplitText.
- **Tailwind** + CSS variables (дизайн-токени нижче).
- **next/image** (WebP), **next/font**.
- Three.js / R3F — **НЕ потрібен** для цього проєкту (немає 3D-моделі; «тур» = frame-sequence з відео).
  Не додавати WebGL без явного дозволу — він тут не потрібен і лише дренує performance.

---

## АРХІТЕКТУРА ФАЙЛІВ
- `app/` — єдиний роут (лендинг), SSR shell, metadata/OG, JSON-LD (RealEstateListing).
- `components/sections/` — одна секція = один компонент (00..09 нижче).
- `components/ui/` — кнопки, кастомний курсор, magnetic CTA, прелоадер, count-up.
- `lib/` — lenis-setup, gsap-setup, hooks (useScrollProgress, useMagnetic, useReducedMotion).
- `public/frames/` — WebP frame-sequences туру (desktop/mobile) — генерує FFmpeg-пайплайн.
- `public/videos/` — вихідні Kling-кліпи (master, до нарізки).
- `public/images/` — hero day/night (desktop+mobile), інтер'єри, екстер'єри.
- `content/COPY_nahirna.md` — увесь текст (брати звідти, не писати lorem).
- `specs/` — ТЗ по секціях.
- `scripts/build-frames.sh` — FFmpeg-пайплайн відео → WebP-кадри (нижче).

---

## ДИЗАЙН-ТОКЕНИ (CSS variables)
```css
:root {
  /* база / ніч */
  --color-night: #0F0F0E;
  --color-brick: #2C2622;     /* шоколадна клінкерна цегла */
  --color-roof: #4F5048;      /* олівково-графітовий дах */
  --color-warm: #E8C9A0;      /* тепле світло вікон / золота година */
  --color-plaster: #EDEAE3;   /* світла штукатурка / тиньк */
  --color-text: #EDEAE3;
  --color-text-muted: #9B978F;
  --color-accent: #E8C9A0;    /* акцент — тепле золото, стримано */
}
```
- **Display-шрифт:** серіф із характером — PT Serif або Lora (НЕ Inter/Roboto/Arial/Space Grotesk).
- **Body-шрифт:** український sans — e-Ukraine або Inter (підтримка кирилиці обов'язкова).
- Тема темна (ніч/шоколад) з теплими золотими акцентами. Атмосфера: тонкий grain/noise, не плоскі заливки.
- Контраст тексту поверх медіа — святий. Тінь/підложка під текстом, де треба.

---

## MOTION-МОВА (luxury real-estate темп — урок ERA)
1. Reveal повільні: **1.5–2.5s** (luxury темп, не 0.9s). Один «героїчний» момент на секцію.
2. Easing: НІКОЛИ linear для UI. Дефолт **power3.out / expo.out**. Settle — power4.out.
3. **Lenis lerp 0.08** (повільно, без «гумовості»).
4. GSAP у React — ТІЛЬКИ через `useGSAP` / `gsap.context` з cleanup (нуль memory leaks).
5. ScrollTrigger: pin/scrub для сторі-секцій (water-story, walkthrough); markers лише в dev.
6. **prefers-reduced-motion: завжди fallback** (статичний кадр замість послідовності/відео).
7. Текст завжди читабельний поверх медіа. Контраст > краса.

---

## СТРУКТУРА САЙТУ (9 секцій — кожна має окреме ТЗ у /specs/)
| # | Секція | Ефект (recipe) | Ризик |
|---|---|---|---|
| 00 | Hero day→night | crossfade двох кадрів на scroll-scrub (canvas/CSS) | 🟡 wow |
| 01 | Вода / «Власний берег» | pinned scroll-story | 🟡 wow |
| 02 | Архітектура крізь скло | sticky window-reveal | 🟡 wow |
| 03 | Простір (кухня-вітальня 45м²) | hover-галерея, stagger | 🟢 |
| 04 | Інтерактивний план | clickable floor plan | 🟢 |
| 05 | Прохід будинком (тур) | frame-sequence overlay, scroll-scrub | 🟡 |
| 06 | Локація / мапа POI | мапа з точками | 🟢 |
| 07 | Факти + статус | count-up | 🟢 |
| 08 | CTA — дзвінок | magnetic button | 🟢 |
| 09 | Футер з ціною | reveal | 🟢 |

---

## ТУР (секція 05) — як збирати з наших медіа
Тур = **3 cinematic-сцени + 2 крос-фейди** (НЕ суцільний проліт крізь дім — так надійніше й преміальніше).
Вихідні Kling-кліпи лежать у `/public/videos/tour/`:
- `scene1_arrival.mp4` — прихід: двір → ганок → поріг (склеєні 2 кліпи B1→B2, B2→B3).
- `scene2_living.mp4` — серце дому: повільний наїзд у вітальні до панорамних вікон/води.
- `scene3_water.mp4` — вихід до води: тераса → берег, золота година.

**Збірка (твоє завдання, Claude Code):**
1. FFmpeg склеює 3 сцени з 2 крос-фейдами (~0.8s xfade між сценами) у `tour_master.mp4`.
2. FFmpeg ріже `tour_master.mp4` у WebP-кадри:
   - desktop: ширина 1920, ~30fps → `/public/frames/tour/desktop/0001..NNNN.webp`
   - mobile: ширина 1080, ~30fps → `/public/frames/tour/mobile/`
   - ціль ~150–180 кадрів сумарно (підрахуй, за потреби прорідь).
3. Секція 05 — fullscreen **overlay** (не окрема сторінка), що відкривається кнопкою «Пройтись будинком».
4. Кадр ← ScrollTrigger progress (scrub). Скрол униз = вперед, угору = реверс. Lenis синхронізований.
5. Preload перших ~20 кадрів eager, решта progressive/lazy.
6. reduced-motion → показати статичний перший кадр + кнопку закрити (без scrub).

Скрипт-пайплайн поклади в `scripts/build-frames.sh` (FFmpeg → WebP, desktop+mobile).

---

## HERO (секція 00) — day→night
- Два кадри: `/public/images/hero-day-desktop.webp` та `hero-night-desktop.webp` (+ mobile 9:16 версії).
- На scroll-scrub: crossfade день→ніч (canvas drawImage з opacity, або 2 layered img з GSAP opacity на scrub).
- Текстові глави fade-in поверх (з ТЗ 00). H1: «Прокидатися від води, не від сусідів».
- reduced-motion → статичний день-кадр.
- Це LCP-критична секція: day-кадр preload, оптимізований WebP, SSR.

---

## PERFORMANCE BUDGET (святий)
- **LCP < 2.5s, INP < 200ms, CLS < 0.1.** 60fps на скролі (desktop), >=40fps mobile mid-tier.
- Hero day-кадр — eager preload; усе below-the-fold — lazy.
- Tour: preload лише ~20 перших кадрів; решта progressive.
- Зображення: WebP, desktop 1920w / mobile 1080w. `next/image` зі `sizes`.
- Тільки GPU-властивості в анімаціях (transform/opacity). Жодного layout-трешингу.
- Тестувати на throttled CPU 4x + mobile viewport (Playwright/Lighthouse).
- Тільки 42–53% сайтів проходять CWV — це наша конкурентна перевага, не жертвуй нею заради «вау».

---

## SEO / ЛІДГЕН (це сайт для продажу — критично)
- SSR критичного HTML (H1, ціна, контакти, адреса доступні без JS).
- Metadata + OpenGraph (hero-night як OG-зображення).
- JSON-LD schema `RealEstateListing` / `Residence`: ціна, площа, адреса, фото.
- Семантичні теги, alt на всіх зображеннях (укр.), heading-ієрархія.
- Телефон — клікабельний `tel:` скрізь. Головна мікроконверсія — дзвінок.

---

## АНАЛІТИКА (з день 1)
- GA4 + Microsoft Clarity.
- Три події мінімум: кліки по телефону/CTA, `form_submit`, `scroll_90`.
- Зафіксувати baseline перед запуском.

---

## ДОСТУПНІСТЬ / FALLBACK
- `prefers-reduced-motion` скрізь: статичні кадри замість scrub/відео.
- Mobile: легші кадри (1080w), вимкнути grain-шейдер, коротший tour-набір.
- Клавіатурна навігація, focus-стани, контраст AA для тексту.
- Сайт мусить лишатись інформативним і без JS (SSR-контент).

---

## МОВА / КОПІРАЙТ
- Українська, шанобливе «Ви». Тон — Творець/Спадщина (luxury, спокій, гідність).
- Увесь текст брати з `content/COPY_nahirna.md`. Жодного lorem ipsum чи AI-кліше у фінальному білді.
- Концепт-слово: **«Власний берег»**. H1 hero: «Прокидатися від води, не від сусідів».

---

## ПРОЦЕС (Superpowers / gstack-style)
brainstorm → design spec → план (2–5 хв задачі, точні шляхи файлів) → виконання →
self-review (design-review, AI-slop детектор, оцінка 0–10) → Playwright перевірка → merge.
Перед кодом — завжди план з точними шляхами. Секції будувати по черзі за їх ТЗ у `/specs/`.

---

## ЗАБОРОНЕНО
- Generic AI-естетика (purple gradient, центрований hero «по дефолту», Inter/Space Grotesk).
- Анімувати все одночасно. Linear UI easing. Скрол без Lenis.
- WebGL/Three.js без явного дозволу (тут не потрібен).
- Залишати GSAP без cleanup. Важкі ефекти без mobile/reduced-motion фолбеку.
- Lorem ipsum або вигадані факти про будинок. Міняти ціну/площу/адресу.
- Робити колони суцільно білими (вони цегляні з білими базою/капітеллю).
- Жертвувати LCP/SEO заради анімації (це лідген-сайт).
