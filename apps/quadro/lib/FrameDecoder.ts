// Sliding-window frame decoder (pattern proven in apps/eruhomist/components/HeroSection.jsx).
// fetch -> blob -> createImageBitmap, keeping only a window of decoded frames in RAM
// (caps memory at ~window*frameSize instead of all 96 decoded, which would be ~hundreds of MB).
// Fast-scroll to an undecoded frame returns the nearest decoded one (never blank).

import { heroFramePath } from "./hero-frames";

const WINDOW_BACK = 8;
const WINDOW_AHEAD = 16;
const MAX_CONCURRENT = 6;

type Decoded = ImageBitmap | HTMLImageElement;

export class FrameDecoder {
  private set: "desktop" | "mobile";
  private count: number;
  private cache = new Map<number, Decoded>();
  private inflight = new Set<number>();
  private queue: number[] = [];
  private active = 0;
  private supportsBitmap =
    typeof window !== "undefined" && typeof window.createImageBitmap === "function";
  private onDecode?: (i: number) => void;
  private destroyed = false;

  constructor(set: "desktop" | "mobile", count: number, onDecode?: (i: number) => void) {
    this.set = set;
    this.count = count;
    this.onDecode = onDecode;
  }

  // Nearest already-decoded frame to `idx` (so the canvas is never blank during load).
  nearestDecoded(idx: number): Decoded | null {
    if (this.cache.has(idx)) return this.cache.get(idx)!;
    for (let r = 1; r < this.count; r++) {
      if (this.cache.has(idx - r)) return this.cache.get(idx - r)!;
      if (this.cache.has(idx + r)) return this.cache.get(idx + r)!;
    }
    return null;
  }

  has(idx: number) {
    return this.cache.has(idx);
  }

  // Ensure the window around `current` is queued; evict frames outside it.
  update(current: number) {
    if (this.destroyed) return;
    const lo = Math.max(0, current - WINDOW_BACK);
    const hi = Math.min(this.count - 1, current + WINDOW_AHEAD);
    for (const key of this.cache.keys()) {
      if (key < lo - WINDOW_BACK || key > hi + WINDOW_AHEAD) {
        const bmp = this.cache.get(key);
        if (bmp && "close" in bmp && typeof bmp.close === "function") bmp.close();
        this.cache.delete(key);
      }
    }
    // queue ahead-first (scroll usually goes forward)
    for (let i = current; i <= hi; i++) this.enqueue(i);
    for (let i = current - 1; i >= lo; i--) this.enqueue(i);
    this.pump();
  }

  // Eager-preload the first n frames; resolves once frame 0 is ready (reveal trigger).
  preload(n: number): Promise<void> {
    for (let i = 0; i < Math.min(n, this.count); i++) this.enqueue(i);
    this.pump();
    return new Promise((resolve) => {
      const check = () => {
        if (this.destroyed || this.cache.has(0)) resolve();
        else setTimeout(check, 30);
      };
      check();
    });
  }

  private enqueue(i: number) {
    if (i < 0 || i >= this.count) return;
    if (this.cache.has(i) || this.inflight.has(i) || this.queue.includes(i)) return;
    this.queue.push(i);
  }

  private pump() {
    while (this.active < MAX_CONCURRENT && this.queue.length) {
      const i = this.queue.shift()!;
      if (this.cache.has(i) || this.inflight.has(i)) continue;
      this.inflight.add(i);
      this.active++;
      this.decode(i).finally(() => {
        this.inflight.delete(i);
        this.active--;
        if (!this.destroyed) this.pump();
      });
    }
  }

  private async decode(i: number): Promise<void> {
    const path = heroFramePath(this.set, i + 1); // files are 1-based
    try {
      const res = await fetch(path);
      const blob = await res.blob();
      let bmp: Decoded;
      if (this.supportsBitmap) {
        bmp = await createImageBitmap(blob);
      } else {
        bmp = await new Promise<HTMLImageElement>((resolve, reject) => {
          const img = new Image();
          img.onload = () => resolve(img);
          img.onerror = reject;
          img.src = URL.createObjectURL(blob);
        });
      }
      if (this.destroyed) {
        if ("close" in bmp && typeof bmp.close === "function") bmp.close();
        return;
      }
      this.cache.set(i, bmp);
      this.onDecode?.(i);
    } catch {
      /* swallow — nearestDecoded covers the gap */
    }
  }

  destroy() {
    this.destroyed = true;
    this.queue = [];
    for (const bmp of this.cache.values()) {
      if (bmp && "close" in bmp && typeof bmp.close === "function") bmp.close();
    }
    this.cache.clear();
  }
}
