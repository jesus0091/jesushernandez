"use client";

import { prefersReducedMotion, setupGsap } from "@/lib/motion";
import { useLayoutEffect, useRef } from "react";

import SectionLabel from "@/components/SectionLabel";

const CELL = 40; // px, size of the pixel blocks
const LINES = ["I code.", "I design.", "I do both."];

function Headline({ wire = false }: { wire?: boolean }) {
  return (
    <h2
      aria-hidden={wire || undefined}
      className="font-semibold tracking-tight"
      style={{
        fontSize: "clamp(44px, 7vw, 104px)",
        lineHeight: 1.08,
        ...(wire ? { color: "transparent", WebkitTextStroke: "1px var(--color-ink-4)" } : {}),
      }}
    >
      {LINES.map((l, i) => (
        <span key={l} className={`block ${!wire && i === 2 ? "text-[var(--orange)]" : !wire ? "text-[var(--black)]" : ""}`}>
          {l}
        </span>
      ))}
    </h2>
  );
}

// Proposal C: the phrase starts as a spec (outlines, redlines, grid) and a
// pixel-block sweep turns it into the finished product.
export default function ProposalSketch() {
  const rootRef = useRef<HTMLElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const wireRef = useRef<HTMLDivElement | null>(null);
  const flashRef = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    const stage = stageRef.current;
    const wire = wireRef.current;
    const flash = flashRef.current;
    if (!root || !stage || !wire || !flash || prefersReducedMotion()) return;
    const gsap = setupGsap();
    const q = gsap.utils.selector(root);

    // Build the cell grid for the current stage size.
    let cells: { x: number; y: number; t: number; el: HTMLDivElement }[] = [];
    let w = 0;
    let h = 0;
    const build = () => {
      w = stage.offsetWidth;
      h = stage.offsetHeight;
      flash.replaceChildren();
      const cols = Math.ceil(w / CELL);
      const rows = Math.ceil(h / CELL);
      cells = [];
      for (let r = 0; r < rows; r++)
        for (let c = 0; c < cols; c++) {
          const el = document.createElement("div");
          el.style.cssText = `position:absolute;left:${c * CELL}px;top:${r * CELL}px;width:${CELL}px;height:${CELL}px;background:var(--orange);opacity:0`;
          flash.appendChild(el);
          // Diagonal sweep with noise, so it reads as blocks, not a wipe.
          const t = 0.06 + ((c / cols) * 0.75 + (r / rows) * 0.1 + Math.random() * 0.15) * 0.9;
          cells.push({ x: c * CELL, y: r * CELL, t, el });
        }
    };

    const render = (p: number) => {
      let d = `M0 0H${w}V${h}H0Z`;
      for (const cell of cells) {
        const dt = p - cell.t;
        if (dt > 0) d += `M${cell.x} ${cell.y}h${CELL}v${CELL}h-${CELL}Z`;
        const o = dt > -0.04 && dt < 0.08 ? 1 - Math.abs(dt - 0.02) / 0.06 : 0;
        cell.el.style.opacity = String(Math.max(0, Math.min(1, o)));
      }
      wire.style.clipPath = `path(evenodd, "${d}")`;
    };

    build();
    const state = { p: 0 };
    render(0);

    const ctx = gsap.context(() => {
      gsap.set(q("[data-redline]"), { scaleX: 0, transformOrigin: "left center" });
      gsap.set(q("[data-spec]"), { autoAlpha: 0, y: 6 });
      gsap.set(q("[data-sub]"), { autoAlpha: 0, y: 12 });

      gsap
        .timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: root,
            start: "top top",
            end: "+=240%",
            scrub: true,
            pin: true,
            anticipatePin: 1,
            onRefresh: () => {
              build();
              render(state.p);
            },
          },
        })
        // 1. The spec gets drawn: guides, measurements, type spec.
        .to(q("[data-redline]"), { scaleX: 1, stagger: 0.08, duration: 0.4 }, 0)
        .to(q("[data-spec]"), { autoAlpha: 1, y: 0, stagger: 0.1, duration: 0.2 }, 0.2)
        // 2. Pixel sweep: spec → product.
        .to(state, { p: 1.1, duration: 1.6, onUpdate: () => render(state.p) }, 0.9)
        .to(q("[data-sub]"), { autoAlpha: 1, y: 0, duration: 0.2 }, 2.3)
        .to({}, { duration: 0.3 });
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={rootRef} className="relative flex h-svh w-full items-center overflow-clip">
      <div className="mx-auto w-full max-w-[1280px] px-8">
        {/* Label — current eyebrow + mono meta (Curtis) */}
        <div className="mb-10 flex items-center justify-between">
          <SectionLabel>What sets me apart</SectionLabel>
          <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--color-ink-4)]">
            Spec → Product · 34.60°S 58.38°W
          </span>
        </div>

        <div ref={stageRef} className="relative w-fit pr-40">
          {/* Final product underneath */}
          <Headline />

          {/* Wireframe on top, clipped away cell by cell */}
          <div ref={wireRef} aria-hidden className="absolute inset-0 bg-[var(--color-bg)]">
            <div className="absolute inset-0 grid grid-cols-12 gap-4 opacity-60">
              {Array.from({ length: 12 }, (_, i) => (
                <div key={i} className="bg-[var(--color-blue)]/[0.04]" />
              ))}
            </div>
            <div className="relative">
              <Headline wire />
            </div>
            {/* Redlines: baselines + measurements */}
            {[0.3, 0.63, 0.96].map((top) => (
              <span
                key={top}
                data-redline
                className="absolute left-0 right-40 border-t border-dashed border-[var(--orange)]/60"
                style={{ top: `${top * 100}%` }}
              />
            ))}
            <span data-spec className="absolute -top-7 left-0 font-mono text-[11px] text-[var(--orange)]">
              Inter · Semibold · 104 / 112 · −3%
            </span>
            <span data-spec className="absolute right-0 top-[18%] rounded bg-[var(--color-blue)] px-1.5 py-0.5 font-mono text-[11px] text-white">
              gap 24
            </span>
            <span data-spec className="absolute right-0 top-[52%] rounded bg-[var(--color-blue)] px-1.5 py-0.5 font-mono text-[11px] text-white">
              gap 24
            </span>
            <span data-spec className="absolute bottom-0 right-0 font-mono text-[11px] text-[var(--color-ink-4)]">
              W 100% · H hug
            </span>
          </div>

          {/* Orange flash blocks */}
          <div ref={flashRef} aria-hidden className="pointer-events-none absolute inset-0" />
        </div>

        <p data-sub className="mt-10 max-w-md text-lg font-medium text-[var(--color-ink-3)]">
          I spec it, then I ship it. <span className="text-[var(--black)]">Design meets code</span> in the same hands.
        </p>
      </div>
    </section>
  );
}
