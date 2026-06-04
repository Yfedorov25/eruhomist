# CONSISTENCY BIBLE + SHOPPING-LIST — «Дім на Нагірній»
## Пакет оркестратора генерації асетів (Nano Banana Pro / Seedance 2.0 через Higgsfield)

> Джерело правди для КОЖНОЇ генерації. Villa-identity sheet нижче додається ДОСЛІВНО до кожного
> промпту. Перед будь-яким батчем — людина затверджує. Master gate (де-ризик) — ПЕРШИЙ.
>
> Перевірено по 14 реальних рендерах (бачені наживо 2026-06-04). Ціна об'єкта: **$300 000**.
> **Будинок продається БЕЗ ремонту — інтер'єри = візуалізація потенціалу (disclosure обов'язковий).**

---

## 🔧 ОБРАНІ ІНСТРУМЕНТИ (з дослідження Higgsfield-конектора)

**Зображення (нічні pin, карта-арт): `nano_banana_pro`**
- Чому: image-to-image reference, photoreal, ultimate quality. На угоді $300k якість критична.
- **Резолюція: ЗАВЖДИ 2K** (рішення власника: 2K анлімітед, нуль витрат → генеруємо скільки треба).
- Reference: подаємо реальний рендер у `medias` з role `image`.
- aspect_ratio: `16:9` для де-ризику (піксель-у-піксель порівняння з оригіналом); `21:9` лише
  для фінального hero-кропу.

**Відео (тур, інтерполяція): `seedance_2_0`** (НЕ Kling — обґрунтування нижче)
- Чому переб'є Kling: ролі `start_image` + `end_image` + окремий `image` reference, теги
  `reference/identity/consistent`. Створений саме під «об'єкт не пливе» — головний критерій ради.
- **Резолюція відео: 1K / 1080p** (рішення власника). mode `std`. genre `auto` або `drama`.
- Kling 3.0 — резерв, якщо Seedance дрифтить на конкретному шоті.

**Чому НЕ повний прохід одним кліпом:** дрифт. Тільки дискретні locked-шоти + різ між ними.

---

## 📐 VILLA IDENTITY SHEET (англ., вставляти ДОСЛІВНО в кожен промпт)

```
SUBJECT LOCK — the exact same one-storey villa in every frame:
One-storey villa. Dark chocolate-brown clinker brick (#2C2622), textured, matte.
Columns: brick shaft with WHITE STONE base and capital ONLY — NOT solid white columns.
Roof: dark olive-black glazed ceramic hip roof, deep overhanging eaves.
Two chimneys, dark brick with white stone caps.
Panoramic floor-to-ceiling glazing, black frames, white sheer curtains inside.
Cornice LED lighting under eaves (warm) — visible at night.
Black BMW coupe under the carport. Boxwood spheres on lawn. Light-grey stone paving.
Interior (visible through glass): black kitchen island, warm oak wood floor, beige sofa,
walnut dining table. Warm 2700K interior light.
Mood: cinematic, photoreal, calm, expensive, restrained. Chocolate-night palette.
NOT bright, NOT saturated, NOT generic-modern, NOT white-rendered. Keep camera and geometry
identical to the reference image.
```

**Палітра-якорі:** brick `#2C2622` · ніч-небо deep blue · золото-акцент `#E8C9A0` стримане ·
інтер'єр 2700K · НІКОЛИ неон, НІКОЛИ перенасичення.

---

## 🌙 NIGHT-CONVERSION RECIPE (денний рендер → ніч, через nano_banana_pro)

Подаємо денний рендер як `image` reference. Промпт-каркас:
```
[VILLA IDENTITY SHEET]
Convert this exact scene to NIGHT. Keep the building, materials, furniture, camera angle,
and composition 100% identical to the reference. Change ONLY the lighting and sky:
deep blue night sky with subtle stars, warm 2700K light glowing from every window,
warm cornice LED under the eaves, soft warm path lights. Water/river becomes dark glass
reflecting the warm window light. Cinematic, calm, expensive, restrained warm gold.
NO new objects, NO moved furniture, NO changed proportions, NO neon, NO daylight.
```
- Negative (якщо модель приймає): `daylight, bright sky, neon, saturated colors, new furniture,
  moved camera, distorted geometry, extra windows, warped brick, people, text, watermark`.
