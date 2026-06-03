// Scrim — gradient legibility veil over media, under text. NOT a flat plate: a directional
// gradient that's transparent on the clean part of the media (readability system Рівень 1).
// pointer-events:none, absolute inset:0. The SINGLE scrim primitive used wherever text sits on
// media (hero, anywhere a photo's bright zone fights the text).
type Dir = "top" | "bottom" | "left" | "right";

const STOP = (dir: Dir, a: number) => {
  // a = peak alpha (0..1). Gradient fades to transparent across the safe distance per direction.
  const c = `rgba(15,15,14,${a})`;
  switch (dir) {
    case "top":
      return `linear-gradient(to bottom, ${c} 0%, transparent 38%)`;
    case "bottom":
      return `linear-gradient(to top, ${c} 0%, transparent 48%)`;
    case "left":
      return `linear-gradient(to right, ${c} 0%, transparent 58%)`;
    case "right":
      return `linear-gradient(to left, ${c} 0%, transparent 58%)`;
  }
};

export function Scrim({
  direction = "bottom",
  strength = 0.7,
  className = "",
}: {
  direction?: Dir;
  strength?: number; // 0..1 — peak alpha multiplier
  className?: string;
}) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 ${className}`}
      style={{ background: STOP(direction, Math.min(1, Math.max(0, strength))) }}
    />
  );
}
