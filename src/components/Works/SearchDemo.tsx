"use client";

import { useLayoutEffect, useRef } from "react";
import { MagnifyingGlass } from "@/components/icons";
import { prefersReducedMotion, setupGsap } from "@/lib/motion";
import type { SearchDemo as Demo } from "@/data/case-studies";

/**
 * The launch, as a visitor meets it: the client's name typed into a search
 * bar, the site as a result, a click, and the site itself, played by the
 * scroll. On its own it runs as it crosses the screen; with `hosted`, whoever
 * holds it in place sends its progress (0 to 1) as "demo-progress" events.
 * Fills its parent, so the parent sets the size. Without motion it rests on
 * the last frame, the site.
 */
export default function SearchDemo({
  demo,
  hosted = false,
  className = "",
}: {
  demo: Demo;
  hosted?: boolean;
  className?: string;
}) {
  const rootRef = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || prefersReducedMotion()) return;
    const gsap = setupGsap();
    const find = (name: string) => root.querySelector<HTMLElement>(`[data-demo-${name}]`);
    const [typed, result, link, cursor, site, from, to] = ["typed", "result", "link", "cursor", "site", "from", "to"].map(find);
    if (!typed || !result || !link || !cursor || !site || !from || !to) return;

    // Where the result's title is inside the banner, for the cursor to travel to.
    const target = () => {
      const box = root.getBoundingClientRect();
      const at = link.getBoundingClientRect();
      return { x: at.left - box.left + Math.min(at.width / 2, 96), y: at.top - box.top + at.height / 2 };
    };
    const typing = { n: 0 };
    const write = () => {
      typed.textContent = demo.query.slice(0, Math.round(typing.n));
    };

    const ctx = gsap.context(() => {
      write();
      // The page swaps in one go, as a page load does; a fade would let the search show through.
      gsap.set(site, { autoAlpha: 0 });
      gsap.set(from, { autoAlpha: 1 });
      gsap.set(to, { autoAlpha: 0 });
      gsap.set(result, { autoAlpha: 0, y: 12 });
      gsap.set(cursor, { autoAlpha: 0 });
      const tl = gsap
        .timeline({
          paused: hosted,
          defaults: { ease: "none" },
          scrollTrigger: hosted ? undefined : { trigger: root, start: "top 85%", end: "top 25%", scrub: true, invalidateOnRefresh: true },
        })
        .to(typing, { n: demo.query.length, duration: 1.4, onUpdate: write })
        .to(result, { autoAlpha: 1, y: 0, duration: 0.4 }, ">0.1")
        .fromTo(
          cursor,
          { autoAlpha: 0, x: () => root.clientWidth * 0.82, y: () => root.clientHeight * 0.92 },
          { autoAlpha: 1, duration: 0.15 },
          "<",
        )
        .to(cursor, { x: () => target().x, y: () => target().y, duration: 0.8, ease: "power1.inOut" }, "<")
        .to(cursor, { scale: 0.8, duration: 0.1, yoyo: true, repeat: 1 })
        .set([site, to], { autoAlpha: 1 }, ">0.1")
        .set([from, cursor], { autoAlpha: 0 }, "<")
        // A beat on the site before the scroll moves on.
        .to({}, { duration: 0.5 });

      if (!hosted) return;
      const onProgress = (e: Event) => tl.progress((e as CustomEvent<number>).detail);
      root.addEventListener("demo-progress", onProgress);
      return () => root.removeEventListener("demo-progress", onProgress);
    }, root);

    return () => ctx.revert();
  }, [demo.query, hosted]);

  return (
    <div
      ref={rootRef}
      data-demo
      aria-hidden
      className={`relative flex flex-col overflow-hidden rounded-2xl border border-black/10 bg-white shadow-xl shadow-black/5 ${className}`}
    >
      {/* The browser window it all happens in; the address follows the page. */}
      <div className="flex h-10 shrink-0 items-center gap-3 border-b border-black/[0.06] bg-[#F1F3F5] px-4">
        <span className="flex gap-1.5">
          {["#FF5F57", "#FEBC2E", "#28C840"].map((color) => (
            <span key={color} className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
          ))}
        </span>
        <span className="relative h-6 min-w-0 flex-1 rounded-full bg-white text-center text-[11px] leading-6 text-[var(--muted)]">
          <span data-demo-from className="invisible absolute inset-0 truncate px-3">
            google.com
          </span>
          <span data-demo-to className="absolute inset-0 truncate px-3">
            {demo.url}
          </span>
        </span>
      </div>

      <div className="relative min-h-0 flex-1">
        {/* The search */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-6 md:px-10">
          <div className="flex h-11 w-full max-w-xl shrink-0 items-center gap-3 rounded-full border border-black/10 bg-white px-4 shadow-sm">
            {/* Google's "G", so the bar reads as the search it stands for. */}
            <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            <span className="min-w-0 flex-1 truncate text-sm text-[var(--black)]">
              <span data-demo-typed>{demo.query}</span>
              <span className="ml-px inline-block h-4 w-px translate-y-0.5 animate-pulse bg-[var(--black)]" />
            </span>
            <MagnifyingGlass size={18} className="shrink-0 text-[var(--muted)]" />
          </div>
          <div data-demo-result className="flex w-full min-w-0 max-w-xl flex-col gap-0.5 pl-1">
            <span className="truncate text-xs text-[var(--muted)]">{demo.url}</span>
            <span data-demo-link className="w-max max-w-full truncate text-base font-medium text-[#0B5ED7] md:text-lg">
              {demo.title}
            </span>
            <span className="truncate text-sm text-[var(--muted)]">{demo.description}</span>
          </div>
        </div>

        {/* The site; opaque, so the search never shows through it. */}
        <div data-demo-site className="absolute inset-0 overflow-hidden bg-white">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={demo.image} alt="" loading="lazy" decoding="async" className="block h-auto w-full" />
        </div>
      </div>

      <svg
        data-demo-cursor
        viewBox="0 0 24 24"
        className="invisible absolute left-0 top-0 h-6 w-6 origin-top-left drop-shadow"
        fill="#0a0a0a"
        stroke="#fff"
        strokeWidth="1.5"
        strokeLinejoin="round"
      >
        <path d="M5 3l14 7.5-6 1.8-2.2 6.2z" />
      </svg>
    </div>
  );
}
