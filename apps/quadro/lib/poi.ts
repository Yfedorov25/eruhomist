// Phase 5 — final POI set for the 3D district map. User-selected (8 of 25 candidates).
// Real coords (Apify scrape) are kept for reference, but markers are placed on the STYLIZED
// map by COMPOSITION via `layout` (normalized -1..1 on the map plane), not by lat/lng — the
// district_map.webp is an artistic top-down, not a geo-accurate tile. QUADRO = map center.

export type PoiCategory = "water" | "park" | "food" | "sport" | "mall" | "kids";

export interface Poi {
  id: string;
  cat: PoiCategory;
  title: string;
  km: number;
  walkMin: number | null;
  driveMin: number | null;
  rating: number;
  photo: boolean;
  // normalized position on the map plane (-1..1), placed by composition (see comments below)
  layout: { x: number; z: number };
  text: string;
}

export const QUADRO = {
  title: "QUADRO HOUSE",
  lat: 49.2353,
  lng: 28.4565,
  layout: { x: 0, z: 0 }, // center of the stylized map
  note: "Дім на чотири квартири",
} as const;

// layout placement follows the painted map:
//   the glowing lake is drawn lower-left  -> water goes there;
//   the olive park mass sits near center  -> park near center;
//   the rest fans out around the house by the real-world azimuth.
export const POI: Poi[] = [
  {
    id: "lake-myru",
    cat: "water",
    title: "Озеро Миру",
    km: 2.1,
    walkMin: null,
    driveMin: 7,
    rating: 4.5,
    photo: true,
    layout: { x: -0.55, z: 0.35 },
    text: "Те саме озеро, заради якого будувався дім. Сім хвилин, і ви на воді.",
  },
  {
    id: "park-leontovycha",
    cat: "park",
    title: "Парк Леонтовича",
    km: 0.1,
    walkMin: 2,
    driveMin: null,
    rating: 4.5,
    photo: true,
    layout: { x: 0.12, z: -0.18 },
    text: "Зелена зона за рогом. Дві хвилини пішки до ранкової кави чи вечірньої прогулянки.",
  },
  {
    id: "park-sushka",
    cat: "park",
    title: "Парк Андрія Сушка",
    km: 1.3,
    walkMin: 16,
    driveMin: 4,
    rating: 5.0,
    photo: false,
    layout: { x: 0.38, z: -0.42 },
    text: "Друга зелена зона поруч. Тихі алеї для пробіжки й вихідних із дітьми.",
  },
  {
    id: "next-fitness",
    cat: "sport",
    title: "Next Fitness Hall",
    km: 0.2,
    walkMin: 3,
    driveMin: null,
    rating: 4.8,
    photo: true,
    layout: { x: 0.22, z: 0.15 },
    text: "Зал за три хвилини від дому. Зранку до роботи, і ви вже у формі.",
  },
  {
    id: "la-cucina",
    cat: "food",
    title: "La cucina",
    km: 1.0,
    walkMin: 12,
    driveMin: 3,
    rating: 4.8,
    photo: true,
    layout: { x: 0.5, z: 0.28 },
    text: "Італійська кухня з одним із найвищих рейтингів міста. Вечеря без бронювання за тиждень.",
  },
  {
    id: "lavinia",
    cat: "food",
    title: "Ресторан Лавінія",
    km: 0.7,
    walkMin: 9,
    driveMin: 2,
    rating: 4.6,
    photo: true,
    layout: { x: 0.34, z: 0.4 },
    text: "Ресторан майже під боком. Для вечора, коли нікуди не хочеться їхати.",
  },
  {
    id: "sky-park",
    cat: "mall",
    title: "Sky Park",
    km: 1.1,
    walkMin: 14,
    driveMin: 4,
    rating: 4.5,
    photo: true,
    layout: { x: 0.52, z: -0.05 },
    text: "Покупки, кіно й кав’ярні за кілька хвилин від дому.",
  },
  {
    id: "befirst-kids",
    cat: "kids",
    title: "BeFirst.Kids",
    km: 1.1,
    walkMin: 13,
    driveMin: 3,
    rating: 5.0,
    photo: true,
    layout: { x: -0.18, z: 0.5 },
    text: "Дитячий садок поруч, із найвищим рейтингом. Ранок без дороги через усе місто.",
  },
];

// iconId -> a <symbol> in MapIcons.tsx (SVG sprite, per PB_interactive_map playbook).
export const CATEGORIES: Record<PoiCategory, { iconId: string; label: string }> = {
  water: { iconId: "ic-water", label: "Озеро" },
  park: { iconId: "ic-park", label: "Парки" },
  food: { iconId: "ic-food", label: "Ресторани" },
  sport: { iconId: "ic-sport", label: "Спорт" },
  mall: { iconId: "ic-mall", label: "ТРЦ" },
  kids: { iconId: "ic-kids", label: "Садочки" },
};
