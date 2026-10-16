"use client";

import { useLayoutEffect, useRef } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { prefersReducedMotion, setupGsap } from "@/lib/motion";

/**
 * The sizes the canvas steps through. Every frame is as tall as the canvas;
 * `w` is its width as a share of the canvas, from each screen's own shape.
 */
const SIZES = [
  { name: "Desktop", px: 1440, key: "desktop", w: 100 },
  { name: "Tablet", px: 768, key: "tablet", w: 48 },
  { name: "Mobile", px: 390, key: "phone", w: 30 },
] as const;

const HOLD = 1.8;
const SWAP = 0.7;

/**
 * One design canvas that shows the site at one size at a time, swapping from
 * desktop to tablet to phone and back while it is on screen. The lines about
 * each size beside it ([data-point] in the same section) follow along.
 * Without motion it rests on the desktop.
 */
export default function ResponsiveCanvas(screens: { desktop: string; tablet: string; phone: string }) {
  const rootRef = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const points = Array.from(root.closest("section")?.querySelectorAll<HTMLElement>("[data-point]") ?? []);
    const mark = (i: number) => points.forEach((point, k) => (point.dataset.on = String(k === i)));
    mark(0);
    if (prefersReducedMotion()) return () => points.forEach((point) => delete point.dataset.on);
    const gsap = setupGsap();

    const ctx = gsap.context(() => {
      const frames = gsap.utils.toArray<HTMLElement>("[data-size]", root);
      const labels = gsap.utils.toArray<HTMLElement>("[data-size-label]", root);
      gsap.set([...frames.slice(1), ...labels.slice(1)], { autoAlpha: 0 });
      gsap.set(frames.slice(1), { scale: 0.94 });

      // The one in view hands over to the next: it fades and settles back, the next comes up.
      const swap = (from: number, to: number) =>
        gsap
          .timeline({ defaults: { duration: SWAP, ease: "power3.inOut" } })
          .call(() => mark(to))
          .to(frames[from], { autoAlpha: 0, scale: 0.94 }, 0)
          .to(labels[from], { autoAlpha: 0, duration: 0.3 }, 0)
          .fromTo(frames[to], { autoAlpha: 0, scale: 0.94 }, { autoAlpha: 1, scale: 1 }, 0.15)
          .to(labels[to], { autoAlpha: 1, duration: 0.3 }, 0.3);

      const tl = gsap.timeline({ repeat: -1, paused: true });
      SIZES.forEach((_, i) => tl.to({}, { duration: HOLD }).add(swap(i, (i + 1) % SIZES.length)));

      // Plays only while on screen; onToggle misses a canvas that is already in view on load.
      const st = ScrollTrigger.create({
        trigger: root,
        start: "top bottom",
        end: "bottom top",
        onToggle: (self) => (self.isActive ? tl.play() : tl.pause()),
      });
      if (st.isActive) tl.play();
    }, root);

    return () => {
      ctx.revert();
      points.forEach((point) => delete point.dataset.on);
    };
  }, []);

  return (
    <div
      ref={rootRef}
      className="rounded-3xl border border-black/[0.06] bg-white px-4 pb-4 pt-8 [background-image:linear-gradient(rgba(11,140,233,0.07)_1px,transparent_1px),linear-gradient(90deg,rgba(11,140,233,0.07)_1px,transparent_1px)] [background-size:16px_16px] md:px-6 md:pb-6 md:pt-10"
    >
      <div className="relative aspect-[16/10]">
        {SIZES.map((size) => (
          <span
            key={size.name}
            data-size-label
            className="absolute -top-6 right-0 flex gap-1.5 whitespace-nowrap text-[10px] font-medium text-[#0B8CE9] md:-top-7 md:text-[11px]"
          >
            {size.name}
            <span className="font-mono opacity-70">{size.px}</span>
          </span>
        ))}
        {SIZES.map((size) => (
          // Centered by flex, not a translate, so the swap's scale has the transform to itself.
          <div key={size.name} className="absolute inset-0 flex justify-center">
          <div
            data-size
            className="h-full overflow-hidden rounded-md bg-white shadow-md ring-1 ring-black/10"
            style={{ width: `${size.w}%` }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={screens[size.key]}
              alt={`Home page at ${size.name.toLowerCase()} size`}
              loading="lazy"
              decoding="async"
              className="block h-full w-full object-cover object-top"
            />
          </div>
          </div>
        ))}
      </div>
    </div>
  );
}
