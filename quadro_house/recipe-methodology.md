# ScrollCraft PRO · Recipe Base (Production Knowledge Base)
> Це наша головна база. Кожна техніка award-рівня = окремий recipe.
> Мета: ти приходиш з ідеєю → ми обираємо recipe(s) → Claude Code будує 1-в-1 на найвищому рівні.

## ЯК ПРАЦЮЄ КОЖЕН RECIPE
Кожен файл recipe має однакову структуру, щоб Claude Code міг будувати надійно:
1. **Що це / коли застосовувати** — опис ефекту + до яких ідей пасує.
2. **Рівень ризику** — 🟢 Claude Code пише сам / 🟡 пише з нашим контролем / 🔴 адаптуємо перевірене репо.
3. **Перевірене джерело** — open-source репо/туторіал, на якому базуємось (ніколи не винаходимо з нуля те, що вже вирішено).
4. **Код-скелет** — робочий каркас, який Claude Code розгортає.
5. **Точні параметри** — easing, lerp, кількість частинок, fps-бюджет, breakpoints.
6. **Performance + fallback** — як не вбити FPS, що робити на mobile / reduced-motion.
7. **Промпт для Claude Code** — готовий, скопіювати й дати агенту.

## КЛАСИФІКАЦІЯ ЗА РИЗИКОМ (чесна оцінка)
| Техніка | Ризик | Стратегія |
|---|---|---|
| Page transitions | 🟢 | Claude Code пише сам (GSAP + persistent scene) |
| Custom cursor / magnetic | 🟢 | Claude Code пише сам (lerp + quickTo) |
| Scroll choreography | 🟢 | Claude Code пише сам (GSAP ScrollTrigger + Lenis) |
| Frame-sequence (2D canvas) | 🟢 | Claude Code пише сам (drawImage + scrub) |
| Frame-sequence у WebGL | 🟡 | Claude Code пише, ми перевіряємо текстурний пайплайн |
| Staggered reveals / marquee | 🟢 | Claude Code пише сам |
| Image displacement / distortion | 🟡 | Claude Code адаптує Codrops-шейдер |
| Post-processing (bloom/DOF/grain) | 🟡 | react-postprocessing, ми задаємо параметри |
| GPGPU particles | 🔴 | Адаптуємо перевірене репо (pmndrs examples / Bruno) |
| Fluid simulation | 🔴 | Адаптуємо PavelDoGreat / kishimisu репо |
| WebGPU / TSL міграція | 🟡 | За зразком Bruno folio-2025 (two-line renderer swap) |

> 🔴 НЕ означає "не зможемо". Означає: ми НЕ просимо Claude Code писати математику solver'а з нуля.
> Ми даємо йому перевірений код як референс, і він інтегрує/адаптує. Так роблять усі студії.

## ЦІЛЬОВИЙ СТЕК-ЕТАЛОН (звірено з кодом Bruno Simon folio-2025, award-сайт)
Реальний package.json award-проєкту:
```
three ^0.183 (three/webgpu + three/tsl)   ← рендер, WebGPU з fallback на WebGL2
@dimforge/rapier3d ^0.17 (WASM)            ← фізика
gsap ^3.12                                 ← motion/timelines
howler ^2.2                                ← звук (award-сайти майже завжди мають sound design)
@gltf-transform/* ^4                       ← asset-пайплайн (стиснення glTF/Draco/KTX2)
camera-controls ^3.1                       ← кінематографічна камера
tweakpane ^4 + stats-gl                    ← debug-панель + FPS-моніторинг
vite ^7                                    ← збірка
seedrandom, normalize-wheel, uuid          ← утиліти
```
Наш стек = це + Next.js (для SSR-shell і роутингу) + Lenis (smooth scroll) + R3F/drei (React-обгортка Three.js).

## ЧОГО НАВЧИВ НАС КОД BRUNO (архітектурні уроки award-рівня)
1. **Модульність:** кожен ефект — окремий клас-файл (Trails.js, Water.js, Tornado.js, Leaves.js, Confetti.js...). Не монолітна сцена. Ми будуємо так само: одна техніка = один компонент.
2. **Центральний Ticker:** один rAF-цикл (`ticker.events.on('tick')`) з пріоритетами (рендер на 998). Усе синхронізовано. Не десятки окремих requestAnimationFrame.
3. **Rendering pipeline:** WebGPURenderer + MRT + TSL pass chain (bloom + cheapDOF). Post-processing — окрема папка Passes/.
4. **Quality manager:** окремий Quality.js — адаптує важкість сцени під залізо. Ми робимо так само (mobile/reduced-motion fallback).
5. **RayCursor:** raycasting-курсор з станами intersect/down — основа всіх 3D-інтеракцій.
6. **Debug-first:** tweakpane-панель для кожного модуля. Прискорює ітерації в рази.

## ⚠️ КЛЮЧОВИЙ УРОК ПРО РОЗБІР WebGL-САЙТІВ
DOM-скрейп (Apify) працює для HTML/DOM-сайтів (imakeup/piozza — дав повний код).
Для WebGL-сайтів (Bruno/Lusion/Igloo) Apify повертає майже порожній `<canvas>` — весь рендер у JS+GPU.
**Тому стратегія розбору WebGL-еталонів:**
1. Apify → підтвердити, що це WebGL (порожній DOM) + витягти HTML-shell, meta, шрифти.
2. GitHub → реальний код (де є open-source: Bruno, Lusion WebGL-Scroll-Sync, pmndrs, 14islands).
3. Резьорч/case study → техніки, які не в коді (як саме зроблено).
4. Codrops → готові recipe конкретних ефектів.
→ Ми НЕ копіюємо конкретний сайт 1-в-1 (він закритий). Ми вчимось техніці й відтворюємо її краще під свою ідею.

## ІНДЕКС RECIPES
- `recipes/R01_frame-sequence-webgl.md` — scroll-scrubbed кадри у WebGL-текстурі
- `recipes/R02_custom-cursor.md` — кастомний курсор + magnetic + raycaster
- (далі додаємо: R03 page-transitions, R04 scroll-choreography, R05 post-processing,
   R06 image-displacement, R07 GPGPU-particles, R08 fluid-sim, R09 webgpu-tsl-migration)

## ПОРЯДОК ПОБУДОВИ БАЗИ (наш roadmap)
Фаза 1 (🟢, фундамент): R01-R04 — те, що Claude Code робить сам бездоганно.
Фаза 2 (🟡, апгрейд): R05-R06, R09 — post-processing, шейдери, WebGPU.
Фаза 3 (🔴, топ): R07-R08 — GPGPU/fluid через адаптацію репо.
Кожен recipe тестуємо реальним білдом у Claude Code перед тим, як вважати "готовим".
