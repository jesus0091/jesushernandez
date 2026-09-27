"use client";

import { prefersReducedMotion, setupGsap } from "@/lib/motion";
import { useLayoutEffect, useRef } from "react";

import { SplitText } from "gsap/SplitText";

type SectionHeadingProps = {
  children: React.ReactNode;
  className?: string;
};

/** Section title that reveals line by line from behind a mask on scroll. */
export default function SectionHeading({ children, className = "" }: SectionHeadingProps) {
  const rootRef = useRef<HTMLHeadingElement | null>(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || prefersReducedMotion()) return;
    const gsap = setupGsap();

    const split = SplitText.create(root, {
      type: "lines",
      mask: "lines",
      autoSplit: true,
      onSplit: (self) => {
        // Masks clip to the line box; with tight leading that cuts descenders
        // (g, y, p) and accents. Pad them out and cancel it with negative
        // margins so the layout doesn't shift.
        gsap.set(self.masks, {
          paddingTop: "0.1em",
          paddingBottom: "0.2em",
          marginTop: "-0.1em",
          marginBottom: "-0.2em",
        });
        return gsap.from(self.lines, {
          yPercent: 130,
          duration: 0.9,
          stagger: 0.1,
          ease: "power4.out",
          scrollTrigger: { trigger: root, start: "top 85%", once: true },
        });
      },
    });

    return () => split.revert();
  }, []);

  return (
    <h2 ref={rootRef} className={className}>
      {children}
    </h2>
  );
}
