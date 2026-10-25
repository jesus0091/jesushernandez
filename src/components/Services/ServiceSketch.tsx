"use client";

import { prefersReducedMotion, setupGsap } from "@/lib/motion";
import type { ServiceId } from "@/data/services";
import { useLayoutEffect, useRef } from "react";

type Props = {
  id: ServiceId;
  /** "scroll" draws it as it scrolls into view; "load" draws it once, right away (page heroes). */
  play?: "scroll" | "load";
  className?: string;
};

// Three layers, drawn in order: construction guides, the object, then the
// accent details. The guides fade back once the drawing is done.
const G = { "data-sk": "guide", className: "sk-guide" } as const;
const L = { "data-sk": "line", className: "sk-line" } as const;
const A = { "data-sk": "accent", className: "sk-accent" } as const;

const SKETCHES: Record<ServiceId, React.ReactNode> = {
  // A phone wireframe next to a bezier curve with its handles.
  "product-design": (
    <>
      <path {...G} d="M0 12.5H240" />
      <path {...G} d="M0 137.5H240" />
      <path {...G} d="M130.5 0V150" />
      <path {...G} d="M200.5 0V150" />
      <path {...G} d="M0 112.5H120" />
      <path {...G} d="M0 36.5H120" />
      <rect {...L} x="130.5" y="12.5" width="70" height="125" rx="12" />
      <rect {...L} x="140.5" y="32.5" width="50" height="34" rx="4" />
      <path {...L} d="M140.5 78.5H190.5" />
      <path {...L} d="M140.5 88.5H174.5" />
      <path {...L} d="M20.5 112.5C70.5 112.5 50.5 36.5 100.5 36.5" />
      <path {...L} d="M20.5 112.5H62.5" />
      <path {...L} d="M100.5 36.5H58.5" />
      <circle {...L} cx="62.5" cy="112.5" r="3" />
      <circle {...L} cx="58.5" cy="36.5" r="3" />
      <rect {...A} x="16.5" y="108.5" width="8" height="8" />
      <rect {...A} x="96.5" y="32.5" width="8" height="8" />
      <rect {...A} x="140.5" y="106.5" width="50" height="12" rx="6" />
    </>
  ),
  // A browser window with code brackets in it.
  "web-development": (
    <>
      <path {...G} d="M0 18.5H240" />
      <path {...G} d="M0 132.5H240" />
      <path {...G} d="M28.5 0V150" />
      <path {...G} d="M212.5 0V150" />
      <path {...G} d="M120.5 0V150" />
      <rect {...L} x="28.5" y="18.5" width="184" height="114" rx="8" />
      <path {...L} d="M28.5 38.5H212.5" />
      <path {...L} d="M100.5 66.5L82.5 84.5L100.5 102.5" />
      <path {...L} d="M140.5 66.5L158.5 84.5L140.5 102.5" />
      <path {...L} d="M128.5 60.5L112.5 108.5" />
      <circle {...A} cx="42.5" cy="28.5" r="3.5" />
      <circle {...L} cx="54.5" cy="28.5" r="3.5" />
      <circle {...L} cx="66.5" cy="28.5" r="3.5" />
      <rect {...A} x="168.5" y="96.5" width="6" height="12" />
    </>
  ),
  // A question, an answer, and the spark that wrote it.
  "ai-features": (
    <>
      <path {...G} d="M0 24.5H240" />
      <path {...G} d="M0 126.5H240" />
      <path {...G} d="M40.5 0V150" />
      <path {...G} d="M204.5 0V150" />
      <circle {...G} cx="40.5" cy="104.5" r="22" />
      <path {...L} d="M118.5 24.5H196.5A8 8 0 0 1 204.5 32.5V52.5A8 8 0 0 1 196.5 60.5H132.5L118.5 70.5Z" />
      <path {...L} d="M132.5 42.5H188.5" />
      <path {...L} d="M76.5 82.5H180.5A8 8 0 0 1 188.5 90.5V118.5A8 8 0 0 1 180.5 126.5H76.5A8 8 0 0 1 68.5 118.5V90.5A8 8 0 0 1 76.5 82.5Z" />
      <path {...L} d="M82.5 98.5H172.5" />
      <path {...L} d="M82.5 110.5H140.5" />
      <path {...A} d="M40.5 88.5C42.5 100.5 44.5 102.5 56.5 104.5C44.5 106.5 42.5 108.5 40.5 120.5C38.5 108.5 36.5 106.5 24.5 104.5C36.5 102.5 38.5 100.5 40.5 88.5Z" />
      <circle {...A} cx="62.5" cy="78.5" r="3" />
    </>
  ),
  // A hand-drawn prototype, an arrow, and the same box built straight.
  "ai-prototype-to-production": (
    <>
      <path {...G} d="M0 34.5H240" />
      <path {...G} d="M0 116.5H240" />
      <path {...G} d="M20.5 0V150" />
      <path {...G} d="M220.5 0V150" />
      <path {...L} d="M22 37C40 33 64 36 92 34.5C95 56 92 86 94 115C70 118 44 114 21 117C18 92 23 62 22 37Z" />
      <path {...L} d="M34 56C48 54 62 57 78 55" />
      <path {...L} d="M34 70C44 72 56 69 66 71" />
      <path {...L} d="M108.5 75.5H132.5" />
      <path {...L} d="M124.5 67.5L132.5 75.5L124.5 83.5" />
      <rect {...L} x="146.5" y="34.5" width="74" height="82" rx="6" />
      <path {...L} d="M158.5 54.5H208.5" />
      <path {...L} d="M158.5 66.5H190.5" />
      <circle {...A} cx="183.5" cy="94.5" r="12" />
      <path className="sk-line sk-on-accent" data-sk="accent" d="M177.5 94.5L181.5 98.5L189.5 90.5" />
    </>
  ),
};

