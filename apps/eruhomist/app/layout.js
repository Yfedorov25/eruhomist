import { Cormorant, Manrope } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";

// Display-шрифт для заголовків (тонкі великі — weight 300, акценти — 600).
const cormorant = Cormorant({
  variable: "--font-display",
  subsets: ["latin", "cyrillic"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

// Базовий sans для тексту інтерфейсу / kicker-ів.
const manrope = Manrope({
  variable: "--font-sans",
  subsets: ["latin", "cyrillic"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

export const metadata = {
  title: "Єрухомість — нерухомість та девелопмент у Вінниці",
  description:
    "Підбираємо нерухомість під ваш стиль життя — для життя, інвестицій та доходу.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="uk">
      <body className={`${cormorant.variable} ${manrope.variable}`}>
        <Header />
        {children}
      </body>
    </html>
  );
}
