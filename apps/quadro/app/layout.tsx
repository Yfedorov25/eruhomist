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

// Absolute base for OG/canonical URLs. Prefer an explicit site URL; fall back to the
// Vercel deployment URL; finally localhost for dev. Without metadataBase the
// opengraph-image resolves to a relative path and link previews break in messengers.
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3210");

export const metadata: Metadata = {
  // Per-locale title/description/OG live in app/[locale]/layout.tsx; this is the fallback.
  metadataBase: new URL(siteUrl),
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
