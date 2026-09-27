"use client";

import { prefersReducedMotion, setupGsap } from "@/lib/motion";
import { useLayoutEffect, useRef } from "react";

import { CATEGORIES } from "./data";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
import SectionHeading from "@/components/motion/SectionHeading";
import SectionLabel from "@/components/SectionLabel";

const CHARS = "abcdefghijklmnopqrstuvwxyz<>/{}#_";

// Proposal 3 (lighter, keeps today's layout): when a row enters, it comes into
// focus (blur → sharp, Daniel Kiss), its chips rise in and their text decodes
// into place (Curtis). Plays once and always completes, so text is never left
// scrambled mid-scroll. Hovering a skill decodes it again.
export default function ProposalScramble() {
  const rootRef = useRef<HTMLElement | null>(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || prefersReducedMotion()) return;
    const gsap = setupGsap();
    gsap.registerPlugin(ScrambleTextPlugin);
    const q = gsap.utils.selector(root);
    const cleanups: (() => void)[] = [];

    const ctx = gsap.context(() => {
      q<HTMLElement>("[data-row]").forEach((row) => {
        const chips = row.querySelectorAll<HTMLElement>("[data-chip-text]");
        const tl = gsap.timeline({
          scrollTrigger: { trigger: row, start: "top 80%", once: true },
        });
        tl.fromTo(row.querySelector("[data-line]"), { scaleX: 0 }, { scaleX: 1, duration: 0.9, ease: "brand" }, 0)
          .fromTo(
            row.querySelector("[data-title]"),
            { filter: "blur(12px)", opacity: 0, x: -24 },
            { filter: "blur(0px)", opacity: 1, x: 0, duration: 0.7, ease: "power3.out" },
            0.05
          )
          .fromTo(
            row.querySelectorAll("[data-chip]"),
            { autoAlpha: 0, y: 14 },
            { autoAlpha: 1, y: 0, duration: 0.5, ease: "power3.out", stagger: 0.035 },
            0.2
          );
        chips.forEach((el, i) => {
          const text = el.dataset.text!;
          tl.fromTo(
            el,
            { scrambleText: { text: text.replace(/\S/g, "_"), chars: CHARS } },
            { scrambleText: { text, chars: CHARS, speed: 0.8 }, duration: 0.6, ease: "none" },
            0.25 + i * 0.035
          );
        });
      });

      // Hover: decode again.
      q<HTMLElement>("[data-chip-text]").forEach((el) => {
        const onEnter = () => gsap.to(el, { duration: 0.45, scrambleText: { text: el.dataset.text!, chars: CHARS, speed: 1.2 } });
        el.addEventListener("pointerenter", onEnter);
        cleanups.push(() => el.removeEventListener("pointerenter", onEnter));
      });
    }, root);

    return () => {
      cleanups.forEach((f) => f());
      ctx.revert();
    };
  }, []);

  return (
    <section ref={rootRef} className="relative py-28">
      <div className="mx-auto w-full max-w-[1280px] px-8">
        <div className="mb-14 flex flex-col gap-3">
          <SectionLabel>Skills</SectionLabel>
          <SectionHeading className="text-3xl md:text-6xl leading-tighter font-semibold tracking-tight text-[var(--black)]">
            What I bring to the table.
          </SectionHeading>
        </div>

        {CATEGORIES.map((c) => (
          <div key={c.key} data-row className="relative grid grid-cols-12 gap-8 py-10">
            <span data-line className="absolute inset-x-0 top-0 h-px origin-left bg-black/15" />
            <div className="col-span-5">
              <h3 data-title className="text-2xl font-semibold tracking-tight text-[var(--black)]">
                {c.label}
              </h3>
            </div>
            {/* Square-ish tags, not pills: the site's buttons are pills, so the
                shape keeps skills from reading as clickable. */}
            <ul className="col-span-7 flex flex-wrap content-start gap-2">
              {c.skills.map((s) => (
                <li
                  key={s}
                  data-chip
                  className="rounded-md bg-black/[0.05] px-2.5 py-1 font-mono text-sm text-[var(--color-ink-2)]"
                >
                  <span data-chip-text data-text={s}>
                    {s}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <p className="mt-6 border-t border-black/15 pt-8 text-lg font-medium text-[var(--color-ink-4)]">
          Always learning, always growing.
        </p>
      </div>
    </section>
  );
}
