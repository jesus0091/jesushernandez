"use client";

import { BehanceLogo, BookOpenText, FlowArrow, GithubLogo, ArrowRight, PenNib, Question } from "@/components/icons";
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import ProjectCard from "./ProjectCard";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import ScrubWords from "../motion/ScrubWords";
import SectionHeading from "../motion/SectionHeading";
import SectionLabel from "../SectionLabel";
import gsap from "gsap";
import { getWorkById } from "@/data/works";
import { prefersReducedMotion } from "@/lib/motion";
import { useIsMobile } from "@/app/utils/useIsMobile";

type Mode = "solo" | "collab";
type Category = "frontend" | "design";

export type LinkOut = {
  type: "behance" | "github" | "website";
  href: string;
  icon?: React.ReactElement;
};

export type Project = {
  id: string;
  productName: string;
  stack: string[];
  cover: string;
  mosaic?: string[];
  category: Category;
  mode: Mode;
  links?: LinkOut[];
};

const PROJECTS: Project[] = [
  {
    id: "ristario",
    productName: "Ristario",
    stack: ["Figma", "ReactJS", "NextJS", "TypeScript", "TailwindCSS", "Design System", "Branding"],
    cover: "/images/linkedin.webp",
    category: "frontend",
    mode: "solo",
    links: [
      { type: "behance", href: "https://www.behance.net/devjesushernandez", icon: <BehanceLogo /> },
      { type: "github", href: "#", icon: <GithubLogo /> },
    ],
  },
  {
    id: "move-the-chain",
    productName: "Move The Chain",
    stack: ["ReactJS", "NextJS", "TypeScript", "TailwindCSS", "Figma", "Design System", "UX Research"],
    cover: "/images/mtc-design.webp",
    category: "design",
    mode: "collab",
    links: [
      { type: "github", href: "#", icon: <GithubLogo /> },
      { type: "behance", href: "https://www.behance.net/devjesushernandez", icon: <BehanceLogo /> },
    ],
  },
  {
    id: "fundacion-pataro",
    productName: "Fundación Pataro",
    stack: ["Figma", "Figma Design", "UX Research", "Accessibility", "Prototyping", "Branding"],
    cover: "/images/Banner-10.webp",
    mosaic: getWorkById("fundacion-pataro")?.mosaic,
    category: "design",
    mode: "solo",
    links: [{ type: "behance", href: "https://www.behance.net/devjesushernandez", icon: <BehanceLogo /> }],
  },
  {
    id: "iacon",
    productName: "IACON",
    stack: ["Figma", "Figma Design", "FigJam", "Design System", "Branding"],
    cover: "/images/iacon.webp",
    category: "design",
    mode: "solo",
    links: [{ type: "behance", href: "https://www.behance.net/devjesushernandez", icon: <BehanceLogo /> }],
  },
  {
    id: "smart-factory",
    productName: "Smart Factory",
    stack: ["Figma", "UX Design", "Prototyping", "Design System", "Branding"],
    cover: "/images/smart-f.webp",
    category: "design",
    mode: "solo",
    links: [{ type: "behance", href: "https://www.behance.net/devjesushernandez", icon: <BehanceLogo /> }],
  },
  {
    id: "cc-webapp",
    productName: "Omnipad",
    stack: ["Figma", "Figma Design", "Design System", "Prototyping", "UX Research", "UI Design"],
    cover: "/images/omnipad.webp",
    category: "design",
    mode: "solo",
    links: [{ type: "behance", href: "https://www.behance.net/devjesushernandez", icon: <BehanceLogo /> }],
  },
  {
    id: "psy-app",
    productName: "Academic Project",
    stack: ["Figma", "Figma Design", "Design System", "iOS", "Prototyping", "UX Research", "Design Thinking"],
    cover: "/images/therapia.webp",
    category: "design",
    mode: "solo",
    links: [{ type: "behance", href: "https://www.behance.net/devjesushernandez", icon: <BehanceLogo /> }],
  },
];

// Newest first; the home shows the latest few, the rest live on /works.
const LATEST = PROJECTS.slice(0, 5);

// Statement under the carousel. On desktop it cycles while the cards pass:
// each phrase rises in, reads itself word by word, then rises out.
// The last one carries the link and stays.
// Each phrase is a step of the process; its icon marks the step.
// Texts live in messages (projects.phrases), in this order.
const PHRASE_ICONS = [Question, FlowArrow, PenNib, BookOpenText];

