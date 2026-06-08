import gsap from "gsap";
import { CustomEase } from "gsap/CustomEase";

// AIR-calibrated signature ease, registered as a named GSAP ease ("air").
// cubic-bezier(0.25, 0.74, 0.22, 0.99) — slow start, fast middle, gentle settle.
// (Lifted exactly from aircenter.space, used there on 23 of their reveals.)
// Side-effect-only module: import it once anywhere a tween wants ease: "air".
if (typeof window !== "undefined") {
  gsap.registerPlugin(CustomEase);
  CustomEase.create("air", "M0,0 C0.25,0.74 0.22,0.99 1,1");
}

export const EASE_AIR = "air";
