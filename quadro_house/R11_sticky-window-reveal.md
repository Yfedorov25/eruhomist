# R11 · Sticky Window / Mask Reveal on Scroll
> Декодовано з ERA (architecture__window). «Вікно», що розширюється на скролі й розкриває зображення/інтер'єр. Елегантний reveal для архітектури/інтер'єрів/продукту.

## ЩО ЦЕ / КОЛИ
Маска (clip-path/scale), що при скролі розширюється від маленького «вікна» до повного зображення — наче камера наближається крізь отвір. Sticky-секція тримає кадр, поки маска анімується.
**Коли:** перехід «екстер'єр→інтер'єр» (нерухомість), розкриття продукту, драматичний reveal головного візуалу.

## РІВЕНЬ РИЗИКУ: 🟢
GSAP ScrollTrigger + clip-path/scale. Claude Code сам.

## ПЕРЕВІРЕНЕ ДЖЕРЕЛО
- ERA `architecture__frame-sticky` + `architecture__window` (Locomotive sticky + parallax-маска).
- GSAP ScrollTrigger pin + clip-path scrub.

## КОД-СКЕЛЕТ (CSS clip-path + GSAP)
```jsx
function WindowReveal() {
  const wrap = useRef(); const mask = useRef()
  useEffect(() => {
    gsap.fromTo(mask.current,
      { clipPath: 'inset(38% 42% 38% 42% round 8px)' },   // маленьке «вікно» в центрі
      { clipPath: 'inset(0% 0% 0% 0% round 0px)',          // повний кадр
        ease: 'none',
        scrollTrigger: {
          trigger: wrap.current, start: 'top top', end: '+=120%',
          pin: true, scrub: 1,
        }
      })
  }, [])
  return (
    <div ref={wrap} className="window-wrap" style={{ height:'100vh' }}>
      <div ref={mask} className="window-mask">
        <img src="/interior.webp" alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
        {/* або відео / frame-sequence canvas */}
      </div>
    </div>
  )
}
```
Альтернатива через `scale` (дешевше за clip-path на деяких GPU):
```js
// зображення scale 1.4→1.0 + контейнер overflow:hidden з малим розміром→повний
gsap.fromTo(img, {scale:1.6}, {scale:1, scrollTrigger:{...pin, scrub:1}})
gsap.fromTo(frame, {width:'30%',height:'40%'}, {width:'100%',height:'100%', ...})
```

## ТОЧНІ ПАРАМЕТРИ
- Старт-вікно: inset ~38-42% (маленький прямокутник у центрі), round 6-10px.
- end `+=120%` скролу, scrub 1, pin true.
- Паралельно: легкий scale зображення (1.5→1) для «наближення камери».
- Можна комбінувати з R01 (всередині вікна — frame-sequence) або відео.

## PERFORMANCE + FALLBACK
- clip-path inset анімується дешево; scale ще дешевше.
- reduced-motion: показати повний кадр без маски.
- Mobile: коротший pin або без pin (просто reveal на 80% viewport).
- `will-change: clip-path` обережно (memory).

## ПРОМПТ ДЛЯ CLAUDE CODE
```
Прочитай recipes/R11_sticky-window-reveal.md і teardowns/ERA_real-estate.md (architecture__window).
Зроби <WindowReveal/>: sticky-секція, де маска clip-path inset(40%)→inset(0%) на scroll (scrub 1, pin),
+ паралельний scale зображення 1.5→1 (наближення). Всередині — зображення/відео/frame-seq.
reduced-motion → повний кадр; mobile → без pin. Поверни компонент + демо.
```
