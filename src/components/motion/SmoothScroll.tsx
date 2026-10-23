"use client";

import { getLenis, isTouchScreen, prefersReducedMotion, setLenis, setupGsap } from "@/lib/motion";

import Lenis from "lenis";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useLayoutEffect } from "react";
import { usePathname } from "@/i18n/navigation";

export default function SmoothScroll() {
  const pathname = usePathname();

  // Every page opens at the top: links, back/forward and reduced motion alike.
  // The browser's and ScrollTrigger's scroll memory would otherwise bring the
  // last position back. A link to an anchor (/#about) keeps its target.
  useEffect(() => {
    history.scrollRestoration = "manual";
  }, []);
  useLayoutEffect(() => {
    if (location.hash) return;
    // ScrollTrigger must be registered before its scroll memory can be cleared.
    setupGsap();
    ScrollTrigger.clearScrollMemory("manual");
    window.scrollTo(0, 0);
    getLenis()?.scrollTo(0, { immediate: true, force: true });
  }, [pathname]);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const gsap = setupGsap();

    const lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 1.1, anchors: true });
    setLenis(lenis);

    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    // Touch screens scroll natively (Lenis only smooths the wheel). There,
    // scroll on the JS thread so pinned sections stay in sync with the finger
    // and the address bar stops sliding in and out mid-animation, which is
    // what resizes the viewport and makes Safari iOS jump.
    const touch = isTouchScreen();
    if (touch) ScrollTrigger.normalizeScroll(true);

    return () => {
      if (touch) ScrollTrigger.normalizeScroll(false);
      gsap.ticker.remove(tick);
      lenis.destroy();
      setLenis(null);
    };
  }, []);

  return null;
}
