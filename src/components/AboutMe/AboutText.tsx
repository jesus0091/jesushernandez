"use client";

import {
  ArrowRight,
  BehanceLogo,
  GithubLogo,
  LinkedinLogo,
} from "@/components/icons";
import React, { useLayoutEffect, useRef } from "react";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { ButtonInner, buttonClass } from "@/components/PillButton";
import { Link } from "@/i18n/navigation";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SectionHeading from "../motion/SectionHeading";
import SectionLabel from "../SectionLabel";
import gsap from "gsap";
import { useRecede } from "../motion/useRecede";

type AboutTextProps = {
  pinDistance?: number;
  wordStagger?: number;
  wordDuration?: number;
  wordOffsetY?: number;
};

const AboutText: React.FC<AboutTextProps> = ({
  pinDistance = 60,
  wordStagger = 0.03,
  wordDuration = 0.35,
  wordOffsetY = 10,
}) => {
  const sectionRef = useRef<HTMLElement | null>(null);
  const paraRef = useRef<HTMLParagraphElement | null>(null);
  const boxRef = useRef<HTMLDivElement | null>(null);
  const rightColRef = useRef<HTMLDivElement | null>(null);
  const gridRef = useRef<HTMLDivElement | null>(null);

  useRecede(sectionRef, gridRef);
  const t = useTranslations("about");
  const tSocial = useTranslations("home");
  // The paragraph marks its bold phrases with <b>…</b>.
  const segments = (t.raw("body") as string)
    .split(/(<b>.*?<\/b>)/)
    .filter(Boolean)
    .map((part) =>
      part.startsWith("<b>")
        ? { text: part.slice(3, -4), bold: true }
        : { text: part, bold: false }
    );

  useLayoutEffect(() => {
    if (typeof window === "undefined") return;

    gsap.registerPlugin(ScrollTrigger);

    const reduce =
      window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;

    const ctx = gsap.context(() => {
      const section = sectionRef.current!;
      const para = paraRef.current!;
      const box = boxRef.current!;
      const words = Array.from(para.querySelectorAll<HTMLElement>("[data-word]"));

      if (reduce) {
        gsap.set([box, words], { opacity: 1, x: 0, y: 0, clipPath: "none", scale: 1, rotateX: 0, yPercent: 0 });
        return;
      }

      gsap.set(box,   { clipPath: "inset(100% 0 0 0)", willChange: "transform,opacity" });

      gsap.timeline({
        defaults: { ease: "power3.out" },
        scrollTrigger: {
          trigger: section,
          start: "top 80%",
          once: true,
        },
      })
        .to(box,   { clipPath: "inset(0% 0 0 0)", duration: 0.9, ease: "power4.out" }, 0);

      // Text "writes itself": words go from faint to full ink, scrubbed with scroll.
      const writeIn = gsap.fromTo(
        words,
        { opacity: 0.15 },
        {
          opacity: 1,
          stagger: 0.1,
          ease: "none",
          immediateRender: false,
          scrollTrigger: { trigger: para, start: "top 95%", end: "center center", scrub: true },
        }
      );
      // The faint start is the effect's first frame, not the text's resting
      // state: apply it only as the paragraph reaches the screen, so the page
      // loads with full-contrast text.
      ScrollTrigger.create({
        trigger: para,
        start: "top bottom",
        once: true,
        onEnter: () => {
          if (!writeIn.scrollTrigger?.progress) gsap.set(words, { opacity: 0.15 });
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [pinDistance, wordStagger, wordDuration, wordOffsetY]);

  return (
    <section
      ref={sectionRef}
      id="about"
      className="relative scroll-mt-20 pt-28 pb-20 md:pt-40 md:pb-28 flex gap-16 flex-col items-center justify-center"
    >
      <div ref={gridRef} className="relative grid grid-cols-1 md:grid-cols-2 max-w-[1280px] w-full px-6 md:px-8 gap-4 md:gap-10 mx-auto">
        <div className="flex-1 flex h-full w-full items-center justify-center">
          {/* Phones get a short band framed on the face; from md up it fills the column. */}
          <div
            ref={boxRef}
            className="relative rounded-card w-full overflow-hidden aspect-[16/10] md:aspect-auto md:min-h-full"
          >
            <Image
              src="/images/about_me.webp"
              alt="Jesús Hernández"
              fill
              className="object-cover object-[50%_20%] md:object-top"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            {/* Film grain over the portrait, like the rest of the page. */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-[image:var(--grain-image)] bg-[size:var(--grain-size)_var(--grain-size)] opacity-75 mix-blend-overlay"
            />
            <div className="absolute bottom-0 left-0 right-0 flex flex-row gap-1 p-3 md:p-4 justify-end">
              <Link
                href="https://www.linkedin.com/in/jesushernandez91/"
                data-sfx="social"
                target="_blank"
                rel="noopener noreferrer"
                aria-label={tSocial("linkedin")}
                className="flex w-10 h-10 md:w-12 md:h-12 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-colors"
              >
                <LinkedinLogo />
              </Link>
              <Link
                href="https://github.com/jesus0091"
                data-sfx="social"
                target="_blank"
                rel="noopener noreferrer"
                aria-label={tSocial("github")}
                className="flex w-10 h-10 md:w-12 md:h-12 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-colors"
              >
                <GithubLogo />
              </Link>
              <Link
                href="https://www.behance.net/devjesushernandez"
                data-sfx="social"
                target="_blank"
                rel="noopener noreferrer"
                aria-label={tSocial("behance")}
                className="flex w-10 h-10 md:w-12 md:h-12 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-colors"
              >
                <BehanceLogo />
              </Link>
            </div>
          </div>
        </div>

        <div ref={rightColRef} className="relative flex-1 flex flex-col gap-6 py-4">

          <div className="flex flex-col gap-3">
            <SectionLabel>{t("label")}</SectionLabel>
            <SectionHeading className="select-none max-md:text-balance text-2xl sm:text-3xl md:text-6xl leading-tighter font-semibold tracking-title text-[var(--black)]">
              {t("heading")}
            </SectionHeading>
          </div>
          <p
            ref={paraRef}
            className="flex flex-wrap gap-y-1 gap-x-1.5 md:gap-1.5 text-base md:text-lg font-medium text-[var(--muted)]"
          >
            {segments.map((seg, si) =>
              seg.text.trim().split(" ").map((w, wi) => (
                <span
                  key={`${si}-${wi}`}
                  data-word
                  className={seg.bold ? "text-[var(--black)]" : ""}
                >
                  {w}
                </span>
              ))
            )}
          </p>
          <Link href="/works" data-sfx="cta" className={buttonClass()}>
            <ButtonInner icon={ArrowRight}>{t("cta")}</ButtonInner>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default AboutText;
