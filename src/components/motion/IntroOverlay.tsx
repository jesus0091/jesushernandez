"use client";

import {
  SIGNATURE_HEIGHT,
  SIGNATURE_MASK_WIDTH,
  SIGNATURE_STROKES,
  SIGNATURE_VIEWBOX,
  SIGNATURE_WIDTH,
} from "./signature";
import {
  getLenis,
  markIntroRevealed,
  prefersReducedMotion,
  setupGsap,
} from "@/lib/motion";
import { useEffect, useId, useRef } from "react";

import { BrushSvg, brushCovered, brushOut } from "./Brush";

export default function IntroOverlay() {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const maskId = `intro-signature-${useId().replace(/:/g, "")}`;

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;

    if (prefersReducedMotion()) {
      wrap.style.display = "none";
      markIntroRevealed();
      return;
    }

    const gsap = setupGsap();
    const wipe = wrap.querySelector<HTMLElement>("[data-intro-wipe]")!;
    const signature = wrap.querySelector<HTMLElement>("[data-intro-signature]")!;
    const strokes = Array.from(signature.querySelectorAll<SVGPathElement>("mask path"));

    window.scrollTo(0, 0);
    getLenis()?.stop();

    const lengths = strokes.map((p) => p.getTotalLength());

    const tl = gsap.timeline({
      onComplete: () => {
        wrap.style.display = "none";
        getLenis()?.start();
      },
    });

    brushCovered(wipe);
    tl.set(strokes, { drawSVG: "0% 0%" })
      .set(signature, { autoAlpha: 1 });

    // Write the signature stroke by stroke (each revealed through its own
    // mask) at a steady pen speed, with a short pen lift between strokes.
    const total = lengths.reduce((a, b) => a + b, 0);
    strokes.forEach((stroke, i) => {
      tl.to(
        stroke,
        {
          drawSVG: "0% 100%",
          duration: Math.max(0.2, (lengths[i] / total) * 1.7),
          ease: "sine.inOut",
        },
        i === 0 ? undefined : "+=0.06"
      );
    });

    tl.to({}, { duration: 0.15 })
      .to(strokes, {
        drawSVG: "100% 100%",
        duration: 0.45,
        stagger: 0.03,
        ease: "power2.inOut",
      })
      // The brush lifts off, linear inside, eased as a whole.
      .to(brushOut(wipe).pause(0), { progress: 1, duration: 1, ease: "sine.inOut" }, "<0.2")
      .set(signature, { autoAlpha: 0 }, "<")
      .call(markIntroRevealed, [], "<0.25");

    return () => {
      tl.kill();
      getLenis()?.start();
    };
  }, []);

  return (
    <>
      <noscript>
        <style>{`[data-intro]{display:none!important}`}</style>
      </noscript>
      <div ref={wrapRef} data-intro aria-hidden="true" className="intro">
        <div data-intro-wipe className="absolute inset-0">
          <BrushSvg covered />
        </div>
        <div data-intro-signature className="intro__signature">
          <svg viewBox={SIGNATURE_VIEWBOX} fill="none" width="100%">
            <defs>
              {SIGNATURE_STROKES.map(({ centerline }, i) => (
                <mask
                  key={i}
                  id={`${maskId}-${i}`}
                  maskUnits="userSpaceOnUse"
                  x={-SIGNATURE_MASK_WIDTH}
                  y={-SIGNATURE_MASK_WIDTH}
                  width={SIGNATURE_WIDTH + SIGNATURE_MASK_WIDTH * 2}
                  height={SIGNATURE_HEIGHT + SIGNATURE_MASK_WIDTH * 2}
                >
                  <path
                    d={centerline}
                    stroke="white"
                    strokeWidth={SIGNATURE_MASK_WIDTH}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </mask>
              ))}
            </defs>
            {SIGNATURE_STROKES.map(({ art }, i) => (
              <path key={i} d={art} fill="currentColor" mask={`url(#${maskId}-${i})`} />
            ))}
          </svg>
        </div>
      </div>
    </>
  );
}
