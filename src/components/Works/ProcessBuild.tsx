"use client";

import { useLayoutEffect, useRef } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { largeViewportHeight, prefersReducedMotion, setupGsap } from "@/lib/motion";
import type { CaseStudy, ProcessVisual } from "@/data/case-studies";

type Step = CaseStudy["process"]["steps"][number];

const KICKER = "font-mono font-medium text-xs uppercase tracking-[0.08em]";
// Scroll per step, in large-viewport heights.
const STEP_SCROLL = 0.8;
// Where the notes sit on the empty canvas, as % of its box.
const NOTE_SPOTS = [
  [6, 10], [38, 6], [68, 12], [12, 44], [44, 40], [70, 46], [20, 74], [54, 72],
];

const two = (n: number) => String(n).padStart(2, "0");
const kindOf = (step: Step): ProcessVisual["kind"] | "demo" | null => step.visual?.kind ?? (step.demo ? "demo" : null);
const visualOf = <K extends ProcessVisual["kind"]>(steps: Step[], kind: K) =>
  steps.find((s) => s.visual?.kind === kind)?.visual as Extract<ProcessVisual, { kind: K }> | undefined;

/** Just enough syntax color for a few lines of TSX: strings, keywords and tags. */
const TOKENS = /(`[^`]*`|"[^"]*"|'[^']*'|\b(?:export|default|function|return|const|import|from)\b|<\/?[A-Z][\w.]*)/g;
function highlight(line: string): React.ReactNode {
  if (!line) return " ";
  return line.split(TOKENS).map((part, i) => {
    if (!part) return null;
    const color = /^[`"']/.test(part)
      ? "text-[#a5d6ff]"
      : /^<\/?[A-Z]/.test(part)
        ? "text-[#7ee787]"
        : /^(export|default|function|return|const|import|from)$/.test(part)
          ? "text-[#ff7b72]"
          : "";
    return color ? <span key={i} className={color}>{part}</span> : part;
  });
}

/**
 * The process, built in place: the screen stays, and with the scroll the
 * product's own page is put together on it one step at a time (guides and
 * notes, a wireframe, the real design, the code, the checks, launch) while the
 * step's text changes beside it. Without motion (or JS) the steps are a plain
 * list, `fallback`, which also stays in the page for screen readers.
 */
