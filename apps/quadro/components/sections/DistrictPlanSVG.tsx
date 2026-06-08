// Hand-authored inline-SVG district plan (PB_interactive_map playbook: the single art asset —
// a drawn plan in the brand palette, NOT a raster tile). Echoes the previous district_map.webp
// composition (radial/octagonal ring streets, glowing lake lower-left, olive park masses) but as
// crisp vector so it stays sharp at any zoom. viewBox 0 0 1200 1200, QUADRO = center (600,600).
// All lines use vector-effect:non-scaling-stroke so they don't fatten when the scene CSS-scales.

const CX = 600;
const CY = 600;

// regular octagon path centered at (CX,CY), vertices offset 22.5° so a flat edge faces up
function octagon(r: number): string {
  const pts = Array.from({ length: 8 }, (_, k) => {
    const a = (Math.PI / 180) * (22.5 + 45 * k);
    return [CX + r * Math.cos(a), CY + r * Math.sin(a)] as const;
  });
  return "M" + pts.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join("L") + "Z";
}

// radial street spokes from inner radius to outer radius (fills the corners with the radial-city feel)
const SPOKES = Array.from({ length: 24 }, (_, k) => {
  const a = (Math.PI / 180) * (15 * k);
  const c = Math.cos(a);
  const s = Math.sin(a);
  return {
    x1: (CX + 165 * c).toFixed(1),
    y1: (CY + 165 * s).toFixed(1),
    x2: (CX + 860 * c).toFixed(1),
    y2: (CY + 860 * s).toFixed(1),
  };
});

const RINGS = [545, 410, 280, 165];

// scattered building blocks (faint copper plates) for texture
const BLOCKS = [
  [150, 170, 52, 30], [995, 205, 44, 28], [880, 980, 50, 26], [205, 980, 40, 34],
  [1010, 760, 30, 44], [165, 740, 28, 40], [470, 150, 46, 24], [690, 1015, 42, 26],
] as const;

export function DistrictPlanSVG({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 1200 1200"
      preserveAspectRatio="xMidYMid slice"
      className={className}
      aria-hidden
      focusable="false"
    >
      <defs>
        <filter id="lakeGlow" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="22" />
        </filter>
        <radialGradient id="vignette" cx="50%" cy="50%" r="62%">
          <stop offset="55%" stopColor="#000" stopOpacity="0" />
          <stop offset="100%" stopColor="#000" stopOpacity="0.55" />
        </radialGradient>
      </defs>

      {/* base */}
      <rect x="0" y="0" width="1200" height="1200" fill="var(--deep)" />

      {/* central district plate — a touch lighter than the surrounds */}
      <path d={octagon(545)} fill="#0e1726" />

      {/* radial spokes (thin, faint copper) */}
      <g stroke="var(--accent)" strokeOpacity="0.16" strokeWidth="1" vectorEffect="non-scaling-stroke">
        {SPOKES.map((l, i) => (
          <line key={i} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} vectorEffect="non-scaling-stroke" />
        ))}
      </g>

      {/* octagonal ring roads */}
      <g fill="none" stroke="var(--accent)" strokeOpacity="0.34" strokeWidth="1.4">
        {RINGS.map((r) => (
          <path key={r} d={octagon(r)} vectorEffect="non-scaling-stroke" />
        ))}
      </g>

      {/* building blocks */}
      <g fill="var(--accent)" fillOpacity="0.12">
        {BLOCKS.map(([x, y, w, h], i) => (
          <rect key={i} x={x} y={y} width={w} height={h} rx="3" />
        ))}
      </g>

      {/* park masses (olive) */}
      <g fill="#565d2c">
        <path d="M560 520 C575 485 640 470 690 490 C735 508 732 560 705 585 C675 612 600 616 575 590 C552 567 548 545 560 520 Z" />
        <path d="M740 405 C760 388 802 392 810 415 C816 438 792 456 768 452 C746 448 728 422 740 405 Z" fillOpacity="0.92" />
      </g>

      {/* lake (lower-left) — soft glow + body + highlight */}
      <g>
        <path
          d="M300 700 C362 705 412 760 406 826 C400 896 350 956 294 950 C244 945 218 882 234 816 C248 758 255 698 300 700 Z"
          fill="#4f8fc4"
          filter="url(#lakeGlow)"
          opacity="0.55"
        />
        <path
          d="M300 702 C360 708 408 760 402 824 C396 892 348 950 296 944 C248 939 224 880 239 818 C252 760 258 700 300 702 Z"
          fill="#2f5573"
        />
        <path
          d="M300 702 C360 708 408 760 402 824 C396 892 348 950 296 944 C248 939 224 880 239 818 C252 760 258 700 300 702 Z"
          fill="none"
          stroke="#7fb4dd"
          strokeOpacity="0.5"
          strokeWidth="1.2"
          vectorEffect="non-scaling-stroke"
        />
      </g>

      {/* edge vignette so the plan fades into the dark frame */}
      <rect x="0" y="0" width="1200" height="1200" fill="url(#vignette)" />
    </svg>
  );
}
