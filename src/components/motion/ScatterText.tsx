"use client";

import { prefersReducedMotion, setupGsap } from "@/lib/motion";
import { useLayoutEffect, useRef } from "react";

import type { ScrollTrigger } from "gsap/ScrollTrigger";
import type gsap from "gsap";
import { SplitText } from "gsap/SplitText";

type ScatterTextProps = {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  /** Overrides the default scrub range (e.g. when the text lives in a pinned section). */
  scrollTrigger?: ScrollTrigger.Vars;
  /**
   * Hand the (paused) animation to a parent timeline instead of a scroll
   * trigger; the parent drives it with `.progress()`. Updated on re-split.
   */
  tweenRef?: React.RefObject<gsap.core.Animation | null>;
};

/**
 * Text whose letters start scattered (offset, rotated, scaled, blurred,
 * invisible) and fade in one by one as they reassemble (scrubbed).
 */
export default function ScatterText({ children, className = "", style, scrollTrigger, tweenRef }: ScatterTextProps) {
  const rootRef = useRef<HTMLSpanElement | null>(null);
  // Read once on mount; the split and its trigger are built a single time.
  const scrollTriggerRef = useRef(scrollTrigger);
  const externalRef = useRef(tweenRef);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || prefersReducedMotion()) return;
    const gsap = setupGsap();

    const split = SplitText.create(root, {
      type: "chars",
      autoSplit: true,
      onSplit: (self) => {
        // Spread scales with the type, capped so letters stay near the viewport.
        const fontSize = parseFloat(getComputedStyle(root).fontSize);
        const spread = Math.min(fontSize * 5, Math.min(window.innerWidth, window.innerHeight) * 0.35);
        // One random start per letter, shared by the move and the fade so each
        // letter fades in as it starts travelling (no simultaneous pop-in).
        const delays = self.chars.map(() => gsap.utils.random(0, 0.6));
        const delay = (i: number) => delays[i];

        const driven = externalRef.current;
        const prevProgress = driven?.current?.progress() ?? 0;
        const tl = gsap.timeline(
          driven
            ? { paused: true }
            : {
                scrollTrigger: scrollTriggerRef.current ?? {
                  trigger: root,
                  start: "top bottom",
                  end: "top 30%",
                  scrub: true,
                },
              }
        );
        tl.fromTo(
          self.chars,
          {
            x: () => gsap.utils.random(-spread, spread),
            y: () => gsap.utils.random(-spread, spread),
            rotation: () => gsap.utils.random(-90, 90),
            // Some start large, as if coming towards the viewer.
            scale: () => gsap.utils.random(0.4, 2.2),
            filter: "blur(16px)",
          },
          { x: 0, y: 0, rotation: 0, scale: 1, filter: "blur(0px)", duration: 1, ease: "power2.out", stagger: delay },
          0
        ).fromTo(self.chars, { opacity: 0 }, { opacity: 1, duration: 0.35, ease: "none", stagger: delay }, 0);

        if (driven) {
          tl.progress(prevProgress);
          driven.current = tl;
        }
        return tl;
      },
    });

    return () => split.revert();
  }, []);

  return (
    <span ref={rootRef} className={className} style={style}>
      {children}
    </span>
  );
}
