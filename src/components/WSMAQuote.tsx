"use client";

import { prefersReducedMotion, setupGsap } from "@/lib/motion";
import { useLayoutEffect, useRef } from "react";

import { HANDOFF, HANDOFF_COVERED } from "./motion/skillsHandoff";
import ScatterText from "./motion/ScatterText";
import type gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SectionLabel from "./SectionLabel";

// Zigzag sweep across a 100×100 box; once thick enough it covers the viewport.
const BRUSH_PATH =
  "M -20 8 C 20 -6, 60 22, 120 4 C 80 30, 30 22, -20 42 C 20 54, 70 38, 120 56 C 80 76, 30 68, -20 88 C 20 100, 70 94, 120 106";

const vh = (n: number) => `${Math.round(n * 100)}%`;

// Exit tunnel: a box (not a cylinder) in perspective, in a 0–100 viewBox
// stretched to the section, so each frame has the screen's proportions.
// Vanishing point a bit above center: the next section covers from the bottom.
const VP = { x: 50, y: 38 };
const TUNNEL_FRAMES = 7;
const TUNNEL_REACH = 3; // lines run out to a frame this many times the screen
// Rails: the 4 corners plus 3 evenly spaced points per side, on the unit frame.
const RAILS = (() => {
  const pts: { x: number; y: number }[] = [];
  for (let i = 0; i < 4; i++) pts.push({ x: i / 4, y: 0 }, { x: 1, y: i / 4 }, { x: 1 - i / 4, y: 1 }, { x: 0, y: 1 - i / 4 });
  // unit frame (0–1) → offset from the vanishing point at scale 1
  return pts.map((p) => ({ dx: p.x * 100 - VP.x, dy: p.y * 100 - VP.y }));
})();
/** Frame size at depth z (0 = far, 1 = at the screen), same curve as CtaTunnel. */
const depthScale = (z: number) => 0.04 * Math.pow(60, z);

