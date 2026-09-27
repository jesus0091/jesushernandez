"use client";

import { prefersReducedMotion, setupGsap } from "@/lib/motion";
import { useLayoutEffect, useRef } from "react";

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

    const split = SplitText.create(root, {
      type: "words",
      autoSplit: true,
      onSplit: (self) =>
        gsap
          .timeline({
            scrollTrigger: { trigger: root, start: "top 85%", end: "top 40%", scrub: true },
          })
          .fromTo(self.words, { opacity: 0.15 }, { opacity: 1, stagger: 0.1, ease: "none" })
          .fromTo(underlines, { backgroundSize: "0% 1.5px" }, { backgroundSize: "100% 1.5px", duration: 0.4, ease: "none" }),
    });

    return () => split.revert();
  }, []);

  return (
    <p ref={rootRef} className={className}>
      {children}
    </p>
  );
}
