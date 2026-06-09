"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { typo } from "@/lib/typo";

// Fullscreen lightbox (ERA imageZoom idiom). Opens from the gallery strip, arrows/keys/swipe to
// move, Esc or backdrop to close. Body scroll is locked while open. No new motion language — a
// plain air-eased fade via CSS. Touch swipe handled inline (no extra dep).
export type Shot = { src: string; alt: string; title: string; meta: string };

export function Lightbox({
  shots,
  index,
  onClose,
  onStep,
}: {
  shots: Shot[];
  index: number | null;
  onClose: () => void;
  onStep: (dir: 1 | -1) => void;
}) {
  const open = index !== null;
  const dialogRef = useRef<HTMLDivElement>(null);

  // Keyboard nav + body scroll lock + focus management (aria-modal contract):
  // move focus into the dialog on open, restore it to the trigger on close, trap Tab.
  useEffect(() => {
    if (!open) return;
    const restoreTo = document.activeElement as HTMLElement | null;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") return onClose();
      if (e.key === "ArrowRight") return onStep(1);
      if (e.key === "ArrowLeft") return onStep(-1);
      if (e.key === "Tab") {
        // Trap focus within the dialog.
        const f = dialogRef.current?.querySelectorAll<HTMLElement>("button");
        if (!f || f.length === 0) return;
        const first = f[0];
        const last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    // Move focus in (next frame so the dialog is mounted).
    const id = requestAnimationFrame(() => dialogRef.current?.querySelector("button")?.focus());

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      cancelAnimationFrame(id);
      restoreTo?.focus?.();
    };
  }, [open, onClose, onStep]);

  // Touch swipe (mobile).
  const touchX = useRef(0);
  const onTouchStart = (e: React.TouchEvent) => (touchX.current = e.touches[0].clientX);
  const onTouchEnd = (e: React.TouchEvent) => {
    const dx = e.changedTouches[0].clientX - touchX.current;
    if (Math.abs(dx) > 44) onStep(dx < 0 ? 1 : -1);
  };

  if (!open) return null;
  const s = shots[index!];

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label={s.title}
      onClick={(e) => e.target === e.currentTarget && onClose()}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[rgba(8,8,7,0.95)] p-6 md:p-10"
      style={{ animation: "lb-fade 0.3s var(--ease-signature, ease) both" }}
    >
      <button
        aria-label="Закрити"
        onClick={onClose}
        className="absolute right-5 top-5 z-10 text-3xl leading-none text-[var(--color-text)]/80 transition-opacity hover:opacity-100 md:right-7 md:top-6"
      >
        ×
      </button>

      <button
        aria-label="Попереднє фото"
        onClick={() => onStep(-1)}
        className="absolute left-1 top-1/2 z-10 hidden -translate-y-1/2 px-4 text-4xl text-[var(--color-warm)]/85 transition-opacity hover:opacity-100 md:block"
      >
        ‹
      </button>
      <button
        aria-label="Наступне фото"
        onClick={() => onStep(1)}
        className="absolute right-1 top-1/2 z-10 hidden -translate-y-1/2 px-4 text-4xl text-[var(--color-warm)]/85 transition-opacity hover:opacity-100 md:block"
      >
        ›
      </button>

      <figure className="relative flex max-h-full max-w-[92vw] flex-col items-center">
        <div className="relative h-[78vh] w-[92vw] max-w-5xl">
          <Image
            src={s.src}
            alt={s.alt}
            fill
            sizes="92vw"
            priority
            className="object-contain"
          />
        </div>
        <figcaption className="mt-4 text-center">
          <span className="font-[var(--font-display)] text-base text-[var(--color-text)]" style={{ fontFamily: "var(--font-display)" }}>
            {typo(s.title)}
          </span>
          <span className="mt-1 block text-[11px] uppercase tracking-[0.16em] text-[var(--color-text-muted)]">
            {s.meta} · {index! + 1} / {shots.length}
          </span>
        </figcaption>
      </figure>
    </div>
  );
}
