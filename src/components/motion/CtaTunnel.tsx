"use client";

import { prefersReducedMotion, setupGsap } from "@/lib/motion";
import { useLayoutEffect, useRef, useState } from "react";

import ShaderTunnel from "./ShaderTunnel";

// The tunnel's light, core to edge (also lights the footer wordmark).
export const TUNNEL_STOPS =
  "#ff7a1a 0%, #f2631a 6%, #d24e22 12%, #9c3a36 19%, #5e2b4f 27%, #2e2163 36%, #161a5c 46%, #0c1148 58%, #070b33 72%, #03061d 86%, #01020c 100%";

// The still card's light (the ride draws its own, in ShaderTunnel).
const BACKGROUND = `radial-gradient(circle at 50% 50%, ${TUNNEL_STOPS})`;
// Where that light rests on the card, as a share of its width and height: low and to the right.
const GLOW_REST = { x: 0.88, y: 1.05 };

/**
 * CTA card that, once centered, grows to fill the screen and then flies the
 * viewer through a tunnel of light and the things we can build together.
 */
export default function CtaTunnel({
  children,
  still = false,
}: {
  children: React.ReactNode;
  /** Just the card, with no scroll ride: for pages that already end on a strong note. */
  still?: boolean;
}) {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const cardGlowRef = useRef<HTMLDivElement | null>(null);
  const [animated, setAnimated] = useState(!still);

  // Reduced motion gets the still card too.
  useLayoutEffect(() => {
    if (still || prefersReducedMotion()) setAnimated(false);
  }, [still]);

  // Still card: the orange glow rests low in a corner, leans toward the
  // pointer and drifts back on leave.
  useLayoutEffect(() => {
    const card = cardRef.current;
    const glow = cardGlowRef.current;
    if (animated || !card || !glow) return;
    if (prefersReducedMotion() || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const gsap = setupGsap();
    const xTo = gsap.quickTo(glow, "x", { duration: 0.9, ease: "power3.out" });
    const yTo = gsap.quickTo(glow, "y", { duration: 0.9, ease: "power3.out" });

    const onMove = (e: PointerEvent) => {
      const rect = card.getBoundingClientRect();
      // Offsets from the resting corner, halved so the light leans rather than follows.
      xTo((e.clientX - rect.left - rect.width * GLOW_REST.x) * 0.5);
      yTo((e.clientY - rect.top - rect.height * GLOW_REST.y) * 0.5);
    };
    const onLeave = () => {
      xTo(0);
      yTo(0);
    };
    card.addEventListener("pointermove", onMove);
    card.addEventListener("pointerleave", onLeave);
    return () => {
      card.removeEventListener("pointermove", onMove);
      card.removeEventListener("pointerleave", onLeave);
      gsap.killTweensOf(glow);
      gsap.set(glow, { clearProps: "transform" });
    };
  }, [animated]);

  if (!animated) {
    return (
      <section className={`max-w-[1280px] mx-auto w-full px-6 md:px-8 pb-8 ${still ? "" : "pt-16"}`}>
        <div
          ref={cardRef}
          className="relative overflow-hidden rounded-card bg-[#01020c] py-8 md:py-10"
        >
          {/* A faint plum haze from the opposite corner, so the dark has depth. */}
          <div
            aria-hidden
            className="absolute inset-0 pointer-events-none"
            style={{ background: "radial-gradient(60% 80% at 0% 0%, rgba(46,33,99,0.35), transparent 70%)" }}
          />
          {/* A square that fades to the card color at its edge, so moving it
              never shows a seam; it rests in the lower right corner. */}
          <div
            aria-hidden
            className="absolute aspect-square w-[max(70%,460px)] -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-80"
            style={{ left: `${GLOW_REST.x * 100}%`, top: `${GLOW_REST.y * 100}%` }}
          >
            {/* Own element for the pointer offset: GSAP would overwrite the centering. */}
            <div
              ref={cardGlowRef}
              className="h-full w-full will-change-transform"
              style={{ background: BACKGROUND.replace("circle at", "circle closest-side at") }}
            />
          </div>
          <div
            aria-hidden
            className="absolute inset-0 pointer-events-none mix-blend-overlay opacity-70"
            style={{ backgroundImage: "var(--grain-image)", backgroundSize: "var(--grain-size) var(--grain-size)" }}
          />
          <div className="relative z-10">{children}</div>
        </div>
      </section>
    );
  }

  return <ShaderTunnel variant="warp">{children}</ShaderTunnel>;
}
