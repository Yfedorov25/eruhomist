# HANDOFF — доопрацювання Нагірної через плагін award-re

> Встав цей файл (або його шлях) у НОВИЙ чат Claude Code, відкритий у теці `apps/nahirna`. Мета: доопрацювати сайт за фідбеком забудовника, використовуючи плагін **award-re**.

---

## 0. ПЕРШІ ДІЇ В НОВОМУ ЧАТІ
1. Переконайся, що плагін award-re встановлено: набери `/award-re:help`. Якщо ні:
   - `/plugin marketplace add ~/Downloads/award-re-plugin`
   - `/plugin install award-re@award-re-plugin`
2. Відкрий чат у корені монорепо `~/Downloads/eruhomist` АБО прямо в `apps/nahirna` (там живе сайт).
3. Запусти `/award-re:award` — це існуючий проект, плагін має це розпізнати.
4. **Встав сюди ФІДБЕК ЗАБУДОВНИКА** (список що треба зробити) — плагін опрацює його як ТЗ.

> ⚠️ Плагін очікує `.award-re/config.yaml`. Для existing-проекту: коли `/award-re:award` спитає тип — обери **Existing (правки готового)**. Він засетапить config під наявний код.

---

## 1. ЩО ЦЕ ЗА ПРОЄКТ
- **Нагірна** — другий кінематографічний сайт-лендинг ОДНІЄЇ вілли «Дім на Нагірній». Стратегія B (atmosphere-depth: один скрол, без visual-search — це вілла, не ЖК).
- **LIVE:** https://nahirna.vercel.app
- **Гілка:** `feat/nahirna-house` (НЕ main). Дерево чисте, усе закомічено (останній коміт `729a436`).
- **Стек:** Next.js (App Router) + TypeScript + GSAP + Lenis + Tailwind v4. **NO WebGL** (хардове правило).
- **Деплой:** `cd apps/nahirna && ../quadro/node_modules/.bin/vercel --prod --yes --scope yehor-s-projects3`
- **Білд:** `npm --prefix /Users/yehorfedorov/Downloads/eruhomist/apps/nahirna run build`
- **Тестувати наживо:** `~/.claude/skills/gstack/browse/dist/browse` (PROD не dev — dev роздуває jank).

## 2. ЩО ВЖЕ ЗРОБЛЕНО (award-движок live)
- AIR-движок: ease "air" `cubic-bezier(0.25,0.74,0.22,0.99)`, Lenis lerp 0.1, dual-rate parallax, clip-wipes, decode-ahead, контекстний курсор, preloader curtain-lift.
- Reveal = плавний fade (НЕ slideshow), serif-italic прибрано — правило власника: heading = smooth fade, без рубаних рисів.
- Секцій 9 (зламаний §05 tour ВИДАЛЕНО site-wide). §04 = інтерактивний реальний план + реальні рендери (НЕ 3D-dollhouse).
- §01 water = стіли + Ken-Burns (canvas frame-scrub НЕ зайшов — reverted).
- Telegram-доставка лідів LIVE + перевірено (бот-токен/chat-id на Vercel Production).
- Українська мікротипографіка (nbsp), zero em-dash, голос Fedoriv, підпис «власний берег».

## 3. PENDING ВІД КЛІЄНТА (порожні поля в `apps/nahirna/lib/site.ts` — блок прихований поки нема даних)
- `phoneTel: ""` → реальний телефон (зараз кнопка дзвінка text-only)
- `ownerName: ""` → імʼя власника (зараз лише роль «господар будинку»)
- `year: ""` → рік завершення
- `priceUsd: 300000` → ВЖЕ стоїть $300k (owner-confirmed, не чіпати)
- 2 POI-відстані → чекають реального заміру (фейкова карта вбиває довіру)
- `NEXT_PUBLIC_GA4_ID` / `CLARITY_ID` → аналітика
**Правило:** нема даних → блок прихований, НЕ вигадувати (CLAUDE.md плагіна §8).

## 4. ЯК ПЛАГІН МАЄ ЦЕ ВЕСТИ
Це **existing-проект + список правок**, тому:
1. `/award-re:award` → Existing.
2. Встав фідбек забудовника. Плагін оцінить кожен пункт.
3. Для ВІЗУАЛЬНИХ/UX-правок секцій → плагін веде через `/award-re:section` (показує варіанти-прототипи, ти обираєш) АБО прямо править, тримаючи ЄДИНІ константи руху (existing motion вже встановлений — не ламати).
4. Для контенту (телефон/рік/імʼя) → заповнити `lib/site.ts` (порожнє→зʼявиться автоматично).
5. ПЕРЕД фінішем → `/award-re:audit https://nahirna.vercel.app` (50 критеріїв + perf-guard: no-WebGL, scroll-jank, узгодженість).
6. Деплой (команда вище) + перевірка наживо на десктопі І мобільному.

## 5. ХАРДОВІ ПРАВИЛА (не порушувати — вони в плагіні CLAUDE.md)
- NO WebGL. Текст у DOM.
- Heading = плавний fade, без slideshow-рисів, без serif-italic (правило власника).
- Один ease/токени/scroll на весь сайт (existing — не вводити новий рух у частину секцій).
- Перфоманс: НІКОЛИ mix-blend/backdrop-filter над скрол-поверхнею; один смузер; idle-rAF (бойові уроки quadro/nahirna).
- Копі = Fedoriv, zero em-dash, antislop. Підпис «власний берег».
- Нема даних клієнта → блок прихований.
- Деплой/коміт — тільки коли користувач просить. Гілка feat/nahirna-house (не main).

## 6. КОРИСНІ ФАЙЛИ
- `apps/nahirna/lib/site.ts` — усі контент-поля (pending тут).
- `apps/nahirna/components/sections/` — секції (00-Hero … 08-CTA).
- `apps/nahirna/lib/` — gsapEase, typo, SmoothScrollProvider, ui/ (Cursor, Reveal, SplitReveal, DecodeAhead…).
- Memory (контекст проєкту): nahirna-villa-build, nahirna-copy-fedoriv, nahirna-price-300k, quadro-scroll-perf (perf-уроки).

---

## 7. ПЕРШЕ ПОВІДОМЛЕННЯ В НОВОМУ ЧАТІ (шаблон — скопіюй і допиши фідбек)
```
Доопрацьовуємо сайт Нагірна (apps/nahirna, гілка feat/nahirna-house, LIVE nahirna.vercel.app)
через плагін award-re. Прочитай apps/nahirna/HANDOFF_PLUGIN.md для контексту.

Фідбек від забудовника, що треба зробити:
1. [...]
2. [...]
3. [...]

Почни з /award-re:award (це existing-проект), потім проведи мене по цих правках.
```
```
