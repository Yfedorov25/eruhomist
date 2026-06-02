# UPGRADE_TO_ERA — Глибокі промпти для Claude Code

> Сайт уже піднятий, але закриває <25% того, що робить era.estate award-рівнем.
> Це НЕ «зроби краще» — це конкретні інженерні завдання під кожну ERA-механіку, якої бракує.
> Виконувати по фазах. Після КОЖНОЇ фази — стоп, design-review (anti-slop) ≥8/10, показ.
>
> ДІАГНОЗ v1 (чому «легко»):
>  - hero = пласке відео-скраб замість depth-parallax шарів
>  - секції = прості fade-in замість багатошарового parallax + sticky reveal
>  - немає 3D-карти району (killer feature нерухомості)
>  - немає persistent canvas (кожна секція окремо, без наскрізності)
>  - reveal-темп швидкий (0.9s) замість luxury 1.5–3s
>  - немає кінематографічного preloader

═══════════════════════════════════════════════════════════════════════
ФАЗА 0 — АУДИТ ПОТОЧНОГО КОДУ (перед будь-якими змінами)
═══════════════════════════════════════════════════════════════════════
```
Прочитай CLAUDE.md, TZ_HERO_DEPTH_v2.md, teardowns/ERA_real-estate.md, recipes/R01,R03,R04,R06,R10,R11.

Зроби аудит поточного сайту QUADRO і напиши ARCHITECTURE_AUDIT.md:
1. Перелік усіх секцій з тим, яка зараз анімація в кожній (fade? parallax? scrub?).
2. Як зараз влаштований скрол (Lenis є? GSAP ScrollTrigger? один canvas чи багато?).
3. Reveal-тайминги по секціях (виміряй фактичні durations).
4. Чи є WebGL взагалі, чи все DOM.
5. Performance baseline: виміряй LCP, CLS, fps на скролі (Playwright + Chrome trace).
6. Для КОЖНОЇ секції — мапінг на потрібний ERA-recipe (R01/R03/R04/R06/R10/R11) і
   що конкретно треба додати, щоб дотягнути до ERA.

НЕ міняй код. Тільки аудит. Поверни ARCHITECTURE_AUDIT.md + baseline-метрики.
Це наша точка відліку — далі покращення будемо міряти проти неї.
```

═══════════════════════════════════════════════════════════════════════
ФАЗА 1 — ПІДГОТОВКА ДО DEPTH (Дорога A — БЕЗ важкого persistent WebGL)
═══════════════════════════════════════════════════════════════════════
> ⚠️ ВАЖЛИВО (з аудиту): full WebGL/R3F тут УЖЕ ПАДАВ чорним екраном на реальному
> залізі й був видалений (commit 5aaaf79, council 4/4). НЕ повертаємо persistent
> R3F canvas на весь сайт. Натомість Дорога A: глибину додаємо ТОЧКОВО, де вона
> дає найбільше враження, на надійній основі.
>
> Аудит показав: scroll-фундамент (Lenis 0.1 + ScrollTrigger, один rAF, чистий teardown),
> темп (1.2–1.8s) і perf (LCP 244ms, CLS 0) — УЖЕ ERA-рівня. НЕ ЧІПАТИ це.
```
Прочитай ARCHITECTURE_AUDIT.md (твій же аудит) і recipes/R06_image-displacement.md.

Фаза 1 = НЕ рефакторинг plumbing (він уже добрий), а ПІДГОТОВКА інфраструктури для depth:
1. НЕ повертай full persistent R3F canvas. Замість цього додай легкий, ІЗОЛЬОВАНИЙ
   WebGL-шар ТІЛЬКИ для hero (окремий <canvas>, mount лише в межах hero-секції,
   з повним fallback-ланцюгом — див. Фазу 2). Якщо він впаде — впаде тільки hero,
   решта сайту жива.
2. Для секцій Суть/Двір/Дах глибину робимо БЕЗ WebGL — через depth-map parallax на
   існуючому DOM (CSS transform по шарах, driven by ScrollTrigger). Це Фаза 4.
3. 3D-карта району (Фаза 5) — окремий ізольований R3F-canvas, теж із fallback;
   падіння карти не валить сайт.
4. Збережи існуючий --scroll-progress на :root і day→night theme tokens — вони вже працюють.
5. Постав WebGL-контекст-гард: при втраті контексту (webglcontextlost) → автоматичний
   перехід на video/static fallback, БЕЗ чорного екрану. Це головний урок попереднього фейлу.

reduced-motion: усе статичне, Lenis off (вже реалізовано — не ламай).
Поверни: план інтеграції depth-шару + context-guard utility. НЕ переписуй scroll-ядро.
Зупинись на оцінку.
```

