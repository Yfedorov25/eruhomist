import type { Metadata } from "next";
import Script from "next/script";
import { Lora, Inter } from "next/font/google";
import { SmoothScrollProvider } from "@/lib/SmoothScrollProvider";
import { listingJsonLd } from "@/lib/jsonld";
import "./globals.css";

// Display: serif with character (CLAUDE.md: PT Serif / Lora — NOT Inter/Roboto/Space Grotesk).
// Lora has full Cyrillic.
const display = Lora({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600"],
  variable: "--font-display",
  display: "swap",
});

// Body: Ukrainian-friendly sans (CLAUDE.md allows Inter for BODY; the display ban is separate).
const body = Inter({
  subsets: ["latin", "cyrillic"],
  weight: ["300", "400", "500"],
  variable: "--font-body",
  display: "swap",
});

// Absolute base for OG/canonical. Explicit site URL → Vercel URL → localhost.
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Дім на Нагірній — власний берег Південного Бугу, Вінниця",
  description:
    "Приватний дім 150 м² на власному березі Південного Бугу. Тупікова вулиця, ~4 сотки берега, " +
    "один поверх. Прокидатися від води, не від сусідів. $270 000.",
  openGraph: {
    title: "Дім на Нагірній — власний берег Південного Бугу",
    description: "Приватний дім 150 м² на власному березі ріки. Тупікова вулиця, без сусідів.",
    locale: "uk_UA",
    type: "website",
  },
};

const GA4 = process.env.NEXT_PUBLIC_GA4_ID;
const CLARITY = process.env.NEXT_PUBLIC_CLARITY_ID;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const jsonLd = listingJsonLd(siteUrl);
  return (
    <html lang="uk" className={`${display.variable} ${body.variable}`} suppressHydrationWarning>
      <head>
        {/* LCP: preload the day hero (eager) so it paints fast (CLAUDE.md perf budget). */}
        <link rel="preload" as="image" href="/images/hero-day-desktop.webp" media="(min-width: 769px)" />
        <link rel="preload" as="image" href="/images/hero-day-mobile.webp" media="(max-width: 768px)" />
        {/* eslint-disable-next-line @next/next/no-sync-scripts */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </head>
      <body className="grain">
        <SmoothScrollProvider>{children}</SmoothScrollProvider>

        {/* GA4 — loaded only when configured (no-ops in dev). */}
        {GA4 ? (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA4}`} strategy="afterInteractive" />
            <Script id="ga4-init" strategy="afterInteractive">
              {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA4}');`}
            </Script>
          </>
        ) : null}

        {/* Microsoft Clarity — loaded only when configured. */}
        {CLARITY ? (
          <Script id="clarity-init" strategy="afterInteractive">
            {`(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window,document,"clarity","script","${CLARITY}");`}
          </Script>
        ) : null}
      </body>
    </html>
  );
}
