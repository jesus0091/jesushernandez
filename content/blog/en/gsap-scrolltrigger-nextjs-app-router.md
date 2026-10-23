---
title: "GSAP ScrollTrigger in the Next.js App Router with useGSAP (patterns from this site)"
slug: gsap-scrolltrigger-nextjs-app-router
description: "How I run GSAP ScrollTrigger, SplitText and Lenis in the Next.js App Router: cleanup, useGSAP, pins, mobile and reduced motion, with code from this site."
date: 2026-10-22
updated: 2026-10-22
keywords:
  - gsap scrolltrigger nextjs
  - useGSAP react
  - gsap next.js app router
  - gsap splittext react
  - lenis scrolltrigger
  - gsap reduced motion
pillar: motion-frontend
alternateSlug: gsap-scrolltrigger-nextjs
---

Every scroll animation on jesushernandez.site runs on GSAP 3.13 inside a Next.js 15 App Router project with next-intl (English and Spanish) and Lenis for smooth scrolling. This post isn't a GSAP tutorial. It's the set of patterns I ended up with after shipping pinned sections, split-text reveals and route transitions to production, with the code taken from the site's own components.

## Key takeaways

- **Every component that touches GSAP is a Client Component, but the page around it stays a Server Component.** The text is in the server HTML. GSAP only sets the starting state in the browser, right before paint.
- **Cleanup is the whole game.** Each animation lives inside a `gsap.context()` (or a `SplitText` instance) and gets reverted when the component unmounts. [`useGSAP`](https://gsap.com/resources/React/) does exactly this for you. My components do it by hand with `useLayoutEffect`, and if I were starting today I'd use the hook.
- **Register plugins once, in one module.** A small `setupGsap()` helper registers ScrollTrigger, SplitText and the brand eases, and sets `ignoreMobileResize`.
- **Lenis and ScrollTrigger share one clock.** Lenis is driven by `gsap.ticker`, and every Lenis scroll event calls `ScrollTrigger.update`.
- **Measure with functions, not numbers.** Pins use `end: () => ...` with `invalidateOnRefresh: true`, and `refreshPriority` when pins are created out of page order.
- **Reduced motion means no animation code runs at all.** Components return early, and the content is simply there.
- **Since April 2025 everything here is free**, including SplitText and the other former bonus plugins, for commercial use ([Webflow's announcement](https://webflow.com/blog/gsap-becomes-free)).

[[DEMO: short screen recording of the home page scroll: hero recedes, project carousel pins and scrolls sideways, quote section brush handoff]]

## Why does GSAP need special handling in the Next.js App Router?

Three things about the App Router change how you write animation code.

First, components are Server Components by default. GSAP needs `window`, the DOM and layout measurements, so anything that calls it must be marked `"use client"`. That doesn't mean the page has to be. On this site, `app/[locale]/page.tsx` is a Server Component that imports client sections like `HomePage`, `LatestsProjects` and `WSMAQuote`. Client components still render on the server, so their text ends up in the HTML.

Second, layouts persist across navigations and pages don't. Anything that should live for the whole visit (Lenis, the page transition overlay) goes in `app/[locale]/layout.tsx`. Anything tied to a page (its ScrollTriggers) has to be created on mount and destroyed on unmount, or the next page inherits triggers pointing at DOM nodes that no longer exist.

Third, React Strict Mode runs effects twice in development. If your effect creates a ScrollTrigger and doesn't clean it up, you get two of them, and pins stack spacing on top of each other. Proper cleanup fixes this in dev and in production.

## Where should you register GSAP plugins in a Next.js project?

In one client module, behind a guard. Here's the trimmed version of `src/lib/motion.ts`:

```tsx
"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { CustomEase } from "gsap/CustomEase";

let registered = false;

/** Registers GSAP plugins + brand eases once. Safe to call from any client component. */
export function setupGsap() {
  if (registered || typeof window === "undefined") return gsap;
  gsap.registerPlugin(ScrollTrigger, SplitText, CustomEase);
  // The mobile address bar showing/hiding changes the viewport height:
  // never re-measure every trigger for that (only for real resizes).
  ScrollTrigger.config({ ignoreMobileResize: true });
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
```

Every component calls `const gsap = setupGsap()` at the top of its effect. It's idempotent, it never runs on the server, and the global config lives in one place. The `ignoreMobileResize` line matters more than it looks: on phones, the address bar sliding in and out changes the viewport height, and without this setting ScrollTrigger would recalculate every trigger each time it happens ([ScrollTrigger.config docs](https://gsap.com/docs/v3/Plugins/ScrollTrigger/static.config())).

## How do you clean up ScrollTrigger animations in React?

Create everything inside a `gsap.context()` and call `ctx.revert()` in the effect's cleanup. This is the hook that makes the hero recede as you scroll past it (`src/components/motion/useRecede.ts`):

```tsx
export function useRecede(
  section: RefObject<HTMLElement | null>,
  content: RefObject<HTMLElement | null>
) {
  useLayoutEffect(() => {
    const trigger = section.current;
    const target = content.current;
    if (!trigger || !target || prefersReducedMotion()) return;
    const gsap = setupGsap();

    const ctx = gsap.context(() => {
      const tl = gsap
        .timeline({
          scrollTrigger: { trigger, start: "top top", end: "bottom top", scrub: true },
        })
        .to(target, { scale: 0.86, yPercent: 16, opacity: 0, ease: "none", duration: 1 }, 0);

      // Not on touch screens: blurring a whole section per frame stutters there.
      if (!isTouchScreen())
        tl.fromTo(target, { filter: "blur(0px)" }, { filter: "blur(10px)", ease: "power2.in", duration: 0.65 }, 0.35);
    }, trigger);

    return () => ctx.revert();
  }, [section, content]);
}
```

`ctx.revert()` kills the timeline, kills its ScrollTrigger, removes pin spacers and puts the inline styles back the way they were before GSAP touched them. Passing `trigger` as the second argument scopes selector strings to that element, so `".card"` inside the context only matches cards in this section ([gsap.context docs](https://gsap.com/docs/v3/GSAP/gsap.context())).

Why `useLayoutEffect` and not `useEffect`? Because the starting state (`opacity: 0`, a line pushed below its mask) has to be applied before the browser paints. With `useEffect` you sometimes get one frame of the final state, then a jump to the starting state. That flash is the most common "GSAP in React looks janky" complaint.

## What does useGSAP do, and should you use it?

[`useGSAP`](https://gsap.com/resources/React/) from `@gsap/react` is the official hook for this exact pattern. Per the GSAP docs, it's a drop-in replacement for `useEffect`/`useLayoutEffect` that wraps your code in a `gsap.context()` and reverts it automatically on unmount. It uses a layout effect in the browser and falls back to `useEffect` on the server, so you don't need the `typeof window` checks. It also takes a `scope` (like the context's second argument), `dependencies` and `revertOnUpdate`, and it gives you `contextSafe()` for animations created later, inside event handlers.

My components predate my switch to it, so they do the context work by hand. Here's the real `SectionHeading` (the masked line reveal on `/about` and `/services` headings), trimmed:

```tsx
"use client";

export default function SectionHeading({ children, as: Tag = "h2", className = "" }) {
  const rootRef = useRef<HTMLHeadingElement | null>(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || prefersReducedMotion()) return;
    const gsap = setupGsap();

    const split = SplitText.create(root, {
      type: "lines",
      mask: "lines",
      autoSplit: true,
      onSplit: (self) =>
        gsap.from(self.lines, {
          yPercent: 130,
          duration: 0.9,
          stagger: 0.1,
          ease: "power4.out",
          scrollTrigger: { trigger: root, start: "top 85%", once: true },
        }),
    });

    return () => split.revert();
  }, []);

  return <Tag ref={rootRef} className={className}>{children}</Tag>;
}
```

And here's the same component written with `useGSAP`, which is what I'd ship in a new project:

```tsx
"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText);

export default function SectionHeading({ children }: { children: React.ReactNode }) {
  const root = useRef<HTMLHeadingElement>(null);

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      SplitText.create(root.current, {
        type: "lines",
        mask: "lines",
        autoSplit: true,
        onSplit: (self) =>
          gsap.from(self.lines, {
            yPercent: 130,
            duration: 0.9,
            stagger: 0.1,
            ease: "power4.out",
            scrollTrigger: { trigger: root.current, start: "top 85%", once: true },
          }),
      });
    },
    { scope: root }
  );

  return <h2 ref={root}>{children}</h2>;
}
```

The logic is identical. What disappears is the bookkeeping: the cleanup function, the `split` variable you have to remember to revert, and the window guard. If you take one thing from this section, it's that `useGSAP` isn't magic. It's `gsap.context()` plus a correctly chosen effect, so you can read either version and know what's going on.

## How do you animate text with SplitText without hurting SEO?

Keep the text as plain children of a real heading or paragraph, and let SplitText split it only in the browser.

Look at the `SectionHeading` above. On the server, it renders a plain `<h2>` with the full heading text, nothing hidden. The split into lines, the masks and the `yPercent: 130` starting state all happen client-side in the layout effect. That matters for two audiences:

- **People with reduced motion, or with JavaScript off**, get a normal, readable heading.
- **Crawlers that don't run JavaScript.** According to [Vercel's analysis of AI crawlers](https://vercel.com/blog/the-rise-of-the-ai-crawler), none of the major ones (GPTBot, ClaudeBot, PerplexityBot) execute JavaScript, while Googlebot does. If your text only appears after an animation runs, those bots never see it.

A quick way to check this on your own site: view source with JavaScript disabled and search for a sentence from the animated block.

Three SplitText options from the 3.13 rewrite do most of the heavy lifting here ([SplitText docs](https://gsap.com/docs/v3/Plugins/SplitText/)):

- `autoSplit: true` re-splits when fonts finish loading or the element's width changes, so lines don't break in the wrong places after a web font swaps in or the window resizes.
- Returning the animation from `onSplit` lets SplitText revert and recreate it on every re-split, so the ScrollTrigger isn't left pointing at stale line elements.
- `mask: "lines"` wraps each line in a clipping element, so you don't need extra markup for the reveal.

One thing I had to fix by hand: masks clip to the line box, and with tight leading that cuts off descenders (g, y, p) and accents, which is a real problem in a bilingual site where Spanish headings have plenty of á, é and ñ. The real component pads the masks and cancels the padding with negative margins so the layout doesn't move:

```tsx
onSplit: (self) => {
  const last = self.masks.length - 1;
  gsap.set(self.masks, {
    paddingTop: "0.1em",
    paddingBottom: "0.2em",
    marginTop: (i: number) => (i === 0 ? "-0.1em" : "0em"),
    // Margins between two lines collapse, so the bottom one carries both.
    marginBottom: (i: number) => (i === last ? "-0.2em" : "-0.3em"),
  });
  return gsap.from(self.lines, { yPercent: 130, /* ... */ });
},
```

For paragraphs, `ScrubWords` uses `aria: "none"`. By default SplitText adds an `aria-label` with the full text to the split element, but an `aria-label` on a `<p>` is ignored anyway, and the individual words read correctly on their own.

[[DEMO: side by side of a SectionHeading on /about in English and Spanish, showing accents not clipped by the line masks]]

## How do you make Lenis and ScrollTrigger work together in Next.js?

Mount Lenis once in the locale layout, drive it from GSAP's ticker, and tell ScrollTrigger every time Lenis scrolls. This is `SmoothScroll.tsx`, minus the route handling covered in the next section:

```tsx
"use client";

export default function SmoothScroll() {
  useEffect(() => {
    if (prefersReducedMotion()) return;
    const gsap = setupGsap();

    const lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 1.1, anchors: true });
    setLenis(lenis);

    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    // Touch screens scroll natively (Lenis only smooths the wheel). There,
    // scroll on the JS thread so pinned sections stay in sync with the finger.
    const touch = isTouchScreen();
    if (touch) ScrollTrigger.normalizeScroll(true);

    return () => {
      if (touch) ScrollTrigger.normalizeScroll(false);
      gsap.ticker.remove(tick);
      lenis.destroy();
      setLenis(null);
    };
  }, []);

  return null;
}
```

A few decisions in there:

- **One clock.** Lenis runs on `gsap.ticker` instead of its own `requestAnimationFrame` loop, so smooth scroll and scrubbed timelines update in the same frame. `ticker.raf` receives seconds, and Lenis wants milliseconds, hence `time * 1000`. `lagSmoothing(0)` stops GSAP from "catching up" after a slow frame, which would otherwise make the scroll position jump.
- **A module-level singleton.** `setLenis`/`getLenis` in `lib/motion.ts` let other components (the navbar's "back to top", the page transition) reach the instance without React context.
- **Touch is different.** Lenis only smooths the wheel, so on phones I turn on [`ScrollTrigger.normalizeScroll`](https://gsap.com/docs/v3/Plugins/ScrollTrigger/static.normalizeScroll()), which moves scrolling to the JS thread. In my testing on iOS Safari, this was what stopped pinned sections from drifting away from the finger and the address bar from resizing the viewport mid-pin.
- **Reduced motion gets no Lenis at all.** Native scrolling is the most accessible scroll there is.

## How do you handle route changes with ScrollTrigger and Lenis?

Two problems show up as soon as you navigate between pages.

The first is scroll position. The browser and ScrollTrigger both remember where you were, so a client-side navigation could open the next page halfway down, under a pin that hasn't been measured yet. `SmoothScroll` resets everything when the path changes:

```tsx
const pathname = usePathname();

useEffect(() => {
  history.scrollRestoration = "manual";
}, []);

useLayoutEffect(() => {
  if (location.hash) return; // a link to /#about keeps its target
  setupGsap(); // ScrollTrigger must be registered before clearing its memory
  ScrollTrigger.clearScrollMemory("manual");
  window.scrollTo(0, 0);
  getLenis()?.scrollTo(0, { immediate: true, force: true });
}, [pathname]);
```

The second is the transition itself. `PageTransition` intercepts internal link clicks, calls `getLenis()?.stop()`, paints a brush over the screen, calls `router.push(url, { scroll: false })`, and once the new `pathname` renders underneath, scrolls to the top, calls `lenis.start()` and lifts the brush. The old page's components unmount during that window, and because every one of them reverts its context, the new page starts with only its own triggers. There's also a failsafe timeout, so a failed navigation never leaves the screen covered.

The home page's entrance timeline has a similar guard. It's created `paused` and only plays when the intro overlay signals it's revealing the page, with a 6-second fallback so content is never stuck hidden if the signal gets lost (for example after a hot reload).

[[DEMO: recording of a page transition from / to /works, showing the brush cover, route change and reveal at scroll position 0]]

## How do you pin sections that measure correctly on every screen?

Use functions for anything that depends on layout, and let ScrollTrigger call them again on refresh. The home page's project carousel is a pinned section that scrolls sideways (`LatestsProjects.tsx`):

```tsx
useLayoutEffect(() => {
  const viewport = viewportRef.current;
  const track = trackRef.current;
  if (!scrollDriven || !viewport || !track) return;

  // Transform-independent: measured from offsets, not bounding rects.
  const distance = () => {
    const first = track.firstElementChild as HTMLElement;
    const last = track.lastElementChild as HTMLElement;
    const pad = parseFloat(getComputedStyle(track).paddingLeft) || 0;
    const end = last.offsetLeft - first.offsetLeft + last.offsetWidth + pad * 2;
    return Math.max(0, end - viewport.clientWidth);
  };

  const ctx = gsap.context(() => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: viewport,
        start: "center center",
        end: () => `+=${distance()}`,
        pin: true,
        scrub: true,
        // Created after later sections' triggers; measure it first so
        // their positions include this pin's spacing.
        refreshPriority: 1,
        invalidateOnRefresh: true,
      },
    });
    tl.to(track, { x: () => -distance(), ease: "none" }, 0);
  }, viewport);

  return () => ctx.revert();
}, [scrollDriven, trackOffset]);
```

What each piece prevents:

- **`end: () => ...` and `x: () => -distance()`** get recomputed on every refresh. A hard-coded number would be wrong the moment the window, font or content changes.
- **`invalidateOnRefresh: true`** makes the tween drop its cached start and end values on refresh, so the function-based `x` is actually read again.
- **Measuring with `offsetLeft`, not `getBoundingClientRect()`**, because the track is already being translated by the animation and bounding rects include that transform.
- **`refreshPriority`** is the one people miss. ScrollTrigger calculates positions in creation order. In React, child components can create their triggers in a different order than they appear on the page. The quote section further down uses `refreshPriority: 2` and the carousel uses `1`, so pins are measured top to bottom and each one includes the spacing of the pins above it ([ScrollTrigger docs](https://gsap.com/docs/v3/Plugins/ScrollTrigger/)).

Refreshing has a cost, too. The footer fits a big name to its container's width, which changes the page height. Rather than calling `ScrollTrigger.refresh()` on every fit, it only does so when the computed font size actually changed, because refreshing every trigger is one of the most expensive steps on page load. [[TODO: metric — main-thread time of ScrollTrigger.refresh() on the home page, from a Performance trace]]

On phones, distances built from `window.innerHeight` jump as the address bar moves. `lib/motion.ts` has a `largeViewportHeight()` helper that measures `100lvh` with a hidden probe element and only re-measures when the width changes. Pinned sections use it for their scroll distances.

## How do you respect prefers-reduced-motion with GSAP?

Check it first and return before creating anything. Every effect on this site starts like this:

```tsx
if (!root || prefersReducedMotion()) return;
```

Nothing gets hidden, split or pinned, so the content is just the server-rendered HTML. On the CSS side, `scroll-behavior: smooth` only applies under `@media (prefers-reduced-motion: no-preference)`.

When a condition changes over time or combines several media queries, I use [`gsap.matchMedia()`](https://gsap.com/docs/v3/GSAP/gsap.matchMedia()) instead. It reverts everything created inside it when the query stops matching. The works wall's pointer effect only runs on a real mouse with motion allowed:

```tsx
const mm = gsap.matchMedia();
mm.add("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)", () => {
  const rows = gsap.utils.toArray<HTMLElement>("[data-wall-shift]", root);
  const moveRow = rows.map((el) => gsap.quickTo(el, "x", { duration: 1.1, ease: "power3.out" }));
  // ...pointer listeners, removed in the returned cleanup
});
return () => mm.revert();
```

The footer's curtain reveal uses `gsap.matchMedia().add("(min-width: 768px)", ...)` the same way, so phones get a simpler layout without a counter-scrolling footer.

## What are the most common mistakes with GSAP in Next.js?

| Mistake | What you see | Fix (as done on this site) |
|---|---|---|
| Calling GSAP in a Server Component or at module top level | `window is not defined` at build time | `"use client"` on the animated component; register plugins inside a guarded `setupGsap()` |
| Creating ScrollTriggers in `useEffect` without cleanup | Duplicated triggers in dev (Strict Mode), stacked pin spacing, triggers firing on the next page | `gsap.context()` + `ctx.revert()`, or `useGSAP` |
| Setting the starting state in `useEffect` | A one-frame flash of the final state before the animation starts | `useLayoutEffect` (or `useGSAP`, which uses a layout effect in the browser) |
| Rendering text only after the animation runs | Text missing for non-JS crawlers and for reduced-motion users | Text as plain children in server HTML; SplitText splits it client-side |
| Running Lenis on its own rAF loop | Scrubbed timelines lag a frame behind the scroll | `gsap.ticker.add(t => lenis.raf(t * 1000))`, `lenis.on("scroll", ScrollTrigger.update)`, `lagSmoothing(0)` |
| Hard-coded pin distances | Pins end too early or too late after resizing or a font swap | `end: () => ...` + `invalidateOnRefresh: true` |
| Pins created out of page order | Sections below a pin start at the wrong scroll position | `refreshPriority` so pins are measured top to bottom |
| Letting the mobile address bar trigger refreshes | Jumps and re-measures mid-scroll on iOS | `ScrollTrigger.config({ ignoreMobileResize: true })`, `normalizeScroll` on touch, lvh-based distances |
| Animating `filter: blur()` on touch devices | Scroll stutter on iOS Safari | Skip blur when `(pointer: coarse)` matches |
| Ignoring scroll memory on navigation | The next page opens mid-scroll | `history.scrollRestoration = "manual"`, `ScrollTrigger.clearScrollMemory("manual")`, scroll to 0 on `pathname` change |

## FAQ

### Do I need useGSAP to use GSAP with Next.js?

No. `useGSAP` is a convenience: it wraps `gsap.context()` and picks the right effect for you. Every component on this site uses `useLayoutEffect` with a manual `ctx.revert()`, which is the same thing done by hand. For new code I'd use `useGSAP`, mostly for `contextSafe()` in event handlers and for not having to write the cleanup.

### Is GSAP free for commercial projects now?

Yes. Since April 2025, all of GSAP is free, including SplitText, ScrollTrigger and the other plugins that used to be paid bonuses, with commercial use allowed ([Webflow](https://webflow.com/blog/gsap-becomes-free)). This site uses SplitText, DrawSVG, ScrambleText and CustomEase with the regular `gsap` npm package.

### Does GSAP hurt SEO in Next.js?

Not if the text is in the server HTML. GSAP itself never renders content. The risk comes from patterns like loading the animated section with `ssr: false`, or injecting text from JavaScript. Keep content as server-rendered children and let GSAP only change styles in the browser.

### Should I use Lenis with ScrollTrigger?

It's a design choice, not a requirement. ScrollTrigger works fine with native scroll. I use Lenis for the feel of wheel scrolling on desktop, and I turn it off completely for reduced motion. If you add it, sync it to `gsap.ticker` and call `ScrollTrigger.update` on every Lenis scroll event.

### Why do my ScrollTrigger positions break after navigating between pages?

Usually the previous page's triggers weren't reverted, the scroll position was restored before the new page's pins were measured, or pins were created out of order. Revert on unmount, reset scroll memory on `pathname` change, and use `refreshPriority` for pins.

---

If you're building something with this kind of motion and want a second pair of eyes on the scroll architecture, the [services page](/services) has how I work. The pinned carousel and quote handoff described here are live on the [home page](/).