═══════════════════════════════════════════════════════════════════════
ФАЗА 2 — HERO DEPTH-PARALLAX (заміна плаского відео, R06+R01+R04)
═══════════════════════════════════════════════════════════════════════
> Асети готові в public/: sky_day.png, sky_night.png, building_day_green.png,
> building_night_green.png (будівлі на зеленому ключі #00FF00 для вирізання).
```
КРОК A — підготувати асети (мережа відкрита, став інструменти):
  pip install "rembg[cpu]" transformers torch pillow --break-system-packages
  1. Виріж будівлі по ЗЕЛЕНОМУ ключу (HSV chroma-key, не нейромережа — зелений фон чистий):
     building_day_green.png  → public/assets/building_day.png  (RGBA)
     building_night_green.png→ public/assets/building_night.png (RGBA)
     Зберегти теплі світні вікна нічної версії недоторканими.
  2. Depth-карти (Depth Anything V2 "depth-anything/Depth-Anything-V2-Small-hf")
     з ОРИГІНАЛЬНИХ рендерів render_terasa_01.jpg і 6_34PM.jpg:
     → depth_day.png, depth_night.png (grayscale, близьке=світле, ресайз 1024w).
  Покажи alpha-preview будівель на шахівниці + depth поряд з оригіналами. Стоп на перевірку країв.

КРОК B — зібрати hero (після підтвердження асетів):
  Прочитай TZ_HERO_DEPTH_v2.md, R06_image-displacement.md.
  <HeroDepthParallax/> у persistent canvas (з Фази 1):
  ШАРИ на різних Z: sky(z=-8, швидкість 0.6) / building(z=0, швидкість 1.0 + depth-displacement)
                    / fg(z=+4, швидкість 1.4 — викеїти з building_day_green передній план).
  Building shader: uv += uOffset * texture2D(uDepth,uv).r; uOffset=f(scrollProgress, mouse).
  Day→night: crossfade day↔night (building+sky+depth) по scrollProgress; вікна ночі світяться.
  Тема :root світла→темна. SplitText H1/sub (з uk.json) reveal 1.5–2s, зникає до ночі.
  Lenis+ScrollTrigger pin+scrub. Темп 1.5–3s. Mouse-parallax subtle.
  FALLBACK (пріоритет деградації, ЗБЕРЕГТИ Kling-відео в проєкті):
    1. Потужний desktop → depth-parallax (основний hero).
    2. Mobile / fps<30 → Kling day→night відео (public/videos/hero-desktop.mp4 16:9,
       hero-mobile.mp4 9:16) — autoplay muted loop playsinline. Воно вже фінальне,
       камера нерухома, перехід плавний — кращий fallback за статику.
    3. reduced-motion / no-WebGL → статичний building_day кадр + текст.
    Тобто Kling-відео НЕ видаляти — це перевірений запасний hero і fallback для слабких пристроїв.
    Опційно: це ж відео можна переюзати як «дихаючий» day→night фон у нижній секції (Суть/CTA).
  Ціль LCP<2.5s, 60fps. Playwright скрол-скріни 0/25/50/75/100%. Стоп — оцінка ефекту проти ERA.
```

═══════════════════════════════════════════════════════════════════════
ФАЗА 3 — STICKY WINDOW-REVEAL для архітектури (R11)
═══════════════════════════════════════════════════════════════════════
> ERA: «вікно» розширюється на скролі й розкриває інтер'єр. У нас зараз fade.
```
Прочитай recipes/R11_sticky-window-reveal.md, teardowns/ERA (architecture__window).
Переробити секцію Архітектура:
- sticky-секція (pin), маска clip-path inset(40%)→inset(0%) на scroll (scrub 1)
  + паралельний scale зображення 1.5→1 (наближення камери крізь вікно).
- Всередині вікна — building_night (теплі вікна) АБО інтер'єрний рендер, якщо є.
- Текст H2 «Увечері світло вмикається зсередини» (з uk.json) reveal синхронно з розкриттям.
- Опційно: вікна будівлі по черзі загоряються теплим при скролі (stagger emissive).
reduced-motion → повний кадр без маски; mobile → без pin.
Поверни + Playwright. Стоп — оцінка.
```

═══════════════════════════════════════════════════════════════════════
ФАЗА 4 — БАГАТОШАРОВИЙ PARALLAX секцій Суть/Двір/Дах (R04)
═══════════════════════════════════════════════════════════════════════
> Замінити прості fade-in на parallax глибини, як в ERA.
```
Прочитай recipes/R04_scroll-choreography.md.
Для секцій Суть, Двір, Дах:
- розкласти кожен рендер на 2-3 шари глибини (Depth Anything depth-карта → parallax-зсув,
  АБО передній/задній план вирізати rembg) — шари їдуть з різною швидкістю на скрол.
- crossfade день↔вечір де є нічна версія (Суть: render_05→render_N_02; Двір: render_10→render_N_03).
- reveal-темп 1.5–3s, easing power3.out/expo.out. Один героїчний момент на секцію.
- текст секцій з uk.json, SplitText, синхронно з parallax.
reduced-motion → статика; mobile → легший parallax (тільки yPercent, без depth-shader).
Поверни + Playwright скрол-скріни. Стоп — оцінка.
```

═══════════════════════════════════════════════════════════════════════
ФАЗА 5 — 3D-КАРТА РАЙОНУ (killer feature, R10)
═══════════════════════════════════════════════════════════════════════
> Дані POI вже зібрані: data/poi-candidates.js (25 реальних об'єктів Вінниці, 8 категорій,
> Apify-скрап). Мапу малює Nano (PROMPTS_PIPELINE.md крок 6).
```
КРОК 0 (ОБОВ'ЯЗКОВА ЗУПИНКА перед побудовою карти):
  Прочитай data/poi-candidates.js — там 25 точок з категоріями, координатами, рейтингами.
  НЕ обирай точки сам. Виведи список і ЗУПИНИСЬ — користувач повернеться й обере,
  які ~10-12 точок показати на карті + які категорії лишити у фільтрі.
  Чекай рішення користувача. Тільки після нього — будуй data/poi.js (фінальний підмножина).

КРОК 1 (після вибору точок):
  Прочитай recipes/R10_3d-district-map.md, teardowns/ERA (/3d-map).
  Текстура мапи: public/assets/district_map.webp (Nano top-down).
  Побудуй <DistrictMap/> (R3F+drei, ІЗОЛЬОВАНИЙ canvas з fallback) Lite-режим за скелетом R10:
  - площина district_map + підсвічений бокс QUADRO у центрі (emissive теракота).
  - POI-маркери: пульсуюче emissive-кільце + назва/відстань як Html-label.
  - ФІЛЬТР КАТЕГОРІЙ (кнопки 💧🌳🍽🏋🛍🎓☕🧸) — вмикають/вимикають групи маркерів.
  - клік → GSAP flyTo камери (1.2s power3.out) + HTML-модалка (фото+відстань+рейтинг+наратив, dim-фон).
  - OrbitControls: enablePan=false, damping 0.08, polar обмежений, min/maxDistance 18/45.
  - компас (стрілка=-azimuthalAngle), зворотний preloader 100→0 (роллер цифр translateY).
  - position[x,0,z] маркерів рахуй з (lat-QUADRO.lat),(lng-QUADRO.lng) × масштаб.
  - mobile/reduced-motion → статична 2D-карта з HTML-маркерами без WebGL.
  - context-guard (з Фази 1): втрата WebGL → fallback на 2D-карту, без чорного екрану.
  - next/image WebP для POI-фото. 60fps desktop.
  Поверни + Playwright (клік маркер→модалка, фільтр категорій). Стоп — оцінка.
```

═══════════════════════════════════════════════════════════════════════
ФАЗА 6 — КІНЕМАТОГРАФІЧНИЙ PRELOADER + ПОЛІРування
═══════════════════════════════════════════════════════════════════════
```
- Splash-preloader на головній: повільний reveal лого/назви QUADRO + лічильник,
  поки вантажиться hero (перші day-шари). Зникає elegant fade коли LCP готовий.
- Глобальний кастомний курсор (R02) — опційно, якщо пасує.
- Пройтись по ВСІХ секціях: easing power3.out, темп 1.5–3s, нуль linear на UI.
- Грейн+віньєтка на hero (R05), щоб не було плоских заливок.
- Фінальний QA: LCP<2.5s, CLS<0.1, 60fps desktop / ≥40 mobile.
  Playwright повний прохід + порівняти з baseline з ARCHITECTURE_AUDIT.md.
- /design-review (anti-slop) кожної секції, ціль ≥8/10. Нижче 8 — переробити.
```

═══════════════════════════════════════════════════════════════════════
ПОРЯДОК: 0(аудит) → 1(canvas) → 2(hero) → 3(архітектура) → 4(parallax) → 5(карта) → 6(поліш).
Після кожної фази — стоп + показ. НЕ робити все одним заходом.
Головна метрика успіху: side-by-side з era.estate — темп, глибина, відчуття «$10k+».
