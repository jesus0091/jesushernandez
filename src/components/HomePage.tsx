"use client";

import { Fragment, useRef } from "react";
import { useTranslations } from "next-intl";
import {
  BehanceLogo,
  GithubLogo,
  LinkedinLogo,
} from "@/components/icons";

import { Link } from "@/i18n/navigation";
import ScrambleTitle, { TITLE_SIZE } from "./motion/ScrambleTitle";
import CoverMosaic from "./Works/CoverMosaic";
import { useRecede } from "./motion/useRecede";

const HERO_WORDS = ["Engineer", "Designer"];

// Every project's screens, interleaved so both row pools mix covers and Pataro screens.
const WALL = ["omnipad", "iacon", "mtc-design", "therapia", "smart-f", "Banner-10", "linkedin"];
const PATARO = ["hero", "purpose", "training", "impact", "audience", "research", "mission"];
const HERO_MOSAIC = WALL.flatMap((name, i) => [
  `/images/wall/color/${name}.webp`,
  `/images/pataro/${PATARO[i]}.webp`,
]);

export default function HomePage() {
  const t = useTranslations("home");
  const sectionRef = useRef<HTMLElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);

  // No entrance of its own: the intro's brush reveals the hero already in place.
  useRecede(sectionRef, contentRef);

  return (
    <Fragment>
      <section
        ref={sectionRef}
        id="hero"
        className="relative min-h-svh w-full
          flex flex-col
          pt-24 pb-6 md:pt-28 md:pb-8
          touch-pan-y select-none
          overflow-x-clip
        "
      >
        {/* As on a project page: the intro sits low on the first screen, the wall closes it. */}
        <div ref={contentRef} className="relative z-10 mx-auto flex w-full max-w-[1280px] flex-1 flex-col items-start gap-2 px-6 text-left md:px-8">
          <p className="mt-auto font-mono text-sm uppercase md:text-base text-[var(--color-accent-ink)]">
            {t("greeting")}
          </p>

          <h1 className="sr-only">{t("srTitle")}</h1>

          {/* Title with the location beside it; on phones the location drops below. */}
          <div className={`relative flex w-full flex-col gap-3 ${TITLE_SIZE}`}>
            <ScrambleTitle lead="Product" words={HERO_WORDS} />

            {/* Location with the socials beside it (phones) or under it. On desktop it's pinned to the
                title's right, spanning its x-height (top) to its baseline (bottom),
                in em of the title's size; the title's changing width never shifts it. */}
            <div className="flex flex-row items-center justify-between md:absolute md:right-0 md:top-[0.367em] md:bottom-[0.152em] md:flex-col md:items-end md:text-right">
              <div className="text-base flex md:text-lg font-medium text-[var(--muted)]">
                <p className="md:-mt-[0.16em] md:leading-none">{t("location")}</p>
              </div>
              <div className="flex flex-row gap-1 -mr-2.5 md:-mb-2.5">
                <Link
                  href="https://www.linkedin.com/in/jesushernandez91/"
                  data-sfx="social"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={t("linkedin")}
                  className="flex w-10 h-10 items-center justify-center rounded-full hover:bg-black/5 transition text-(--color-ink-3) hover:text-(--color-ink-1)"
                >
                  <LinkedinLogo size={20} />
                </Link>
                <Link
                  href="https://github.com/jesus0091"
                  data-sfx="social"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={t("github")}
                  className="flex w-10 h-10 items-center justify-center rounded-full hover:bg-black/5 transition text-(--color-ink-3) hover:text-(--color-ink-1)"
                >
                  <GithubLogo size={20} />
                </Link>
                <Link
                  href="https://www.behance.net/devjesushernandez"
                  data-sfx="social"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={t("behance")}
                  className="flex w-10 h-10 items-center justify-center rounded-full hover:bg-black/5 transition text-(--color-ink-3) hover:text-(--color-ink-1)"
                >
                  <BehanceLogo size={20} />
                </Link>
              </div>
            </div>
          </div>

          {/* The same moving wall as a project page, dealt from every project. */}
          <div className="relative mt-6 h-[38svh] min-h-60 w-full overflow-hidden rounded-card bg-zinc-200"
          >
            <CoverMosaic tiles={HERO_MOSAIC} animated prioritySrc="/images/wall/color/Banner-10.webp" sizes="(min-width: 768px) 280px, 210px" />
          </div>
        </div>
      </section>
    </Fragment>
  );
}
