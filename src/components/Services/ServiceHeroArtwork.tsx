"use client";

import { SERVICE_THEME } from "@/components/Services/ServiceArtwork";
import ServiceField from "@/components/Services/ServiceField";
import ServiceSketch from "@/components/Services/ServiceSketch";
import type { ServiceId } from "@/data/services";
import { prefersReducedMotion, setupGsap } from "@/lib/motion";
import { useLayoutEffect, useRef } from "react";

/**
 * A service page's hero ground: the service's colour with heavier grain. Under
 * the mouse a soft light follows the pointer and the service's field wakes up
 * around it; the sketch stays still. Fills its parent.
 */
export default function ServiceHeroArtwork({ id, className = "" }: { id: ServiceId; className?: string }) {
  const boxRef = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    const box = boxRef.current;
    if (!box || prefersReducedMotion()) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const gsap = setupGsap();
    // The light and grid read the pointer from CSS variables, eased the same way.
    const pos = { x: 50, y: 50, on: 0 };
    const paint = () => {
      box.style.setProperty("--mx", `${pos.x}%`);
      box.style.setProperty("--my", `${pos.y}%`);
      box.style.setProperty("--on", String(pos.on));
    };

    const onMove = (e: PointerEvent) => {
      const r = box.getBoundingClientRect();
      const nx = (e.clientX - r.left) / r.width; // 0 → 1
      const ny = (e.clientY - r.top) / r.height;
      gsap.to(pos, { x: nx * 100, y: ny * 100, on: 1, duration: 0.6, ease: "power3.out", onUpdate: paint, overwrite: true });
    };
    const onLeave = () => {
      gsap.to(pos, { on: 0, duration: 0.8, ease: "power2.out", onUpdate: paint, overwrite: true });
    };

    box.addEventListener("pointermove", onMove);
    box.addEventListener("pointerleave", onLeave);
    return () => {
      box.removeEventListener("pointermove", onMove);
      box.removeEventListener("pointerleave", onLeave);
      gsap.killTweensOf(pos);
    };
  }, []);

  return (
    <div
      ref={boxRef}
      className={`relative isolate flex items-center justify-center overflow-hidden rounded-3xl px-[12%] [--on:0] [--sk-width:1.5] [--sk-fill:#fff] ${SERVICE_THEME[id]} ${className}`}
    >
      {/* The service's own field (code, figures or pixels), waking up around the pointer. */}
      <ServiceField id={id} className="-z-10" />
      {/* The light that follows the pointer. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(420px_circle_at_var(--mx,50%)_var(--my,50%),rgba(255,255,255,0.55),transparent_70%)] [opacity:var(--on)]"
      />
      {/* Heavier grain than the cards, over the colour and the light. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[image:var(--grain-image)] bg-[size:var(--grain-size)_var(--grain-size)] opacity-100 mix-blend-overlay"
      />
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-[image:var(--grain-image)] bg-[size:var(--grain-size)_var(--grain-size)] opacity-25 mix-blend-multiply" />

      <div className="w-full max-w-[520px]">
        <ServiceSketch id={id} play="load" />
      </div>
    </div>
  );
}
