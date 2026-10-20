"use client";

import { useEffect, useRef } from "react";

// Safari 26 (iOS) tints its top and bottom bars with the background color of
// a full-width fixed element at that edge (theme-color is ignored). The
// page's own fixed layers (the grain, the intro) are transparent, so without
// these strips Safari falls back to the cream <html> background over every
// section. Each strip is painted in the color of the section at its edge as
// the page scrolls, so it reads as part of that section. Chrome on Android
// tints from theme-color, which follows the top strip.
// 6px: the smallest strip Safari still samples at the top edge.
const STRIP = 6;

/** Alpha of a computed color: rgba(r, g, b, a), or any color function's "/ a". */
function alphaOf(color: string): number {
  const slash = color.match(/\/\s*([\d.]+%?)\s*\)$/)?.[1];
  const legacy = color.match(/^rgba\([^,]+,[^,]+,[^,]+,\s*([\d.]+)\)$/)?.[1];
  const a = slash ?? legacy;
  if (a === undefined) return 1;
  return a.endsWith("%") ? parseFloat(a) / 100 : parseFloat(a);
}

/** First opaque background color at height y, skipping these strips. */
function backgroundAt(y: number): string | null {
  for (const el of document.elementsFromPoint(window.innerWidth / 2, y)) {
    if (el.hasAttribute("data-browser-tint")) continue;
    for (let n: Element | null = el; n; n = n.parentElement) {
      const color = getComputedStyle(n).backgroundColor;
      if (color && color !== "transparent" && alphaOf(color) > 0.95) return color;
    }
  }
  return null;
}

export default function BrowserTint() {
  const topRef = useRef<HTMLDivElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const top = topRef.current;
    const bottom = bottomRef.current;
    if (!top || !bottom) return;
    const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
    const fallback = getComputedStyle(document.documentElement).backgroundColor;

    let frame = 0;
    const update = () => {
      frame = 0;
      const topColor = backgroundAt(STRIP / 2) ?? fallback;
      const bottomColor = backgroundAt(window.innerHeight - STRIP / 2) ?? fallback;
      if (top.style.backgroundColor !== topColor) top.style.backgroundColor = topColor;
      if (bottom.style.backgroundColor !== bottomColor) bottom.style.backgroundColor = bottomColor;
      if (meta && meta.content !== topColor) meta.content = topColor;
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, []);

  const strip = "pointer-events-none fixed inset-x-0 z-[99999]";
  return (
    <>
      <div ref={topRef} data-browser-tint aria-hidden className={`${strip} top-0`} style={{ height: STRIP }} />
      <div ref={bottomRef} data-browser-tint aria-hidden className={`${strip} bottom-0`} style={{ height: STRIP }} />
    </>
  );
}
