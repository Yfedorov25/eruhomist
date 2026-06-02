import { notFound } from "next/navigation";
import { isLocale, getMessages } from "@/lib/i18n";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/sections/Hero";
import { Concept } from "@/components/sections/Concept";
import { Architecture } from "@/components/sections/Architecture";
import { Courtyard } from "@/components/sections/Courtyard";
import { Roof } from "@/components/sections/Roof";
import { DistrictMap } from "@/components/sections/DistrictMap";
import { Specs } from "@/components/sections/Specs";
import { Contact } from "@/components/sections/Contact";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const m = getMessages(locale);

  return (
    <>
      <Header locale={locale} m={m} />
      <main>
        <Hero m={m} />
        {/* Post-hero content rides a stable evening surface so body copy keeps a
            guaranteed contrast floor (the hero owns the full day→night sweep). */}
        <div className="content-surface">
          <Concept m={m} />
          <Architecture m={m} />
          <Courtyard m={m} />
          <Roof m={m} />
          <DistrictMap m={m} />
          <Specs m={m} />
          <Contact m={m} />
        </div>
      </main>
      <Footer locale={locale} m={m} />
    </>
  );
}
