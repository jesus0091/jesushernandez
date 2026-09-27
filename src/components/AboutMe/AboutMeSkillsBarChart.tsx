"use client";

import React, { useEffect, useLayoutEffect, useRef } from "react";

import { Sparkle } from "@/components/icons";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SectionHeading from "../motion/SectionHeading";
import SectionLabel from "../SectionLabel";
import gsap from "gsap";

const CATEGORIES = [
  {
    key: "dev",
    label: "Development",
    skills: [
      "React", "Next.js", "TypeScript", "JavaScript", "TailwindCSS",
      "GSAP", "Framer Motion", "Zustand", "Redux", "Jotai",
      "Storybook", "Git", "Claude API", "OpenAI API", "AI Prompting",
    ],
  },
  {
    key: "design",
    label: "Design",
    skills: [
      "Figma", "Design System", "Prototyping", "UX Research",
      "Accessibility", "AI Design", "Midjourney",
    ],
  },
  {
    key: "soft",
    label: "Soft Skills",
    skills: [
      "Communication", "Teamwork", "Problem Solving", "Empathy",
      "Ownership", "Mentoring", "Adaptability", "Critical Thinking",
      "Self-management",
    ],
  },
];

/* ─── Interactive dot grid canvas ─── */
const DOT_SPACING = 22;
const DOT_BASE_R  = 1.1;
const DOT_MAX_R   = 5.5;
const EFFECT_R    = 120;
const LERP_SPEED  = 0.11;

const DotGrid: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let cols = 0, rows = 0;
    let radii: Float32Array | null = null;
    let raf = 0;
    const mouse = { x: -9999, y: -9999 };

    const resize = () => {
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      canvas.width  = w;
      canvas.height = h;
      cols  = Math.ceil(w / DOT_SPACING) + 1;
      rows  = Math.ceil(h / DOT_SPACING) + 1;
      radii = new Float32Array(cols * rows).fill(DOT_BASE_R);
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const draw = () => {
      if (!radii) { raf = requestAnimationFrame(draw); return; }
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const mx = mouse.x, my = mouse.y;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const idx = r * cols + c;
          const x   = c * DOT_SPACING;
          const y   = r * DOT_SPACING;
          const dx  = x - mx, dy = y - my;
          const dist = Math.sqrt(dx * dx + dy * dy);

          let target = DOT_BASE_R;
          if (dist < EFFECT_R) {
            const t = 1 - dist / EFFECT_R;
            target = DOT_BASE_R + (DOT_MAX_R - DOT_BASE_R) * t * t * t;
          }

          radii[idx] += (target - radii[idx]) * LERP_SPEED;

          ctx.beginPath();
          ctx.arc(x, y, radii[idx], 0, Math.PI * 2);
          ctx.fillStyle = "rgba(0,0,0,0.16)";
          ctx.fill();
        }
      }

      raf = requestAnimationFrame(draw);
    };

    draw();

    const onMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };
    const onLeave = () => { mouse.x = -9999; mouse.y = -9999; };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseleave", onLeave);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        maskImage:
          "linear-gradient(to bottom, transparent 0%, black 14%, black 86%, transparent 100%)",
        WebkitMaskImage:
          "linear-gradient(to bottom, transparent 0%, black 14%, black 86%, transparent 100%)",
      }}
    />
  );
};

/* ─── Custom cursor follower ─── */
const SkillsCursor: React.FC<{ sectionRef: React.RefObject<HTMLElement | null> }> = ({ sectionRef }) => {
  const dotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const dot = dotRef.current;
    if (!section || !dot) return;

    const xTo = gsap.quickTo(dot, "x", { duration: 0.35, ease: "power3.out" });
    const yTo = gsap.quickTo(dot, "y", { duration: 0.35, ease: "power3.out" });

    gsap.set(dot, { autoAlpha: 0, scale: 0 });

    const onMove = (e: MouseEvent) => {
      const rect = section.getBoundingClientRect();
      xTo(e.clientX - rect.left);
      yTo(e.clientY - rect.top);
    };

    const onEnter = () => gsap.to(dot, { autoAlpha: 1, scale: 1, duration: 0.3, ease: "back.out(2)" });
    const onLeave = () => gsap.to(dot, { autoAlpha: 0, scale: 0, duration: 0.2 });

    section.addEventListener("mousemove", onMove);
    section.addEventListener("mouseenter", onEnter);
    section.addEventListener("mouseleave", onLeave);

    return () => {
      section.removeEventListener("mousemove", onMove);
      section.removeEventListener("mouseenter", onEnter);
      section.removeEventListener("mouseleave", onLeave);
    };
  }, [sectionRef]);

  return (
    <div
      ref={dotRef}
      aria-hidden
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: 28,
        height: 28,
        borderRadius: "50%",
        background: "radial-gradient(circle, #ff660088 0%, #ff660022 70%, transparent 100%)",
        border: "1.5px solid #ff660066",
        transform: "translate(-50%, -50%)",
        pointerEvents: "none",
        zIndex: 50,
        backdropFilter: "blur(1px)",
      }}
    />
  );
};

/* ─── "always learning" phrase ─── */
const LearningPhrase: React.FC = () => (
  <p className="mt-8 flex items-center gap-2 text-xl font-medium select-none" style={{ cursor: "none" }}>
    <Sparkle size={16} className="shrink-0" style={{ color: "rgba(0,0,0,0.25)" }} />
    <span className="skills-learning-text">always learning, always growing.</span>
  </p>
);

