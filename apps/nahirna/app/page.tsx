import Hero from "@/components/sections/00-Hero";
import Water from "@/components/sections/01-Water";
import Architecture from "@/components/sections/02-Architecture";
import Space from "@/components/sections/03-Space";
import Floorplan from "@/components/sections/04-Floorplan";
import Walkthrough from "@/components/sections/05-Walkthrough";
import Location from "@/components/sections/06-Location";
import Facts from "@/components/sections/07-Facts";
import CTA from "@/components/sections/08-CTA";
import Footer from "@/components/sections/09-Footer";
import { CallPill } from "@/components/ui/CallPill";
import { Cursor } from "@/components/ui/Cursor";
import { Preloader } from "@/components/ui/Preloader";

// The landing assembles sections 00→09 in order. Each is its own component under
// components/sections. The CallPill rides above everything once past the water section.
export default function Page() {
  return (
    <>
      <Preloader />
      <main>
        <Hero />
        <Water />
        <Architecture />
        <Space />
        <Floorplan />
        <Walkthrough />
        <Location />
        <Facts />
        <CTA />
      </main>
      <Footer />
      <CallPill />
      <Cursor />
    </>
  );
}
