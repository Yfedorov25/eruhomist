# R23 · Kinetic-Type Page Transitions
> Хвиля 1-2. Codrops KineticTypePageTransition. Типографіка ЯК перехід між сторінками: гігантський текст влітає/масштабується/розщеплюється, перекриваючи зміну контенту.

## ЩО ЦЕ / КОЛИ
Перехід між сторінками, де великий кінетичний текст (назва наступної секції/сторінки) драматично анімується на весь екран — масштаб, split-by-letter, marquee, rotation — і під його прикриттям міняється контент. Заміна нудного fade.
**Коли:** мультисторінкові award-сайти, портфоліо (назва проєкту як перехід), editorial-бренди, агенції. Поєднується з R03 (persistent canvas) і Barba/Next router.

## РІВЕНЬ РИЗИКУ: 🟡
GSAP (SplitText/timeline) + router hook. Складність — синхронізація з завантаженням наступної сторінки.

## ПЕРЕВІРЕНЕ ДЖЕРЕЛО
- **codrops/KineticTypePageTransition** (Codrops туторіал).
- GSAP SplitText (розбивка на літери/слова), timeline, CustomEase.
- Next.js: `router.events` / template.tsx; vanilla: Barba.js hooks (як ERA).
- J0SUKE/gsap-threejs-codrops — Astro + Barba.js + GSAP Flip/SplitText (приклад інтеграції).

## ПРИНЦИП
1. Клік на лінк → перехоплюємо (Barba / Next router).
2. **Out-анімація:** оверлей з гігантським текстом наступної сторінки влітає (covers viewport).
3. Під оверлеєм міняється контент (новий маршрут завантажений).
4. **In-анімація:** текст-оверлей їде геть, відкриваючи нову сторінку.
5. SplitText → stagger по літерах для «кінетики».

## КОД-СКЕЛЕТ (GSAP + SplitText)
```js
import gsap from 'gsap'
import { SplitText } from 'gsap/SplitText'
gsap.registerPlugin(SplitText)

async function pageTransition(nextLabel, loadNextContent) {
  const overlay = document.querySelector('.transition-overlay')
  const heading = overlay.querySelector('.transition-text')
  heading.textContent = nextLabel
  const split = new SplitText(heading, { type:'chars' })

  const tl = gsap.timeline()
  // OUT: текст влітає, оверлей закриває екран
  tl.set(overlay, { display:'flex', yPercent:100 })
    .to(overlay, { yPercent:0, duration:0.7, ease:'power4.inOut' })
    .from(split.chars, { yPercent:120, rotate:8, stagger:0.02, duration:0.5, ease:'power3.out' }, '-=0.3')
    .add(async () => { await loadNextContent() })          // міняємо контент під оверлеєм
    // IN: оверлей їде геть
    .to(split.chars, { yPercent:-120, stagger:0.02, duration:0.4, ease:'power3.in' })
    .to(overlay, { yPercent:-100, duration:0.7, ease:'power4.inOut' }, '-=0.1')
    .set(overlay, { display:'none' })
}
```
```jsx
// Next.js App Router — template.tsx обгортка для transition при зміні route
'use client'
import { useState } from 'react'
// перехоплення Link onClick → pageTransition(label) → router.push
```
**Варіації кінетики:** scale-up (текст наближається), marquee (пролітає горизонтально), split-words rotate, mask-reveal тексту.

## ТОЧНІ ПАРАМЕТРИ
- Оверлей slide: duration 0.7, `power4.inOut`.
- SplitText chars stagger 0.02, in `power3.out` / out `power3.in`.
- yPercent літер 120 (влітають знизу), rotate 5-10° для динаміки.
- Загальна тривалість переходу 1.2-1.6s (не довше — дратує).
- Колір оверлею = брендовий (контраст до сторінок).

## PERFORMANCE + FALLBACK
- SplitText на великих текстах — багато DOM; revert() після анімації (`split.revert()`).
- Прелоад наступної сторінки під час out-анімації (паралельно).
- reduced-motion: простий instant-перехід або короткий fade.
- Mobile: коротша анімація, менше rotation.
- З R03 (persistent canvas) — WebGL не перемонтовується, текст-оверлей зверху.

## ПРОМПТ ДЛЯ CLAUDE CODE
```
Прочитай recipes/R23_kinetic-type-transitions.md.
Зроби kinetic-type page transition (GSAP SplitText + router):
- оверлей з гігантським текстом назви наступної сторінки
- OUT: оверлей slide yPercent 100→0 (power4.inOut 0.7) + chars влітають (SplitText stagger 0.02 rotate 8)
- під оверлеєм — зміна контенту (Next router.push / Barba); прелоад паралельно
- IN: chars + оверлей їдуть геть; split.revert() після
- варіанти: scale-up, marquee; колір оверлею брендовий
- reduced-motion → fade; mobile → коротше; сумісно з R03 persistent canvas
Репо-орієнтир: codrops/KineticTypePageTransition, J0SUKE/gsap-threejs-codrops. Поверни компонент + демо 2 сторінок.
```
