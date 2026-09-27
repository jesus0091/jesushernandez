"use client";

import { prefersReducedMotion, setupGsap } from "@/lib/motion";
import { useLayoutEffect, useRef } from "react";

import { Caveat } from "next/font/google";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";

const hand = Caveat({ subsets: ["latin"], weight: ["600"] });

// Proposal A: the phrase acts itself out.
// "I code." decodes like source, "I design." sits in a Figma-style selection a
// cursor nudges into place, "I do both." settles everything with a brush stroke.
export default function ProposalDecode() {
  const rootRef = useRef<HTMLElement | null>(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || prefersReducedMotion()) return;
    const gsap = setupGsap();
    gsap.registerPlugin(ScrambleTextPlugin);
    const q = gsap.utils.selector(root);

    const ctx = gsap.context(() => {
      gsap.set(q("[data-raw-code]"), { text: "" });
      gsap.set(q("[data-final-code]"), { autoAlpha: 0 });
      gsap.set(q("[data-design]"), { autoAlpha: 0, x: 48 });
      gsap.set(q("[data-frame]"), { autoAlpha: 0, scale: 0.96 });
      gsap.set(q("[data-cursor]"), { autoAlpha: 0, x: 220, y: 90 });
      gsap.set(q("[data-both] span"), { yPercent: 110 });
      gsap.set(q("[data-brush]"), { drawSVG: "0% 0%" });
      gsap.set(q("[data-note]"), { autoAlpha: 0, x: -12 });
      gsap.set(q("[data-sub]"), { autoAlpha: 0, y: 12 });

      gsap
        .timeline({
          defaults: { ease: "none" },
          scrollTrigger: { trigger: root, start: "top top", end: "+=260%", scrub: true, pin: true, anticipatePin: 1 },
        })
        // 1. I code.
        .to(q("[data-raw-code]"), { duration: 1, scrambleText: { text: "<I code />", chars: "01{}<>/;=_", speed: 0.6, revealDelay: 0.2 } })
        // 2. I design.
        .to(q("[data-frame]"), { autoAlpha: 1, scale: 1, duration: 0.25 }, 1.05)
        .to(q("[data-design]"), { autoAlpha: 1, duration: 0.2 }, 1.1)
        .to(q("[data-cursor]"), { autoAlpha: 1, x: 0, y: 0, duration: 0.35, ease: "power2.out" }, 1.15)
        .to([q("[data-design]"), q("[data-frame]"), q("[data-cursor]")], { x: "-=48", duration: 0.45, ease: "power2.inOut" }, 1.55)
        // 3. I do both. — code resolves into the same type, the frame lets go.
        .to(q("[data-raw-code]"), { duration: 0.45, scrambleText: { text: "I code.", chars: "01{}<>/;=_", speed: 0.8 } }, 2.1)
        .to(q("[data-raw-code]"), { autoAlpha: 0, duration: 0.15 }, 2.5)
        .to(q("[data-final-code]"), { autoAlpha: 1, duration: 0.15 }, 2.5)
        .to([q("[data-frame]"), q("[data-cursor]")], { autoAlpha: 0, duration: 0.2 }, 2.2)
        .to(q("[data-both] span"), { yPercent: 0, stagger: 0.06, duration: 0.3, ease: "power3.out" }, 2.3)
        .to(q("[data-brush]"), { drawSVG: "0% 100%", duration: 0.35, ease: "power1.inOut" }, 2.65)
        .to(q("[data-note]"), { autoAlpha: 1, x: 0, duration: 0.2 }, 2.9)
        .to(q("[data-sub]"), { autoAlpha: 1, y: 0, duration: 0.2 }, 3)
        .to({}, { duration: 0.4 });
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={rootRef} className="relative flex h-svh w-full items-center overflow-clip">
      <div className="mx-auto w-full max-w-[1280px] px-8">
        {/* Label — numbered index + dot-separated meta (Daniel Kiss) */}
        <div className="mb-10 flex items-baseline gap-4">
          <span className="font-mono text-sm font-semibold text-[var(--orange)]">04</span>
          <span className="h-px w-10 translate-y-[-4px] bg-[var(--orange)]/70" />
          <div className="flex flex-col gap-1">
            <span className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--orange)]">What sets me apart</span>
            <span className="text-xs font-medium uppercase tracking-[0.12em] text-[var(--color-ink-4)]">
              Product design · Front-end · Motion
            </span>
          </div>
        </div>

        <h2
          className="flex flex-col gap-1 font-semibold tracking-tight text-[var(--black)]"
          style={{ fontSize: "clamp(44px, 7vw, 104px)", lineHeight: 1.05 }}
        >
          {/* I code. */}
          <span className="grid">
            <span data-raw-code className="[grid-area:1/1] font-mono font-medium text-[var(--color-ink-3)]" style={{ fontSize: "0.82em" }}>
              {"<I code />"}
            </span>
            <span data-final-code className="[grid-area:1/1]">I code.</span>
          </span>

          {/* I design. */}
          <span className="relative w-fit">
            <span data-design className="relative z-10 inline-block">I design.</span>
            <span data-frame aria-hidden className="pointer-events-none absolute -inset-x-3 -inset-y-1 border-[1.5px] border-[var(--color-blue)]">
              {["-left-[5px] -top-[5px]", "-right-[5px] -top-[5px]", "-left-[5px] -bottom-[5px]", "-right-[5px] -bottom-[5px]"].map((pos) => (
                <span key={pos} className={`absolute size-2 border-[1.5px] border-[var(--color-blue)] bg-white ${pos}`} />
              ))}
              <span className="absolute -bottom-7 left-1/2 -translate-x-1/2 rounded bg-[var(--color-blue)] px-1.5 py-0.5 font-mono text-[11px] font-medium tracking-normal text-white">
                Hug × 104
              </span>
            </span>
            <span data-cursor aria-hidden className="pointer-events-none absolute -right-10 -bottom-9 z-20 flex items-start">
              <svg width="22" height="22" viewBox="0 0 24 24" className="drop-shadow">
                <path d="M4 2l16 9-7 2-3 7z" fill="var(--color-blue)" stroke="white" strokeWidth="1.5" strokeLinejoin="round" />
              </svg>
              <span className="mt-4 rounded-full bg-[var(--color-blue)] px-2 py-0.5 text-[12px] font-medium tracking-normal text-white">Jesús</span>
            </span>
          </span>

          {/* I do both. */}
          <span className="relative w-fit text-[var(--orange)]">
            <span data-both className="inline-flex gap-[0.25em]">
              {["I", "do", "both."].map((w) => (
                <span key={w} className="inline-block overflow-clip pb-[0.12em] -mb-[0.12em]">
                  <span className="inline-block">{w}</span>
                </span>
              ))}
            </span>
            <svg aria-hidden viewBox="0 0 300 20" preserveAspectRatio="none" className="absolute -bottom-[0.12em] left-[38%] h-[0.22em] w-[62%] overflow-visible">
              <path data-brush d="M4 12 C 70 4, 150 16, 296 7" fill="none" stroke="var(--orange)" strokeWidth="7" strokeLinecap="round" />
            </svg>
            <span
              data-note
              className={`${hand.className} absolute left-[calc(100%+1.2rem)] top-1/2 -translate-y-1/2 whitespace-nowrap text-[0.32em] font-semibold text-[var(--color-ink-3)]`}
            >
              ← the fun part
            </span>
          </span>
        </h2>

        <p data-sub className="mt-10 max-w-md text-lg font-medium text-[var(--color-ink-3)]">
          Great products happen when <span className="text-[var(--black)]">design meets code</span>, in the same hands.
        </p>
      </div>
    </section>
  );
}
