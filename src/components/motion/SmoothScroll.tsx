"use client";

import { isTouchScreen, prefersReducedMotion, setLenis, setupGsap } from "@/lib/motion";

import Lenis from "lenis";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect } from "react";

export default function SmoothScroll() {
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
