"use client";

import { useEffect, useRef } from "react";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { ScreenQuad } from "@react-three/drei";
import * as THREE from "three";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { FrameDecoder } from "@/lib/FrameDecoder";
import { HERO_FRAME_COUNT, HERO_EAGER_COUNT, HERO_POSTER } from "@/lib/hero-frames";

gsap.registerPlugin(ScrollTrigger);

// R01 + R05: scroll-scrubbed frame-sequence on a fullscreen plane, one THREE.Texture
// fed by the sliding-window decoder, with a GLSL grain + vignette pass. Driven by the
// GLOBAL ScrollTrigger (NOT drei ScrollControls). frameloop="demand" + invalidate()
// so we only paint when the frame index or grain time actually changes.
function FrameMesh({
  set,
  pinTarget,
  onReady,
}: {
  set: "desktop" | "mobile";
  pinTarget: string;
  onReady: () => void;
}) {
  const { invalidate, gl } = useThree();
  const matRef = useRef<THREE.ShaderMaterial | null>(null);
  const texRef = useRef<THREE.Texture | null>(null);
  const decoderRef = useRef<FrameDecoder | null>(null);
  const currentRef = useRef(0);
  const velocityRef = useRef(0);
  const grainOn = set === "desktop"; // grain off on mobile (fragment-op budget)

  // material (created once)
  if (!matRef.current) {
    const tex = new THREE.Texture();
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;
    tex.generateMipmaps = false;
    // ImageBitmap sources are NOT auto-flipped by three's flipY the way HTMLImage is;
    // disable flipY here and flip V in the vertex shader so all decode paths match.
    tex.flipY = false;
    texRef.current = tex;
    matRef.current = new THREE.ShaderMaterial({
      uniforms: {
        uTex: { value: tex },
        uTime: { value: 0 },
        uGrain: { value: grainOn ? 0.04 : 0.0 },
        uVig: { value: 0.5 },
        uHasTex: { value: 0 },
      },
      // ScreenQuad: position.xy is already in NDC (-1..1). Derive UV from it and flip V
      // (ImageBitmap is top-left origin; WebGL samples bottom-left).
      vertexShader: `
        varying vec2 vUv;
        void main(){
          vUv = vec2(position.x * 0.5 + 0.5, 0.5 - position.y * 0.5);
          gl_Position = vec4(position.xy, 0.0, 1.0);
        }
      `,
      fragmentShader: `
        varying vec2 vUv;
        uniform sampler2D uTex; uniform float uTime,uGrain,uVig,uHasTex;
        float rand(vec2 c){ return fract(sin(dot(c,vec2(12.9898,78.233)))*43758.5453); }
        void main(){
          vec4 col = texture2D(uTex, vUv);
          if (uHasTex < 0.5) { gl_FragColor = vec4(0.04,0.055,0.085,1.0); return; }
          float g = (rand(vUv + uTime) - 0.5) * uGrain;
          col.rgb += g;
          float d = distance(vUv, vec2(0.5));
          col.rgb *= smoothstep(0.95, 0.3 * uVig, d) * 0.45 + 0.55;
          gl_FragColor = vec4(col.rgb, 1.0);
        }
      `,
    });
  }

  useEffect(() => {
    const mat = matRef.current!;
    const tex = texRef.current!;

    let lastUploaded: CanvasImageSource | null = null;
    const setFrame = (idx: number) => {
      const i = Math.max(0, Math.min(HERO_FRAME_COUNT - 1, Math.round(idx)));
      const sameFrame = i === currentRef.current;
      currentRef.current = i;
      decoder.update(i);
      const bmp = decoder.nearestDecoded(i);
      // Only re-upload to the GPU when the actual decoded image changed — skips the
      // costly texture upload when the rounded frame index didn't move (fast scroll).
      if (bmp && bmp !== lastUploaded) {
        tex.image = bmp;
        tex.needsUpdate = true;
        lastUploaded = bmp;
        mat.uniforms.uHasTex.value = 1;
        invalidate();
      } else if (!sameFrame) {
        invalidate();
      }
    };

    const decoder = new FrameDecoder(set, HERO_FRAME_COUNT, (decodedIdx) => {
      // if the frame we're waiting on just arrived, repaint
      if (Math.abs(decodedIdx - currentRef.current) <= 1) setFrame(currentRef.current);
    });
    decoderRef.current = decoder;

    let st: ScrollTrigger | null = null;
    decoder.preload(HERO_EAGER_COUNT).then(() => {
      setFrame(0);
      onReady();
      st = ScrollTrigger.create({
        trigger: pinTarget,
        start: "top top",
        end: "+=300%",
        pin: true,
        scrub: true,
        onUpdate: (self) => {
          velocityRef.current = self.getVelocity();
          setFrame(self.progress * (HERO_FRAME_COUNT - 1));
        },
      });
      ScrollTrigger.refresh();
    });

    // WebGL context loss: re-upload current frame on restore.
    const canvas = gl.domElement;
    const onLost = (e: Event) => e.preventDefault();
    const onRestored = () => setFrame(currentRef.current);
    canvas.addEventListener("webglcontextlost", onLost);
    canvas.addEventListener("webglcontextrestored", onRestored);

    return () => {
      canvas.removeEventListener("webglcontextlost", onLost);
      canvas.removeEventListener("webglcontextrestored", onRestored);
      st?.kill();
      decoder.destroy();
      tex.dispose();
      mat.dispose();
    };
  }, [set, pinTarget, onReady, invalidate, gl]);

  // Animate grain only while actively scrolling (velocity-gated) to avoid 60fps-forever.
  useFrame((state) => {
    if (!grainOn || !matRef.current) return;
    if (Math.abs(velocityRef.current) > 1) {
      matRef.current.uniforms.uTime.value = state.clock.elapsedTime;
      velocityRef.current *= 0.9; // decay so it settles when scroll stops
      invalidate();
    }
  });

  // ScreenQuad always fills the viewport regardless of camera/resize — removes all
  // plane-sizing ambiguity for a fullscreen shader pass.
  return <ScreenQuad material={matRef.current} />;
}

export function HeroCanvas({
  set,
  pinTarget,
  onReady,
}: {
  set: "desktop" | "mobile";
  pinTarget: string;
  onReady: () => void;
}) {
  return (
    <Canvas
      frameloop="demand"
      gl={{ antialias: false, powerPreference: "high-performance" }}
      camera={{ position: [0, 0, 1], fov: 50 }}
      style={{ position: "absolute", inset: 0 }}
    >
      <FrameMesh set={set} pinTarget={pinTarget} onReady={onReady} />
    </Canvas>
  );
}

// re-export poster for the parent's static fallback
export { HERO_POSTER };
