"use client";

import { useLayoutEffect, type RefObject } from "react";

import { prefersReducedMotion, setupGsap } from "@/lib/motion";

/**
 * Leaving a section: as the page scrolls past it, `content` recedes (smaller,
 * slower than the scroll, blurring and fading) so the next section slides over
 * it instead of butting up against a hard edge. Scrubbed, so scrolling back
 * brings it forward again.
 */
export function useRecede(
  section: RefObject<HTMLElement | null>,
  content: RefObject<HTMLElement | null>
) {
  useLayoutEffect(() => {
    const trigger = section.current;
    const target = content.current;
    if (!trigger || !target || prefersReducedMotion()) return;
    const gsap = setupGsap();

    const ctx = gsap.context(() => {
      gsap.fromTo(
        target,
        { filter: "blur(0px)" },
        {
          scale: 0.86,
          yPercent: 16,
          opacity: 0,
          filter: "blur(10px)",
          ease: "none",
          transformOrigin: "50% 30%",
          scrollTrigger: { trigger, start: "top top", end: "bottom top", scrub: true },
        }
      );
    }, trigger);

    return () => ctx.revert();
  }, [section, content]);
}
