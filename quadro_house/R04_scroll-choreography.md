# R04 · Scroll Choreography (Lenis + GSAP ScrollTrigger)
> Фундамент ВСІХ scroll-driven сайтів. Smooth scroll (Lenis) + scrubbed/pinned анімації (GSAP ScrollTrigger). Це те, що дає «$10k feeling» руху.

## ЩО ЦЕ / КОЛИ
Lenis робить нативний скрол плавним (інерція, lerp). GSAP ScrollTrigger прив'язує анімації до прогресу скролу (scrub), пінить секції (sticky-сцени), запускає reveals. Разом = кінематографічна хореографія, синхронна зі скролом.
**Коли:** ЗАВЖДИ. Це базовий шар будь-якого award-сайту (ERA = Locomotive+sticky, IG = Lenis, наш дефолт = Lenis+ScrollTrigger).

## РІВЕНЬ РИЗИКУ: 🟢
Claude Code пише сам бездоганно. Детермінована логіка.

## ПЕРЕВІРЕНЕ ДЖЕРЕЛО
- **Lenis** (darkroomengineering/lenis, v1.3.23) — офіційна GSAP ScrollTrigger інтеграція в README.
- **GSAP ScrollTrigger** — scrub, pin, snap, toggleActions.
- Підтверджено: IG (Lenis), ERA (Locomotive — той самий принцип).

## КОД-СКЕЛЕТ — базова інтеграція (точна, з Lenis docs)
```js
import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
gsap.registerPlugin(ScrollTrigger)

const lenis = new Lenis({
  lerp: 0.1,            // плавність (0.08-0.12 — золото; менше = «важче»/повільніше)
  smoothWheel: true,
  // duration: 1.2,     // альтернатива lerp
})

// синхронізація Lenis ↔ ScrollTrigger (ОФІЦІЙНИЙ патерн)
lenis.on('scroll', ScrollTrigger.update)
gsap.ticker.add((time) => lenis.raf(time * 1000))  // секунди → мс
gsap.ticker.lagSmoothing(0)                          // без затримки скрол-анімацій
```
```jsx
// React/Next обгортка
import { ReactLenis } from 'lenis/react'
export default function Layout({ children }) {
  return <ReactLenis root options={{ lerp: 0.1 }}>{children}</ReactLenis>
}
```

## ПАТЕРНИ ХОРЕОГРАФІЇ

### A. Scrubbed timeline (анімація прив'язана до скролу)
```js
gsap.timeline({
  scrollTrigger: {
    trigger: '.section',
    start: 'top top',
    end: '+=2000',       // довжина скролу (= висота «сцени»)
    scrub: 1,            // 1 = плавне «доганяння» (0.5-1.5); true = миттєво
    pin: true,           // ПІНИМО секцію (sticky) поки програється
  }
})
.to('.layer-1', { yPercent: -30 })
.to('.layer-2', { scale: 1.2, opacity: 0 }, '<')  // паралельно
.from('.title', { y: 100, opacity: 0 })
```

### B. Pinned scroll-story (як hero ERA/imakeup — 400vh sticky)
```js
ScrollTrigger.create({
  trigger: '.hero', start: 'top top', end: '+=300%', pin: true, scrub: true,
  onUpdate: (self) => {
    const p = self.progress           // 0..1 → індекс кадру (R01), главу hero, тощо
    frameSeq.setFrame(Math.floor(p * (FRAME_COUNT-1)))
  }
})
```

### C. Staggered reveal (золотий стандарт, з нашого teardown)
```js
gsap.from('.reveal', {
  scrollTrigger: { trigger: '.block', start: 'top 80%' },
  y: 28, opacity: 0,
  duration: 0.9,                      // luxury/real-estate: 1.5-3s (урок ERA)
  ease: 'power3.out',
  stagger: 0.11,                      // 110ms між елементами
})
```

### D. Parallax шари (data-driven, як ERA keyframes)
```js
gsap.utils.toArray('[data-parallax]').forEach(el => {
  gsap.to(el, {
    yPercent: el.dataset.parallax * -1,   // напр. data-parallax="20"
    ease: 'none',
    scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true }
  })
})
```

### E. Scroll-velocity (для distortion-шейдерів R06, dot-cursor IG)
```js
let velocity = 0
lenis.on('scroll', (e) => { velocity = e.velocity })  // передаємо в шейдер uScrollVelocity
```

## ТОЧНІ ПАРАМЕТРИ (еталонні)
- Lenis lerp: **0.1** (0.08 повільніше/важче для luxury, 0.12 жвавіше).
- ScrollTrigger scrub: **1** (плавне доганяння); `scrub:true` для миттєвого (frame-seq).
- Reveal: y 28px, duration 0.9s (звичайне) / 1.5-3s (luxury), ease power3.out, stagger 110ms.
- Pinned hero: end `+=300%` (= 400vh загальна висота, як imakeup/piozza/ERA).
- ease-довідник: `power3.out` (входи), `power2.inOut` (морфи), `expo.out` (драматичні), `none` (parallax/scrub).

## PERFORMANCE + FALLBACK
- `gsap.ticker.lagSmoothing(0)` — обов'язково, інакше скрол лагає.
- reduced-motion: `if (matchMedia('(prefers-reduced-motion:reduce)').matches)` → не ініціалізувати Lenis, показати статику, ScrollTrigger без scrub.
- `ScrollTrigger.refresh()` після завантаження зображень/шрифтів (інакше зміщені тригери).
- Mobile: Lenis `smoothTouch:false` (нативний touch-скрол кращий на тач); пін обережно (може лагати).
- Чистити: `lenis.destroy()` + `ScrollTrigger.killAll()` при unmount.

## ПРОМПТ ДЛЯ CLAUDE CODE
```
Прочитай recipes/R04_scroll-choreography.md.
Налаштуй scroll-хореографію для Next.js:
- ReactLenis root (lerp 0.1) + GSAP ScrollTrigger інтеграція (lenis.on scroll→ST.update, gsap.ticker.add raf, lagSmoothing 0)
- pinned hero 400vh з onUpdate progress (для frame-seq R01)
- staggered reveals (y28, power3.out, stagger 110ms; для luxury 1.5s)
- data-parallax шари (scrub)
- scroll-velocity expose для шейдерів
- reduced-motion: без Lenis, статика; ScrollTrigger.refresh після load; cleanup на unmount
Поверни файли + демо-сторінку з pinned hero + 2 reveal-секціями.
```
