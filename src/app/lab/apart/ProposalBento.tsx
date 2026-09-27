"use client";

import { FigmaIcon, IllustratorIcon, ReactIcon, TailwindIcon, TypeScriptIcon } from "@/components/AboutMe/SkillsIcons";
import { prefersReducedMotion, setupGsap } from "@/lib/motion";
import { useLayoutEffect, useRef } from "react";

type Card = { kind: "code" | "design"; k: number; name: string; note: string; icon: React.ReactNode };

function SystemGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="size-7" fill="none" stroke="currentColor" strokeWidth="1.6">
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="3.5" />
      <rect x="3" y="14" width="7" height="7" rx="3.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  );
}

// DOM order = the final, interleaved layout. `k` = slot inside its own deck.
const CARDS: Card[] = [
  { kind: "code", k: 0, name: "React & Next.js", note: "Components that ship", icon: <ReactIcon className="size-7" /> },
  { kind: "design", k: 0, name: "Figma", note: "Flows, UI, prototypes", icon: <FigmaIcon className="size-7" /> },
  { kind: "code", k: 1, name: "TypeScript", note: "Typed, predictable", icon: <TypeScriptIcon className="size-7" /> },
  { kind: "design", k: 1, name: "Visual craft", note: "Branding, assets", icon: <IllustratorIcon className="size-7" /> },
  { kind: "code", k: 2, name: "Tailwind & motion", note: "Pixel-true, alive", icon: <TailwindIcon className="size-7" /> },
  { kind: "design", k: 2, name: "Design systems", note: "Tokens to components", icon: <SystemGlyph /> },
];

// Notched top-left corner, like a folder tab (Curtis).
const NOTCH = "polygon(22px 0, 100% 0, 100% 100%, 0 100%, 0 22px)";

// Proposal B: two decks. Code cards deal in from the left, design cards from
// the right, each lighting up its clause; on "I do both." they shuffle into
// one mixed grid.
export default function ProposalBento() {
  const rootRef = useRef<HTMLElement | null>(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || prefersReducedMotion()) return;
    const gsap = setupGsap();
    const q = gsap.utils.selector(root);

    const ctx = gsap.context(() => {
      const cards = q<HTMLElement>("[data-card]");
      // Offset from a card's final slot to its slot in the sorted "two decks" layout
      // (code on the top row, design on the bottom), measured transform-free.
      const sortedSlot = (c: Card) => (c.kind === "code" ? c.k : 3 + c.k);
      const toSorted = (i: number, axis: "x" | "y") => {
        const target = cards[sortedSlot(CARDS[i])];
        return axis === "x" ? target.offsetLeft - cards[i].offsetLeft : target.offsetTop - cards[i].offsetTop;
      };
      const dealX = (_: number, el: HTMLElement) => toSorted(cards.indexOf(el), "x");
      const deal = (kind: Card["kind"]) => cards.filter((_, i) => CARDS[i].kind === kind);
      const lines = q("[data-line]");

      gsap.set(lines, { opacity: 0.18 });
      gsap.set(q("[data-both-badge]"), { autoAlpha: 0, scale: 0.9 });
      cards.forEach((el, i) => {
        const fromLeft = CARDS[i].kind === "code";
        gsap.set(el, {
          x: () => toSorted(i, "x") + (fromLeft ? -900 : 900),
          y: () => toSorted(i, "y"),
          rotation: fromLeft ? -8 : 8,
          autoAlpha: 0,
        });
      });

      gsap
        .timeline({
          defaults: { ease: "power2.out" },
          scrollTrigger: {
            trigger: root,
            start: "top top",
            end: "+=260%",
            scrub: true,
            pin: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        })
        .to(lines[0], { opacity: 1, duration: 0.2 }, 0)
        .to(deal("code"), { x: dealX, rotation: 0, autoAlpha: 1, stagger: 0.15, duration: 0.6 }, 0.1)
        .to(lines[0], { opacity: 0.35, duration: 0.2 }, 1)
        .to(lines[1], { opacity: 1, duration: 0.2 }, 1)
        .to(deal("design"), { x: dealX, rotation: 0, autoAlpha: 1, stagger: 0.15, duration: 0.6 }, 1.1)
        // I do both. — shuffle into one grid
        .to(lines, { opacity: 1, duration: 0.2 }, 2)
        .to(cards, { x: 0, y: 0, duration: 0.7, stagger: 0.04, ease: "power3.inOut" }, 2.05)
        .to(cards, { borderColor: "color-mix(in oklab, var(--orange) 45%, transparent)", duration: 0.3 }, 2.6)
        .to(q("[data-both-badge]"), { autoAlpha: 1, scale: 1, duration: 0.25 }, 2.75)
        .to({}, { duration: 0.4 });
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={rootRef} className="relative flex h-svh w-full items-center overflow-clip">
      <div className="mx-auto grid w-full max-w-[1280px] grid-cols-[5fr_7fr] items-center gap-16 px-8">
        <div>
          {/* Label — pill tag (Curtis) */}
          <span className="mb-8 inline-flex items-center gap-2 rounded-full bg-[var(--black)] px-3 py-1.5 font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--color-bg)]">
            <span className="size-1.5 rounded-full bg-[var(--orange)]" />
            What sets me apart
          </span>
          <h2 className="font-semibold tracking-tight text-[var(--black)]" style={{ fontSize: "clamp(40px, 5.2vw, 80px)", lineHeight: 1.05 }}>
            <span data-line className="block">I code.</span>
            <span data-line className="block">I design.</span>
            <span data-line className="block text-[var(--orange)]">I do both.</span>
          </h2>
          <p className="mt-8 max-w-sm text-lg font-medium text-[var(--color-ink-3)]">
            One pair of hands from the first frame to the last commit. Nothing lost in handoff.
          </p>
        </div>

        <div className="relative">
          <div className="grid grid-cols-3 gap-4">
            {CARDS.map((c) => (
              <div
                key={c.name}
                data-card
                className="flex aspect-[4/3.4] flex-col justify-between border border-[var(--color-line-1)] bg-white p-5 shadow-[0_1px_0_rgba(0,0,0,0.03)]"
                style={{ clipPath: NOTCH, borderRadius: 16 }}
              >
                <span
                  className={`self-end font-mono text-[10px] font-semibold uppercase tracking-[0.2em] ${
                    c.kind === "code" ? "text-[var(--color-blue)]" : "text-[var(--orange)]"
                  }`}
                >
                  {c.kind}
                </span>
                <div className="text-[var(--color-ink-2)]">{c.icon}</div>
                <div>
                  <div className="text-base font-semibold text-[var(--black)]">{c.name}</div>
                  <div className="text-sm text-[var(--color-ink-4)]">{c.note}</div>
                </div>
              </div>
            ))}
          </div>
          <div
            data-both-badge
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--orange)] px-5 py-2.5 text-sm font-semibold text-white shadow-lg"
          >
            Designed & built by the same person
          </div>
        </div>
      </div>
    </section>
  );
}
