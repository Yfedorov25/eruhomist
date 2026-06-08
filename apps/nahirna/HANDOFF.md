# HANDOFF — «Дім на Нагірній» award-переробка (для нового чату)

> Передаю весь контекст. Прочитай ЦЕЙ файл повністю + memory-файли (нижче) перед роботою.
> Дата хендофу: 2026-06-07. Ти — оркестратор award-переробки цього cinematic real-estate лендингу.

---

## 0) ХТО ТИ / ЦІЛЬ
Senior++ creative dev/motion-designer рівня Lusion / Active Theory / Vide Infra. Перетворюєш лендинг villa
з «junior+» на **award-winning cinematic** (Awwwards-tier), зберігаючи перф і чесність. Ціль сайту — **дзвінки/заявки**.
Працюєш ітеративно: показуєш прототип/результат → чекаєш «ок» користувача → деплоїш. Користувач — ВІЗУАЛ,
любить БАЧИТИ (прототипи в браузері, скріни в Downloads), не описи.

## 1) ПРО ОБ'ЄКТ (факти — не міняти, не вигадувати)
Приватна вілла, **150 м²**, вул. Нагірна, Вінниця. **Ціна $300 000** (memory `nahirna-price-300k`;
`lib/site.ts priceUsd:300000` правильно; у `apps/nahirna/CLAUDE.md` стоїть стале $270k — ІГНОРУЙ, $300k).
Ділянка 10 соток + **~4 сотки приватного берега Південного Бугу**, глухий кут, без сусідів, один поверх.
Кімнати (реальні м², для 3D-плану): кухня-вітальня **45**, тераса **29.83**, навіс **36.92**, коридор 17.53,
майстер-спальня **16.65** (ensuite+гардероб), спальня 14.43, кімната 13.41, гардероб-центр 9.36, ганок 9.02,
прихожа 6.21, топкова 6.15, санвузол 6.09, санвузол-майстер 5.82, гардероб-майстер 5.48.
Архітектура: шоколадна клінкерна цегла #2C2622, колони = цегла + білий камінь (база/капітель, НЕ суцільно білі),
олівковий шатровий дах, панорамне скління, 2 димарі з білими завершеннями, чорний BMW, кулі-самшити.

## 2) ДЕ ЩО ЛЕЖИТЬ
- **Сайт:** `apps/nahirna/` (Next.js 16 + Lenis + GSAP + Tailwind v4). LIVE: **https://nahirna.vercel.app**
- **Award-база (джерело правди дизайну):** `references/websites-award/` (109 файлів ScrollCraft PRO) +
  `references/README_ORCHESTRATOR.md` (точка входу). Ключове: `analyzers/A1_award_criteria.md` (50 критеріїв),
  `library/playbooks/`, `teardowns_reference/`. **Звіряйся з A1 на КОЖНІЙ збірці (ціль 45+/50).**
- **Memory (читається щосесії, коротко):** `award-system-scrollcraft`, `award-digest-blocks`,
  `award-re-teardowns`, `higgsfield-i2v-craft`, `media-review-workflow`, `nahirna-villa-build`, `nahirna-price-300k`.
- **Прототипи (gitignored, локально):** `apps/nahirna/prototypes/` (proto-A..E, proto-loc-*, proto-polish-compare, font-tests).
- **Живі кліпи (деплояться):** `apps/nahirna/public/video/living/web/*.mp4` + `*-poster.webp/png` (~12MB).
- **Згенеровані результати + референси для перевірки:** `~/Downloads/` (nahirna-*, SEC06-*, QA-*).

