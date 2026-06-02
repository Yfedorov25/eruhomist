import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, getMessages, locales, type Locale } from "@/lib/i18n";
import { Preloader } from "@/components/Preloader";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const m = getMessages(locale).meta;
  return {
    title: m.title,
    description: m.description,
    // The root-level opengraph-image file is not auto-merged once a segment supplies its
    // own openGraph object, so reference it explicitly (resolved absolute via metadataBase).
    openGraph: {
      title: m.ogTitle,
      description: m.ogDescription,
      images: ["/opengraph-image.jpg"],
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  // The <html> element + smooth-scroll provider live in the root layout (above this),
  // so a locale switch never recreates them. We just scope the lang + render content.
  return (
    <div lang={locale} data-locale={locale as Locale}>
      <Preloader />
      {children}
    </div>
  );
}
