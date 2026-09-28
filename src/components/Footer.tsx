// components/Footer.tsx
"use client";

import {
  ArrowUp,
  ArrowUpRight,
  BehanceLogo,
  GithubLogo,
  LinkedinLogo,
  Envelope,
} from "@/components/icons";
import { useEffect, useRef, useState } from "react";

import CtaTunnel from "./motion/CtaTunnel";
import Image from "next/image";
import Link from "next/link";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { getLenis, setupGsap } from "@/lib/motion";
import SectionLabel from "./SectionLabel";
import gsap from "gsap";

type FooterLink = { label: string; href: string };
type SocialLink = { label: string; href: string; icon: React.ReactNode };

type FooterProps = {
  className?: string;
  quickLinks?: FooterLink[];
  social?: SocialLink[];
  email?: string;
  contactEmail?: string;
};

export default function Footer({
  className = "",
  email = "hello @jesus",
  contactEmail = "jesushernandez120491@gmail.com",
  quickLinks = [
    { label: "Home", href: "/" },
    { label: "Projects", href: "/works" },
  ],
  social = [
    {
      label: "LinkedIn",
      href: "https://www.linkedin.com/in/jesushernandez91/",
      icon: <LinkedinLogo />,
    },
    {
      label: "Behance",
      href: "https://www.behance.net/devjesushernandez#",
      icon: <BehanceLogo />,
    },
    {
      label: "GitHub",
      href: "https://github.com/jesus0091",
      icon: <GithubLogo />,
    },
  ],
}: FooterProps) {
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const footerRef = useRef<HTMLElement | null>(null);
  const ctaBtnRef = useRef<HTMLAnchorElement | null>(null);
  const wordmarkRef = useRef<HTMLParagraphElement | null>(null);
  const wordmarkBoxRef = useRef<HTMLDivElement | null>(null);

  const [localTime, setLocalTime] = useState<string | null>(null);

  useEffect(() => setYear(new Date().getFullYear()), []);

  // Live Buenos Aires clock; client-only to avoid a hydration mismatch.
  useEffect(() => {
    const fmt = new Intl.DateTimeFormat("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "America/Argentina/Buenos_Aires",
    });
    const tick = () => setLocalTime(fmt.format(new Date()));
    tick();
    const id = window.setInterval(tick, 15_000);
    return () => window.clearInterval(id);
  }, []);

  const scrollToTop = () => {
    const lenis = getLenis();
    if (lenis) lenis.scrollTo(0, { duration: 1.6 });
    else window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    if (typeof window === "undefined") return;

    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reduce) return;

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      const footer = footerRef.current!;
      const label = footer.querySelector<HTMLElement>("[data-cta-label]");
      const title = footer.querySelector<HTMLElement>("[data-cta-title]");
      const ctas = footer.querySelectorAll<HTMLElement>("[data-cta]");
      const cols = footer.querySelectorAll<HTMLElement>("[data-footer-col]");
      const glow = footer.querySelector<HTMLElement>("[data-aurora]");
      const inner = footer.querySelector<HTMLElement>("[data-footer-inner]");
      const body = footer.querySelector<HTMLElement>("[data-footer-body]");

      // Curtain reveal: content counter-scrolls so the page seems to slide off it.
      gsap.matchMedia().add("(min-width: 768px)", () => {
        gsap.from(inner, {
          yPercent: -100,
          ease: "none",
          scrollTrigger: {
            trigger: body,
            start: "clamp(top bottom)",
            end: "clamp(top top)",
            scrub: true,
          },
        });
      });

      // Estado inicial
      gsap.set([label, title, ...ctas, ...cols], {
        opacity: 0,
        y: 18,
        willChange: "opacity, transform",
      });
      if (glow)
        gsap.set(glow, {
          opacity: 0.0,
          scale: 0.98,
          willChange: "opacity, transform",
        });

      // Timeline principal (reversible)
      const tl = gsap.timeline({
        defaults: { ease: "power3.out" },
        scrollTrigger: {
          trigger: footer,
          start: "top 78%",
          end: "bottom 40%",
          toggleActions: "play reverse play reverse", // 🔁 ambos sentidos
        },
      });

      if (glow)
        tl.to(
          glow,
          { opacity: 1, duration: 0.8, scale: 1, ease: "power2.out" },
          0
        );
      if (label) tl.to(label, { opacity: 1, y: 0, duration: 0.5 }, 0.05);

      if (title) {
        tl.to(title, { opacity: 1, y: 0, duration: 0.7 }, 0.2);
        tl.fromTo(
          title,
          { filter: "brightness(1.05)" },
          { filter: "brightness(1)", duration: 0.6, ease: "power1.out" },
          "-=0.4"
        );
      }

      if (ctas.length) {
        tl.to(
          ctas,
          { opacity: 1, y: 0, duration: 0.6, stagger: 0.08 },
          0.4
        ).fromTo(
          ctas,
          { scale: 0.96 },
          { scale: 1, duration: 0.35, stagger: 0.06 },
          "-=0.4"
        );
      }

      if (cols.length) {
        gsap.to(cols, {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.08,
          ease: "power3.out",
          scrollTrigger: { trigger: body, start: "top 85%", toggleActions: "play none none reverse" },
        });
      }

      const burst = () => {
        ctas.forEach((btn, i) => {
          let halo = btn.querySelector<HTMLElement>("span[data-halo]");
          if (!halo) {
            halo = document.createElement("span");
            halo.setAttribute("data-halo", "");
            halo.className =
              "pointer-events-none absolute inset-0 rounded-xl opacity-0";
            (btn as HTMLElement).style.position = "relative";
            btn.appendChild(halo);
          }
          gsap.fromTo(
            halo,
            { opacity: 0, clipPath: "inset(50% 50% 50% 50% round 12px)" },
            {
              opacity: 0.25,
              clipPath: "inset(0% 0% 0% 0% round 12px)",
              background:
                "radial-gradient(120% 120% at 50% 50%, rgba(232, 232, 232, 0.18), rgba(255,255,255,0) 55%)",
              duration: 0.6,
              ease: "power2.out",
              delay: 0.15 + i * 0.05,
              onComplete: () => {
                gsap.to(halo as HTMLElement, { opacity: 0, duration: 0.6 });
              },
            }
          );
        });
      };

      ScrollTrigger.create({
        trigger: footer,
        start: "top 78%",
        end: "bottom 40%",
        onEnter: () => {
          burst();
        },
        onEnterBack: () => {
          burst();
        },
      });
    }, footerRef);

    return () => ctx.revert();
  }, []);
  useEffect(() => {
    const text = wordmarkRef.current;
    const box = wordmarkBoxRef.current;
    if (!text || !box) return;

    // Fit the wordmark exactly to the container width.
    let lastWidth = 0;
    const fit = () => {
      if (box.clientWidth === lastWidth) return;
      lastWidth = box.clientWidth;
      text.style.fontSize = "100px";
      const w = text.offsetWidth;
      if (w) text.style.fontSize = `${(100 * box.clientWidth) / w}px`;
      ScrollTrigger.refresh();
    };

    let split: SplitText | null = null;
    let tween: gsap.core.Tween | null = null;
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setupGsap();
      split = SplitText.create(text, { type: "chars" });
      // Char boxes are only 0.8em tall (leading-[0.8]) but glyphs + accents
      // reach ~1em above the baseline, so push well past the box to hide them.
      tween = gsap.from(split.chars, {
        yPercent: 180,
        ease: "none",
        stagger: 0.06,
        // The body wrapper isn't transformed by the curtain, so its
        // positions are stable. Letters land a little before the page end,
        // clamped to the max scroll: ending exactly on the last pixel left
        // the last letters short whenever the page height was off by a few
        // pixels (rounding, late fonts, subpixel layout).
        scrollTrigger: {
          trigger: box.closest("[data-footer-body]"),
          start: "center bottom",
          end: "clamp(bottom bottom+=48)",
          scrub: true,
        },
      });
    }

    fit();
    document.fonts?.ready.then(() => {
      lastWidth = 0;
      fit();
    });
    const ro = new ResizeObserver(fit);
    ro.observe(box);

    return () => {
      ro.disconnect();
      tween?.scrollTrigger?.kill();
      tween?.kill();
      split?.revert();
    };
  }, []);

  useEffect(() => {
    const btn = ctaBtnRef.current;
    if (!btn) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    const magnetRadius = 120;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = btn.getBoundingClientRect();
      const btnCenterX = rect.left + rect.width / 2;
      const btnCenterY = rect.top + rect.height / 2;
      const distX = e.clientX - btnCenterX;
      const distY = e.clientY - btnCenterY;
      const dist = Math.sqrt(distX * distX + distY * distY);

      if (dist < magnetRadius) {
        const strength = (magnetRadius - dist) / magnetRadius;
        gsap.to(btn, {
          x: distX * strength * 0.4,
          y: distY * strength * 0.4,
          duration: 0.3,
          ease: "power2.out",
        });
      } else {
        gsap.to(btn, { x: 0, y: 0, duration: 0.5, ease: "elastic.out(1, 0.5)" });
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <footer
      ref={footerRef}
      id="contact"
      className={`relative flex flex-col ${className}`}
    >
      <CtaTunnel>
        <div className="flex flex-col items-center gap-4 text-center px-6">
          <div data-cta-label className="[&_span]:text-white/80 [&_span[aria-hidden]]:bg-white/50">
            <SectionLabel align="center">From Concept to Code</SectionLabel>
          </div>
          <h3
            data-cta-title
            className="text-3xl sm:text-4xl md:text-7xl font-semibold tracking-tight text-white [text-shadow:0_2px_24px_rgba(15,23,42,0.45)]"
          >
            Let&apos;s build something <br /> great together
          </h3>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
            <Link
              ref={ctaBtnRef}
              href={`mailto:${contactEmail}`}
              data-cta
              data-sfx="cta"
              className="relative inline-flex items-center rounded-full gap-2 border border-white/20 bg-[#050b3a]/60 px-6 py-3 text-base cursor-pointer font-medium text-white hover:bg-white/10 transition active:scale-[0.96]"
              aria-label="Send me an email"
            >
              <Envelope size={18} />
              {email}
            </Link>
          </div>
        </div>
      </CtaTunnel>

      <div data-footer-body className="overflow-hidden">
      <div data-footer-inner>
      {/* Cuerpo */}
      <div className="z-10 flex flex-col pt-16 md:pt-24">
        <div className="w-full max-w-[1280px] mx-auto px-6 md:px-8">
          <div className="grid grid-cols-2 md:grid-cols-12 gap-x-6 gap-y-10">
            <div data-footer-col className="col-span-2 md:col-span-5 flex items-start gap-4">
              <Link href="/" aria-label="Go to home" className="shrink-0">
                <Image
                  src={"/images/facebrand.png"}
                  className="border border-black/10 rounded-lg bg-black/5 object-contain"
                  width={48}
                  height={48}
                  alt="Logo"
                />
              </Link>
              <p className="text-base text-[var(--color-ink-3)] leading-relaxed max-w-sm">
                AI-Driven Engineer &amp; Product Designer. I build cohesive,
                scalable and delightful digital products.
              </p>
            </div>

            <nav data-footer-col aria-label="Footer" className="md:col-span-2 md:col-start-7 flex flex-col gap-3">
              <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-ink-4)]">
                Navigation
              </h4>
              <ul className="flex flex-col gap-2">
                {quickLinks.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="text-base text-[var(--color-ink-3)] hover:text-[var(--color-ink-1)] transition-colors"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <div data-footer-col className="md:col-span-2 flex flex-col gap-3">
              <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-ink-4)]">
                Connect
              </h4>
              <ul className="flex flex-col gap-2">
                {social.map((s) => (
                  <li key={s.label}>
                    <Link
                      href={s.href}
                      target="_blank"
                      rel="noreferrer"
                      className="group inline-flex items-center gap-1 text-base text-[var(--color-ink-3)] hover:text-[var(--color-ink-1)] transition-colors"
                    >
                      {s.label}
                      <ArrowUpRight
                        size={14}
                        className="opacity-0 -translate-x-1 transition duration-200 ease-out group-hover:opacity-100 group-hover:translate-x-0"
                      />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div data-footer-col className="md:col-span-2 flex flex-col gap-3">
              <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-ink-4)]">
                Location
              </h4>
              <p className="text-base text-[var(--color-ink-3)]">Argentina</p>
              <p className="text-base tabular-nums text-[var(--color-ink-1)]">
                {localTime ? `${localTime} ART` : "\u00a0"}
              </p>
            </div>
          </div>
        </div>

        {/* Wordmark: sized to fill the container, letters rise in with scroll */}
        <div className="mt-16 md:mt-24 w-full max-w-[1280px] mx-auto px-6 md:px-8">
          <div ref={wordmarkBoxRef} className="overflow-hidden pt-[0.1em]">
            <p
              ref={wordmarkRef}
              className="inline-block whitespace-nowrap font-semibold tracking-[-0.05em] leading-[0.8] text-[var(--black)] text-[12vw] md:text-[10vw] pb-[0.12em]"
            >
              Jesús Hernández
            </p>
          </div>
        </div>

        <div
          data-footer-col
          className="w-full flex flex-col-reverse pb-6 md:pb-8 max-w-[1280px] mx-auto px-6 md:px-8 sm:flex-row items-center justify-between gap-3 pt-5 relative before:absolute before:top-0 before:inset-x-6 md:before:inset-x-8 before:h-px before:bg-black/15"
        >
          <p className="text-sm text-center text-[var(--color-ink-3)]">
            © {year} Jesús Hernández. All rights reserved.
          </p>
          <button
            type="button"
            onClick={scrollToTop}
            className="group inline-flex items-center gap-1.5 text-sm text-[var(--color-ink-3)] hover:text-[var(--color-ink-1)] transition-colors"
          >
            Back to top
            <ArrowUp
              size={14}
              className="transition-transform duration-200 ease-out group-hover:-translate-y-0.5"
            />
          </button>
        </div>
      </div>
      </div>
      </div>
      <div className="dark-bottom-sentinel h-10 w-full absolute bottom-0" />
    </footer>
  );
}
