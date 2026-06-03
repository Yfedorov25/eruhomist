# ТЗ 05 · Прохід будинком — frame-sequence overlay (КЛЮЧОВА wow-секція)

## Мета й емоція
Дати відчуття «я всередині»: безшовний кінематографічний прохід від двору крізь дім до води,
керований скролом. Кульмінація туру — вихід на воду в золоту годину.

## Патерн
Ядро: frame-sequence scroll-scrub у fullscreen overlay. 3 cinematic-сцени + 2 крос-фейди.

## Ассети (вихідні Kling-кліпи, готові)
- `/public/videos/tour/scene1_arrival.mp4` — двір → ганок → поріг (двері навстіж, стабільні)
- `/public/videos/tour/scene2_living.mp4` — повільний наїзд у вітальні до вікон/води
- `/public/videos/tour/scene3_water.mp4` — тераса → берег, золота година
- Усі 1080p, ~5s кожна.

## Збірка (FFmpeg — див. scripts/build-frames.sh)
1. Склеїти 3 сцени з крос-фейдами (~0.8s xfade) → `tour_master.mp4`.
2. Нарізати у WebP-кадри:
   - desktop 1920w ~30fps → `/public/frames/tour/desktop/0001..NNNN.webp`
   - mobile 1080w ~30fps → `/public/frames/tour/mobile/`
   - ціль ~150–180 кадрів сумарно.

## Поведінка скролу / взаємодія
- Кнопка «Пройтись будинком» (у секції 03 або окремо) відкриває fullscreen overlay.
- Overlay: canvas drawImage, індекс кадру ← ScrollTrigger progress (scrub). Скрол униз = вперед, угору = реверс.
- Кнопка «Закрити» (X) повертає на сторінку.
- Preload перших ~20 кадрів eager, решта progressive.
- Опційно: тонкий прогрес-індикатор проходу (% шляху).

## Текст (з content/COPY_nahirna.md)
- CTA кнопки: «Пройтись будинком».
- Можливі мікро-підписи на ключових кадрах (двір / вітальня / вода) — опційно, fade.

## Технічні обмеження
- Lenis синхронізований зі ScrollTrigger. Тільки drawImage (canvas), без важкого WebGL.
- reduced-motion → статичний перший кадр + кнопка закрити (без scrub).
- mobile: легший набір кадрів (1080w), менше кадрів.
- Звільняти пам'ять при закритті overlay.

## Definition of Done
- [ ] overlay відкривається/закривається коректно
- [ ] scrub плавний, 60fps desktop, >=40fps mobile
- [ ] крос-фейди між сценами м'які
- [ ] preload перших кадрів, progressive решта
- [ ] reduced-motion fallback
- [ ] пам'ять звільняється при закритті, GSAP cleanup
