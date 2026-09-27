"use client";

import { prefersReducedMotion, setupGsap } from "@/lib/motion";
import { useLayoutEffect, useRef } from "react";

import { HANDOFF } from "../motion/skillsHandoff";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
import SectionHeading from "../motion/SectionHeading";
import SectionLabel from "../SectionLabel";

type Category = { key: string; label: string; skills: string[] };

// Kept current with what shows up in recent projects.
const CATEGORIES: Category[] = [
  {
    key: "dev",
    label: "Development",
    skills: [
      "React", "Next.js", "TypeScript", "JavaScript", "Vite", "TailwindCSS",
      "GSAP", "Framer Motion", "Zustand", "TanStack Query", "React Hook Form",
      "React Native", "Expo",
      "Supabase", "PostgreSQL", "Prisma", "Drizzle", "Convex", "Redis",
      "Playwright", "Vitest", "Testing Library", "Zod", "Storybook", "Git",
      "Claude API", "AI Prompting",
    ],
  },
  {
    key: "design",
    label: "Design",
    skills: ["Figma", "Design System", "Prototyping", "UX Research", "Accessibility", "AI Design", "Midjourney"],
  },
  {
    key: "soft",
    label: "Soft Skills",
    skills: [
      "Communication", "Teamwork", "Problem Solving", "Empathy",
      "Ownership", "Mentoring", "Adaptability", "Critical Thinking", "Self-management",
    ],
  },
];

const CHARS = "abcdefghijklmnopqrstuvwxyz<>/{}#_";

/**
 * Skills by category, driven by scroll: each divider grows across as its row
 * comes up, the title comes into focus, the tags rise in and their text
 * decodes. The decode finishes while the row is still in the lower part of
 * the screen (top at 70%), so it is always readable where you actually read
 * it. Hovering a tag decodes it again.
 */
export default function Skills() {
  const rootRef = useRef<HTMLElement | null>(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || prefersReducedMotion()) return;
    const gsap = setupGsap();
    gsap.registerPlugin(ScrambleTextPlugin);
    const q = gsap.utils.selector(root);
    const cleanups: (() => void)[] = [];

    const ctx = gsap.context(() => {
      // Dividers fill across with scroll.
      q<HTMLElement>("[data-line]:not([data-line-last])").forEach((line) => {
        gsap.fromTo(
          line,
          { scaleX: 0 },
          { scaleX: 1, ease: "none", scrollTrigger: { trigger: line, start: "top bottom", end: "top 50%", scrub: 0.6 } }
        );
      });

      // The closing divider fills while the section holds at the bottom of the
      // screen (the hold itself is pinned by WSMAQuote, which paints over it).
      gsap.fromTo(
        q("[data-line-last]"),
        { scaleX: 0 },
        {
          scaleX: 1,
          ease: "none",
          scrollTrigger: { trigger: root, start: "bottom bottom", end: `+=${HANDOFF.lineFill * 100}%`, scrub: 0.6 },
        }
      );

      q<HTMLElement>("[data-row]").forEach((row) => {
        const texts = row.querySelectorAll<HTMLElement>("[data-tag-text]");
        // Scrubbed, but done by the time the row's top reaches 70% of the viewport.
        const tl = gsap.timeline({ scrollTrigger: { trigger: row, start: "top bottom", end: "top 70%", scrub: 0.6 } });
        tl.fromTo(
          row.querySelector("[data-title]"),
          { filter: "blur(12px)", opacity: 0, x: -24 },
          { filter: "blur(0px)", opacity: 1, x: 0, duration: 0.5, ease: "power2.out" },
          0
        ).fromTo(
          row.querySelectorAll("[data-tag]"),
          { autoAlpha: 0, y: 14 },
          { autoAlpha: 1, y: 0, duration: 0.3, ease: "power2.out", stagger: 0.035 },
          0.1
        );
        texts.forEach((el, i) => {
          const text = el.dataset.text!;
          tl.fromTo(
            el,
            { scrambleText: { text: text.replace(/\S/g, "_"), chars: CHARS } },
            { scrambleText: { text, chars: CHARS, speed: 0.8 }, duration: 0.4, ease: "none" },
            0.15 + i * 0.035
          );
        });
      });

      q<HTMLElement>("[data-tag]").forEach((tag) => {
        const el = tag.querySelector<HTMLElement>("[data-tag-text]")!;
        const onEnter = (e: PointerEvent) => {
          if (e.pointerType !== "mouse") return;
          gsap.to(el, { duration: 0.45, scrambleText: { text: el.dataset.text!, chars: CHARS, speed: 1.2 } });
        };
        tag.addEventListener("pointerenter", onEnter);
        cleanups.push(() => tag.removeEventListener("pointerenter", onEnter));
      });
    }, root);

    return () => {
      cleanups.forEach((f) => f());
      ctx.revert();
    };
  }, []);

  return (
    <section id="skills" ref={rootRef} className="relative pt-12 pb-20 md:py-28">
      <div className="mx-auto w-full max-w-[1280px] px-6 md:px-8">
        <div className="mb-10 md:mb-14 flex flex-col gap-3">
          <SectionLabel>Skills</SectionLabel>
          <SectionHeading className="text-3xl md:text-6xl leading-tighter font-semibold tracking-tight text-[var(--black)]">
            What I bring to the table.
          </SectionHeading>
        </div>

        {CATEGORIES.map((c) => (
          <div key={c.key} data-row className="relative grid grid-cols-1 gap-4 py-8 md:grid-cols-12 md:gap-8 md:py-10">
            <span data-line aria-hidden className="absolute inset-x-0 top-0 h-px origin-left bg-black/15" />
            <h3 data-title className="text-2xl font-semibold tracking-tight text-[var(--black)] md:col-span-5">
              {c.label}
            </h3>
            {/* Square-ish tags, not pills: the site's buttons are pills, so the
                shape keeps skills from reading as clickable. */}
            <ul className="flex flex-wrap content-start gap-2 md:col-span-7">
              {c.skills.map((s) => (
                <li key={s} data-tag className="rounded-md bg-black/[0.05] px-2.5 py-1 font-mono text-sm text-[var(--color-ink-2)]">
                  <span data-tag-text data-text={s}>
                    {s}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <p className="relative mt-4 md:mt-6 pt-8 text-base md:text-lg font-medium text-[var(--color-ink-4)]">
          <span data-line data-line-last aria-hidden className="absolute inset-x-0 top-0 h-px origin-left bg-black/15" />
          Always learning, always growing.
        </p>
      </div>
    </section>
  );
}
