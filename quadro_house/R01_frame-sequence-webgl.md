# R01 · Frame-Sequence у WebGL (scroll-scrubbed)
> Апгрейд над 2D-canvas версією з PDF/imakeup. Кадри стають GPU-текстурою → можна додати шейдерні ефекти (grain, distortion, color grade) поверх послідовності.

## ЩО ЦЕ / КОЛИ
Послідовність WebP-кадрів (з Kling-рендеру) відображається на повноекранній площині у WebGL, індекс кадру керується прогресом скролу. Це ядро ScrollCraft. У WebGL-версії (на відміну від 2D canvas) можна:
- накласти film grain / chromatic aberration / vignette шейдером;
- додати displacement на швидкості скролу;
- зробити плавний crossfade між кадрами (intermediate blending).
**Коли:** будь-який кінематографічний hero (продукт, локація, бренд) — основа всіх трьох стилів PDF.

## РІВЕНЬ РИЗИКУ: 🟡
Claude Code пише сам, ми перевіряємо: (1) preload-стратегію кадрів, (2) що текстура оновлюється без memory leak, (3) fps на mobile.

## ПЕРЕВІРЕНЕ ДЖЕРЕЛО
- Lusion `WebGL-Scroll-Sync` (github.com/lusionltd/WebGL-Scroll-Sync) — як синхронізувати WebGL зі скролом без scroll-jacking.
- pmndrs drei `useScroll` + `<ScrollControls>` — R3F-патерн.
- Bruno folio: централізований Ticker (один rAF).

## КОД-СКЕЛЕТ (R3F + drei + Lenis)
```jsx
// HeroSequence.jsx
import { useRef, useMemo, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useScroll } from '@react-three/drei'
import * as THREE from 'three'

const FRAME_COUNT = 150          // 120–180 кадрів (PDF budget)
const PAD = (i) => String(i).padStart(4, '0')

export function HeroSequence({ basePath = '/frames/hero/desktop' }) {
  const mesh = useRef()
  const scroll = useScroll()
  const { viewport } = useThree()

  // 1. Preload усіх кадрів як текстур (перші 20 — eager, решта — lazy через IntersectionObserver зовні)
  const textures = useMemo(() => {
    const loader = new THREE.TextureLoader()
    return Array.from({ length: FRAME_COUNT }, (_, i) => {
      const t = loader.load(`${basePath}/${PAD(i + 1)}.webp`)
      t.colorSpace = THREE.SRGBColorSpace
      return t
    })
  }, [basePath])

  // 2. Шейдерний матеріал: показує кадр + grain + vignette
  const material = useMemo(() => new THREE.ShaderMaterial({
    uniforms: {
      uTex:   { value: textures[0] },
      uTime:  { value: 0 },
      uGrain: { value: 0.04 },     // film grain intensity
      uVig:   { value: 0.5 },      // vignette strength
    },
    vertexShader: /* glsl */`
      varying vec2 vUv;
      void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }
    `,
    fragmentShader: /* glsl */`
      varying vec2 vUv; uniform sampler2D uTex; uniform float uTime,uGrain,uVig;
      float rand(vec2 c){ return fract(sin(dot(c,vec2(12.9898,78.233)))*43758.5453); }
      void main(){
        vec4 col = texture2D(uTex, vUv);
        float g = (rand(vUv + uTime) - 0.5) * uGrain;        // grain
        col.rgb += g;
        float d = distance(vUv, vec2(0.5));                   // vignette
        col.rgb *= smoothstep(0.9, 0.3*uVig, d) * 0.4 + 0.6;
        gl_FragColor = col;
      }
    `,
  }), [textures])

  // 3. Скрол → індекс кадру (scrub). drei useScroll.offset = 0..1
  useFrame((state) => {
    const o = scroll.offset                                  // 0..1
    const idx = Math.min(FRAME_COUNT - 1, Math.floor(o * (FRAME_COUNT - 1)))
    material.uniforms.uTex.value = textures[idx]
    material.uniforms.uTime.value = state.clock.elapsedTime
  })

  useEffect(() => () => textures.forEach(t => t.dispose()), [textures]) // cleanup

  return (
    <mesh ref={mesh} material={material}>
      <planeGeometry args={[viewport.width, viewport.height]} />
    </mesh>
  )
}
```
```jsx
// у Canvas: <ScrollControls pages={4} damping={0.15}> <HeroSequence/> ... </ScrollControls>
// Lenis синхронізувати з drei через <ScrollControls> (drei сам керує) АБО vanilla Lenis + raf.
```

## ТОЧНІ ПАРАМЕТРИ
- FRAME_COUNT: 120–180 (desktop), можна 90 на mobile.
- pages у ScrollControls: 3–4 (= 300–400vh, як у imakeup/piozza).
- damping: 0.12–0.18 (відповідає Lenis lerp 0.1).
- grain: 0.03–0.05; vignette: 0.4–0.6.
- Текстури: WebP, desktop 1920w / mobile 1080w, colorSpace = SRGB.
- Кадри ПЕРШІ 20 — eager preload (показати hero миттєво), решта — progressive.

## PERFORMANCE + FALLBACK
- 150 текстур по 1920w ≈ багато VRAM. Альтернатива: одна текстура, що оновлює `.image` через `<img>`/canvas і `needsUpdate=true` (менше памʼяті, як 2D-підхід, але в WebGL). Для 🟡 — почати з масиву, якщо VRAM тисне → перейти на single-texture update.
- reduced-motion: показати статичний кадр 0001, без useFrame-оновлень.
- mobile: 90 кадрів, 1080w, вимкнути grain (економія fragment-ops).
- Завжди dispose() текстур у cleanup.

## ПРОМПТ ДЛЯ CLAUDE CODE
```
Прочитай 00_foundations/recipe-methodology.md і recipes/R01_frame-sequence-webgl.md.
Побудуй <HeroSequence/> для Next.js + R3F за скелетом R01:
- кадри з /public/frames/hero/desktop/0001..0150.webp, mobile з /mobile/
- scroll-scrubbed через drei ScrollControls (pages=4, damping=0.15)
- ShaderMaterial з film grain (0.04) + vignette (0.5)
- preload перших 20 кадрів eager, решта progressive
- reduced-motion → статичний кадр 0001
- cleanup усіх текстур; ціль 60fps desktop / 40fps mobile
- додай tweakpane debug для grain/vignette (як у Bruno folio)
Поверни список файлів + як перевірити через Playwright (скрол-скрін на 0%, 50%, 100%).
```