export default function ProcessBuild({
  steps,
  fallback,
}: {
  steps: Step[];
  fallback: React.ReactNode;
}) {
  const rootRef = useRef<HTMLDivElement | null>(null);

  const notes = visualOf(steps, "notes")?.groups.flatMap((g) => g.notes).slice(0, NOTE_SPOTS.length) ?? [];
  const sitemap = visualOf(steps, "sitemap");
  const proto = visualOf(steps, "prototype");
  const code = visualOf(steps, "code");
  const checks = visualOf(steps, "checks");
  const demo = steps.find((s) => s.demo)?.demo;
  const at = (kind: ReturnType<typeof kindOf>) => steps.findIndex((s) => kindOf(s) === kind);

  useLayoutEffect(() => {
    const root = rootRef.current;
    const stage = root?.querySelector<HTMLElement>("[data-stage]");
    if (!root || !stage || prefersReducedMotion()) return;
    const gsap = setupGsap();
    root.dataset.b = "on";

    const ctx = gsap.context(() => {
      const q = gsap.utils.selector(root);
      const n = steps.length;
      const phases = q("[data-phase]") as HTMLElement[];
      const rail = q("[data-rail]")[0] as HTMLElement | undefined;

      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: stage,
          start: "top top",
          end: () => `+=${largeViewportHeight() * STEP_SCROLL * n}`,
          pin: true,
          scrub: true,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const step = Math.min(n - 1, Math.floor(self.progress * n));
            phases.forEach((el, i) => {
              el.dataset.on = String(i === step);
              // Steps already built stay marked, in a softer orange.
              el.dataset.done = String(i < step);
            });
            if (rail) rail.style.transform = `scaleY(${self.progress})`;
          },
        },
      });


      // Everything the screen will hold starts unbuilt.
      gsap.set(q("[data-guide-x]"), { scaleX: 0 });
      gsap.set(q("[data-guide-y]"), { scaleY: 0 });
      gsap.set(q("[data-dim]"), { autoAlpha: 0 });
      gsap.set(q("[data-note]"), { autoAlpha: 0, y: 14, scale: 0.9 });
      gsap.set(q("[data-wire]"), { autoAlpha: 0 });
      gsap.set(q("[data-wire-part]"), { scaleX: 0 });
      gsap.set(q("[data-wire-label]"), { autoAlpha: 0 });
      gsap.set(q("[data-shot]"), { clipPath: "inset(0% 0% 100% 0%)" });
      gsap.set(q("[data-approve]"), { autoAlpha: 0, scale: 0.8 });
      gsap.set(q("[data-scan]"), { autoAlpha: 0, top: "0%" });
      gsap.set(q("[data-load]"), { scaleX: 0 });
      gsap.set(q("[data-code]"), { xPercent: -110, autoAlpha: 0 });
      gsap.set(q("[data-code-line]"), { clipPath: "inset(0% 100% 0% 0%)" });
      gsap.set(q("[data-code-status]"), { autoAlpha: 0 });
      gsap.set(q("[data-checks]"), { autoAlpha: 0, y: 24 });
      gsap.set(q("[data-check]"), { autoAlpha: 0.35 });
      gsap.set(q("[data-check-done]"), { autoAlpha: 0 });
      gsap.set(q("[data-url]"), { clipPath: "inset(0% 100% 0% 0%)" });
      gsap.set(q("[data-url-dev]"), { autoAlpha: 1 });
      gsap.set(q("[data-live]"), { autoAlpha: 0, scale: 0.6 });
      gsap.set(q("[data-result]"), { autoAlpha: 0, yPercent: 40 });

      // Each step builds inside its own stretch of scroll, [i, i + 1).
      const span = (from: number, to: number) => ({ duration: to - from });

      const notesAt = at("notes");
      if (notesAt >= 0) {
        tl.to(q("[data-guide-y]"), { scaleY: 1, stagger: 0.02, ease: "power2.out", ...span(0, 0.2) }, notesAt + 0.08)
          .to(q("[data-dim]"), { autoAlpha: 1, ...span(0, 0.12) }, notesAt + 0.1)
          .to(q("[data-guide-x]"), { scaleX: 1, stagger: 0.05, ...span(0, 0.2) }, notesAt + 0.25)
          .to(q("[data-note]"), { autoAlpha: 1, y: 0, scale: 1, stagger: 0.05, ease: "back.out(2)", ...span(0, 0.12) }, notesAt + 0.35);
      }

      const wireAt = at("sitemap");
      if (wireAt >= 0) {
        // The notes clear off as the layout takes their place.
        // The notes fly up into the menu: the brief becomes the structure.
        tl.to(q("[data-note]"), { autoAlpha: 0, yPercent: -320, scale: 0.35, stagger: 0.025, ease: "power2.in", ...span(0, 0.16) }, wireAt + 0.02)
          .set(q("[data-wire]"), { autoAlpha: 1 }, wireAt + 0.1)
          .to(q("[data-wire-part]"), { scaleX: 1, stagger: 0.04, ease: "power2.out", ...span(0, 0.18) }, wireAt + 0.12)
          .to(q("[data-wire-label]"), { autoAlpha: 1, stagger: 0.04, ...span(0, 0.1) }, wireAt + 0.3);
      }

      const protoAt = at("prototype");
      if (protoAt >= 0) {
        tl.to(q("[data-shot]"), { clipPath: "inset(0% 0% 0% 0%)", ease: "power1.inOut", ...span(0, 0.35) }, protoAt + 0.32)
          .fromTo(q("[data-shot]"), { scale: 1.08 }, { scale: 1, ease: "power2.out", ...span(0, 0.45) }, protoAt + 0.32)
          .to(q("[data-guide-x], [data-guide-y], [data-dim]"), { autoAlpha: 0, ...span(0, 0.2) }, protoAt + 0.3)
          .to(q("[data-approve]"), { autoAlpha: 1, scale: 1, ease: "back.out(2)", ...span(0, 0.1) }, protoAt + 0.72);
      }

      const codeAt = at("code");
      if (codeAt >= 0) {
        tl.to(q("[data-approve]"), { autoAlpha: 0, ...span(0, 0.08) }, codeAt + 0.02)
          .to(q("[data-code]"), { xPercent: 0, autoAlpha: 1, ease: "power3.out", ...span(0, 0.22) }, codeAt + 0.08)
          .to(q("[data-code-line]"), { clipPath: "inset(0% 0% 0% 0%)", stagger: 0.06, ...span(0, 0.06) }, codeAt + 0.3)
          .to(q("[data-code-status]"), { autoAlpha: 1, ...span(0, 0.08) }, codeAt + 0.85);
      }

      const checksAt = at("checks");
      if (checksAt >= 0) {
        tl.to(q("[data-code]"), { xPercent: -110, autoAlpha: 0, ease: "power2.in", ...span(0, 0.18) }, checksAt + 0.02)
          .to(q("[data-checks]"), { autoAlpha: 1, y: 0, ease: "power3.out", ...span(0, 0.15) }, checksAt + 0.12)
          .set(q("[data-scan]"), { autoAlpha: 1 }, checksAt + 0.2)
          .to(q("[data-scan]"), { top: "100%", ease: "none", ...span(0, 0.6) }, checksAt + 0.2)
          .set(q("[data-scan]"), { autoAlpha: 0 }, checksAt + 0.8)
          .to(q("[data-check]"), { autoAlpha: 1, stagger: 0.07, ...span(0, 0.04) }, checksAt + 0.28)
          .to(q("[data-check-done]"), { autoAlpha: 1, ...span(0, 0.08) }, checksAt + 0.85);
      }

      const demoAt = at("demo");
      if (demoAt >= 0) {
        tl.to(q("[data-checks]"), { autoAlpha: 0, y: 16, ...span(0, 0.12) }, demoAt + 0.02)
          .to(q("[data-url-dev]"), { autoAlpha: 0, ...span(0, 0.06) }, demoAt + 0.1)
          .to(q("[data-url]"), { clipPath: "inset(0% 0% 0% 0%)", ease: "steps(18)", ...span(0, 0.3) }, demoAt + 0.12)
          .to(q("[data-load]"), { scaleX: 1, ease: "power1.inOut", ...span(0, 0.12) }, demoAt + 0.38)
          .to(q("[data-load]"), { autoAlpha: 0, ...span(0, 0.05) }, demoAt + 0.5)
          .to(q("[data-live]"), { autoAlpha: 1, scale: 1, ease: "back.out(2)", ...span(0, 0.1) }, demoAt + 0.45)
          .to(q("[data-result]"), { autoAlpha: 1, yPercent: 0, ease: "power3.out", ...span(0, 0.25) }, demoAt + 0.55);
      }

      // The last step holds a moment before the scroll lets go.
      tl.to({}, { duration: 0.001 }, n);
    }, root);

    return () => {
      ctx.revert();
      delete root.dataset.b;
      ScrollTrigger.refresh();
    };
    // The steps are static data for the page's life.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div ref={rootRef} className="group/b">
      <div className="group-data-[b=on]/b:sr-only">{fallback}</div>

      <div
        data-stage
        aria-hidden
        className="hidden h-[100svh] flex-col gap-5 pb-8 pt-24 group-data-[b=on]/b:flex md:gap-8 md:pt-28"
      >

        <div className="flex min-h-0 flex-1 flex-col gap-6 lg:grid lg:grid-cols-12 lg:items-center lg:gap-10">
          {/* The screen being built. */}
          {/* A stage in the project's own colors (CaseTheme.stage); the screen rises out of its bottom edge. */}
          <div
            data-frame
            className="relative order-1 mx-auto aspect-[4/3] max-h-full w-full min-h-0 max-w-full overflow-hidden rounded-card bg-[linear-gradient(135deg,var(--cs-stage-from),var(--cs-stage-to))] lg:order-2 lg:col-span-7 lg:aspect-[16/10]"
          >
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-60 mix-blend-overlay"
              style={{ backgroundImage: "var(--grain-image)", backgroundSize: "var(--grain-size) var(--grain-size)" }}
            />
            {/* The screen's size, measured above it like a spec. */}
            <span
              data-dim
              aria-hidden
              className="absolute inset-x-[6%] top-[2.5%] flex items-center gap-2 text-[10px] font-medium text-[var(--color-accent-ink)] md:text-[11px]"
            >
              <span className="h-2 w-px bg-current" />
              <span className="h-px flex-1 bg-current opacity-50" />
              1440 × 900
              <span className="h-px flex-1 bg-current opacity-50" />
              <span className="h-2 w-px bg-current" />
            </span>
            <div className="absolute inset-x-[6%] bottom-0 top-[8%] flex flex-col overflow-hidden rounded-t-xl bg-white shadow-[0_30px_80px_-24px_rgb(0_0_0/0.35)] ring-1 ring-black/[0.06]">
              {/* Browser bar: the address types itself in at launch. */}
              <div className="flex shrink-0 items-center gap-3 border-b border-black/[0.06] px-3 py-2 md:px-4 md:py-2.5">
                <span className="flex gap-1.5" aria-hidden>
                  <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]/80" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]/80" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]/80" />
                </span>
                {/* While it's being built it runs locally; at launch the real address types over it. */}
                <span className="relative mx-auto flex h-6 w-full max-w-[60%] min-w-0 items-center justify-center gap-1.5 overflow-hidden rounded-md bg-black/[0.04] px-3 text-[10px] text-[var(--black)] md:text-[11px]">
                  <svg aria-hidden viewBox="0 0 16 16" className="h-2.5 w-2.5 shrink-0 fill-current opacity-40">
                    <path d="M4 7V5a4 4 0 1 1 8 0v2h1v8H3V7h1Zm2 0h4V5a2 2 0 1 0-4 0v2Z" />
                  </svg>
                  <span className="grid min-w-0">
                    <span data-url-dev className="col-start-1 row-start-1 truncate text-black/45">localhost:3000</span>
                    <span data-url className="col-start-1 row-start-1 truncate">{demo?.url ?? ""}</span>
                  </span>
                  <span data-load className="absolute inset-x-0 bottom-0 h-0.5 origin-left bg-[var(--orange)]" />
                </span>
                {demo && (
                  <span data-live className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-600">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inset-0 animate-ping rounded-full bg-emerald-400" />
                      <span className="relative h-2 w-2 rounded-full bg-emerald-500" />
                    </span>
                    Live
                  </span>
                )}
              </div>

              <div className="relative min-h-0 flex-1">
                {/* The grid: twelve columns and two guides, where everything will line up. */}
                <div className="absolute inset-y-0 inset-x-[5%] grid grid-cols-12 gap-[1.6%]" aria-hidden>
                  {Array.from({ length: 12 }, (_, i) => (
                    <span key={i} data-guide-y className="origin-top bg-[var(--orange)]/[0.08]" />
                  ))}
                </div>
                {[22, 64].map((top) => (
                  <span key={top} data-guide-x className="absolute inset-x-0 h-px origin-left bg-[var(--orange)]/40" style={{ top: `${top}%` }} />
                ))}

                {/* Discovery: what the brief is made of. */}
                {notes.map((note, i) => (
                  <span
                    key={note}
                    data-note
                    className="absolute max-w-[40%] rounded-md bg-[#fff1c2] px-2.5 py-1.5 text-[10px] font-medium leading-tight text-[#5c4a12] shadow-sm md:text-xs"
                    style={{ left: `${NOTE_SPOTS[i][0]}%`, top: `${NOTE_SPOTS[i][1]}%`, rotate: `${(i % 3) - 1}deg` }}
                  >
                    {note}
                  </span>
                ))}

                {/* Ideation: the wireframe, with the sitemap's pages in the menu. */}
                {sitemap && (
                  <div data-wire className="absolute inset-0 flex flex-col gap-[6%] p-[5%]">
                    <div className="flex items-center gap-[3%]">
                      <span data-wire-part className="h-3 w-[12%] origin-left rounded-sm bg-black/15" />
                      <span className="flex flex-1 items-center justify-end gap-[3%] text-[9px] md:text-[11px]">
                        {/* Menu items as bars, one per page of the sitemap, as long as its name. */}
                        {sitemap.pages.map((page) => (
                          <span
                            key={page.label}
                            data-wire-label
                            className="h-2 rounded-sm bg-black/[0.12]"
                            style={{ width: `${Math.max(4, page.label.length) * 0.45}em` }}
                          />
                        ))}
                      </span>
                    </div>
                    <div className="grid flex-1 grid-cols-2 gap-[5%]">
                      <div className="flex flex-col justify-center gap-[8%]">
                        <span data-wire-part className="h-[9%] w-[90%] origin-left rounded-sm bg-black/15" />
                        <span data-wire-part className="h-[9%] w-[70%] origin-left rounded-sm bg-black/15" />
                        <span data-wire-part className="h-[4%] w-[80%] origin-left rounded-sm bg-black/[0.08]" />
                        <span data-wire-part className="h-[11%] w-[34%] origin-left rounded-full border-2 border-dashed border-black/25" />
                      </div>
                      <span data-wire-part className="origin-left rounded-md border-2 border-dashed border-black/20" />
                    </div>
                  </div>
                )}

                {/* Design: the real page, revealed over its wireframe. Not lazy: it and the
                    phone start hidden, and a lazy image only loads once it shows. */}
                {proto && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img data-shot src={proto.desktop.image} alt="" decoding="async" className="absolute inset-0 h-full w-full object-cover object-top" />
                )}

                {/* Testing: a scan passes down the page as the checks tick. */}
                <span
                  data-scan
                  className="pointer-events-none absolute inset-x-0 h-16 -translate-y-1/2 bg-[linear-gradient(to_bottom,transparent,rgb(16_185_129/0.18),transparent)] after:absolute after:inset-x-0 after:top-1/2 after:h-px after:bg-emerald-500/70"
                />
              </div>
            </div>

            {/* Outside the screen's clip, so they can overlap its edges. The captures already
                show the phone, so no phone of its own here. */}
            {proto && (
              <>
                <span
                  data-approve
                  className="absolute bottom-[6%] right-[4%] flex items-center gap-2 rounded-full bg-[var(--color-ink-1)] px-3 py-1.5 text-[11px] font-medium text-white shadow-lg md:text-xs"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  {proto.reviewer} · {proto.comment}
                </span>
              </>
            )}

            {code && (
              <div
                data-code
                className="absolute bottom-[7%] left-[4%] w-[62%] overflow-hidden rounded-xl bg-[#0f1117] font-mono text-[9px] leading-relaxed text-[#c9d1d9] shadow-[0_30px_60px_-20px_rgb(0_0_0/0.6)] ring-1 ring-white/10 md:text-[11px]"
              >
                <div className="flex items-center gap-3 border-b border-white/10 px-3 py-2">
                  <span className="flex gap-1" aria-hidden>
                    <span className="h-2 w-2 rounded-full bg-white/15" />
                    <span className="h-2 w-2 rounded-full bg-white/15" />
                    <span className="h-2 w-2 rounded-full bg-white/15" />
                  </span>
                  <span className="truncate rounded bg-white/[0.06] px-2 py-0.5 text-white/60">{code.file.split("/").pop()}</span>
                </div>
                <div className="flex flex-col px-3 py-2.5">
                  {code.lines.map((line, i) => (
                    <span key={i} data-code-line className="flex gap-3 whitespace-pre">
                      <span className="w-3 shrink-0 text-right text-white/20">{i + 1}</span>
                      <span>{highlight(line)}</span>
                    </span>
                  ))}
                  <span aria-hidden className="mt-0.5 h-3 w-1.5 animate-pulse bg-white/70" />
                </div>
                <div data-code-status className="border-t border-white/10 px-3 py-1.5 text-emerald-400">
                  ✓ {code.status}
                </div>
              </div>
            )}

            {checks && (
              <div
                data-checks
                className="absolute bottom-[6%] right-[3%] w-[46%] rounded-xl bg-white p-3 text-[10px] shadow-[0_24px_50px_-20px_rgb(0_0_0/0.35)] ring-1 ring-black/[0.06] md:w-[36%] md:p-4 md:text-xs"
              >
                <p className="mb-2 text-xs font-semibold text-[var(--black)] md:text-sm">{checks.label}</p>
                <ul className="grid grid-cols-2 gap-x-3 gap-y-1.5">
                  {checks.checks.map((check) => (
                    <li key={check} data-check className="flex items-center gap-1.5 text-[var(--black)]">
                      <span className="grid h-3.5 w-3.5 place-items-center rounded-full bg-emerald-500 text-[8px] text-white">✓</span>
                      {check}
                    </li>
                  ))}
                </ul>
                <p data-check-done className="mt-2.5 font-medium text-emerald-600">{checks.done}</p>
              </div>
            )}

            {demo && (
              <div
                data-result
                className="absolute bottom-[6%] left-[4%] w-[68%] rounded-xl bg-white p-3 shadow-[0_30px_60px_-20px_rgb(0_0_0/0.4)] ring-1 ring-black/[0.06] md:w-[54%] md:p-4"
              >
                <p className="truncate text-[10px] text-[var(--muted)] md:text-xs">
                  <span>{demo.query}</span>
                </p>
                <p className="mt-1.5 truncate text-[10px] text-emerald-700 md:text-xs">{demo.url}</p>
                <p className="truncate text-xs font-medium text-[#1a0dab] md:text-base">{demo.title}</p>
                <p className="mt-0.5 line-clamp-2 text-[10px] text-[var(--muted)] md:text-xs">{demo.description}</p>
              </div>
            )}
          </div>

          {/* Left: every step in place; the current one opens. */}
          <div className="order-2 flex min-h-0 shrink-0 flex-col gap-6 lg:order-1 lg:col-span-5 lg:gap-8">
            <ol className="relative flex flex-col pl-6">
              {/* The rail fills with the build; each step's dot sits on it. */}
              <span aria-hidden className="absolute bottom-3 left-0 top-3 w-px bg-[var(--color-line-2)]">
                <span data-rail className="absolute inset-0 origin-top scale-y-0 bg-[var(--orange)]" />
              </span>
              {steps.map((step, i) => (
                <li key={step.phase} data-phase data-on={i === 0} className="group/p relative py-2 md:py-2.5">
                  <span
                    aria-hidden
                    className="absolute -left-6 top-[0.85rem] h-2 w-2 -translate-x-1/2 rounded-full bg-[var(--color-line-2)] transition-colors duration-300 group-data-[done=true]/p:bg-[var(--orange)]/50 group-data-[on=true]/p:bg-[var(--orange)] md:top-[0.95rem]"
                  />
                  {/* Phase, then title, then (for the current step) the text. */}
                  <span className={`${KICKER} block text-[var(--color-ink-4)] transition-colors duration-300 group-data-[done=true]/p:text-[var(--color-accent-ink)] group-data-[on=true]/p:text-[var(--color-accent-ink)]`}>
                    {two(i + 1)} · {step.phase}
                  </span>
                  {/* Closed steps show only their phase; the current one opens its title and text (grid rows 0fr → 1fr). */}
                  <div className="grid grid-rows-[0fr] transition-[grid-template-rows] duration-500 ease-out group-data-[on=true]/p:grid-rows-[1fr]">
                    <div className="overflow-hidden">
                      {/* Sized here, not by text-4xl (a fluid 48–72px that carries no line height). */}
                      <h3 className="mt-1.5 text-balance text-xl font-semibold leading-tighter tracking-title text-[var(--black)] md:text-2xl lg:text-[clamp(22px,1.9vw,30px)]">
                        {step.title}
                      </h3>
                      <p className="text-pretty pb-2 pt-2 text-sm leading-relaxed text-[var(--muted)] md:text-base">{step.text}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
