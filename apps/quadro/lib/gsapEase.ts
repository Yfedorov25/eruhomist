import gsap from "gsap";
import { CustomEase } from "gsap/CustomEase";

// AIR-calibrated signature ease, registered as a named GSAP ease ("air").
// cubic-bezier(0.25, 0.74, 0.22, 0.99) — slow start, fast middle, gentle settle.
// (Lifted from aircenter.space; the agency-doctrine reveal curve.) Side-effect-only module:
// import it once anywhere a tween wants ease: "air".
if (typeof window !== "undefined") {
  gsap.registerPlugin(CustomEase);
  CustomEase.create("air", "M0,0 C0.25,0.74 0.22,0.99 1,1");
}

export const EASE_AIR = "air";
