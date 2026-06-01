# R05 · Post-Processing (Bloom · DOF · Grain · Chromatic Aberration · Vignette)
> Шар, що перетворює «3D-сцену» на «кінематографічний кадр». Те, що дає cinematic look усім award-сайтам (Igloo, Cartier, Bruno folio).

## ЩО ЦЕ / КОЛИ
Повноекранні ефекти поверх відрендереної 3D-сцени: selective bloom (світіння емісивних об'єктів), depth of field (боке/розмиття глибини), film grain, chromatic aberration (RGB-зсув на краях), vignette, tone mapping. Збираються в один EffectComposer pass-chain.
**Коли:** будь-яка WebGL-сцена, якій треба «дорогий» кінематографічний вигляд. Bloom для емісивних/неонових; DOF для фокусу на продукті; grain+vignette майже завжди (тепло, плівково).

## РІВЕНЬ РИЗИКУ: 🟡
Claude Code пише сам через @react-three/postprocessing; ми задаємо параметри й стежимо за перформансом (post-processing дорогий на mobile).

## ПЕРЕВІРЕНЕ ДЖЕРЕЛО
- **pmndrs/postprocessing** + **@react-three/postprocessing** — EffectComposer автоматично мерджить ефекти в мінімум render-операцій (single-triangle fullscreen, WebGL2 MSAA, gamma correction з коробки). Швидше за `three/examples/jsm/postprocessing`.
- Bruno folio-2025: bloom через TSL BloomNode + кастомний cheapDOF (WebGPU-рівень).
- Codrops: «How to Create Distortion and Grain Effects on Scroll with Shaders».

## КОД-СКЕЛЕТ (R3F — точний API)
```jsx
import { Canvas } from '@react-three/fiber'
import { EffectComposer, Bloom, DepthOfField, Noise, Vignette, ChromaticAberration }
  from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'

function Scene() {
  return (
    <Canvas gl={{ antialias: false }}>  {/* MSAA дає composer */}
      {/* ...сцена... емісивні матеріали для bloom: */}
      {/* <meshStandardMaterial emissive="#e0a96d" emissiveIntensity={2}/> */}

      <EffectComposer>
        <Bloom
          luminanceThreshold={0.85}   // тільки яскравіше за поріг світиться (selective)
          luminanceSmoothing={0.9}
          intensity={0.6}
          mipmapBlur                   // м'якіше, дешевше
        />
        <DepthOfField
          focusDistance={0}            // 0..1 (нормалізовано)
          focalLength={0.02}
          bokehScale={2}
          height={480}
        />
        <ChromaticAberration
          offset={[0.0008, 0.0008]}    // ледь помітний RGB-зсув
          blendFunction={BlendFunction.NORMAL}
        />
        <Noise opacity={0.04} blendFunction={BlendFunction.OVERLAY} /> {/* film grain */}
        <Vignette eskil={false} offset={0.1} darkness={0.9} />
      </EffectComposer>
    </Canvas>
  )
}
```

## SELECTIVE BLOOM (тільки обрані об'єкти світяться)
- Дай емісивний матеріал лише тим мешам, що мають світитися (`emissiveIntensity > 1`).
- `luminanceThreshold` ~0.85 → звичайні поверхні не цвітуть, лише яскраві.
- Для строгого контролю — selective bloom через layers (об'єкт на окремому layer, bloom рендерить тільки його).

## ТОЧНІ ПАРАМЕТРИ (cinematic-пресети)
**Теплий преміум (як AMBRA/Cartier):**
- Bloom: threshold 0.85, intensity 0.5-0.7, mipmapBlur.
- Grain: opacity 0.03-0.05, OVERLAY.
- Vignette: offset 0.1, darkness 0.8-1.0.
- ChromaticAberration: 0.0005-0.001 (ледь-ледь).

**Продуктовий фокус:**
- DOF: focusDistance на об'єкті, bokehScale 2-3 → фон розмитий.
- Bloom слабкий (0.3).

**Неон/tech (Igloo-style):**
- Bloom сильний (intensity 1-1.5, threshold 0.6), емісивні неонові кольори.
- ChromaticAberration помітніший (0.002).

## PERFORMANCE + FALLBACK
- Post-processing ДОРОГИЙ. На mobile: вимкнути DOF (найважчий) + bloom resolution менше, або взагалі вимкнути chain.
- `mipmapBlur` на Bloom — дешевше за стандартний.
- DOF `height={480}` — рендер у меншій роздільності.
- reduced-motion / low-end: рендер без EffectComposer (чиста сцена).
- Quality manager (як Bruno): детект FPS → adaptive (вимикати ефекти при просіданні).
- НЕ нагромаджувати: 3-4 ефекти максимум для web.

## WEBGPU/TSL ВЕРСІЯ (R09)
На WebGPU bloom/DOF через TSL nodes (`three/tsl` BloomNode, кастомний cheapDOF як Bruno). Мігрувати коли цільова аудиторія на Chrome/Edge 113+.

## ПРОМПТ ДЛЯ CLAUDE CODE
```
Прочитай recipes/R05_post-processing.md.
Додай post-processing chain (@react-three/postprocessing) до WebGL-сцени:
- пресет "теплий преміум": Bloom(threshold 0.85, intensity 0.6, mipmapBlur) + Noise(0.04 overlay) + Vignette(0.1/0.9) + ChromaticAberration(0.0008)
- selective bloom: лише емісивні меші (emissiveIntensity>1)
- gl antialias:false (MSAA від composer)
- mobile/reduced-motion: вимкнути chain (рендер чистої сцени), DOF тільки desktop
- adaptive quality: детект FPS, вимикати ефекти при <40fps
Поверни файли + порівняння до/після (скрін) + FPS-замір через Chrome DevTools MCP.
```
