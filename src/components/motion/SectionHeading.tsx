"use client";

import { useNearViewport } from "@/components/motion/useNearViewport";

import { prefersReducedMotion, setupGsap } from "@/lib/motion";
import { useLayoutEffect, useRef } from "react";

import { SplitText } from "gsap/SplitText";

type SectionHeadingProps = {
  children: React.ReactNode;
  /** "h1" when it is the page title. */
  as?: "h1" | "h2";
  className?: string;
};

/** Section title that reveals line by line from behind a mask on scroll. */
export default function SectionHeading({ children, as: Tag = "h2", className = "" }: SectionHeadingProps) {
  const rootRef = useRef<HTMLHeadingElement | null>(null);

  const near = useNearViewport(rootRef);

  useLayoutEffect(() => {
    if (!near) return;
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
        // margins so the layout doesn't shift. Margins between two lines
        // collapse instead of adding up, so the bottom one carries both.
        const last = self.masks.length - 1;
        gsap.set(self.masks, {
          paddingTop: "0.1em",
          paddingBottom: "0.2em",
          marginTop: (i: number): string => (i === 0 ? "-0.1em" : "0em"),
          marginBottom: (i: number): string => (i === last ? "-0.2em" : "-0.3em"),
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
  }, [near]);

  return (
    <Tag ref={rootRef} className={className}>
      {children}
    </Tag>
  );
}
