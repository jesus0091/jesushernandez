"use client";

import { useNearViewport } from "@/components/motion/useNearViewport";

import { isTouchScreen, prefersReducedMotion, setupGsap } from "@/lib/motion";
import { useLayoutEffect, useRef } from "react";
import { useTranslations } from "next-intl";

import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
import SectionHeading from "../motion/SectionHeading";
import SectionLabel from "../SectionLabel";
import SkillLogos from "./SkillLogos";

// Technical skill names stay as they are; only the category titles and the soft skills are translated.
type Category = { key: "dev" | "design" | "soft"; skills: string[] };

// Kept current with what shows up in recent projects.
const CATEGORIES: Category[] = [
  {
    key: "dev",
    skills: [
      "React", "Next.js", "TypeScript", "JavaScript", "Vite", "TailwindCSS",
      "GSAP", "Framer Motion", "Zustand", "TanStack Query", "React Hook Form",
      "React Native", "Expo",
      "Supabase", "PostgreSQL", "Prisma", "Drizzle", "Convex", "Redis",
      "Playwright", "Vitest", "Testing Library", "Zod", "Storybook", "Git",
      "SEO", "Web Performance", "WCAG / ARIA",
      "Claude API", "AI Prompting",
    ],
  },
  {
    key: "design",
    skills: ["Figma", "Design System", "Prototyping", "UX Research", "Accessibility", "AI Design", "Midjourney"],
  },
  {
    key: "soft",
    // Keys into skills.softItems.
    skills: [
      "communication", "teamwork", "problemSolving", "empathy",
      "ownership", "mentoring", "adaptability", "criticalThinking", "selfManagement",
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
  const t = useTranslations("skills");
  const rootRef = useRef<HTMLElement | null>(null);

  const near = useNearViewport(rootRef);

  useLayoutEffect(() => {
    if (!near) return;
    const root = rootRef.current;
    if (!root || prefersReducedMotion()) return;
    const gsap = setupGsap();
    gsap.registerPlugin(ScrambleTextPlugin);
    const q = gsap.utils.selector(root);
    const cleanups: (() => void)[] = [];

    const ctx = gsap.context(() => {
      // Dividers fill across with scroll.
      q<HTMLElement>("[data-line]").forEach((line) => {
        gsap.fromTo(
          line,
          { scaleX: 0 },
          { scaleX: 1, ease: "none", scrollTrigger: { trigger: line, start: "top bottom", end: "top 50%", scrub: 0.6 } }
        );
      });

      // Touch screens skip the blur: repainting it per frame stutters on Safari iOS.
      const blur = !isTouchScreen();
      q<HTMLElement>("[data-row]").forEach((row) => {
        const texts = row.querySelectorAll<HTMLElement>("[data-tag-text]");
        // Scrubbed, but done by the time the row's top reaches 70% of the viewport.
        const tl = gsap.timeline({ scrollTrigger: { trigger: row, start: "top bottom", end: "top 70%", scrub: 0.6 } });
        tl.fromTo(
          row.querySelector("[data-title]"),
          { filter: blur ? "blur(12px)" : "none", opacity: 0, x: -24 },
          { filter: blur ? "blur(0px)" : "none", opacity: 1, x: 0, duration: 0.5, ease: "power2.out" },
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
  }, [near]);

  return (
    <section id="skills" ref={rootRef} className="relative pt-20 md:pt-28">
      <div className="mx-auto w-full max-w-[1280px] px-6 md:px-8">
        <div className="mb-10 md:mb-14 flex flex-col gap-3">
          <SectionLabel>{t("label")}</SectionLabel>
          <SectionHeading className="text-2xl sm:text-3xl md:text-6xl leading-tighter font-semibold tracking-title text-[var(--black)]">
            {t("heading")}
          </SectionHeading>
        </div>

        {CATEGORIES.map((c) => (
          <div key={c.key} data-row className="relative grid grid-cols-1 gap-3 py-6 md:grid-cols-12 md:gap-8 md:py-7">
            <span data-line aria-hidden className="absolute inset-x-0 top-0 h-px origin-left bg-black/15" />
            <h3 data-title className="text-2xl font-semibold tracking-title text-[var(--black)] md:col-span-3">
              {t(c.key)}
            </h3>
            {/* Square-ish tags, not pills: the site's buttons are pills, so the
                shape keeps skills from reading as clickable. */}
            <ul className="flex flex-wrap content-start gap-x-2 gap-y-1.5 md:col-span-9">
              {c.skills.map((s) => {
                const label = c.key === "soft" ? t(`softItems.${s}`) : s;
                return (
                  <li key={s} data-tag className="rounded-chip bg-[color-mix(in_srgb,var(--color-bg),black_8%)] px-2.5 py-1 font-mono text-sm text-[var(--color-ink-2)]">
                    <span data-tag-text data-text={label}>
                      {label}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      {/* Outside the container so the logos run the full width of the page. */}
      <SkillLogos />
    </section>
  );
}