const linkClass =
  "bg-[linear-gradient(var(--orange),var(--orange))] bg-[length:100%_1.5px] bg-bottom-left bg-no-repeat pb-0.5 text-[var(--color-accent-ink)]";

/** Word wrapped in its own mask so it can rise in/out; padded so descenders aren't clipped. */
const phraseIconClass = "mr-2 inline-block align-[-0.15em]";

function MaskedWords({ text }: { text: string }) {
  return text.split(" ").map((w, i) => (
    <React.Fragment key={i}>
      {i > 0 && " "}
      <span className="inline-block overflow-clip pb-[0.2em] -mb-[0.2em] align-bottom">
        <span data-word className="inline-block">
          {w}
        </span>
      </span>
    </React.Fragment>
  ));
}

// The carousel pins and scrolls sideways with the page (Embla off).
// Reduced motion: regular swipeable Embla carousel.

export default function LatestProjects() {
  const t = useTranslations("projects");
  const phraseTexts = t.raw("phrases") as string[];
  const phraseLink = t("phraseLink");
  const sectionRef = useRef<HTMLElement | null>(null);
  const headerRef = useRef<HTMLDivElement | null>(null);
  const anchorRef = useRef<HTMLDivElement | null>(null);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const progressRef = useRef<HTMLDivElement | null>(null);
  const phrasesRef = useRef<HTMLDivElement | null>(null);
  const [trackOffset, setTrackOffset] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);
  const isMobile = useIsMobile(768);
  const scrollDriven = !reducedMotion;

  useEffect(() => setReducedMotion(prefersReducedMotion()), []);

  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    // Not the viewport's first child: the caption sits above the track.
    container: "[data-embla-track]",
    containScroll: "trimSnaps",
    dragFree: false,
    loop: false,
    slidesToScroll: 1,
    active: reducedMotion,
  });

  // Progress bar, written straight to the DOM (runs every scroll frame).
  const setProgress = (progress: number) => {
    const p = Math.min(1, Math.max(0, progress));
    // Start at one slot's width so the bar is never empty on arrival.
    const min = 1 / LATEST.length;
    if (progressRef.current)
      progressRef.current.style.transform = `scaleX(${min + p * (1 - min)})`;
  };

  // Reduced motion: follow the Embla swipe.
  useEffect(() => {
    if (!emblaApi || scrollDriven) return;
    const update = () => setProgress(emblaApi.scrollProgress());
    update();
    emblaApi.on("scroll", update).on("reInit", update);
    return () => {
      emblaApi.off("scroll", update).off("reInit", update);
    };
  }, [emblaApi, scrollDriven]);

  // Measure container left edge for full-bleed carousel alignment
  useEffect(() => {
    const measure = () => {
      if (anchorRef.current) {
        setTrackOffset(anchorRef.current.getBoundingClientRect().left);
      }
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  // Scroll-driven horizontal carousel (desktop)
  useLayoutEffect(() => {
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!scrollDriven || !viewport || !track) return;
    gsap.registerPlugin(ScrollTrigger);

    // Transform-independent: measured from offsets, not bounding rects.
    const distance = () => {
      const first = track.firstElementChild as HTMLElement;
      const last = track.lastElementChild as HTMLElement;
      const pad = parseFloat(getComputedStyle(track).paddingLeft) || 0;
      const end = last.offsetLeft - first.offsetLeft + last.offsetWidth + pad * 2;
      return Math.max(0, end - viewport.clientWidth);
    };

    const ctx = gsap.context(() => {
      const n = PHRASE_ICONS.length;
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: viewport,
          start: "center center",
          end: () => `+=${distance()}`,
          pin: true,
          scrub: true,
          anticipatePin: 1,
          // Created after later sections' triggers; measure it first so their
          // positions include this pin's spacing.
          refreshPriority: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => setProgress(self.progress),
          onRefresh: (self) => setProgress(self.progress),
        },
      });
      // The caption takes over as the header scrolls away: hidden on entry,
      // in by the time the heading has left the screen.
      const header = headerRef.current;
      if (header)
        gsap.fromTo(
          viewport.querySelector("[data-caption]"),
          { autoAlpha: 0, y: 8 },
          {
            autoAlpha: 1, y: 0, ease: "none",
            scrollTrigger: { trigger: header, start: "bottom 35%", end: "bottom top", scrub: true },
          }
        );

      // One timeline unit per phrase; the track spans all of them.
      tl.to(track, { x: () => -distance(), ease: "none", duration: n }, 0);

      const phrases = phrasesRef.current?.querySelectorAll<HTMLElement>("[data-phrase]") ?? [];
      phrases.forEach((phrase, i) => {
        const words = phrase.querySelectorAll<HTMLElement>("[data-word]");
        const icon = phrase.querySelector<SVGElement>("[data-phrase-icon]");
        const last = i === n - 1;
        if (i > 0) {
          tl.set(phrase, { autoAlpha: 1 }, i);
          tl.fromTo(words, { yPercent: 110 }, { yPercent: 0, duration: 0.15, ease: "power2.out", stagger: { amount: 0.08 } }, i);
          if (icon)
            tl.fromTo(icon, { autoAlpha: 0, scale: 0.6, rotation: -12 }, { autoAlpha: 1, scale: 1, rotation: 0, duration: 0.15, ease: "back.out(2)" }, i);
        }
        tl.fromTo(words, { opacity: 0.15 }, { opacity: 1, duration: 0.1, ease: "none", stagger: { amount: last ? 0.45 : 0.55 } }, i + 0.15);
        if (last) {
          const underline = phrase.querySelector<HTMLElement>("[data-scrub-underline]");
          if (underline)
            tl.fromTo(underline, { backgroundSize: "0% 1.5px" }, { backgroundSize: "100% 1.5px", duration: 0.25, ease: "none" }, i + 0.7);
        } else {
          tl.to(words, { yPercent: -110, duration: 0.12, ease: "power2.in", stagger: { amount: 0.06 } }, i + 0.85);
          if (icon) tl.to(icon, { autoAlpha: 0, scale: 0.6, duration: 0.1, ease: "power2.in" }, i + 0.87);
          tl.set(phrase, { autoAlpha: 0 }, i + 1);
        }
      });

      // The header's CTA comes back with the last phrase.
      const endCta = phrasesRef.current?.querySelector<HTMLElement>("[data-end-cta]");
      if (endCta)
        tl.fromTo(endCta, { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.2, ease: "power2.out" }, n - 1 + 0.4);
    }, viewport);

    return () => ctx.revert();
  }, [scrollDriven, trackOffset]);

  // Entry animation
  useLayoutEffect(() => {
    if (!sectionRef.current) return;
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;
    if (reduce) return;

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      const subtitle = headerRef.current?.querySelector<HTMLElement>("p:last-child");

      if (subtitle) gsap.set(subtitle, { autoAlpha: 0, y: 16 });

      const tl = gsap.timeline({
        defaults: { ease: "power3.out" },
        scrollTrigger: { trigger: sectionRef.current, start: "top 80%", once: true },
      });

      if (subtitle) tl.to(subtitle, { autoAlpha: 1, y: 0, duration: 0.5 }, 0.25);
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="projects"
      // Opaque, above the section before it: it slides over "What sets me apart".
      className="grain-surface z-10 w-full pt-20 pb-12 md:py-32"
    >
      {/* Header inside container */}
      <div className="mx-auto max-w-[1280px] w-full px-6 md:px-8">
        <div ref={headerRef} className="flex items-end justify-between gap-4 mb-3">
          <div className="flex flex-col gap-2">
            {/* Anchor to measure left offset for full-bleed carousel */}
            <div ref={anchorRef} className="absolute" aria-hidden />
            <SectionLabel className="mb-1">{t("label")}</SectionLabel>
            <Link href="/works" className="block max-w-3xl">
              <SectionHeading className="text-3xl md:text-6xl text-[var(--black)] font-semibold tracking-title">
                {t("headingTop")}
                <br />
                {t("headingBottom")}
              </SectionHeading>
            </Link>
            <p className="text-sm md:text-lg font-medium text-[var(--muted)] max-w-lg mt-1">
              {t("subtitle")}
            </p>
          </div>

          <Link
            href="/works"
            data-sfx="cta"
            className="hidden md:inline-flex items-center gap-2 shrink-0 rounded-full px-6 py-3 bg-[var(--black)] text-white font-medium text-base transition hover:bg-zinc-800"
          >
            {t("viewAll")}
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>

      {/* Carousel — full bleed */}
      <div
        ref={(el) => {
          viewportRef.current = el;
          emblaRef(el);
        }}
        className={scrollDriven ? "overflow-hidden" : "overflow-hidden px-6 md:px-0"}
      >
        {/* Says up front that the carousel is a cut of the full list. Inside the
            pinned viewport, so it stays while the cards scroll by. */}
        <p
          data-caption
          className={`mx-auto max-w-[1280px] w-full md:px-8 mb-3 flex items-center gap-2 font-mono text-xs uppercase tracking-[0.08em] text-[var(--color-ink-4)] ${scrollDriven ? "px-6" : ""}`}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-accent)]" aria-hidden />
          {t("caption", { count: LATEST.length })}
        </p>

        <div
          ref={trackRef}
          data-embla-track
          className="flex gap-5 will-change-transform"
          style={{ paddingLeft: scrollDriven || !isMobile ? trackOffset : undefined }}
        >
          {LATEST.map((p, i) => (
            // Desktop: the banner's height follows the screen height (36svh,
            // clamped to 240–380px) and the width follows the 1600×707 cover.
            <div
              key={p.id}
              className="shrink-0 w-[calc(100vw-64px)] md:w-[calc(clamp(240px,36svh,380px)*1600/707)]"
              style={(scrollDriven || !isMobile) && i === LATEST.length - 1 ? { marginRight: trackOffset } : undefined}
            >
              <ProjectCard project={p} />
            </div>
          ))}
        </div>

        {/* Progress — inside the pinned viewport so it stays with the cards */}
        <div className={`mx-auto max-w-[1280px] w-full md:px-8 mt-8 flex items-center ${scrollDriven ? "px-6" : ""}`}>
          <div className="relative h-px flex-1 overflow-hidden bg-[var(--color-line-2)]">
            <div
              ref={progressRef}
              className="absolute inset-y-0 left-0 w-full origin-left bg-[var(--color-ink-1)]"
              style={{ transform: `scaleX(${1 / LATEST.length})` }}
            />
          </div>
        </div>

        {/* Rotating statement — pinned with the cards (desktop) */}
        {scrollDriven && (
          <div
            ref={phrasesRef}
            className="mx-auto max-w-[1280px] w-full px-6 md:px-8 mt-8 md:mt-10 flex items-end justify-between gap-6"
          >
            <div className="grid text-sm md:text-lg font-medium text-[var(--muted)]">
              {phraseTexts.map((text, i) => {
                const Icon = PHRASE_ICONS[i];
                return (
                <p
                  key={i}
                  data-phrase
                  className="[grid-area:1/1] max-w-md text-balance"
                  style={i > 0 ? { visibility: "hidden", opacity: 0 } : undefined}
                  aria-hidden={i < phraseTexts.length - 1 || undefined}
                >
                  <Icon
                    data-phrase-icon
                    aria-hidden
                    size={20}
                    className={`${phraseIconClass} ${i === phraseTexts.length - 1 ? "text-[var(--orange)]" : ""}`}
                  />
                  <MaskedWords text={text} />
                  {i === phraseTexts.length - 1 && (
                    <>
                      {" "}
                      <Link href="/works" data-scrub-underline className={linkClass}>
                        <MaskedWords text={phraseLink} />
                      </Link>
                    </>
                  )}
                </p>
                );
              })}
            </div>
            {/* Same CTA as the header's, back at the end of the ride. */}
            <Link
              href="/works"
              data-sfx="cta"
              data-end-cta
              style={{ visibility: "hidden", opacity: 0 }}
              className="inline-flex items-center gap-2 shrink-0 rounded-full px-6 py-3 bg-[var(--black)] text-white font-medium text-base transition hover:bg-zinc-800"
            >
              {t("viewAll")}
              <ArrowRight size={16} />
            </Link>
          </div>
        )}
      </div>

      {/* Footer — texto + CTA (mobile / reduced motion) */}
      <div className="mx-auto max-w-[1280px] w-full px-6 md:px-8 mt-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        {!scrollDriven && (
          <ScrubWords className="text-sm md:text-lg font-medium text-[var(--muted)] max-w-md">
            <BookOpenText aria-hidden size={20} className={`${phraseIconClass} text-[var(--orange)]`} />
            {phraseTexts[phraseTexts.length - 1]}{" "}
            <Link href="/works" data-scrub-underline className={linkClass}>
              {phraseLink}
            </Link>
          </ScrubWords>
        )}
        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/works"
            className="md:hidden inline-flex items-center gap-2 rounded-full px-5 py-2.5 bg-[var(--black)] text-white font-medium text-sm transition hover:bg-zinc-800"
          >
            {t("viewAll")}
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
