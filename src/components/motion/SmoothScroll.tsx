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
    // Touch screens keep the browser's own scroll, untouched: Lenis only
    // smooths the wheel, and moving the scroll from JS (normalizeScroll)
    // loses the native momentum and lags whenever the main thread is busy.
    if (prefersReducedMotion() || isTouchScreen()) return;
    const gsap = setupGsap();

    const lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 1.1, anchors: true });
    setLenis(lenis);

    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
      setLenis(null);
    };
  }, []);

  return null;
}
