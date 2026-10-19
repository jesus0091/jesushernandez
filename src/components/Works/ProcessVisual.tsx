"use client";

import { Fragment, useLayoutEffect, useRef } from "react";
import { prefersReducedMotion, setupGsap } from "@/lib/motion";
import type { ProcessVisual as Visual } from "@/data/case-studies";

const LABEL = "font-mono font-medium text-[10px] uppercase tracking-[0.08em] text-[var(--muted)]";
const BOX = "rounded-lg border border-black/10 bg-white px-3 py-1.5 text-xs font-semibold text-[var(--black)] shadow-sm";
const LINE = "bg-[var(--color-line-2)]";
const NOTE_TONES = ["bg-[#FFE9A8]", "bg-[#CFE4FF]", "bg-[#D6F5E3]"];

// A frame on a design canvas, and the name that sits above it.
const FRAME = "h-full w-full bg-white shadow-md ring-1 ring-black/10";
const FRAME_NAME = "whitespace-nowrap text-[10px] font-medium text-[#0B8CE9]";

type Vars = Record<string, string | number>;

/** How a [data-seq] part comes in, by the attribute's value. */
const STATES: Record<string, [Vars, Vars]> = {
  pop: [{ autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0 }],
  fade: [{ autoAlpha: 0 }, { autoAlpha: 1 }],
  scale: [{ autoAlpha: 0, scale: 0.4 }, { autoAlpha: 1, scale: 1 }],
  grow: [{ scaleX: 0 }, { scaleX: 1 }],
  rise: [{ scaleY: 0 }, { scaleY: 1 }],
  wipe: [{ clipPath: "inset(0% 100% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)" }],
};