- 2-3 варіації (анлімітед) → обрати найточнішу за rejection-тестом.

---

## ✅ REJECTION-ТЕСТ (брак, якщо ХОЧ ОДНЕ «ні»)
1. Цегла — та сама шоколадна клінкерна (не червона, не сіра, не гладка)?
2. Колони — цегла + БІЛИЙ камінь лише база/капітель (не суцільно білі)?
3. Дах — олівково-чорний шатровий з глибокими звисами (форма та сама)?
4. Камера/ракурс — збігається з reference (не зсунулась)?
5. Пропорції/геометрія — не «попливли», вікон не побільшало?
6. Палітра — шоколад-ніч + стримане золото (не неон, не пересвіт)?
7. Меблі (якщо видно) — ті самі, не переставлені?
→ Будь-яке «ні» = regenerate (до 3 спроб), далі fallback на статичний pin-рендер.

---

## 🎬 SHOPPING-LIST — ТОЧНІ ГЕНЕРАЦІЇ

### 🥇 DE-RISK GATE (ПЕРШЕ, ~$0 image + 1 кліп)
**G0-img · Ніч-з-води (S-D hero pin) — nano_banana_pro 2K, 16:9**
- Reference: `water-finale` (денний, золота година, вид між колонами на Буг).
- Промпт: [IDENTITY SHEET] + [NIGHT RECIPE], додатково:
  `View framed between two dark brick columns looking out over the Southern Bug river at night.
  River is dark glass reflecting warm light. Distant tree line silhouette. Terrace floor in
  foreground. Deep blue starry sky. Calm, expensive, cinematic.`
- Перевірка: rejection-тест + чи тримається ідентичність колон і берега.

**G0-vid · 1 інтерпольований кліп — seedance_2_0 1080p, 16:9, 5s**
- start_image: `water-terrace-golden` → end_image: результат G0-img (ніч-з-води).
- image reference: `water-finale` (для consistency).
- Промпт: повільний рух камери від тераси до води, день→присмерк, `slow cinematic push,
  no warping, locked geometry`. genre `drama`.
- Перевірка: ДРИФТ між кадрами (меблі/колони/пропорції стабільні?) + чистота крос-фейду.

**GATE: тримається → greenlight F1. Пливе → лагодимо рецепт ПЕРЕД масштабом.**

---

### F1 — ТУР (4 locked-шоти, день + ніч, після greenlight)
Кожен: seedance_2_0 1080p, 16:9, 24fps native, ~5s, start+end pin на РЕАЛЬНІ рендери.

| Шот | Рух | start_image → end_image | image-ref | Стан |
|---|---|---|---|---|
| **S-A** | ворота → фасад | `exterior-day-1` → `exterior-terrace-columns` | `hero-day-desktop` | день |
| **S-B** | фасад → тераса | `exterior-terrace-columns` → `terrace` | `terrace` | день |
| **S-C** | тераса → вода | `water-terrace-golden` → `water-finale` | `water-finale` | golden |
| **S-D** | НІЧ-З-ВОДИ (hero/OG) | `water-finale` → G0-img (ніч) | G0-img | НІЧ ⭐ |

- Кожен шот промпт = [IDENTITY SHEET] + опис руху + `slow, cinematic, locked geometry, no warp,
  no morphing, 16:9 throughout`.
- **Ніч-версії S-A/S-B/S-C:** спершу nano_banana_pro нічні pin (день-рендер → ніч за рецептом),
  потім seedance з тими ж камер-keyframes у нічних pin. Claude Code крос-фейдить день↔ніч.
- PERF cap: ≤120 кадрів desktop / ≤96 mobile сумарно. Eager-20 ≤4.5MB. Ніч роздуває → крос-фейд-пари.

---

### F2 — §03 ГАЛЕРЕЯ (0 нових базових генерацій)
- День↔ніч крос-фейд по кліку: фронт `living-day` → клік → `living-evening` (обидва вже Є).
- Екстер'єр-картка: `exterior-day-2` → нічний близнюк (nano_banana_pro з `exterior-night-1`).
- РІВНО ОДИН cinemagraph: тераса-вода (`terrace` / `water-finale`), 4с ping-pong, 1080p, MP4+poster.
  ТІЛЬКИ вода рухається. **empty→furnished dissolve ЗАБОРОНЕНО** (покупець: «розводять»).
