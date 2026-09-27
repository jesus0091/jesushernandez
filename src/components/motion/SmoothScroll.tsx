"use client";

import { prefersReducedMotion, setLenis, setupGsap } from "@/lib/motion";

import Lenis from "lenis";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect } from "react";

export default function SmoothScroll() {
  useEffect(() => {
    if (prefersReducedMotion()) return;
    const gsap = setupGsap();

    const lenis = new Lenis({ lerp: 0.15, wheelMultiplier: 1.1, anchors: true });
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