/** Keywords, tags and strings of a line of code, colored for the dark editor. */
function Code({ line }: { line: string }) {
  const parts = line.split(/("[^"]*"|\b(?:export|default|function|return)\b|<\/?[A-Za-z][A-Za-z0-9]*|\/?>)/);
  return (
    <>
      {parts.map((part, i) => {
        const tone = /^"/.test(part)
          ? "text-[#7DD3C0]"
          : /^(export|default|function|return)$/.test(part)
            ? "text-[#FF9A62]"
            : /^<|>$/.test(part)
              ? "text-[#8AB4F8]"
              : "";
        return tone ? (
          <span key={i} className={tone}>
            {part}
          </span>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        );
      })}
    </>
  );
}

function Body({ visual }: { visual: Visual }) {
  switch (visual.kind) {
    // A workshop board: what was heard, as sticky notes.
    case "notes":
      return (
        <div className="absolute inset-0 flex gap-4 p-4 [background-image:radial-gradient(rgba(0,0,0,0.09)_1px,transparent_1px)] [background-size:16px_16px] md:p-5">
          {visual.groups.map((group, g) => (
            <div key={group.label} className="flex min-w-0 flex-1 flex-col gap-3">
              <span data-seq="pop" className={LABEL}>
                {group.label}
              </span>
              <div className="flex flex-wrap content-start gap-2">
                {group.notes.map((note, i) => (
                  <span
                    key={note}
                    data-seq="pop"
                    className={`rounded-md px-2.5 py-2 text-xs font-medium leading-tight text-[#1E293B] shadow-sm ${NOTE_TONES[(g + i) % NOTE_TONES.length]}`}
                    style={{ rotate: `${((i * 7 + g * 3) % 5) - 2}deg` }}
                  >
                    {note}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      );
    // The sitemap, drawn from the home page down.
    case "sitemap":
      return (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
          <span data-seq="pop" className={BOX}>
            {visual.root}
          </span>
          <span data-seq="rise" className={`h-4 w-px origin-top ${LINE}`} />
          <div className="flex w-full max-w-xl">
            {visual.pages.map((page, i) => (
              <div key={page.label} className={`relative flex min-w-0 flex-col items-center px-1.5 ${page.children ? "flex-[2]" : "flex-1"}`}>
                <span
                  data-seq="grow"
                  className={`absolute top-0 h-px origin-left ${LINE} ${
                    i === 0 ? "left-1/2 right-0" : i === visual.pages.length - 1 ? "left-0 right-1/2" : "inset-x-0"
                  }`}
                />
                <span data-seq="rise" className={`h-4 w-px origin-top ${LINE}`} />
                <span data-seq="pop" className={BOX}>
                  {page.label}
                </span>
                {page.children && (
                  <>
                    <span data-seq="rise" className={`h-3 w-px origin-top ${LINE}`} />
                    <div className="grid grid-cols-3 gap-1">
                      {page.children.map((child) => (
                        <span
                          key={child}
                          data-seq="pop"
                          className="rounded-md border border-black/10 bg-white/70 px-2 py-1 text-center text-[10px] font-medium text-[var(--muted)]"
                        >
                          {child}
                        </span>
                      ))}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      );
    // A design tool's canvas: two frames of the prototype wired together, with the client reviewing on it.
    case "prototype":
      return (
        <div className="absolute inset-0 flex items-stretch justify-center px-5 pb-5 pt-9 [background-image:radial-gradient(rgba(0,0,0,0.09)_1px,transparent_1px)] [background-size:16px_16px] md:px-8">
          <div data-seq="pop" className="relative min-w-0 max-w-md flex-1 self-center">
            <span className={`absolute -top-5 left-0 ${FRAME_NAME}`}>{visual.desktop.label}</span>
            {/* The frame takes the screen's own shape, so the whole page shows. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={visual.desktop.image} alt="" loading="lazy" decoding="async" className={`${FRAME} !h-auto`} />
            {/* Selected, as the frame being worked on. */}
            <span data-seq="fade" className="absolute -inset-px border-2 border-[#0B8CE9]">
              {["-left-1 -top-1", "-right-1 -top-1", "-bottom-1 -left-1", "-bottom-1 -right-1"].map((corner) => (
                <span key={corner} className={`absolute h-2 w-2 border border-[#0B8CE9] bg-white ${corner}`} />
              ))}
            </span>
            <span data-seq="pop" className="absolute bottom-[18%] left-[42%] flex items-start">
              <svg viewBox="0 0 16 16" className="h-4 w-4 shrink-0" fill="#0B8CE9" stroke="#fff" strokeWidth="1">
                <path d="M2 1l11 5.5-4.6 1.4L7 12.5z" />
              </svg>
              <span className="-ml-0.5 mt-3 rounded-md rounded-tl-none bg-[#0B8CE9] px-1.5 py-0.5 text-[10px] font-semibold text-white">
                {visual.reviewer}
              </span>
            </span>
          </div>
          {/* The link from one frame to the next, as a prototype draws it. */}
          <span className="flex w-10 shrink-0 items-center self-center md:w-16">
            <span data-seq="grow" className="relative h-0.5 w-full origin-left bg-[#0B8CE9]">
              <span className="absolute -left-1 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full border-2 border-[#0B8CE9] bg-white" />
              <span className="absolute -right-0.5 top-1/2 h-2 w-2 -translate-y-1/2 rotate-45 border-r-2 border-t-2 border-[#0B8CE9]" />
            </span>
          </span>
          <div data-seq="pop" className="relative aspect-[9/19] shrink-0">
            <span className={`absolute -top-5 left-0 ${FRAME_NAME}`}>{visual.phone.label}</span>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={visual.phone.image} alt="" loading="lazy" decoding="async" className={`${FRAME} object-cover object-top`} />
            <span
              data-seq="scale"
              className="absolute -right-3 top-3 flex origin-bottom-left items-center gap-1.5 rounded-full rounded-bl-none bg-white py-1 pl-1 pr-2.5 text-[11px] font-semibold text-[var(--black)] shadow-lg ring-1 ring-black/10"
            >
              <span className="grid h-4 w-4 place-items-center rounded-full bg-[#16A34A]">
                <svg viewBox="0 0 12 12" className="h-2.5 w-2.5" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2.5 6.5l2.5 2.5 4.5-5.5" />
                </svg>
              </span>
              {visual.comment}
            </span>
          </div>
        </div>
      );
    // An editor where the page is written out line by line, and then builds.
    case "code":
      return (
        <div className="absolute inset-0 flex flex-col bg-[#0F1115] text-[#C9D1D9]">
          <div className="flex h-9 shrink-0 items-center gap-3 border-b border-white/10 px-4">
            <span className="flex gap-1.5">
              {["#FF5F57", "#FEBC2E", "#28C840"].map((color) => (
                <span key={color} className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
              ))}
            </span>
            <span className="truncate font-mono text-[11px] text-white/50">{visual.file}</span>
          </div>
          <div className="flex min-h-0 flex-1 flex-col justify-center overflow-hidden px-4 font-mono text-[11px] leading-5 md:text-[13px] md:leading-6">
            {visual.lines.map((line, i) => (
              <span key={i} data-seq="wipe" className="flex gap-4 whitespace-pre">
                <span className="w-4 shrink-0 text-right text-white/25">{i + 1}</span>
                <span>
                  <Code line={line} />
                </span>
              </span>
            ))}
          </div>
          <span data-seq="pop" className="shrink-0 border-t border-white/10 px-4 py-2 font-mono text-[11px] text-[#4ADE80]">
            ✓ {visual.status}
          </span>
        </div>
      );
    // A run of checks, ticked off one after another.
    case "checks":
      return (
        <div className="absolute inset-0 flex flex-col justify-center gap-4 p-5 md:px-7">
          <div className="flex flex-col gap-2">
            <span className={LABEL}>{visual.label}</span>
            <span className="h-1 w-full overflow-hidden rounded-full bg-black/10">
              <span data-seq-all="" className="block h-full origin-left bg-[#16A34A]" />
            </span>
          </div>
          <ul className="grid grid-cols-2 gap-x-6 gap-y-2.5 sm:grid-cols-3">
            {visual.checks.map((check) => (
              <li key={check} className="flex min-w-0 items-center gap-2.5">
                <span className="relative h-5 w-5 shrink-0 rounded-full border border-black/15">
                  <span data-seq="scale" className="absolute -inset-px grid place-items-center rounded-full bg-[#16A34A]">
                    <svg viewBox="0 0 12 12" className="h-3 w-3" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M2.5 6.5l2.5 2.5 4.5-5.5" />
                    </svg>
                  </span>
                </span>
                <span className="truncate text-sm font-medium text-[var(--black)]">{check}</span>
              </li>
            ))}
          </ul>
          <span data-seq="pop" className="text-sm font-semibold text-[#16A34A]">
            {visual.done}
          </span>
        </div>
      );
  }
}

/**
 * What a process step looks like, built up by the scroll. On its own it plays
 * as it crosses the screen; with `hosted`, whoever holds it in place sends its
 * progress (0 to 1) as "demo-progress" events. Parts marked [data-seq] come in
 * one after another, in the order they are written. Fills its parent, so the
 * parent sets the size. Without motion it rests complete.
 */
export default function ProcessVisual({
  visual,
  hosted = false,
  className = "",
}: {
  visual: Visual;
  hosted?: boolean;
  className?: string;
}) {
  const rootRef = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || prefersReducedMotion()) return;
    const gsap = setupGsap();

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        paused: hosted,
        defaults: { ease: "power2.out", duration: 1 },
        scrollTrigger: hosted ? undefined : { trigger: root, start: "top 85%", end: "top 30%", scrub: true },
      });
      root.querySelectorAll<HTMLElement>("[data-seq]").forEach((el, i) => {
        const [from, to] = STATES[el.dataset.seq ?? ""] ?? STATES.pop;
        // [data-seq-with] moves together with the part before it.
        tl.fromTo(el, from, to, i === 0 ? 0 : el.dataset.seqWith !== undefined ? "<" : ">-0.55");
      });
      // [data-seq-all] fills across the whole sequence.
      root
        .querySelectorAll("[data-seq-all]")
        .forEach((el) => tl.fromTo(el, { scaleX: 0 }, { scaleX: 1, duration: tl.duration(), ease: "none" }, 0));

      if (!hosted) return;
      const onProgress = (e: Event) => tl.progress((e as CustomEvent<number>).detail);
      root.addEventListener("demo-progress", onProgress);
      return () => root.removeEventListener("demo-progress", onProgress);
    }, root);

    return () => ctx.revert();
  }, [hosted]);

  return (
    <div
      ref={rootRef}
      data-demo
      aria-hidden
      className={`relative overflow-hidden rounded-card border border-black/[0.06] bg-white ${className}`}
    >
      <Body visual={visual} />
    </div>
  );
}