- Кожна мебльована картка несе disclosure-рядок.

---

### F3 — КАРТА
- Дефолт (A): лишити стилізовану SVG + посилити overlay (анімований river, золотий край «Ваш
  берег», БІЛЬШЕ орієнтирів). Без растру, без LCP-удару. Робить Claude Code.
- Опція (B), якщо A читається «джуніорно»: ОДИН nano_banana_pro 2K top-down 45° аксонометрія
  ділянки + S-вигин Бугу, та сама вілла, БЕЗ тексту (піни додасть Claude Code SVG).
  Промпт: [IDENTITY SHEET] + `top-down 45-degree axonometric view of the property plot with the
  river curving along one side, flat muted chocolate-night color, no text, no labels`.
- **P0 (головне, БЕЗ AI):** хвилини до центру/школи/садка + приватний/спільний берег + чистота
  річки — від власника. Краса вторинна, ВІДПОВІДІ — головне.

---

## 📝 P0 DISCLOSURE-КОПІ (БЕЗ AI, Claude Code вставляє)

**На КОЖНІЙ візуалізації інтер'єру (ЗУ «Про рекламу» + довіра):**
> Інтер'єри наведені як візуалізація. Будинок передається з чорновим оздобленням — простір,
> який Ви завершуєте під себе.

**Чесний статус (екран фактів/архітектура):**
> Зараз будинок — з чорновим оздобленням усередині. Стіни, дах, фасад, вікна — готові.
> Усередині — Ваш чистий аркуш.

> Чому відкрито (вердикт ради + покупець): відкрите розкриття = aspiration; виявлене самим
> покупцем = брехня й втрата угоди. Чесність = архетип Творець.

---

## 📂 КУДИ КЛАСТИ (для Claude Code)
```
public/frames/tour/day/{S-A,S-B,S-C}/   ← кадри день (FFmpeg з seedance-кліпів)
public/frames/tour/night/{S-A,S-B,S-C,S-D}/  ← кадри ніч
public/images/night-water-hero.webp      ← G0-img (S-D hero + OG)
public/images/exterior-night-gallery.webp
public/video/terrace-cinemagraph.mp4 + poster.webp
public/plan/district-map.svg (A)  або  public/plan/aerial-art.webp (B)
```

---

## 🧾 PROVENANCE-ТАБЛИЦЯ (заповнювати на кожен ассет)
| Ассет | pin-рендер(и) | модель | seed | резол. | дата | спроб |
|---|---|---|---|---|---|---|
| G0-img ніч-вода | water-finale | nano_banana_pro | TBD | 2K 16:9 | | |
| G0-vid тест | water-terrace-golden→G0-img | seedance_2_0 | TBD | 1080p | | |
| S-A день | exterior-day-1→terrace-columns | seedance_2_0 | | 1080p | | |
| ... | | | | | | |

> Усі AI-ассети = swap-in плейсхолдери. Будинок добудують → перегенерувати тими ж pin/seed.
> Закладено дешеву регенерацію.

---

