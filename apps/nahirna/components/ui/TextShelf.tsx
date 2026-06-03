import type { ReactNode } from "react";

// TextShelf — diptych: text lives on a solid chocolate panel BESIDE the media, never over it
// (readability system Рівень 2). Illegibility is impossible by construction. Used by §02.
// Desktop: side-by-side (shelf | media). Mobile: shelf stacks above media.
// `shelfSide` puts the text panel left or right. `ratio` is the shelf width fraction on desktop.
export function TextShelf({
  shelf,
  media,
  shelfSide = "left",
  className = "",
}: {
  shelf: ReactNode;
  media: ReactNode;
  shelfSide?: "left" | "right";
  className?: string;
}) {
  const shelfFirst = shelfSide === "left";
  return (
    <div className={`grid grid-cols-1 md:grid-cols-12 ${className}`}>
      {/* Shelf — solid chocolate panel, text always readable. */}
      <div
        className={`relative z-10 flex flex-col justify-center bg-[#1a1510] px-6 py-12 md:px-12 md:py-16 md:col-span-5 ${
          shelfFirst ? "md:order-1" : "md:order-2"
        }`}
      >
        {/* subtle warm inner edge so the panel isn't a flat fill */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(120% 80% at 0% 0%, rgba(232,201,160,0.05) 0%, transparent 55%)",
          }}
        />
        <div className="relative">{shelf}</div>
      </div>

      {/* Media — fills its column. */}
      <div
        className={`relative overflow-hidden md:col-span-7 ${
          shelfFirst ? "md:order-2" : "md:order-1"
        }`}
      >
        {media}
      </div>
    </div>
  );
}
