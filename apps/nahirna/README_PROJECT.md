# Дім на Нагірній — пакет для білду (Claude Code)

Розпакуй цей архів у корінь нового репозиторію. Усе вже на місцях.

## ЩО ВСЕРЕДИНІ
- `CLAUDE.md` — головне джерело правди (читати першим).
- `START_PROMPT_claude_code.md` — стартовий промпт: дай його Claude Code.
- `specs/` — 9 ТЗ секцій + _README (порядок збірки, відкриті питання клієнту).
- `content/COPY_nahirna.md` — увесь текст сайту (укр.).
- `public/images/` — hero day/night (desktop+mobile), інтер'єри, екстер'єри, тераса, вода, план (PDF).
- `public/videos/tour/` — scene1_arrival, scene2_living, scene3_water (готові кліпи туру).
- `scripts/build-frames.sh` — FFmpeg: 3 сцени → WebP-кадри desktop+mobile для scroll-scrub.

## ПОРЯДОК
1. Розпакувати в корінь репо.
2. Закрити відкриті питання клієнту (див. specs/_README.md): телефон, відстані POI, рік, назва.
   Вставити відповіді у content/COPY_nahirna.md.
3. Дати Claude Code вміст START_PROMPT_claude_code.md.
4. Claude Code: scaffold → секції 00-09 по черзі → тур (запустить build-frames.sh) → поліш → деплой.

## МЕДІА — МАПА ІМЕН
| Файл | Що це |
|---|---|
| hero-day/night-desktop.webp | Hero 16:9 день/ніч |
| hero-day/night-mobile.webp | Hero 9:16 день/ніч |
| living-day.webp / living-evening.webp | Кухня-вітальня A1/A2 |
| terrace.webp / water-terrace-golden.webp | Тераса на воду A4 |
| water-finale.webp | Берег, золота година B7 |
| exterior-day-1/2.webp, exterior-night-1/2.webp | Екстер'єри для секцій 02/06 |
| exterior-terrace-columns.webp | Колони зблизька (деталь) |
| floorplan-source.pdf | План для секції 04 (перемалювати в SVG) |
| videos/tour/scene1_arrival.mp4 | Двір→ганок→поріг (склеєно) |
| videos/tour/scene2_living.mp4 | Рух у вітальні |
| videos/tour/scene3_water.mp4 | Тераса→вода, золота година |

## ⚠️ Hero desktop день/ніч
Перевір пару hero-day-desktop / hero-night-desktop — вони мають бути ОДНІЄЮ сценою
(та сама композиція, різне світло) для чистого crossfade. Якщо ні — перегенеруй пару.
