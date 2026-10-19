"use client";

import { Fragment, useLayoutEffect, useRef } from "react";
import {
  BehanceLogo,
  GithubLogo,
  LinkedinLogo,
} from "@/components/icons";

import { Link } from "@/i18n/navigation";
import ScrambleTitle, { TITLE_SIZE } from "./motion/ScrambleTitle";
import CoverMosaic from "./Works/CoverMosaic";
import gsap from "gsap";
import { onIntroReveal } from "@/lib/motion";
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
  const sectionRef = useRef<HTMLElement | null>(null);
  const greetRef = useRef<HTMLParagraphElement | null>(null);
  const titleRef = useRef<HTMLDivElement | null>(null);
  const subtitleRef = useRef<HTMLDivElement | null>(null);
  const footerSocialRef = useRef<HTMLDivElement | null>(null);
  const mosaicRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);

  useRecede(sectionRef, contentRef);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    let stopWaiting = () => {};
    const ctx = gsap.context(() => {
      const socialLinks = Array.from(
        footerSocialRef.current?.querySelectorAll<HTMLElement>("a") ?? []
      );

      // The title decodes itself in (ScrambleTitle); this only brings the
      // text around it in.
      gsap.set(greetRef.current, { autoAlpha: 0, y: 16 });
      gsap.set(subtitleRef.current, { autoAlpha: 0, y: 16 });
      gsap.set(socialLinks, { autoAlpha: 0, y: 10, scale: 0.96 });
      gsap.set(mosaicRef.current, { autoAlpha: 0, y: 40 });

      const tl = gsap.timeline({ paused: true, defaults: { ease: "power3.out" } });
      stopWaiting = onIntroReveal(() => tl.play());

      tl.to(greetRef.current, { autoAlpha: 1, y: 0, duration: 0.4 })
        .to(subtitleRef.current, { autoAlpha: 1, y: 0, duration: 0.5 }, "+=0.9")
        .to(
          socialLinks,
          { autoAlpha: 1, y: 0, scale: 1, duration: 0.4, stagger: 0.06 },
          ">0.05"
        )
        .to(mosaicRef.current, { autoAlpha: 1, y: 0, duration: 1 }, "<0.1");
    }, section);

    return () => {
      stopWaiting();
      ctx.revert();
    };
  }, []);

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
          <p ref={greetRef} className="mt-auto font-mono text-sm uppercase md:text-base text-[var(--color-accent-ink)]">
            My name is Jesús Hernández 👋
          </p>

          <h1 className="sr-only">Jesús Hernández, Product Engineer &amp; Product Designer</h1>

          {/* Title with the location beside it; on phones the location drops below. */}
          <div className={`relative flex w-full flex-col gap-3 ${TITLE_SIZE}`}>
            <div ref={titleRef}>
              <ScrambleTitle lead="Product" words={HERO_WORDS} />
            </div>

            {/* Location with the socials under it. On desktop it's pinned to the
                title's right, spanning its x-height (top) to its baseline (bottom),
                in em of the title's size; the title's changing width never shifts it. */}
            <div className="flex flex-col md:absolute md:right-0 md:top-[0.367em] md:bottom-[0.152em] md:items-end md:justify-between md:text-right">
              <div
                ref={subtitleRef}
                className="text-base flex md:text-lg font-medium text-[var(--muted)]"
              >
                <p className="md:-mt-[0.16em] md:leading-none">Based in Argentina</p>
              </div>
              <div ref={footerSocialRef} className="flex flex-row gap-1 mt-1 -ml-2.5 md:mt-0 md:ml-0 md:-mr-2.5 md:-mb-2.5">
                <Link
                  href="https://www.linkedin.com/in/jesushernandez91/"
                  data-sfx="social"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn profile"
                  className="flex w-10 h-10 items-center justify-center rounded-full hover:bg-black/5 transition text-(--color-ink-3) hover:text-(--color-ink-1)"
                >
                  <LinkedinLogo size={20} />
                </Link>
                <Link
                  href="https://github.com/jesus0091"
                  data-sfx="social"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="GitHub profile"
                  className="flex w-10 h-10 items-center justify-center rounded-full hover:bg-black/5 transition text-(--color-ink-3) hover:text-(--color-ink-1)"
                >
                  <GithubLogo size={20} />
                </Link>
                <Link
                  href="https://www.behance.net/devjesushernandez"
                  data-sfx="social"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Behance profile"
                  className="flex w-10 h-10 items-center justify-center rounded-full hover:bg-black/5 transition text-(--color-ink-3) hover:text-(--color-ink-1)"
                >
                  <BehanceLogo size={20} />
                </Link>
              </div>
            </div>
          </div>

          {/* The same moving wall as a project page, dealt from every project. */}
          <div
            ref={mosaicRef}
            className="relative mt-10 h-[38svh] min-h-60 w-full overflow-hidden rounded-card bg-zinc-200 md:mt-12"
          >
            <CoverMosaic tiles={HERO_MOSAIC} animated />
          </div>
        </div>
      </section>
    </Fragment>
  );
}
