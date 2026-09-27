"use client";

import { useLayoutEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, BehanceLogo, GithubLogo, ArrowUpRight } from "@/components/icons";
import gsap from "gsap";
import type { Work } from "@/data/works";

const LINK_ICONS = {
  behance: BehanceLogo,
  github: GithubLogo,
  website: ArrowUpRight,
};

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-black/10 bg-white/60 px-3 py-1 text-sm font-medium text-[var(--black)]">
      {children}
    </span>
  );
}

export default function WorkDetail({ work }: { work: Work }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!containerRef.current) return;
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;
    if (reduce) return;

    const ctx = gsap.context(() => {
      const img = containerRef.current!.querySelector(".detail-img");
      const content = containerRef.current!.querySelector(".detail-content");

      if (img) gsap.fromTo(img, { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, ease: "power3.out" });
      if (content) gsap.fromTo(content, { y: 60, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, ease: "power3.out", delay: 0.15 });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="w-full pt-28 pb-24 md:pt-36 md:pb-32 bg-[var(--background)]">
      <div className="mx-auto max-w-[1280px] px-6 md:px-8">
        <Link
          href="/works"
          className="inline-flex items-center gap-2 text-sm font-medium text-[var(--muted)] hover:text-[var(--black)] transition mb-8"
        >
          <ArrowLeft size={16} />
          Back to all works
        </Link>

        <div className="detail-img relative w-full aspect-[16/9] md:aspect-[2/1] rounded-2xl overflow-hidden bg-zinc-200 mb-10">
          <Image
            src={work.cover}
            alt={work.title}
            fill
            className="object-cover"
            priority
          />
        </div>

        <div className="detail-content flex flex-col md:flex-row gap-10 md:gap-16">
          <div className="flex flex-col gap-6 flex-1 max-w-2xl">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-[var(--orange)]">{work.category}</span>
                <span className="text-sm text-[var(--muted)]">· {work.year}</span>
              </div>
              <h1
                className="font-bold text-[var(--black)] tracking-tight"
                style={{ fontSize: "clamp(32px, 5vw, 56px)", lineHeight: 1.1 }}
              >
                {work.title}
              </h1>
              <p className="text-lg font-medium text-[var(--muted)]">{work.role}</p>
              <p className="text-sm font-semibold text-[var(--orange)]">{work.productName}</p>
            </div>

            <p className="text-base md:text-lg leading-relaxed text-[var(--foreground)]">
              {work.description}
            </p>

            {work.links && work.links.length > 0 && (
              <div className="flex items-center gap-2 pt-2">
                {work.links.map((l) => {
                  const Icon = LINK_ICONS[l.type];
                  return (
                    <Link
                      key={`${l.type}-${l.href}`}
                      href={l.href}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 rounded-full border border-black/15 px-5 py-2.5 text-sm font-medium text-[var(--black)] hover:bg-black hover:text-white hover:border-black transition"
                    >
                      <Icon size={16} />
                      {l.label}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-5 md:w-[280px] shrink-0">
            <div className="flex flex-col gap-2">
              <p className="text-xs font-semibold text-[var(--muted)] tracking-widest">Technologies</p>
              <div className="flex flex-wrap gap-1.5">
                {work.technologies.map((t) => <Chip key={t}>{t}</Chip>)}
              </div>
            </div>

            {work.integrations && work.integrations.length > 0 && (
              <div className="flex flex-col gap-2">
                <p className="text-xs font-semibold text-[var(--muted)] tracking-widest">Integrations</p>
                <div className="flex flex-wrap gap-1.5">
                  {work.integrations.map((t) => <Chip key={t}>{t}</Chip>)}
                </div>
              </div>
            )}

            <div className="flex flex-col gap-2">
              <p className="text-xs font-semibold text-[var(--muted)] tracking-widest">Tools</p>
              <div className="flex flex-wrap gap-1.5">
                {work.tools.map((t) => <Chip key={t}>{t}</Chip>)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
