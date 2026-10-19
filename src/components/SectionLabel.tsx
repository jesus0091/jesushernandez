"use client";

import { prefersReducedMotion, setupGsap } from "@/lib/motion";
import React, { useLayoutEffect, useRef } from "react";

type SectionLabelProps = {
  children: React.ReactNode;
  align?: "left" | "center";
  /** "inverse" for dark/colored surfaces where the orange accent lacks contrast. */
  tone?: "accent" | "inverse";
  /** What it sits on: the accent is darkened on light surfaces to keep 4.5:1. */
  surface?: "light" | "dark";
  /**
   * "scroll" reveals itself once when it enters the viewport. "none" leaves it
   * to a parent timeline, which drives [data-label-text] (see LABEL_FROM / LABEL_TO).
   */
  animate?: "scroll" | "none";
  className?: string;
};

/** Hidden / revealed states, shared with parent timelines that drive the label. */
export const LABEL_FROM = { text: { yPercent: 110 } };
export const LABEL_TO = { text: { yPercent: 0 } };

/** Section eyebrow: the text rises from a mask. */
export default function SectionLabel({
  children,
  align = "left",
  tone = "accent",
  surface = "light",
  animate = "scroll",
  className = "",
}: SectionLabelProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const isCenter = align === "center";
  const text =
    tone === "inverse"
      ? "text-[var(--color-bg)]"
      : surface === "dark"
        ? "text-[var(--orange)]"
        : "text-[var(--color-accent-ink)]";

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || animate === "none" || prefersReducedMotion()) return;
    const gsap = setupGsap();

    const ctx = gsap.context(() => {
      // Same curve as SectionHeading, so label and title read as one move.
      gsap.from("[data-label-text]", {
        ...LABEL_FROM.text,
        duration: 0.8,
        ease: "power4.out",
        scrollTrigger: { trigger: root, start: "top 85%", once: true },
      });
    }, root);

    return () => ctx.revert();
  }, [animate]);

  return (
    <div
      ref={rootRef}
      data-section-label
      className={`inline-flex items-center gap-3 ${isCenter ? "justify-center" : ""} ${className}`}
    >
      <span className="overflow-clip">
        <span
          data-label-text
          className={`block text-xs md:text-sm font-mono font-medium uppercase tracking-[0.08em] ${text}`}
        >
          {children}
        </span>
      </span>
    </div>
  );
}