## ⚠️ ДАНІ ВІД ВЛАСНИКА (паралельно, P0, не AI — найвищий ROI на дзвінки)
1. Ім'я забудовника + досвід/track record (#1 call-driver).
2. Хвилини: центр Вінниці / школа / садок / виїзд.
3. Берег приватний чи спільний? Річка чиста (можна купатися)?
4. Телефон, Telegram/Viber. Рік завершення / поточний статус.
```

---

# 🔬 ВИСНОВКИ З РЕАЛЬНИХ ТЕСТІВ (сесія 2026-06-04) — ОНОВЛЕНА СТРАТЕГІЯ

> Це НЕ теорія — це перевірено на справжніх генераціях через Higgsfield. Має пріоритет
> над початковими припущеннями вище, де суперечить.

## ❗ ГОЛОВНИЙ УРОК: AI дрифтить АРХІТЕКТУРУ, не плавність
Перевірено двічі (Nano Banana ніч + Seedance відео): моделі тримають РУХ стабільним, але
ПЕРЕМАЛЬОВУЮТЬ сам будинок, щойно кадр складний або ракурс кутовий. Для угоди $300k, де
покупець бачив денні фото, «будинок не той» = втрата довіри. Це межа технології, не промпту.

## ✅ ЩО ПРАЦЮЄ (підтверджено)
1. **Nano Banana ніч-конверсія** — тримає композицію ТІЛЬКИ на простих кадрах, і то лотерея.
   → Використовувати ЛИШЕ для Зони Б (hero/OG/лоадер, без порівняння пліч-о-пліч).
   → Метод: подати денний рендер за ПУБЛІЧНИМ URL (nahirna.vercel.app/images/...) у medias role=image.
   → Робити кілька варіацій (2K анлімітед), відбирати найточнішу за rejection-тестом.
2. **Seedance відео — РЕЦЕПТ, ЩО ПРАЦЮЄ:**
   - ТІЛЬКИ `start_image` (БЕЗ `end_image` — інакше модель роз'їжджає геометрію, щоб «догнати»).
   - Тривалість 4s. genre `auto` (НЕ `drama` — менше ризику NSFW-фільтра на темному).
   - Промпт: явна заборона «do NOT add/duplicate/move/reshape columns/walls/roofline» + опис
     МІНІМАЛЬНОГО руху (дрейф камери, листя, мерехтіння води).
   - 1080p. Працює на ПРОСТИХ ФРОНТАЛЬНИХ кадрах.

## ❌ ЩО НЕ ПРАЦЮЄ (підтверджено браком)
- `end_image` з іншою композицією → колони роз'їжджаються, додаються нові (тест S-C день).
- Кутові/складні ракурси (`exterior-day-2`) → будинок перемальовується, навіть якщо рух стабільний.
- genre `drama` + темний AI-end-frame → NSFW-фільтр хибно скасовує джобу (кредити повертає).
- Ніч-конверсія тераси без явної заборони інтер'єру → модель плутає з мебльованим ракурсом.

## 🎯 ФІНАЛЬНА СТРАТЕГІЯ ТУРУ (комбінація — рішення власника)
- **Зовнішні рухи = AI-відео Seedance** на БЕЗПЕЧНИХ фронтальних кадрах. ГОТОВО, перевірено:
  · S-A фасад (від exterior-day-1) ✅ стабільно
  · S-B тераса (від terrace) ✅ стабільно
  · S-C вода (від water-finale) ✅ стабільно (тест рецепту)
  · Hero-фронт (від hero-day-desktop) ✅ стабільно, дорогий паралакс-рух
- **Внутрішній прохід будинком = scroll-послідовність з РЕАЛЬНИХ рендерів** (НЕ AI-відео).
  Інженер бере living-day, living-evening + кадри наявного відео-туру з репо → frame-sequence.
  Нуль дрифту, бо кожен кадр — справжній рендер.
- **НЕ генерувати** інтер'єрні AI-проходи кімнатами — найвищий ризик дрифту.

## 🌙 ДЕНЬ→НІЧ = РОБОТА ІНЖЕНЕРА, НЕ ГЕНЕРАЦІЇ (нове правило)
Для «доказових» кадрів (тур, диптих 02, галерея) ніч робить Claude Code через CSS/canvas
колор-grade денного рендера (затемнення в синь + тепле свічення вікон масками). Геометрія =
той самий файл = НУЛЬ дрифту гарантовано. AI-ніч лишається ТІЛЬКИ для hero/OG/лоадера.

## 📦 ГОТОВІ АСЕТИ (станом на кінець сесії)
| Ассет | Тип | Статус | Призначення |
|---|---|---|---|
| water-finale ніч (job 05f4c14b) | img | ✅ кандидат | hero/OG (Зона Б) |
| terrace ніч (job d6470e13) | img | ✅ зберегти | галерея ніч (Зона Б) |
| S-A фасад | video | ✅ | тур, зовні |
| S-B тераса | video | ✅ | тур, зовні |
| S-C вода | video | ✅ | тур, фінал день |
| Hero-фронт | video | ✅ | hero |

## ⏭️ ЩО ЛИШИЛОСЬ ЗГЕНЕРУВАТИ (опційно)
- 1 cinemagraph тераса-вода (4s ping-pong) — для §03 галереї.
- Hero/OG ніч — відібрати з варіацій water-finale ніч (Шлях 2).
- Карта: спершу інженер пробує посилену SVG (А); арт bird's-eye (Б) — тільки якщо А «джуніорно».
