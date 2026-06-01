#!/usr/bin/env node
/*
  Hero frame pipeline: source MP4 -> contiguous WebP sequence in
  apps/quadro/public/frames/hero/{desktop,mobile}/0001..NNNN.webp.

  Approach (deterministic): extract ALL frames at the target width, then KEEP an
  even subset of FRAME_TARGET and renumber the kept files 0001..NNNN contiguously.
  Avoids ffmpeg `select`'s per-file numbering quirks (it numbered desktop and mobile
  differently). The hero is scroll-scrubbed over a ~400vh pin, so smoothness depends
  on frames-per-scroll-distance, not playback fps — ~96 frames is smooth.

  Budget (TZ §5): the LCP-critical weight is the EAGER first ~20 frames, not the whole
  set (rest loads progressively + is gitignored/CDN-cached). We report both the eager-20
  weight and the full-set weight.

  Run from apps/quadro:  npm run frames
  Override: WEBP_QUALITY=72 FRAME_TARGET=96 npm run frames
*/
import { execFileSync } from "node:child_process";
import { mkdirSync, rmSync, renameSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, resolve } from "node:path";

const QUADRO = resolve(import.meta.dirname, "..");
const VIDEOS = resolve(QUADRO, "../../quadro_house/public/videos");
const QUALITY = Number(process.env.WEBP_QUALITY ?? 72);
const FRAME_TARGET = Number(process.env.FRAME_TARGET ?? 96);
const EAGER = 20;
const pad = (n) => String(n).padStart(4, "0");

// libwebp extraction frame count varies per source (mobile MP4 has irregular
// timestamps → ffmpeg emits ~136, desktop emits 145). So compute the kept-subset
// indices against the ACTUAL extracted count, per set — fully robust.
function evenSubset(total, target) {
  const t = Math.min(target, total);
  return Array.from({ length: t }, (_, i) =>
    Math.round((i * (total - 1)) / (t - 1)),
  );
}

const sets = [
  { name: "desktop", src: "hero-desktop.mp4", width: 1920 },
  { name: "mobile", src: "hero-mobile.mp4", width: 1080 },
];

function extract({ name, src, width }) {
  const srcPath = join(VIDEOS, src);
  if (!existsSync(srcPath)) throw new Error(`missing source video: ${srcPath}`);
  const outDir = join(QUADRO, "public", "frames", "hero", name);
  const tmpDir = join(outDir, "_all");
  rmSync(outDir, { recursive: true, force: true });
  mkdirSync(tmpDir, { recursive: true });

  // 1. extract every source frame at target width (contiguous 0001..0145).
  execFileSync(
    "ffmpeg",
    [
      "-loglevel", "error",
      "-i", srcPath,
      "-vf", `scale=${width}:-2:flags=lanczos`,
      "-vsync", "0",
      "-c:v", "libwebp",
      "-quality", String(QUALITY),
      "-compression_level", "6",
      "-preset", "photo",
      "-an",
      join(tmpDir, "%04d.webp"),
    ],
    { stdio: ["ignore", "ignore", "inherit"] },
  );

  // 2. keep an even subset of whatever was extracted, renumber contiguously.
  const extracted = readdirSync(tmpDir).filter((f) => f.endsWith(".webp")).sort();
  const keepIdx = evenSubset(extracted.length, FRAME_TARGET);
  keepIdx.forEach((zeroBased, i) => {
    renameSync(join(tmpDir, extracted[zeroBased]), join(outDir, `${pad(i + 1)}.webp`));
  });
  rmSync(tmpDir, { recursive: true, force: true });

  const files = readdirSync(outDir).filter((f) => f.endsWith(".webp")).sort();
  const sum = (arr) => arr.reduce((s, f) => s + statSync(join(outDir, f)).size, 0);
  const fullMb = sum(files) / 1024 / 1024;
  const eagerMb = sum(files.slice(0, EAGER)) / 1024 / 1024;
  console.log(
    `[${name}] ${files.length} frames | eager-${EAGER}: ${eagerMb.toFixed(2)} MB | ` +
      `full: ${fullMb.toFixed(2)} MB (q=${QUALITY}, ${width}w)`,
  );
  return { name, count: files.length, eagerMb, fullMb };
}

const results = sets.map(extract);
const desktop = results.find((r) => r.name === "desktop");
console.log(`\nFRAME_COUNT for the hero = ${desktop?.count ?? FRAME_TARGET}`);
