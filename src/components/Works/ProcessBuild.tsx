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

/**
 * The process, built in place: the screen stays, and with the scroll the
 * product's own page is put together on it one step at a time (guides and
 * notes, a wireframe, the real design, the code, the checks, launch) while the
 * step's text changes beside it. Without motion (or JS) the steps are a plain
 * list, `fallback`, which also stays in the page for screen readers.
 */
export default function ProcessBuild({ steps, fallback }: { steps: Step[]; fallback: React.ReactNode }) {
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
      const counter = q("[data-counter]")[0] as HTMLElement | undefined;
      const percent = q("[data-percent]")[0] as HTMLElement | undefined;
      const bar = q("[data-bar]")[0] as HTMLElement | undefined;
      const texts = q("[data-text]") as HTMLElement[];

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
            if (counter) counter.textContent = `${two(step + 1)} / ${two(n)}`;
            if (percent) percent.textContent = `${String(Math.round(self.progress * 100)).padStart(3, "0")}%`;
            if (bar) bar.style.transform = `scaleX(${self.progress})`;
          },
        },
      });

      // The step's text swaps in place: out up, in from below.
      gsap.set(texts.slice(1), { autoAlpha: 0, y: 28 });
      texts.forEach((text, i) => {
        if (i === 0) return;
        tl.to(texts[i - 1], { autoAlpha: 0, y: -28, duration: 0.12, ease: "power2.in" }, i - 0.06)
          .to(text, { autoAlpha: 1, y: 0, duration: 0.14, ease: "power2.out" }, i + 0.04);
      });

      // Everything the screen will hold starts unbuilt.
      gsap.set(q("[data-guide-x]"), { scaleX: 0 });
      gsap.set(q("[data-guide-y]"), { scaleY: 0 });
      gsap.set(q("[data-note]"), { autoAlpha: 0, y: 14, scale: 0.9 });
      gsap.set(q("[data-wire]"), { autoAlpha: 0 });
      gsap.set(q("[data-wire-part]"), { scaleX: 0 });
      gsap.set(q("[data-wire-label]"), { autoAlpha: 0 });
      gsap.set(q("[data-shot]"), { clipPath: "inset(0% 0% 100% 0%)" });
      gsap.set(q("[data-phone]"), { autoAlpha: 0, yPercent: 30 });
      gsap.set(q("[data-approve]"), { autoAlpha: 0, scale: 0.8 });
      gsap.set(q("[data-code]"), { xPercent: -110, autoAlpha: 0 });
      gsap.set(q("[data-code-line]"), { clipPath: "inset(0% 100% 0% 0%)" });
      gsap.set(q("[data-code-status]"), { autoAlpha: 0 });
      gsap.set(q("[data-checks]"), { autoAlpha: 0, y: 20 });
      gsap.set(q("[data-check]"), { autoAlpha: 0.35 });
      gsap.set(q("[data-check-done]"), { autoAlpha: 0 });
      gsap.set(q("[data-url]"), { clipPath: "inset(0% 100% 0% 0%)" });
      gsap.set(q("[data-live]"), { autoAlpha: 0, scale: 0.6 });
      gsap.set(q("[data-result]"), { autoAlpha: 0, yPercent: 40 });

      // Each step builds inside its own stretch of scroll, [i, i + 1).
      const span = (from: number, to: number) => ({ duration: to - from });

      const notesAt = at("notes");
      if (notesAt >= 0) {
        tl.to(q("[data-guide-x]"), { scaleX: 1, stagger: 0.05, ...span(0, 0.3) }, notesAt + 0.1)
          .to(q("[data-guide-y]"), { scaleY: 1, stagger: 0.05, ...span(0, 0.3) }, notesAt + 0.2)
          .to(q("[data-note]"), { autoAlpha: 1, y: 0, scale: 1, stagger: 0.05, ease: "back.out(2)", ...span(0, 0.12) }, notesAt + 0.35);
      }

      const wireAt = at("sitemap");
      if (wireAt >= 0) {
        // The notes clear off as the layout takes their place.
        tl.to(q("[data-note]"), { autoAlpha: 0, y: -10, stagger: 0.02, ...span(0, 0.12) }, wireAt + 0.02)
          .set(q("[data-wire]"), { autoAlpha: 1 }, wireAt + 0.1)
          .to(q("[data-wire-part]"), { scaleX: 1, stagger: 0.04, ease: "power2.out", ...span(0, 0.18) }, wireAt + 0.12)
          .to(q("[data-wire-label]"), { autoAlpha: 1, stagger: 0.04, ...span(0, 0.1) }, wireAt + 0.3);
      }

      const protoAt = at("prototype");
      if (protoAt >= 0) {
        tl.to(q("[data-shot]"), { clipPath: "inset(0% 0% 0% 0%)", ease: "power1.inOut", ...span(0, 0.45) }, protoAt + 0.1)
          .to(q("[data-guide-x], [data-guide-y]"), { autoAlpha: 0, ...span(0, 0.2) }, protoAt + 0.3)
          .to(q("[data-phone]"), { autoAlpha: 1, yPercent: 0, ease: "power3.out", ...span(0, 0.3) }, protoAt + 0.45)
          .to(q("[data-approve]"), { autoAlpha: 1, scale: 1, ease: "back.out(2)", ...span(0, 0.12) }, protoAt + 0.72);
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
          .to(q("[data-check]"), { autoAlpha: 1, stagger: 0.07, ...span(0, 0.04) }, checksAt + 0.28)
          .to(q("[data-check-done]"), { autoAlpha: 1, ...span(0, 0.08) }, checksAt + 0.85);
      }

      const demoAt = at("demo");
      if (demoAt >= 0) {
        tl.to(q("[data-checks]"), { autoAlpha: 0, y: -12, ...span(0, 0.12) }, demoAt + 0.02)
          .to(q("[data-url]"), { clipPath: "inset(0% 0% 0% 0%)", ease: "steps(18)", ...span(0, 0.3) }, demoAt + 0.12)
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
        {/* Which step, and how much of the whole has been built. */}
        <div className={`${KICKER} flex items-center gap-4 text-[var(--muted)]`}>
          <span data-counter className="text-[var(--black)] tabular-nums">
            01 / {two(steps.length)}
          </span>
          <span className="relative h-px flex-1 overflow-hidden bg-[var(--color-line-2)]">
            <span data-bar className="absolute inset-0 origin-left scale-x-0 bg-[var(--orange)]" />
          </span>
          <span data-percent className="tabular-nums">000%</span>
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-6 lg:grid lg:grid-cols-12 lg:items-center lg:gap-10">
          {/* The screen being built. */}
          <div className="relative order-1 mx-auto aspect-[4/3] max-h-full w-full min-h-0 max-w-full lg:order-2 lg:col-span-7 lg:aspect-[16/10]">
            <div className="absolute inset-0 flex flex-col overflow-hidden rounded-card border border-black/[0.08] bg-white shadow-[0_24px_60px_-30px_rgb(0_0_0/0.35)]">
              {/* Browser bar: the address types itself in at launch. */}
              <div className="flex shrink-0 items-center gap-3 border-b border-black/[0.06] px-3 py-2 md:px-4 md:py-2.5">
                <span className="flex gap-1.5" aria-hidden>
                  <span className="h-2.5 w-2.5 rounded-full bg-black/10" />
                  <span className="h-2.5 w-2.5 rounded-full bg-black/10" />
                  <span className="h-2.5 w-2.5 rounded-full bg-black/10" />
                </span>
                <span className="flex h-6 min-w-0 flex-1 items-center rounded-full bg-black/[0.04] px-3 font-mono text-[11px] text-[var(--black)]">
                  <span data-url className="truncate">{demo?.url ?? ""}</span>
                </span>
                {demo && (
                  <span data-live className="flex items-center gap-1.5 font-mono text-[11px] font-medium text-emerald-600">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    Live
                  </span>
                )}
              </div>

              <div className="relative min-h-0 flex-1">
                {/* Guides: where things will go. */}
                {[22, 64].map((top) => (
                  <span key={top} data-guide-x className="absolute inset-x-0 h-px origin-left bg-[var(--orange)]/40" style={{ top: `${top}%` }} />
                ))}
                {[8, 50, 92].map((left) => (
                  <span key={left} data-guide-y className="absolute inset-y-0 w-px origin-top bg-[var(--orange)]/40" style={{ left: `${left}%` }} />
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
                      <span className="flex flex-1 justify-end gap-[3%]">
                        {sitemap.pages.map((page) => (
                          <span key={page.label} data-wire-label className="font-mono text-[9px] text-black/45 md:text-[11px]">
                            {page.label}
                          </span>
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

                {/* Design: the real page, revealed over its wireframe. */}
                {proto && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img data-shot src={proto.desktop.image} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover object-top" />
                )}
              </div>
            </div>

            {/* Outside the screen's clip, so they can overlap its edges. */}
            {proto && (
              <>
                <div data-phone className="absolute -bottom-3 right-[4%] w-[18%] overflow-hidden rounded-[14%/7%] border-[3px] border-[var(--color-ink-1)] bg-white shadow-xl md:w-[15%]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={proto.phone.image} alt="" loading="lazy" className="aspect-[9/19] w-full object-cover object-top" />
                </div>
                <span
                  data-approve
                  className="absolute bottom-[22%] right-[21%] flex items-center gap-2 rounded-full bg-[var(--color-ink-1)] px-3 py-1.5 text-[11px] font-medium text-white shadow-lg md:right-[20%] md:text-xs"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  {proto.reviewer} · {proto.comment}
                </span>
              </>
            )}

            {code && (
              <div
                data-code
                className="absolute bottom-[6%] left-[-2%] w-[64%] overflow-hidden rounded-xl bg-[#0f1117] font-mono text-[9px] leading-relaxed text-white/85 shadow-2xl md:text-[11px]"
              >
                <div className="border-b border-white/10 px-3 py-1.5 text-white/50">{code.file}</div>
                <div className="flex flex-col px-3 py-2">
                  {code.lines.map((line, i) => (
                    <span key={i} data-code-line className="block whitespace-pre">
                      {line || " "}
                    </span>
                  ))}
                </div>
                <div data-code-status className="border-t border-white/10 px-3 py-1.5 text-emerald-400">
                  ✓ {code.status}
                </div>
              </div>
            )}

            {checks && (
              <div
                data-checks
                className="absolute right-[3%] top-[14%] w-[44%] rounded-xl bg-white/95 p-3 text-[10px] shadow-xl ring-1 ring-black/5 md:w-[34%] md:p-4 md:text-xs"
              >
                <p className={`${KICKER} mb-2 text-[var(--muted)]`}>{checks.label}</p>
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
                className="absolute bottom-[5%] left-[4%] w-[66%] rounded-xl bg-white p-3 shadow-2xl ring-1 ring-black/5 md:w-[52%] md:p-4"
              >
                <p className="truncate text-[10px] text-[var(--muted)] md:text-xs">
                  <span className="font-mono">{demo.query}</span>
                </p>
                <p className="mt-1.5 truncate text-[10px] text-emerald-700 md:text-xs">{demo.url}</p>
                <p className="truncate text-xs font-medium text-[#1a0dab] md:text-base">{demo.title}</p>
                <p className="mt-0.5 line-clamp-2 text-[10px] text-[var(--muted)] md:text-xs">{demo.description}</p>
              </div>
            )}
          </div>

          {/* The step's text, all in one place; the scroll swaps them. */}
          <div className="order-2 grid shrink-0 lg:order-1 lg:col-span-5">
            {steps.map((step, i) => (
              <div key={step.phase} data-text className="col-start-1 row-start-1 flex flex-col gap-2 md:gap-3">
                <span className={`${KICKER} text-[var(--color-accent-ink)]`}>
                  {two(i + 1)} · {step.phase}
                </span>
                <h3 className="text-balance text-2xl font-semibold leading-tight tracking-title text-[var(--black)] md:text-4xl">
                  {step.title}
                </h3>
                <p className="text-pretty text-sm leading-relaxed text-[var(--muted)] md:text-base">{step.text}</p>
                <p className="mt-1 flex flex-col gap-0.5 rounded-control bg-white/70 px-4 py-3">
                  <span className="text-xs text-[var(--muted)]">The client gets</span>
                  <span className="text-sm font-semibold text-[var(--black)]">{step.client}</span>
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
