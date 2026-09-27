"use client";

import { CustomEase } from "gsap/CustomEase";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import type Lenis from "lenis";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import gsap from "gsap";

let registered = false;

/** Registers GSAP plugins + brand eases once. Safe to call from any client component. */
export function setupGsap() {
  if (registered || typeof window === "undefined") return gsap;
  gsap.registerPlugin(ScrollTrigger, SplitText, DrawSVGPlugin, CustomEase);
  CustomEase.create("brand", "0.625, 0.05, 0, 1");
  registered = true;
  return gsap;
}

export function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/* ---------------- Lenis singleton ---------------- */

let lenisInstance: Lenis | null = null;

export const setLenis = (l: Lenis | null) => {
  lenisInstance = l;
};
export const getLenis = () => lenisInstance;

/* ---------------- Intro signal ---------------- */
// The intro overlay fires this when it starts revealing the page, so page-level
// entrance timelines can wait for it instead of playing hidden underneath.

let introRevealed = false;
const INTRO_EVENT = "intro:reveal";

export function markIntroRevealed() {
  if (introRevealed) return;
  introRevealed = true;
  window.dispatchEvent(new Event(INTRO_EVENT));
}

// Longest the intro may take before callers stop waiting for it.
const INTRO_FAILSAFE_MS = 6000;

export function onIntroReveal(cb: () => void) {
  const intro = document.querySelector<HTMLElement>("[data-intro]");
  const introGone = !intro || getComputedStyle(intro).display === "none";
  if (introRevealed || introGone) {
    cb();
    return () => {};
  }

  // Never leave content hidden if the signal is lost (e.g. a hot reload
  // re-creates this module after the intro already finished).
  let done = false;
  const run = () => {
    if (done) return;
    done = true;
    window.clearTimeout(timer);
    window.removeEventListener(INTRO_EVENT, run);
    cb();
  };
  const timer = window.setTimeout(run, INTRO_FAILSAFE_MS);
  window.addEventListener(INTRO_EVENT, run);
  return () => {
    done = true;
    window.clearTimeout(timer);
    window.removeEventListener(INTRO_EVENT, run);
  };
}
