"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";

import { onIntroReveal, prefersReducedMotion, setupGsap } from "@/lib/motion";

type ScrambleTitleProps = {
  /** Fixed lead word, drawn bold. */
  lead: string;
  /** Words that take turns after the lead, decoding from one to the next. */
  words: string[];
  /** How long each word holds before the next swap (s). */
  hold?: number;
  className?: string;
};

/** The title's type size, shared so neighbours can be placed on its cap height and baseline in em. */
export const TITLE_SIZE = "text-[clamp(2.75rem,9.5vw,8.75rem)]";

// Lowercase only: wide capitals (W, M, Z) would push the line past its final width mid-decode.
const GLYPHS = "abcdefghijklmnopqrstuvwxyz";

/** Decodes el's text from `from` to `to`: each character flickers, then settles, roughly left to right. */
function scramble(el: HTMLElement, from: string, to: string, duration: number) {
  const n = to.length;
  const settle = Array.from({ length: n }, (_, k) => 0.25 + (k / n) * 0.55 + Math.random() * 0.2);
  const state = { p: 0 };
  let frame = 0;
  return gsap.to(state, {
    p: 1,
    duration,
    ease: "none",
    onUpdate() {
      // Every other frame: a flicker at 60fps reads as noise, not letters.
      if (frame++ % 2) return;
      let s = "";
      for (let k = 0; k < n; k++) {
        if (state.p >= settle[k]) s += to[k];
        else if (state.p >= settle[k] - 0.3) s += GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
        else s += from[k] ?? "";
      }
      el.textContent = s;
    },
    onComplete() {
      el.textContent = to;
    },
  });
}

export default function ScrambleTitle({ lead, words, hold = 2.8, className = "" }: ScrambleTitleProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const wordRef = useRef<HTMLSpanElement | null>(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    const wordEl = wordRef.current;
    if (!root || !wordEl || prefersReducedMotion()) return;
    setupGsap();

    let i = 0;
    let dead = false;
    let wait: gsap.core.Tween | null = null;
    let swap: gsap.core.Tween | null = null;

    const next = () => {
      if (dead) return;
      i = (i + 1) % words.length;
      swap = scramble(wordEl, wordEl.textContent ?? "", words[i], 0.75);
      swap.eventCallback("onComplete", () => {
        wordEl.textContent = words[i];
        wait = gsap.delayedCall(hold, next);
      });
    };

    const ctx = gsap.context(() => {}, root);

    // The title is whole from the first paint (the intro's brush reveals it in
    // place); the words only start taking turns once the page is revealed.
    const stopWaiting = onIntroReveal(() =>
      ctx.add(() => {
        wait = gsap.delayedCall(hold, next);
      })
    );

    return () => {
      dead = true;
      stopWaiting();
      wait?.kill();
      swap?.kill();
      ctx.revert();
      wordEl.textContent = words[0];
    };
  }, [words, hold]);

  return (
    // -ml: the bold P's side bearing pushes its stem right of the text above;
    // pulling the line back lines up the ink, not the boxes.
    <div
      ref={rootRef}
      aria-hidden
      className={`-ml-[0.04em] flex items-baseline whitespace-nowrap leading-[1.05] tracking-[-0.02em] ${TITLE_SIZE} ${className}`}
    >
      <span className="font-black tracking-[-0.035em]">
        {lead}
      </span>
      <span ref={wordRef} className="ml-[0.22em] font-light">
        {words[0]}
      </span>
    </div>
  );
}
