import { FACTS, CONTACT, phoneReady } from "@/lib/site";

// JSON-LD for the listing. Rendered in the SSR shell so the price/area/address are machine
// -readable for search + rich results (this is a lead-gen site — SEO is part of the product).
export function listingJsonLd(siteUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "SingleFamilyResidence",
    name: "Дім на Нагірній",
    description:
      "Приватний одноповерховий будинок 150 м² на першій лінії до Південного Бугу, " +
      "вул. Нагірна, Вінниця. Тупікова вулиця, ~4 сотки прибережної зони.",
    url: siteUrl,
    image: `${siteUrl}/images/hero-night-desktop.webp`,
    numberOfRooms: FACTS.bedrooms,
    floorSize: { "@type": "QuantitativeValue", value: FACTS.areaHouse, unitCode: "MTK" },
    numberOfBedrooms: FACTS.bedrooms,
    address: {
      "@type": "PostalAddress",
      streetAddress: "вул. Нагірна",
      addressLocality: "Вінниця",
      addressCountry: "UA",
    },
    ...(phoneReady() ? { telephone: CONTACT.phoneTel } : {}),
    offers: {
      "@type": "Offer",
      price: FACTS.priceUsd,
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
    },
  };
}