/* ─── Main section ─── */
const AboutMeSkills: React.FC = () => {
  const sectionRef  = useRef<HTMLElement | null>(null);
  const labelRef    = useRef<HTMLDivElement | null>(null);
  const dividerRef  = useRef<HTMLDivElement | null>(null);
  const rowsRef     = useRef<HTMLDivElement | null>(null);
  const contentRef  = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    if (typeof window === "undefined") return;

    gsap.registerPlugin(ScrollTrigger);

    const reduce =
      window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;

    const ctx = gsap.context(() => {
      const section   = sectionRef.current!;
      const label     = labelRef.current!;
      const divider   = dividerRef.current!;
      const rows      = rowsRef.current!.querySelectorAll<HTMLElement>("[data-row]");
      const rowLabels = rowsRef.current!.querySelectorAll<HTMLElement>("[data-row-label]");
      const chips     = rowsRef.current!.querySelectorAll<HTMLElement>("[data-chip]");

      if (reduce) {
        gsap.set([label, divider, rows, rowLabels, chips], {
          autoAlpha: 1, x: 0, y: 0, skewX: 0, skewY: 0, scale: 1,
        });
        return;
      }

      gsap.set(label,     { autoAlpha: 0, x: -24, skewX: -4 });
      gsap.set(divider,   { scaleX: 0, transformOrigin: "left center" });
      gsap.set(rows,      { autoAlpha: 0, y: 30, skewY: 1 });
      gsap.set(rowLabels, { autoAlpha: 0, x: -20 });
      gsap.set(chips,     { autoAlpha: 0, scale: 0.7, y: 12 });

      gsap.timeline({
        defaults: { ease: "power3.out" },
        scrollTrigger: {
          trigger: section,
          start: "top 80%",
          once: true,
        },
      })
        .to(label,     { autoAlpha: 1, x: 0, skewX: 0, duration: 0.5 }, 0)
        .to(divider,   { scaleX: 1, duration: 0.6, ease: "power2.inOut" }, 0.3)
        .to(rows,      { autoAlpha: 1, y: 0, skewY: 0, duration: 0.5, stagger: 0.1 }, 0.4)
        .to(rowLabels, { autoAlpha: 1, x: 0, duration: 0.4, stagger: 0.1 }, 0.45)
        .to(chips,     { autoAlpha: 1, scale: 1, y: 0, duration: 0.4, stagger: 0.015, ease: "back.out(1.8)" }, 0.55);
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="skills"
      ref={sectionRef}
      className="relative overflow-hidden cursor-none"
    >
      <DotGrid />
      <SkillsCursor sectionRef={sectionRef} />

      <style>{`
        @keyframes skills-text-sweep {
          0%, 77%   { background-position: 100% 0; }
          91%       { background-position: 0% 0; }
          94%, 100% { background-position: 100% 0; }
        }
        .skills-learning-text {
          background: linear-gradient(
            90deg,
            rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.55) 38%,
            #ff6600 48%, #ffaa00 52%,
            rgba(0,0,0,0.55) 62%, rgba(0,0,0,0.55) 100%
          );
          background-size: 400% 100%;
          background-repeat: no-repeat;
          background-position: 100% 0;
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: skills-text-sweep 10s ease-in-out infinite;
        }
        .skill-chip {
          background-color: #e0e0e0;
          color: #555555;
          transition: background-color 0.3s ease, color 0.3s ease;
        }
        .chip-row:hover .skill-chip.chip-dev    { background-color: #d0dbe6; color: #2e4a62; }
        .chip-row:hover .skill-chip.chip-design { background-color: #e8d9cf; color: #5e3018; }
        .chip-row:hover .skill-chip.chip-soft   { background-color: #d1d5db; color: #1f2937; }
        @media (max-width: 767px) {
          .skill-chip.chip-dev    { background-color: #d0dbe6 !important; color: #2e4a62 !important; }
          .skill-chip.chip-design { background-color: #e8d9cf !important; color: #5e3018 !important; }
          .skill-chip.chip-soft   { background-color: #d1d5db !important; color: #1f2937 !important; }
        }
      `}</style>

      <div
        ref={contentRef}
        className="relative z-10 flex flex-col py-20 md:py-28 px-6 md:px-8 max-w-[1280px] mx-auto w-full"
      >
        <div className="mb-10 flex flex-col gap-3">
          <SectionLabel ref={labelRef}>Skills</SectionLabel>
          <SectionHeading className="text-3xl md:text-6xl font-semibold text-[var(--black)] leading-tighter tracking-tight">
            What I bring to the table.
          </SectionHeading>
        </div>

        <div ref={rowsRef} className="border-t-2 border-black/20">
          <div ref={dividerRef} className="hidden" />
          {CATEGORIES.map(({ key, label, skills }) => (
            <div
              key={key}
              data-row
              className="chip-row flex flex-col md:flex-row md:items-start gap-4 md:gap-8 py-6 border-b-2 border-black/20 last:border-b-0"
            >
              <div className="md:min-w-[200px] pt-0.5">
                <span data-row-label className="text-lg md:text-xl font-semibold text-[var(--black)]">
                  {label}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {skills.map((name) => (
                  <span
                    key={`${key}-${name}`}
                    data-chip
                    className={`skill-chip chip-${key} select-none rounded-full px-3 py-1 text-sm md:px-4 md:py-1.5 md:text-base font-medium`}
                  >
                    {name}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        <LearningPhrase />
      </div>
    </section>
  );
};

export default AboutMeSkills;