## 3) ІНСТРУМЕНТИ (як користуватись + підводні камені)
- **Higgsfield MCP** (`mcp__claude_ai_Higgsfield__*`) — Ultra-план, акаунт `3Eb7n1N7HpasLH2x0SnqP5LppNy`
  (кредитів лишилось ~2100, перевір `balance`). Генерація медіа.
  - **i2v (оживлення реального стілу):** модель `veo3_1` (Veo 3.1, макс 8с), `quality:"high"`, `16:9`.
    Для ДОВШОГО (10-15с) → `kling3_0`. Зображення → `nano_banana_pro`.
  - **Flow:** `media_upload {filename,content_type:"image/webp"}` → `curl -X PUT --data-binary @file '<upload_url>'`
    (HTTP 200) → `media_confirm {media_id,type:"image"}` → `generate_video {medias:[{role:"start_image",value:"<id>"}]}`.
    Можна i2v напряму з job_id зображення. `get_cost:true` = безкоштовний preflight. Ігноруй `preset_recommendation`
    → ретрай з `declined_preset_id`. Поллити `job_status {sync:true}`.
  - **⚠️ Уроки (memory `higgsfield-i2v-craft`):** (1) рух камери має бути ПОЯСНЮВАНИЙ кадром — аеро-кран на
    фронтальному фото → галюцинує об'єкти. Тримай рух У МЕЖАХ кадру (dolly-in) + анти-морф guard у промпті
    («nothing new appears, no morphing, geometry stays identical»). (2) Хвостовий артефакт: 8с дрейфує в останні
    1-2с → роби 6с або обріж `ffmpeg -t 6`. (3) Рух тканини в інтер'єрі = кріпово (привид) → інтер'єр ЗАСТИГЛИЙ,
    рух лише камера + вода за вікном.
- **Blender MCP** (`mcp__blender__*`) — підключений. `execute_blender_code`, `get_viewport_screenshot`,
  `get_scene_info`, render через bpy. **NO live WebGL на сайті** — Blender рендерить у VIDEO/кадри (як тур).
  ⚠️ Стилізований 3D-РЕЛЬЄФ виходить мутним (V4 програв) — НЕ варто. 3D-ПЛАН будинку (dollhouse) = варто.
  Сцени що вже є: `NahirnaMap`, `V4Terrain` (чорнові, можна видалити).
- **Браузер:** користувач ЗАБОРОНИВ Playwright/design-engineer. Використовуй:
  - **gstack `/browse`** для ВІЗУАЛЬНОГО QA (скріни): бінарник `~/.claude/skills/gstack/browse/dist/browse`.
    Скрін зберігати ТІЛЬКИ в `/private/tmp` або `apps/nahirna/`. Cinematic-сайт: full-page знімає порожній
    старт → метод `viewport → goto → wait --load → js scrollTo/scrollIntoView → screenshot --viewport`.
    Для scrub-станів (Lenis) full-page/scrollTo не рухає Lenis → виставляй `window.lenis` глобально в прототипі
    і скроль через `window.lenis.scrollTo(y,{immediate:true})`.
  - **BrowserMCP** (`mcp__browsermcp__*`, керує РЕАЛЬНИМ Chrome) — `browser_snapshot` дає відмінний DOM;
    `browser_screenshot` ПАДАЄ (GPU image-readback на цьому Mac). Тож DOM — BrowserMCP, скріни — /browse.
- **Деплой (Vercel):** `cd apps/nahirna && ../quadro/node_modules/.bin/vercel --prod --yes --cwd .`
  (у nahirna нема свого vercel-бінарника — позичаємо quadro). Проєкт `nahirna`, `.vercel/project.json`
  prj_TaH2h0duNg2wn0XNIe3Ed7bvJwjW, team team_ZdnkDXRFpJxY6Vr0ISzaUT67. Деплой іде з робочої теки (НЕ git).
- **Білд/типчек локально:** `./node_modules/.bin/tsc --noEmit -p tsconfig.json` + `./node_modules/.bin/next build`.

## 4) ЩО ВЖЕ ЗРОБЛЕНО + LIVE (award-переробка, усе CLS 0, 0 помилок)
1. **Living video по хребту** (Higgsfield Veo i2v з РЕАЛЬНИХ стілів — не CGI): §00 hero день→ніч,
   §01 water sentence-story, §03 кухня (картка-клік), §03b вогнище-ніч, §08 CTA нічний фінал.
   Web-кліпи 1280w в `public/video/living/web/`. Mobile/reduced = стіли (0 відео грає).
2. **Award-типографіка:** display → **Cormorant Garamond** (кирилиця підтверджена), монументальний hero
   (clamp→7rem, lh0.94). Easing-токени + alpha-шкала в `app/globals.css`.
