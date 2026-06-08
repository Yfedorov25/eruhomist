"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

// Custom cursor — a warm ring that trails the pointer (gsap.quickTo) with three contextual modes:
// default ring (blend-difference, reads on the day→night sweep), grow over clickables, and a
// filled label disc over [data-cursor="…"] elements. Desktop + fine-pointer only.
export function Cursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduced) return;

    const dot = dotRef.current;
    const label = labelRef.current;
    if (!dot || !label) return;

    gsap.set(dot, { xPercent: -50, yPercent: -50, opacity: 0 });
    const xTo = gsap.quickTo(dot, "x", { duration: 0.35, ease: "power3.out" });
    const yTo = gsap.quickTo(dot, "y", { duration: 0.35, ease: "power3.out" });

    let shown = false;
    let mode = "";
    let labelText = "";
    const apply = (next: "default" | "grow" | "label", text = "") => {
      if (next === mode && text === labelText) return;
      mode = next;
      labelText = text;
      if (next === "label") {
        label.textContent = text;
        dot.style.mixBlendMode = "normal";
        gsap.to(dot, { width: 56, height: 56, backgroundColor: "var(--accent)", borderColor: "rgba(0,0,0,0)", duration: 0.32, ease: "power3.out" });
        gsap.to(label, { opacity: 1, duration: 0.25 });
      } else {
        dot.style.mixBlendMode = "difference";
        gsap.to(label, { opacity: 0, duration: 0.12 });
        const size = next === "grow" ? 30 : 12;
        gsap.to(dot, { width: size, height: size, backgroundColor: "rgba(0,0,0,0)", borderColor: "var(--accent)", duration: 0.3, ease: "power3.out" });
      }
    };

    const onMove = (e: MouseEvent) => {
      if (!shown) {
        shown = true;
        gsap.to(dot, { opacity: 1, duration: 0.4 });
      }
      xTo(e.clientX);
      yTo(e.clientY);
      const t = e.target as HTMLElement;
      const labeled = t.closest<HTMLElement>("[data-cursor]");
      if (labeled?.dataset.cursor) apply("label", labeled.dataset.cursor);
      else if (t.closest("a, button, input, label, [role=button], summary")) apply("grow");
      else apply("default");
    };
    const onLeave = () => gsap.to(dot, { opacity: 0, duration: 0.3 });

    window.addEventListener("mousemove", onMove);
    document.addEventListener("mouseleave", onLeave);
    return () => {
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return (
    <div
      ref={dotRef}
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[200] hidden h-3 w-3 items-center justify-center rounded-full md:flex"
      style={{ border: "1px solid var(--accent)", mixBlendMode: "difference", willChange: "transform" }}
    >
      <span ref={labelRef} className="pointer-events-none max-w-[46px] select-none text-center text-[8.5px] font-medium uppercase leading-[1.05] tracking-[0.06em] text-[var(--deep)] opacity-0" />
    </div>
  );
}
