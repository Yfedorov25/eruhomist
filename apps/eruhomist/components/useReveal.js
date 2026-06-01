"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/*
  useReveal — диференційовані entrance-вокабули для секцій.
  Замість fade-up×6 кожна секція обирає свій "почерк" руху.
  Transform/opacity (+ clipPath) — дешево на слабких машинах.
  Поважає prefers-reduced-motion (показує все одразу).

  Вокабули (data-anim значення на елементах усередині scope):
    "rise"   — підйом знизу з легким масштабом (заголовки)
    "clip"   — розкриття зверху-вниз через clipPath (медіа/блоки)
    "scale"  — наближення з 0.94 + opacity (метрики, домінанти)
    "blur"   — проявлення з blur(8px) (текст, м'який вхід)
    "slide-l"/"slide-r" — збоку (асиметричні блоки)

  Опції: { scope, start, stagger, batch (селектор для ScrollTrigger.batch) }
*/

const FROM = {
  rise: { y: 48, opacity: 0, scale: 0.985 },
  clip: { clipPath: "inset(0 0 100% 0)", opacity: 0 },
  scale: { scale: 0.94, opacity: 0, transformOrigin: "left bottom" },
  blur: { opacity: 0, y: 18, filter: "blur(8px)" },
  "slide-l": { x: -56, opacity: 0 },
  "slide-r": { x: 56, opacity: 0 },
};

const TO = {
  rise: { y: 0, opacity: 1, scale: 1 },
  clip: { clipPath: "inset(0 0 0% 0)", opacity: 1 },
  scale: { scale: 1, opacity: 1 },
  blur: { opacity: 1, y: 0, filter: "blur(0px)" },
  "slide-l": { x: 0, opacity: 1 },
  "slide-r": { x: 0, opacity: 1 },
};

export function useReveal(scopeRef, opts = {}) {
  const {
    start = "top 78%",
    stagger = 0.12,
    duration = 1.2,
    ease = "expo.out", // "expensive" deceleration, not bounce
  } = opts;

  useEffect(() => {
    const root = scopeRef.current;
    if (!root) return;

    const ctx = gsap.context(() => {
      const reduce = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;
      const items = gsap.utils.toArray("[data-anim]", root);

      if (reduce) {
        items.forEach((el) =>
          gsap.set(el, { clearProps: "all", opacity: 1 })
        );
        return;
      }

      // group items by vocabulary so each batch staggers within its kind
      const groups = {};
      items.forEach((el) => {
        const kind = el.getAttribute("data-anim") || "rise";
        (groups[kind] ||= []).push(el);
      });

      Object.entries(groups).forEach(([kind, els]) => {
        gsap.set(els, FROM[kind] || FROM.rise);
        ScrollTrigger.batch(els, {
          start,
          once: true,
          onEnter: (batch) =>
            gsap.to(batch, {
              ...(TO[kind] || TO.rise),
              duration,
              ease,
              stagger,
              onStart: () =>
                batch.forEach((b) => b.classList.add("is-in")),
            }),
        });
      });
    }, scopeRef);

    return () => ctx.revert();
  }, [scopeRef, start, stagger, duration, ease]);
}
