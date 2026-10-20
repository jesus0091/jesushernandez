"use client";

import { useEffect } from "react";

// Safari 26 (iOS) ignores theme-color and tints its top and bottom bars from
// the page background (<html>), which is the cream of the light sections.
// While a dark section fills the screen edge to edge (the WSMA phrase, the CTA
// tunnel), <html> takes that section's tint so the bars match it; it can't
// show anywhere else then, since nothing else is on screen. Sections opt in
// with data-browser-tint="<color>" and count only while they're dark for the
// navbar too (data-nav-dark not "false"). Chrome on Android follows
// theme-color, which gets the same color.

/** The tint of the dark section covering the whole screen, if any. */
function fullScreenTint(): string | null {
  for (const el of document.querySelectorAll<HTMLElement>(
    '[data-browser-tint][data-nav-dark]:not([data-nav-dark="false"])',
  )) {
    const r = el.getBoundingClientRect();
    // 1px of slack: pinned sections land on subpixel edges.
    if (r.top <= 1 && r.bottom >= window.innerHeight - 1) return el.dataset.browserTint!;
  }
  return null;
}

export default function BrowserTint() {
  useEffect(() => {
    const html = document.documentElement;
    const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
    const page = getComputedStyle(html).backgroundColor;

    let frame = 0;
    let last: string | null | undefined;
    const update = () => {
      frame = 0;
      const tint = fullScreenTint();
      if (tint === last) return;
      last = tint;
      html.style.backgroundColor = tint ?? "";
      if (meta) meta.content = tint ?? page;
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
      html.style.backgroundColor = "";
    };
  }, []);

  return null;
}
