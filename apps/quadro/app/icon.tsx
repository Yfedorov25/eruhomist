import { ImageResponse } from "next/og";

// Favicon — the QUADRO "Q" on the deep evening color with a warm accent, generated at
// build (no binary asset to maintain). 32px is the browser tab size.
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0a1018",
          color: "#e0a96d",
          fontSize: 24,
          fontFamily: "Georgia, serif",
          fontWeight: 600,
        }}
      >
        Q
      </div>
    ),
    size,
  );
}