/** A line drawing of a service that draws itself: guides, then the object, then the accents. */
export default function ServiceSketch({ id, play = "scroll", className = "" }: Props) {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useLayoutEffect(() => {
    const svg = svgRef.current;
    if (!svg || prefersReducedMotion()) return;
    const gsap = setupGsap();

    const ctx = gsap.context(() => {
      const guides = svg.querySelectorAll('[data-sk="guide"]');
      const lines = svg.querySelectorAll('[data-sk="line"]');
      const accents = svg.querySelectorAll('[data-sk="accent"]');

      const tl = gsap.timeline(
        play === "load"
          ? { delay: 0.35 }
          : { scrollTrigger: { trigger: svg, start: "top 92%", end: "top 38%", scrub: 0.6 } },
      );
      // Scrubbed, durations are proportions of the scroll distance; played, seconds.
      const k = play === "load" ? 1.6 : 1;
      tl.fromTo(guides, { drawSVG: "0%", opacity: 1 }, { drawSVG: "100%", opacity: 1, duration: 0.3 * k, stagger: 0.04 * k, ease: "none" })
        .fromTo(lines, { drawSVG: "0%" }, { drawSVG: "100%", duration: 0.3 * k, stagger: 0.05 * k, ease: "power1.inOut" }, 0.2 * k)
        .fromTo(
          accents,
          { scale: 0, opacity: 0, transformOrigin: "50% 50%" },
          { scale: 1, opacity: 1, duration: 0.15 * k, stagger: 0.05 * k, ease: "back.out(2)" },
          ">-0.05",
        )
        .to(guides, { opacity: 0.35, duration: 0.15 * k, ease: "none" }, ">-0.1");
    }, svg);

    return () => ctx.revert();
  }, [play]);

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 240 150"
      className={`service-sketch block h-auto w-full overflow-visible ${className}`}
      aria-hidden="true"
      focusable="false"
    >
      {SKETCHES[id]}
    </svg>
  );
}
