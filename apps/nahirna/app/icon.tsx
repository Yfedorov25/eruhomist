import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

// Favicon: warm-gold "Н" (Нагірна) monogram on chocolate-night, matching the brand tokens.
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
          background: "#0f0f0e",
          color: "#e8c9a0",
          fontSize: 22,
          fontWeight: 600,
          fontFamily: "Georgia, serif",
          borderRadius: 6,
        }}
      >
        Н
      </div>
    ),
    size,
  );
}