3. **§06 ЛОКАЦІЯ = «аеро-спуск»** (користувач обрав з 4 варіантів; V4 Blender-рельєф програв). Фон =
   Higgsfield аеро-спуск-відео (`web/aerial-descent.mp4`, постер `web/aerial-river.png`). **Механіка
   збережена 1-в-1 (користувач любить):** зліва копія+відстані ТЬМЯНІЄ, справа count-down→0 «хвилин до
   власного берега» + CTA. Відео грає на місці (БЕЗ scrub, БЕЗ scale → не рецедить на скролі).
Змінені файли: `app/layout.tsx` (шрифт), `app/globals.css` (токени), `components/sections/00-Hero.tsx`,
`01-Water.tsx`, `03-Space.tsx`, `03b-Landscape.tsx`, `06-Location.tsx`, `08-CTA.tsx`,
`components/ui/GalleryCard.tsx`. **Гілка `feat/nahirna-house` НЕ закомічена** (деплой прямий через Vercel CLI;
комітити лише на запит користувача).

## 5) ПРАВИЛА (жорсткі)
- **NO WebGL/Three.js на сайті** (перф + не треба). Blender/3D → рендер у відео/кадри.
- **Перф святий:** LCP<2.5s, CLS<0.1 (зараз 0), 60fps. Відео = lazy, mobile = стіли. Перевіряй CLS після змін.
- **Анти-слоп копірайт** (memory: 0 em-dash у фінальному копі англ.-стиль, але укр. тире легітимне; тести Федоріва).
- **СТАНДАРТНЕ ПРАВИЛО (memory `media-review-workflow`):** щоразу після генерації медіа — клади В DOWNLOADS
  І результат, І референс, та `open` обидва (користувач звіряє вручну).
- **Gitignore:** `public/video/living/web/` деплоїться; великі root-кліпи + `prototypes/` gitignored.
- **Звіряй кожну збірку з A1 (50 критеріїв), ціль 45+/50.** Cormorant-display + Inter-body — не міняти без причини.

## 6) НАСТУПНИЙ КРОК (що користувач замовив) — STEP 3: Blender 3D-ПЛАН будинку (dollhouse)
Точний **3D-план з реальних метрів** (див. §1 кімнати). Аксонометрія згори, дах піднімається, кімнати
підсвічуються, видно як 45м² кухні-вітальні перетікає на терасу 29.83 до води. Рендер у Blender → відео/кадри
(NO live WebGL) → замінить плаский PNG-план у `components/sections/04-Floorplan.tsx`.
**План:** (1) точне блокування кімнат за метрами (масштаб м→Blender units), правильна суміжність (кухня-вітальня
відкрита на терасу; майстер з ensuite+гардероб); (2) матеріали (шоколад/тепле дерево/скло); (3) аксо-камера +
golden-hour підсвітка; (4) анімація (дах злітає / кімнати підсвічуються по черзі) → рендер кадрів; (5) вшити як
scroll-scrub frame-sequence або відео в §04. Перевірка viewport-скріном на КОЖНОМУ етапі (Blender блокаут раніше
виходив абстрактним — потрібні чисті форми + чисте світло + аксо-ракурс, не перспектива-каша).
Користувач чекає «давай» щоб стартувати глибоко.

## 7) ВІДКЛАДЕНЕ (дані власника — потім, користувач сказав «це наступний етап, цього нема»)
Реальний телефон + Viber/Telegram (форма зараз чесний fallback «Замовити дзвінок» бо `CONTACT.phoneTel` порожній +
TELEGRAM env не виставлені на Vercel nahirna), GA4/Clarity ID, кадастровий номер, ім'я власника (`CONTACT.ownerName`),
рік завершення. Усе TODO_CLIENT у `lib/site.ts`, показано чесно. НЕ вигадувати.

## 8) ДЕ ВЗЯТИ ДЕТАЛІ
Точні числа (easing, clamp, scroll-smoothness, 8 флагман-ефектів, P_realestate) — memory `award-digest-blocks`.
Що читається «дорого» в RE — `award-re-teardowns`. Higgsfield-крафт — `higgsfield-i2v-craft`. Повний журнал
проєкту — `nahirna-villa-build`. Award-метод + 50 критеріїв — `award-system-scrollcraft` + `references/websites-award/`.