export default function WSMAQuote() {
  // The pin owns the wrapper; the exit tween owns the section's transform. If
  // both lived on one element, a ScrollTrigger refresh while scrolled past the
  // pin would record the exit's translateY as the pin's own style and restore
  // it on the way back up, leaving the section off screen (blank page).
  const pinRef = useRef<HTMLDivElement | null>(null);
  const sectionRef = useRef<HTMLElement | null>(null);
  const brushRef = useRef<HTMLDivElement | null>(null);
  const extrasRef = useRef<HTMLDivElement | null>(null);
  const tunnelRef = useRef<SVGSVGElement | null>(null);
  // The phrase's scatter animation, driven by this section's pinned timeline.
  const scatterRef = useRef<gsap.core.Animation | null>(null);

  useLayoutEffect(() => {
    const pinEl = pinRef.current;
    const section = sectionRef.current;
    const brush = brushRef.current;
    const extras = extrasRef.current;
    if (!pinEl || !section || !brush || !extras || prefersReducedMotion()) return;
    const gsap = setupGsap();
    const path = brush.querySelector("path");

    const skills = document.getElementById("skills");
    const total = HANDOFF.lineFill + HANDOFF.brush + HANDOFF.scatter + HANDOFF.outro;

    const ctx = gsap.context(() => {
      // This section overlaps the last screen of the skills section (negative
      // margin, motion-safe only) and starts transparent, so its pin begins the
      // moment the skills section's bottom reaches the bottom of the screen.
      // Transparent (not --color-bg) so the page grain shows through.
      gsap.set(section, { backgroundColor: "transparent", pointerEvents: "none" });
      // The scattered letters already sit in their start positions; keep them
      // hidden until the brush has covered the screen. Opacity on the wrapper,
      // since the letters manage their own visibility.
      gsap.set(extras, { opacity: 0 });

      // Hold the skills section in place while its closing divider fills
      // (Skills.tsx) and the brush paints over it. No spacing: this section's
      // pin provides the scroll distance.
      if (skills)
        ScrollTrigger.create({
          trigger: skills,
          start: "bottom bottom",
          end: `+=${vh(HANDOFF_COVERED)}`,
          pin: true,
          pinSpacing: false,
        });

      // One pinned timeline, in viewport heights of scroll:
      // divider fills → brush covers → black takes over, phrase assembles
      // → label + copy fade in → hold.
      const brushAt = HANDOFF.lineFill;
      const scatter = { p: 0 };
      gsap
        .timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: pinEl,
            start: "top top",
            end: `+=${vh(total)}`,
            scrub: true,
            pin: true,
            // No anticipatePin: it also re-pins early when scrolling back up
            // fast, while the exit below still offsets the section, so the
            // phrase jumped for a frame. Lenis drives scroll, so it's not needed.
            // Measure before the projects carousel pin (priority 1) below, so
            // its start includes this pin's spacing.
            refreshPriority: 2,
          },
        })
        .set(brush, { autoAlpha: 1 }, brushAt)
        .fromTo(path, { drawSVG: "0% 0%", strokeWidth: 8 }, { drawSVG: "0% 100%", duration: HANDOFF.brush }, brushAt)
        .to(path, { strokeWidth: 60, duration: HANDOFF.brush * 0.9 }, brushAt + HANDOFF.brush * 0.1)
        .set(section, { backgroundColor: "var(--color-ink-1)", pointerEvents: "auto" }, HANDOFF_COVERED)
        .set(extras, { opacity: 1 }, HANDOFF_COVERED)
        .set(brush, { autoAlpha: 0 }, HANDOFF_COVERED)
        .fromTo(
          scatter,
          { p: 0 },
          { p: 1, duration: HANDOFF.scatter, onUpdate: () => void scatterRef.current?.progress(scatter.p) },
          HANDOFF_COVERED
        )
        .fromTo(
          extras.querySelectorAll("[data-wsma-fade]"),
          { autoAlpha: 0, y: 16 },
          { autoAlpha: 1, y: 0, stagger: 0.15, duration: 0.3 },
          HANDOFF_COVERED + HANDOFF.scatter * 0.6
        )
        .to({}, { duration: 0.01 }, total - 0.01);

      // 2. Exit: the projects section slides up over this one instead of
      //    pushing it: the y offset cancels the scroll so it stays put and the
      //    next section stacks on top of it. The pin keeps the wrapper in
      //    place, so the section only offsets from 0 within it.
      const projects = document.getElementById("projects");
      const tunnel = tunnelRef.current;
      if (projects && tunnel) {
        const rails = Array.from(tunnel.querySelectorAll<SVGLineElement>("[data-rail]"));
        const frames = Array.from(tunnel.querySelectorAll<SVGRectElement>("[data-frame]"));
        // p: 0 → 1 over the exit. Rails draw out from the vanishing point,
        // frames drift away into the depth.
        const renderTunnel = (p: number) => {
          tunnel.style.opacity = String(gsap.utils.clamp(0, 1, p / 0.15));
          const reach = TUNNEL_REACH * gsap.utils.clamp(0, 1, p / 0.3);
          rails.forEach((line, i) => {
            line.setAttribute("x2", String(VP.x + RAILS[i].dx * reach));
            line.setAttribute("y2", String(VP.y + RAILS[i].dy * reach));
          });
          frames.forEach((rect, i) => {
            const z = (((i + 1) / TUNNEL_FRAMES - p * 0.6) % 1 + 1) % 1;
            const k = depthScale(z);
            rect.setAttribute("x", String(VP.x - VP.x * k));
            rect.setAttribute("y", String(VP.y - VP.y * k));
            rect.setAttribute("width", String(100 * k));
            rect.setAttribute("height", String(100 * k));
            // fade the ones near the vanishing point and the ones leaving the screen
            rect.style.opacity = String(Math.min(1, z / 0.25, (1 - z) / 0.15));
          });
        };
        const tunnelState = { p: 0 };
        renderTunnel(0);
        tunnel.style.opacity = "0";

        gsap
          .timeline({
            defaults: { ease: "none" },
            scrollTrigger: {
              trigger: projects,
              start: "top bottom",
              end: "top top",
              scrub: true,
              invalidateOnRefresh: true,
            },
          })
          .fromTo(section, { y: 0 }, { y: () => window.innerHeight, duration: 1, immediateRender: false }, 0)
          .fromTo(tunnelState, { p: 0 }, { p: 1, duration: 1, immediateRender: false, onUpdate: () => renderTunnel(tunnelState.p) }, 0)
          // The phrase sinks toward the vanishing point, speeding up, and is gone
          // by the time the next section covers the middle of the screen.
          .fromTo(
            extras,
            { scale: 1, opacity: 1, filter: "blur(0px)" },
            {
              scale: 0.1,
              opacity: 0,
              filter: "blur(10px)",
              duration: 0.5,
              ease: "power1.in",
              immediateRender: false,
              transformOrigin: () => `50% ${(VP.y / 100) * section.offsetHeight - extras.offsetTop}px`,
            },
            0
          );
        // Still behind the navbar while covered: stop counting as dark once
        // the projects section reaches the navbar.
        ScrollTrigger.create({
          trigger: projects,
          start: "top 36px",
          onEnter: () => (section.dataset.navDark = "false"),
          onLeaveBack: () => (section.dataset.navDark = ""),
        });
      }
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <>
      <div
        ref={brushRef}
        aria-hidden
        className="pointer-events-none invisible fixed inset-0 z-40"
      >
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-full w-full overflow-visible">
          <path
            d={BRUSH_PATH}
            fill="none"
            stroke="var(--color-ink-1)"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      <div ref={pinRef} className="motion-safe:-mt-[100svh]">
      <section
        ref={sectionRef}
        data-section="wsma-quote"
        data-nav-dark
        className="relative flex h-lvh w-full items-center overflow-x-clip bg-[var(--color-ink-1)]"
      >
        <svg
          ref={tunnelRef}
          aria-hidden
          className="pointer-events-none absolute inset-0 h-full w-full opacity-0"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <defs>
            {/* Rails fade out toward the vanishing point instead of bunching up. */}
            <radialGradient id="wsma-tunnel-fade" gradientUnits="userSpaceOnUse" cx={VP.x} cy={VP.y} r={100}>
              <stop offset="0.03" stopColor="var(--color-bg)" stopOpacity={0} />
              <stop offset="0.3" stopColor="var(--color-bg)" stopOpacity={0.3} />
              <stop offset="1" stopColor="var(--color-bg)" stopOpacity={0.3} />
            </radialGradient>
          </defs>
          <g fill="none">
            {RAILS.map((_, i) => (
              <line
                key={i}
                data-rail
                x1={VP.x}
                y1={VP.y}
                x2={VP.x}
                y2={VP.y}
                stroke="url(#wsma-tunnel-fade)"
                vectorEffect="non-scaling-stroke"
              />
            ))}
            {Array.from({ length: TUNNEL_FRAMES }).map((_, i) => (
              <rect
                key={i}
                data-frame
                stroke="var(--color-bg)"
                strokeOpacity={0.22}
                vectorEffect="non-scaling-stroke"
              />
            ))}
          </g>
        </svg>

        <div
          ref={extrasRef}
          className="relative z-[41] mx-auto max-w-[1280px] px-6 md:px-8 flex flex-col items-center text-center gap-4"
        >
          <div data-wsma-fade>
            <SectionLabel align="center">What sets me apart</SectionLabel>
          </div>

          <div className="flex flex-col pb-2">
            <ScatterText
              className="text-[var(--color-bg)]"
              style={{ fontSize: "clamp(36px, 5vw, 72px)", fontWeight: 700, lineHeight: 1.2, letterSpacing: "-0.03em" }}
              tweenRef={scatterRef}
            >
              I code. I design. <span className="text-[var(--color-accent)]">I do both.</span>
            </ScatterText>
          </div>

          <p data-wsma-fade className="text-sm md:text-lg font-medium text-[var(--color-bg)]/60 max-w-md mt-1">
            Great products happen when
            <br />
            <span className="text-[var(--color-bg)] font-semibold">design meets code.</span>
          </p>
        </div>
      </section>
      </div>
    </>
  );
}
