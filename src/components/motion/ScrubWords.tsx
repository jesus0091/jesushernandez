"use client";

import { prefersReducedMotion, setupGsap } from "@/lib/motion";
import { useLayoutEffect, useRef } from "react";

import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

type ScrubWordsProps = {
  children: React.ReactNode;
  className?: string;
};

/**
 * Paragraph that "reads itself": words go from faint to full opacity, scrubbed
 * with scroll. Any descendant marked [data-scrub-underline] gets its underline
 * drawn once the last word lights up (style it with a background-image line).
 */
export default function ScrubWords({ children, className = "" }: ScrubWordsProps) {
  const rootRef = useRef<HTMLParagraphElement | null>(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || prefersReducedMotion()) return;
    const gsap = setupGsap();
    const underlines = root.querySelectorAll<HTMLElement>("[data-scrub-underline]");

    // The faint start is the effect's first frame, not the text's resting
    // state: it's applied only as the paragraph reaches the screen, so the
    // page loads with full-contrast text (WCAG 1.4.3).
    let faint: ScrollTrigger | undefined;
    const split = SplitText.create(root, {
      type: "words",
      // Words read fine as they are; an aria-label on a <p> is ignored anyway.
      aria: "none",
      autoSplit: true,
      onSplit: (self) => {
        const tl = gsap
          .timeline({
            scrollTrigger: { trigger: root, start: "top 85%", end: "top 40%", scrub: true },
          })
          .fromTo(self.words, { opacity: 0.15 }, { opacity: 1, stagger: 0.1, ease: "none", immediateRender: false })
          .fromTo(underlines, { backgroundSize: "0% 1.5px" }, { backgroundSize: "100% 1.5px", duration: 0.4, ease: "none" });
        faint?.kill();
        faint = ScrollTrigger.create({
          trigger: root,
          start: "top bottom",
          once: true,
          onEnter: () => {
            if (!tl.scrollTrigger?.progress) gsap.set(self.words, { opacity: 0.15 });
          },
        });
        return tl;
      },
    });

    return () => {
      faint?.kill();
      split.revert();
    };
  }, []);

  return (
    <p ref={rootRef} className={className}>
      {children}
    </p>
  );
}
