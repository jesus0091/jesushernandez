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

// Drawn in order: construction guides, then the object's planes (its body
// and tinted panels) fade in, its lines draw, and the
// accent details pop. The guides fade back once the drawing is done.
const G = { "data-sk": "guide", className: "sk-guide" } as const;
const F = { "data-sk": "plane", className: "sk-fill" } as const;
const T = { "data-sk": "plane", className: "sk-tint" } as const;
const L = { "data-sk": "line", className: "sk-line" } as const;
const A = { "data-sk": "accent", className: "sk-accent" } as const;

const SKETCHES: Record<ServiceId, React.ReactNode> = {
  // A browser window with code brackets in it.
  "web-development": (
    <>
      <path {...G} d="M0 18.5H240" />
      <path {...G} d="M0 132.5H240" />
      <path {...G} d="M28.5 0V150" />
      <path {...G} d="M212.5 0V150" />
      <path {...G} d="M120.5 0V150" />
      <rect {...F} x="28.5" y="18.5" width="184" height="114" rx="8" />
      <path {...T} d="M28.5 38.5V26.5A8 8 0 0 1 36.5 18.5H204.5A8 8 0 0 1 212.5 26.5V38.5Z" />
      <rect {...T} x="44.5" y="112.5" width="48" height="8" rx="4" />
      <rect {...L} x="28.5" y="18.5" width="184" height="114" rx="8" />
      <path {...L} d="M28.5 38.5H212.5" />
      <rect {...L} x="84.5" y="23.5" width="100" height="10" rx="5" />
      <path {...L} d="M100.5 66.5L82.5 84.5L100.5 102.5" />
      <path {...L} d="M140.5 66.5L158.5 84.5L140.5 102.5" />
      <path {...L} d="M128.5 60.5L112.5 108.5" />
      <circle {...A} cx="42.5" cy="28.5" r="3.5" />
      <circle {...L} cx="54.5" cy="28.5" r="3.5" />
      <circle {...L} cx="66.5" cy="28.5" r="3.5" />
      <rect {...A} x="168.5" y="96.5" width="6" height="12" />
    </>
  ),
  // A dashboard: sidebar, two stat cards and a bar chart.
  "web-apps": (
    <>
      <path {...G} d="M0 18.5H240" />
      <path {...G} d="M0 132.5H240" />
      <path {...G} d="M28.5 0V150" />
      <path {...G} d="M212.5 0V150" />
      <path {...G} d="M72.5 0V150" />
      <rect {...F} x="28.5" y="18.5" width="184" height="114" rx="8" />
      <path {...T} d="M28.5 26.5A8 8 0 0 1 36.5 18.5H72.5V132.5H36.5A8 8 0 0 1 28.5 124.5Z" />
      <rect {...T} x="84.5" y="30.5" width="56" height="26" rx="4" />
      <rect {...T} x="146.5" y="30.5" width="56" height="26" rx="4" />
      <rect {...T} x="90.5" y="98.5" width="12" height="22" />
      <rect {...T} x="110.5" y="84.5" width="12" height="36" />
      <rect {...T} x="130.5" y="92.5" width="12" height="28" />
      <rect {...T} x="150.5" y="76.5" width="12" height="44" />
      <rect {...L} x="28.5" y="18.5" width="184" height="114" rx="8" />
      <path {...L} d="M72.5 18.5V132.5" />
      <path {...L} d="M40.5 38.5H60.5" />
      <path {...L} d="M40.5 50.5H56.5" />
      <path {...L} d="M40.5 62.5H60.5" />
      <circle {...L} cx="50.5" cy="116.5" r="6" />
      <rect {...L} x="84.5" y="30.5" width="56" height="26" rx="4" />
      <rect {...L} x="146.5" y="30.5" width="56" height="26" rx="4" />
      <path {...L} d="M154.5 48.5H180.5" />
      <path {...L} d="M84.5 120.5H202.5" />
      <rect {...L} x="90.5" y="98.5" width="12" height="22" />
      <rect {...L} x="110.5" y="84.5" width="12" height="36" />
      <rect {...L} x="130.5" y="92.5" width="12" height="28" />
      <rect {...L} x="150.5" y="76.5" width="12" height="44" />
      <path {...L} d="M96.5 88.5L116.5 74.5L136.5 82.5L156.5 66.5L176.5 58.5" />
      <rect {...A} x="170.5" y="68.5" width="12" height="52" />
      <rect {...A} x="92.5" y="40.5" width="22" height="6" rx="3" />
    </>
  ),
  // A phone home screen, a new notification, and the store download beside it.
  "mobile-apps": (
    <>
      <path {...G} d="M0 12.5H240" />
      <path {...G} d="M0 137.5H240" />
      <path {...G} d="M104.5 0V150" />
      <path {...G} d="M174.5 0V150" />
      <path {...G} d="M0 108.5H90" />
      <circle {...T} cx="60.5" cy="72.5" r="30" />
      <rect {...F} x="104.5" y="12.5" width="70" height="125" rx="12" />
      <rect {...T} x="112.5" y="96.5" width="54" height="22" rx="5" />
      <rect {...L} x="104.5" y="12.5" width="70" height="125" rx="12" />
      <path {...L} d="M130.5 21.5H148.5" />
      <rect {...L} x="114.5" y="36.5" width="12" height="12" rx="3" />
      <rect {...L} x="133.5" y="36.5" width="12" height="12" rx="3" />
      <rect {...L} x="152.5" y="36.5" width="12" height="12" rx="3" />
      <rect {...L} x="114.5" y="55.5" width="12" height="12" rx="3" />
      <rect {...L} x="133.5" y="55.5" width="12" height="12" rx="3" />
      <rect {...L} x="152.5" y="55.5" width="12" height="12" rx="3" />
      <rect {...L} x="114.5" y="74.5" width="12" height="12" rx="3" />
      <rect {...L} x="112.5" y="96.5" width="54" height="22" rx="5" />
      <path {...L} d="M120.5 104.5H150.5" />
      <path {...L} d="M120.5 111.5H138.5" />
      <path {...L} d="M128.5 128.5H150.5" />
      <path {...L} d="M60.5 52.5V88.5" />
      <path {...L} d="M46.5 74.5L60.5 88.5L74.5 74.5" />
      <path {...L} d="M44.5 96.5H76.5" />
      <rect {...A} x="133.5" y="74.5" width="12" height="12" rx="3" />
      <circle {...A} cx="164.5" cy="36.5" r="5" />
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
      const planes = svg.querySelectorAll('[data-sk="plane"]');
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
        .fromTo(planes, { opacity: 0 }, { opacity: 1, duration: 0.3 * k, stagger: 0.04 * k, ease: "none" }, 0.15 * k)
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
