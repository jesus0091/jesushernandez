"use client";

import { useLayoutEffect, useRef } from "react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { ArrowUpRight } from "@/components/icons";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { WORKS } from "@/data/works";

export default function WorksList() {
  const gridRef = useRef<HTMLUListElement>(null);

  useLayoutEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;
    if (reduce) return;

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      const rows = gsap.utils.toArray<HTMLElement>(".work-card");
      const zoom = (batch: Element[]) => batch.map((card) => card.querySelector("[data-zoom]"));

      gsap.set(rows, { autoAlpha: 0, y: 28 });
      gsap.set(zoom(rows), { scale: 1.14 });

      // Each row reveals as it enters, not the whole list at once: the row
      // rises a little while its cover settles back from a slight zoom.
      ScrollTrigger.batch(rows, {
        start: "top 88%",
        once: true,
        onEnter: (batch) => {
          gsap.to(batch, { autoAlpha: 1, y: 0, duration: 0.9, ease: "power3.out", stagger: 0.12 });
          gsap.to(zoom(batch), { scale: 1, duration: 1.4, ease: "power3.out", stagger: 0.12 });
        },
      });
    }, grid);

    return () => ctx.revert();
  }, []);

  return (
    <section aria-labelledby="works-list-heading" className="w-full pt-16 pb-24 md:pt-24 md:pb-32">
      {/* Names the list for assistive tech, so the rows' h3 sit under an h2. */}
      <h2 id="works-list-heading" className="sr-only">
        All projects
      </h2>
      <ul ref={gridRef} className="mx-auto max-w-[1280px] px-6 md:px-8 border-b border-[var(--color-line-2)]">
        {WORKS.map((work) => (
          <li key={work.id} className="work-card border-t border-[var(--color-line-2)]">
            {/* One row per project: index, a large cover, then category, name and
                role, and the arrow. Below md the cover goes full width above the text. */}
            <Link
              href={`/works/${work.id}`}
              className="group grid grid-cols-1 gap-5 py-8 md:grid-cols-[2.5rem_minmax(0,440px)_1fr_auto] md:items-center md:gap-10 md:py-10"
            >
              <span className="hidden md:block self-start font-mono text-sm text-[var(--color-ink-4)] transition-colors duration-300 group-hover:text-[var(--color-accent)]">
                {work.index}
              </span>

              {/* Covers are exported at 1600×707. */}
              <div className="relative aspect-[1600/707] w-full overflow-hidden rounded-2xl bg-zinc-100">
                <div data-zoom className="absolute inset-0">
                  {/* The plain cover, even for projects with a mosaic: the mosaic reads as
                      noise at this size and repeats the wall above. */}
                  <Image
                    src={work.cover}
                    alt={work.title}
                    fill
                    sizes="(min-width: 768px) 440px, 100vw"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                  />
                </div>
              </div>

              <div className="min-w-0">
                <span className="font-mono text-xs uppercase tracking-[0.08em] text-[var(--color-ink-4)]">
                  {work.category}
                </span>
                <h3 className="mt-3 text-[1.75rem] md:text-3xl font-semibold text-[var(--black)] tracking-title leading-[1.1] transition-transform duration-500 ease-out md:group-hover:translate-x-2">
                  {work.productName}
                </h3>
                <p className="mt-2 text-base md:text-lg text-[var(--muted)]">{work.role}</p>
              </div>

              <span
                aria-hidden
                className="hidden md:inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-[var(--color-line-2)] text-[var(--black)] transition-[background-color,border-color,color,rotate] duration-300 group-hover:rotate-45 group-hover:border-[var(--color-accent)] group-hover:bg-[var(--color-accent)] group-hover:text-white"
              >
                <ArrowUpRight size={20} />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
