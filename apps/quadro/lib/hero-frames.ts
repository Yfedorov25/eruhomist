// Hero frame-sequence manifest. Regenerate frames with `npm run frames`.
// Count is the contiguous-renumbered subset size (see scripts/extract-frames.mjs).
// 96 frames over a ~400vh scrub = ~one frame per 4vh — smooth; desktop eager-20
// (LCP-critical) ~4.4MB, full ~17.6MB streamed progressively.
export const HERO_FRAME_COUNT = 96;
export const HERO_EAGER_COUNT = 20; // preload before reveal; rest progressive

export const pad4 = (n: number) => String(n).padStart(4, "0");

export function heroFramePath(set: "desktop" | "mobile", index1based: number): string {
  return `/frames/hero/${set}/${pad4(index1based)}.webp`;
}

// Day poster = first frame; used as the LCP element + reduced-motion/no-WebGL fallback.
export const HERO_POSTER = {
  desktop: heroFramePath("desktop", 1),
  mobile: heroFramePath("mobile", 1),
};
