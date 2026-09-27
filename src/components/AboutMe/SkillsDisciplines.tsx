"use client";

import { prefersReducedMotion, setupGsap } from "@/lib/motion";
import { useLayoutEffect, useRef } from "react";

import ScrubWords from "../motion/ScrubWords";
import SectionHeading from "../motion/SectionHeading";
import SectionLabel from "../SectionLabel";
import { Sparkle } from "@/components/icons";

type Discipline = {
  title: string;
  pitch: string;
  tools: string[];
};

const DISCIPLINES: Discipline[] = [
  {
    title: "Development",
    pitch: "I build fast, accessible interfaces, from design system to production.",
    tools: ["React", "Next.js", "TypeScript", "TailwindCSS", "GSAP", "Framer Motion"],
  },
  {
    title: "Design",
    pitch: "Research, flows and systems that still hold up once they meet code.",
    tools: ["Figma", "Design Systems", "Prototyping", "UX Research", "Accessibility"],
  },
  {
    title: "AI",
    pitch: "I treat AI as material for the product, not as a gimmick.",
    tools: ["Claude API", "OpenAI API", "AI Prompting", "AI Design", "Midjourney"],
  },
];

/** Skills as numbered disciplines: what I do, then the tools I do it with. */
export default function SkillsDisciplines() {
  const listRef = useRef<HTMLUListElement | null>(null);

  useLayoutEffect(() => {
    const list = listRef.current;
    if (!list || prefersReducedMotion()) return;
    const gsap = setupGsap();

    const ctx = gsap.context(() => {
      list.querySelectorAll<HTMLElement>("[data-row]").forEach((row) => {
        gsap
          .timeline({ scrollTrigger: { trigger: row, start: "top 85%", once: true } })
          .from(row.querySelector("[data-line]"), { scaleX: 0, duration: 0.9, ease: "brand" }, 0)
          .from(
            row.querySelectorAll("[data-reveal]"),
            { autoAlpha: 0, y: 24, duration: 0.7, stagger: 0.08, ease: "power3.out" },
            0.15
          );
      });
    }, list);

    return () => ctx.revert();
  }, []);

  return (
    <section id="skills" className="relative py-24 md:py-32">
      <div className="mx-auto max-w-[1280px] w-full px-6 md:px-8">
        <div className="flex flex-col gap-3 mb-12 md:mb-16">
          <SectionLabel>Skills</SectionLabel>
          <SectionHeading className="text-3xl md:text-6xl leading-tighter font-semibold text-[var(--black)]">
            What I bring to the table.
          </SectionHeading>
        </div>

        <ul
          ref={listRef}
          className="border-b border-black/10 [@media(hover:hover)]:[&:hover>li]:opacity-35 [@media(hover:hover)]:[&>li:hover]:opacity-100"
        >
          {DISCIPLINES.map((d, i) => (
            <li
              key={d.title}
              data-row
              className="group relative grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-8 py-8 md:py-12 transition-opacity duration-300"
            >
              <span
                data-line
                aria-hidden
                className="absolute inset-x-0 top-0 h-px origin-left bg-black/10"
              />

              <div data-reveal className="md:col-span-5 flex items-baseline gap-5 md:gap-8">
                <span className="font-mono text-sm text-[var(--muted)] transition-colors duration-300 group-hover:text-[var(--orange)]">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="text-4xl md:text-6xl font-semibold tracking-[-0.03em] leading-none text-[var(--black)]">
                  {d.title}
                </h3>
              </div>

              <div className="md:col-span-7 flex flex-col gap-4 md:pt-2">
                <ScrubWords className="text-lg md:text-2xl font-medium leading-snug tracking-[-0.01em] text-[var(--black)] max-w-xl">
                  {d.pitch}
                </ScrubWords>
                <p data-reveal className="text-sm md:text-base text-[var(--muted)]">
                  {d.tools.join("  ·  ")}
                </p>
              </div>
            </li>
          ))}
        </ul>

        <p className="mt-12 md:mt-16 flex items-center gap-2 text-base md:text-lg text-[var(--muted)]">
          <Sparkle size={18} className="text-[var(--orange)]" />
          Ownership, mentoring and clear communication. Always learning, always growing.
        </p>
      </div>
    </section>
  );
}
