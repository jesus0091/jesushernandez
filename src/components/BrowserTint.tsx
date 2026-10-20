"use client";

import { useEffect } from "react";

// Safari 26 (iOS) ignores theme-color and tints its top and bottom bars from a
// fixed or sticky element touching that edge, using its background color.
// Dark sections that fill the screen opt in with data-browser-tint: once one
// covers the screen with an opaque background of its own (the WSMA section
// after the brush, the CTA tunnel fully grown), its nearest fixed or sticky
// box (the pin, or the sticky stage itself) gets that color, hidden behind the
// section, so Safari can sample it. Chrome on Android tints from theme-color,
// which gets the same color.

/** Alpha of a computed color: rgba(r, g, b, a), or any color function's "/ a". */
function alphaOf(color: string): number {
  const slash = color.match(/\/\s*([\d.]+%?)\s*\)$/)?.[1];
  const legacy = color.match(/^rgba\([^,]+,[^,]+,[^,]+,\s*([\d.]+)\)$/)?.[1];
  const a = slash ?? legacy;
  if (a === undefined) return 1;
  return a.endsWith("%") ? parseFloat(a) / 100 : parseFloat(a);
}

/** The element itself or its nearest fixed/sticky ancestor. */
function pinnedBox(el: HTMLElement): HTMLElement | null {
  for (let n: HTMLElement | null = el; n && n !== document.body; n = n.parentElement) {
    const position = getComputedStyle(n).position;
    if (position === "fixed" || position === "sticky") return n;
  }
  return null;
}

/** The opt-in section covering the whole screen with an opaque background. */
function fullScreenDark(): { el: HTMLElement; color: string } | null {
  for (const el of document.querySelectorAll<HTMLElement>("[data-browser-tint]")) {
    const r = el.getBoundingClientRect();
    // 1px of slack: pinned sections land on subpixel edges.
    if (r.top > 1 || r.bottom < window.innerHeight - 1) continue;
    const color = getComputedStyle(el).backgroundColor;
    if (color && color !== "transparent" && alphaOf(color) > 0.95) return { el, color };
  }
  return null;
}

export default function BrowserTint() {
  useEffect(() => {
    const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
    const page = getComputedStyle(document.documentElement).backgroundColor;

    let frame = 0;
    let painted: HTMLElement | null = null;
    let last: string | null = null;
    const update = () => {
      frame = 0;
      const dark = fullScreenDark();
      const box = dark ? pinnedBox(dark.el) : null;
      const color = dark?.color ?? null;
      if (box === painted && color === last) return;
      // The section paints its own color; only a separate pin box needs it.
      if (painted && painted !== box) painted.style.backgroundColor = "";
      if (box && dark && box !== dark.el) box.style.backgroundColor = dark.color;
      painted = box && dark && box !== dark.el ? box : null;
      last = color;
      if (meta) meta.content = color ?? page;
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
      if (painted) painted.style.backgroundColor = "";
    };
  }, []);

  return null;
}
