"use client";

import { prefersReducedMotion, setupGsap } from "@/lib/motion";
import { useLayoutEffect, useRef, useState } from "react";

import ShaderTunnel from "./ShaderTunnel";

// The tunnel's light, core to edge (also lights the footer wordmark).
export const TUNNEL_STOPS =
  "#ff7a1a 0%, #f2631a 6%, #d24e22 12%, #9c3a36 19%, #5e2b4f 27%, #2e2163 36%, #161a5c 46%, #0c1148 58%, #070b33 72%, #03061d 86%, #01020c 100%";

// The still card's light (the ride draws its own, in ShaderTunnel).
const BACKGROUND = `radial-gradient(circle at 50% 50%, ${TUNNEL_STOPS})`;

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

  // Still card: the orange glow trails the pointer and drifts back on leave.
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
      xTo(e.clientX - rect.left - rect.width / 2);
      yTo(e.clientY - rect.top - rect.height / 2);
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
          {/* A square bigger than the card that fades to the card color at
              its edge, so moving it never shows a seam. */}
          <div
            aria-hidden
            className="absolute left-1/2 top-1/2 aspect-square w-[max(116%,640px)] -translate-x-1/2 -translate-y-1/2 pointer-events-none"
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
