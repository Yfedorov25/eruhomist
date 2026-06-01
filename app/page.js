import HeroSection from "@/components/HeroSection";
import Directions from "@/components/Directions";
import Catalog from "@/components/Catalog";
import Investment from "@/components/Investment";
import Cases from "@/components/Cases";
import About from "@/components/About";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main>
      <HeroSection />
      <Directions />
      <Catalog />
      <Investment />
      <Cases />
      <About />
      <Contact />
      <Footer />
    </main>
  );
}
