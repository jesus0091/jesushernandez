"use client";

import { useLayoutEffect, useRef } from "react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { ArrowUpRight } from "@/components/icons";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { WORKS } from "@/data/works";
import CoverMosaic from "./CoverMosaic";

// Bento on large screens (4 columns): the newest project takes a 3×2 tile
// (close to the covers' own proportions, so it barely crops), two small tiles
// stack beside it and four more close the grid. Below that, 1–2 plain columns.
const BENTO = ["lg:col-span-3 lg:row-span-2", "", "", "", "", "", "md:col-span-2 lg:col-span-1"];

export default function WorksList() {
  const gridRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;
    if (reduce) return;

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray<HTMLElement>(".work-card");
      const zoom = (batch: Element[]) => batch.map((card) => card.querySelector("[data-zoom]"));

      gsap.set(cards, { autoAlpha: 0, y: 28 });
      gsap.set(zoom(cards), { scale: 1.14 });

      // Each row reveals as it enters, not the whole grid at once: the card
      // rises a little while its cover settles back from a slight zoom.
      ScrollTrigger.batch(cards, {
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
    <section className="w-full pt-16 pb-24 md:pt-24 md:pb-32">
      <div
        ref={gridRef}
        className="mx-auto max-w-[1280px] px-6 md:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 lg:auto-rows-[280px] gap-6"
      >
        {WORKS.map((work, i) => {
          const big = i === 0;
          return (
            <Link
              key={work.id}
              href={`/works/${work.id}`}
              className={`work-card group relative flex flex-col overflow-hidden rounded-card bg-white/70 backdrop-blur-sm border border-white/50 transition-[background-color,box-shadow,translate] duration-300 hover:bg-white/90 hover:-translate-y-1 hover:shadow-lg ${BENTO[i] ?? ""}`}
            >
              {/* Covers are exported at 1600×707; bento cells crop them to fit. */}
              <div className="relative aspect-[1600/707] w-full bg-zinc-100 overflow-hidden lg:aspect-auto lg:min-h-0 lg:flex-1">
                <div data-zoom className="absolute inset-0">
                  {work.mosaic ? (
                    <div className="absolute inset-0 transition-transform duration-500 group-hover:scale-105">
                      <CoverMosaic tiles={work.mosaic} />
                    </div>
                  ) : (
                    <Image
                      src={work.cover}
                      alt={work.title}
                      fill
                      sizes={big ? "(min-width: 1024px) 920px, 100vw" : "(min-width: 1024px) 300px, (min-width: 768px) 50vw, 100vw"}
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  )}
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute top-4 left-4 right-4 flex items-center gap-2">
                  <span className="truncate rounded-full bg-white/80 backdrop-blur-md px-3 py-1 text-xs font-semibold text-[var(--black)]">
                    {work.category}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between gap-4 px-5 py-4">
                <div className="min-w-0">
                  <h3
                    className={`font-bold text-[var(--black)] tracking-title leading-tight ${
                      big ? "text-xl md:text-2xl lg:text-3xl" : "text-xl md:text-2xl lg:text-lg"
                    }`}
                  >
                    {work.productName}
                  </h3>
                  <p className="mt-1 truncate text-sm text-[var(--muted)]">{work.role}</p>
                </div>
                <span
                  aria-hidden
                  className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--black)] text-white opacity-0 translate-y-2 transition-[opacity,translate] duration-300 group-hover:opacity-100 group-hover:translate-y-0"
                >
                  <ArrowUpRight size={18} />
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
