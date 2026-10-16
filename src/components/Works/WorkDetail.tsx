"use client";

import { Fragment, useLayoutEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { BehanceLogo, GithubLogo, ArrowUpRight } from "@/components/icons";
import gsap from "gsap";
import type { Work } from "@/data/works";
import SectionHeading from "../motion/SectionHeading";
import CoverMosaic from "./CoverMosaic";
import WorkCaseStudy from "./WorkCaseStudy";

const LINK_ICONS = {
  behance: BehanceLogo,
  github: GithubLogo,
  website: ArrowUpRight,
};

export default function WorkDetail({ work }: { work: Work }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const website = work.links?.find((l) => l.type === "website");
  // The project's own colors, for the parts of the page that wear them (see CaseTheme).
  const theme = work.caseStudy?.theme;
  const themeVars = theme
    ? ({
        "--cs-brand": theme.brand,
        "--cs-brand-hover": theme.brandHover,
        "--cs-glow-a": theme.glow[0],
        "--cs-glow-b": theme.glow[1],
        "--cs-stage-from": theme.stage[0],
        "--cs-stage-to": theme.stage[1],
      } as React.CSSProperties)
    : undefined;
  const links = work.links?.filter((l) => l !== website) ?? [];
  const { overview } = work;

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
    <div ref={containerRef} style={themeVars} className="w-full overflow-x-clip pb-6 md:pb-8">
      <div className="mx-auto max-w-[1280px] px-6 md:px-8">
        {/* The opening screen: the breadcrumb on top, the title and the banner sitting at the bottom. */}
        <div className="flex min-h-[100svh] flex-col pt-24 pb-6 md:pt-28 md:pb-8">
          {/* Where you are (and the way back), then the title on its own line. */}
          <header className="mb-10 flex flex-1 flex-col gap-10 md:mb-12">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-semibold text-xs uppercase tracking-[0.2em]">
              <nav aria-label="Breadcrumb">
                <ol className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <li className="flex items-center gap-x-3">
                    <Link href="/works" className="text-[var(--muted)] transition hover:text-[var(--black)]">
                      Works
                    </Link>
                    <span aria-hidden className="text-[var(--color-line-2)]">
                      /
                    </span>
                  </li>
                  <li aria-current="page" className="text-[var(--orange)]">
                    {work.productName}
                  </li>
                </ol>
              </nav>
            </div>
            <div className="mt-auto flex flex-col gap-6 md:flex-row md:items-end md:justify-between md:gap-10">
              <SectionHeading
                as="h1"
                className="max-w-4xl font-semibold text-[var(--black)] tracking-title text-[clamp(36px,5.4vw,72px)] leading-[1.04]"
              >
                {(work.titleLines ?? [work.title]).map((line, i) => (
                  <Fragment key={line}>
                    {i > 0 && <br />}
                    {line}
                  </Fragment>
                ))}
              </SectionHeading>
              {/* A plain button under the title on small screens; from md, a tile as tall as the two-line title. */}
              {website && (
                <Link
                  href={website.href}
                  target="_blank"
                  rel="noreferrer"
                  className="group relative isolate flex h-12 w-max shrink-0 items-center gap-2.5 overflow-hidden rounded-xl bg-[var(--cs-brand,#0B5ED7)] px-5 text-sm font-medium text-white transition-colors duration-300 hover:bg-[var(--cs-brand-hover,#083A8F)] md:size-[clamp(112px,11.2vw,150px)] md:flex-col-reverse md:items-start md:justify-between md:rounded-2xl md:p-4 md:text-base md:leading-tight"
                >
                  {/* The site's grain tile; overlay so it reads on the saturated brand color. */}
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-0 -z-10 opacity-80 mix-blend-overlay"
                    style={{ backgroundImage: "var(--grain-image)", backgroundSize: "var(--grain-size) var(--grain-size)" }}
                  />
                  {website.label}
                  <ArrowUpRight
                    size={22}
                    className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 md:self-end"
                  />
                </Link>
              )}
            </div>
          </header>

          {/* A fixed share of the screen, with a floor for short viewports. */}
          <div className="detail-img relative h-[38svh] min-h-60 w-full overflow-hidden rounded-2xl bg-zinc-200">
            {work.mosaic ? (
              <CoverMosaic tiles={work.mosaic} animated />
            ) : (
              <Image
                src={work.cover}
                alt={work.title}
                fill
                className="object-cover"
                priority
              />
            )}
          </div>
        </div>

        {/* Who the client is and what was done for them, with the facts as a sheet beside it. */}
        <div className="detail-content mt-14 grid grid-cols-1 gap-10 md:mt-20 lg:grid-cols-12 lg:gap-16">
          <div className="flex flex-col gap-6 lg:col-span-7">
            {overview && <p className="font-semibold text-xs uppercase tracking-[0.2em] text-[var(--orange)]">The client</p>}
            <p
              className={
                overview
                  ? "text-2xl md:text-[32px] leading-snug tracking-title text-[var(--black)]"
                  : "text-lg md:text-xl leading-relaxed text-[var(--foreground)]"
              }
            >
              {overview?.about ?? work.description}
            </p>
            {overview && <p className="max-w-xl text-base md:text-lg leading-relaxed text-[var(--muted)]">{overview.work}</p>}

            {/* The live site already has its tile next to the title. */}
            {links.length > 0 && (
              <div className="mt-2 flex flex-wrap items-center gap-2">
                {links.map((l) => {
                  const Icon = LINK_ICONS[l.type];
                  return (
                    <Link
                      key={`${l.type}-${l.href}`}
                      href={l.href}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 rounded-full border border-black/15 px-5 py-2.5 text-sm font-medium text-[var(--black)] transition hover:border-black hover:bg-black hover:text-white"
                    >
                      <Icon size={16} />
                      {l.label}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          <dl className="border-t border-[var(--color-line-2)] lg:col-span-5">
            {[
              { label: "Client", values: overview ? [overview.client] : [] },
              { label: "Sector", values: overview ? [overview.sector] : [] },
              { label: "Scope", values: [work.category] },
              { label: "Role", values: [work.role] },
              { label: "Stack", values: work.technologies },
              // A case study has its own technology chapter; the sheet stays short.
              ...(work.caseStudy
                ? []
                : [
                    { label: "Integrations", values: work.integrations ?? [] },
                    { label: "Tools", values: work.tools },
                  ]),
            ]
              .filter((row) => row.values.length > 0)
              .map((row) => (
                <div
                  key={row.label}
                  className="grid grid-cols-[130px_1fr] gap-4 border-b border-[var(--color-line-2)] py-4"
                >
                  <dt className="pt-1 font-semibold text-[11px] uppercase tracking-[0.16em] text-[var(--muted)]">{row.label}</dt>
                  <dd className="text-sm md:text-base leading-relaxed text-[var(--black)]">{row.values.join(" · ")}</dd>
                </div>
              ))}
          </dl>
        </div>

        {work.caseStudy && <WorkCaseStudy study={work.caseStudy} />}
      </div>
    </div>
  );
}
