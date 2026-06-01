import type { Metadata } from "next";
import { Cormorant, Manrope } from "next/font/google";
import { SmoothScrollProvider } from "@/lib/SmoothScrollProvider";
import "./globals.css";

// Display: high-contrast antiqua (NOT Inter/Roboto/Space Grotesk). Cyrillic + Latin.
const display = Cormorant({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600"],
  variable: "--font-display",
  display: "swap",
});

// Body: clean, refined grotesk with Cyrillic support.
const body = Manrope({
  subsets: ["latin", "cyrillic"],
  weight: ["300", "400", "500"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  // Per-locale metadata is set in app/[locale]/layout.tsx; this is the fallback.
  title: "QUADRO HOUSE",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html className={`${display.variable} ${body.variable}`} suppressHydrationWarning>
      <body>
        <SmoothScrollProvider>{children}</SmoothScrollProvider>
      </body>
    </html>
  );
}
