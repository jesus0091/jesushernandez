"use client";

import { useLayoutEffect, type RefObject } from "react";

import { isTouchScreen, prefersReducedMotion, setupGsap } from "@/lib/motion";

/**
 * Leaving a section: as the page scrolls past it, `content` recedes (smaller,
 * slower than the scroll, fading, and blurring late) so the next section slides over
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
      const tl = gsap
        .timeline({ scrollTrigger: { trigger, start: "top top", end: "bottom top", scrub: true } })
        .to(target, { scale: 0.86, yPercent: 16, opacity: 0, ease: "none", transformOrigin: "50% 30%", duration: 1 }, 0);
      // The blur waits until the section is well on its way out, then builds
      // slowly, so the content stays readable while it's still in view.
      // Not on touch screens: blurring a whole section per frame stutters there.
      if (!isTouchScreen())
        tl.fromTo(target, { filter: "blur(0px)" }, { filter: "blur(10px)", ease: "power2.in", duration: 0.65 }, 0.35);
    }, trigger);

    return () => ctx.revert();
  }, [section, content]);
}
