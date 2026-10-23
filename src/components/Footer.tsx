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
import { useLocale, useTranslations } from "next-intl";
import { CONTACT_EMAIL, contactHref } from "@/lib/contact";
import { pathInLocale } from "@/i18n/slugs";
import type { Locale } from "@/i18n/routing";

import CtaTunnel, { TUNNEL_STOPS } from "./motion/CtaTunnel";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { getLenis, setupGsap } from "@/lib/motion";
import SectionLabel, { LABEL_FROM, LABEL_TO } from "./SectionLabel";
import gsap from "gsap";

// The wordmark is lit by the tunnel's light: a small orange core inside the
// name, top to bottom, fading to the tunnel's blues. The gradient is twice the
// word's width so the core can drift side to side without running out.
const WORDMARK_GRADIENT = `radial-gradient(ellipse 26% 110% at 50% 55%, ${TUNNEL_STOPS})`;
/** How far the core drifts each way, as a fraction of the word's width. */
const WORDMARK_DRIFT = 0.32;
/** Extra painted area above and below each letter, in em (see paint()). */
const WORDMARK_PAD = 0.3;

type FooterLink = { label: string; href: string };
type SocialLink = { label: string; href: string; icon: React.ReactNode };

type FooterProps = {
  className?: string;
  /** "card" drops the tunnel ride and adds the logo and social links to the card. */
  cta?: "tunnel" | "card";
  quickLinks?: FooterLink[];
  social?: SocialLink[];
  contactEmail?: string;
};

export default function Footer({
  className = "",
  cta = "tunnel",
  contactEmail = CONTACT_EMAIL,
  quickLinks,
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
  const t = useTranslations("footer");
  const locale = useLocale() as Locale;
  const tNav = useTranslations("nav");
  const links = quickLinks ?? [
    { label: tNav("home"), href: "/" },
    { label: tNav("works"), href: "/works" },
    { label: tNav("about"), href: pathInLocale("/about", "en", locale) },
    { label: tNav("services"), href: pathInLocale("/services", "en", locale) },
    // Lab is hidden until it has content (see Navbar.tsx).
    { label: tNav("blog"), href: "/blog" },
  ];
  const isCard = cta === "card";
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

  // Phones: the back-to-top link becomes a floating button, shown while the
  // footer's body is on screen.
  const [floatTop, setFloatTop] = useState(false);
  useEffect(() => {
    const body = footerRef.current?.querySelector("[data-footer-body]");
    if (!body) return;
    const io = new IntersectionObserver(([entry]) => setFloatTop(entry.isIntersecting));
    io.observe(body);
    return () => io.disconnect();
  }, []);

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
      const extras = footer.querySelectorAll<HTMLElement>("[data-cta-extra]");
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
      gsap.set([title, ...ctas, ...extras, ...cols], {
        opacity: 0,
        y: 18,
        willChange: "opacity, transform",
      });
      // No own layer for the title: Firefox painted it as a lighter box.
      gsap.set(title, { willChange: "auto" });
      const labelText = label?.querySelectorAll("[data-label-text]") ?? [];
      gsap.set(labelText, LABEL_FROM.text);
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
      tl.to(labelText, { ...LABEL_TO.text, duration: 0.8, ease: "power4.out" }, 0.17);

      if (title) {
        tl.to(title, { opacity: 1, y: 0, duration: 0.7 }, 0.2);
      }

      if (extras.length) {
        tl.to(extras, { opacity: 1, y: 0, duration: 0.6, stagger: 0.25 }, 0.1);
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
              "pointer-events-none absolute inset-0 rounded-control opacity-0";
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

    let split: SplitText | null = null;

    // The tunnel's light, coming down from above into the name. Each letter
    // gets its own slice of one gradient sized to the whole word, so it reads
    // as a single glow even while the letters rise one by one.
    const paint = () => {
      const pad = parseFloat(text.style.fontSize) * WORDMARK_PAD;
      const els = split ? (split.chars as HTMLElement[]) : [text];
      // Char boxes are tighter than the glyphs (0.8em tall, and narrowed by
      // the negative tracking), and the gradient only paints inside the box:
      // extend it on every side so accents and glyph edges aren't cut off,
      // without moving the layout. Set before measuring, so offsets are the
      // padded boxes'.
      if (split)
        for (const el of els) {
          el.style.padding = `${pad}px`;
          el.style.margin = `${-pad}px`;
        }
      const w = text.offsetWidth;
      const h = text.offsetHeight + pad * 2;
      slices = els.map((el) => {
        el.style.backgroundImage = WORDMARK_GRADIENT;
        el.style.backgroundSize = `${w * 2}px ${h}px`;
        el.style.backgroundRepeat = "no-repeat";
        el.style.backgroundClip = "text";
        el.style.webkitBackgroundClip = "text";
        el.style.color = "transparent";
        return { el, x: split ? el.offsetLeft : 0, y: split ? el.offsetTop + pad : 0 };
      });
      wordW = w;
      place();
    };

    // Moves the light: every slice shifts together, so it stays one glow.
    let slices: { el: HTMLElement; x: number; y: number }[] = [];
    let wordW = 0;
    const glow = { drift: 0 };
    const place = () => {
      const dx = glow.drift * WORDMARK_DRIFT * wordW;
      for (const { el, x, y } of slices) el.style.backgroundPosition = `${-x - wordW / 2 + dx}px ${-y}px`;
    };

    // Fit the wordmark exactly to the container width.
    let lastWidth = 0;
    let lastSize = "";
    const fit = () => {
      if (box.clientWidth === lastWidth) return;
      lastWidth = box.clientWidth;
      text.style.fontSize = "100px";
      // The negative tracking also follows the last letter, so the line's box
      // ends before the last glyph's ink: fit the ink (plus a hair for the
      // glyph's own overhang), or the box clips the final letter.
      const tracking = Math.min(0, parseFloat(getComputedStyle(text).letterSpacing) || 0);
      const w = text.offsetWidth - tracking + 2;
      if (w) text.style.fontSize = `${(100 * box.clientWidth) / w}px`;
      paint();
      // Refreshing every trigger is the costliest step of loading the page,
      // so only do it when the size changed. The first fit only moves the
      // name's own trigger (made just below, before the name had its size);
      // later ones change the page's height, which every trigger depends on.
      const size = text.style.fontSize;
      if (size === lastSize) return;
      if (lastSize) ScrollTrigger.refresh();
      else tween?.scrollTrigger?.refresh();
      lastSize = size;
    };

    let tween: gsap.core.Tween | null = null;
    let drift: gsap.core.Tween | null = null;
    let io: IntersectionObserver | null = null;
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setupGsap();
      // The light drifts slowly side to side, only while the name is on screen.
      gsap.set(glow, { drift: -1 });
      drift = gsap.to(glow, { drift: 1, duration: 14, ease: "sine.inOut", repeat: -1, yoyo: true, paused: true, onUpdate: place });
      io = new IntersectionObserver(([entry]) => void (entry.isIntersecting ? drift?.play() : drift?.pause()));
      io.observe(box);
      split = SplitText.create(text, { type: "chars", aria: "none" });
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
      io?.disconnect();
      drift?.kill();
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
      <CtaTunnel still={isCard}>
        <div className="flex flex-col items-center gap-4 text-center px-12 md:px-6">
          {isCard && (
            <Image
              data-cta-extra
              src="/images/facebrand.png"
              className="mb-2 rounded-control border border-white/20 bg-white/10 object-contain"
              width={64}
              height={64}
              alt="Jesús Hernández"
            />
          )}
          <div data-cta-label className="[&_span]:text-white/80 [&_span[aria-hidden]]:bg-white/50">
            <SectionLabel align="center" animate="none" surface="dark">{t("ctaLabel")}</SectionLabel>
          </div>
          <h3
            data-cta-title
            className="text-2xl sm:text-4xl md:text-7xl leading-tighter font-semibold tracking-title text-white"
          >
            {t("ctaTitleTop")} <br /> {t("ctaTitleBottom")}
          </h3>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
            <Link
              ref={ctaBtnRef}
              href={contactEmail === CONTACT_EMAIL ? contactHref(locale) : `mailto:${contactEmail}`}
              data-cta
              data-sfx="cta"
              className="relative inline-flex items-center rounded-full gap-2 border border-white/20 bg-[#050b3a]/60 px-6 py-3 text-base cursor-pointer font-medium text-white hover:bg-white/10 transition active:scale-[0.96]"
              aria-label={t("emailAria")}
            >
              <Envelope size={18} />
              {t("talk")}
            </Link>
          </div>
          {isCard && (
            <ul data-cta-extra className="mt-4 flex items-center gap-3">
              {social.map((s) => (
                <li key={s.label}>
                  <Link
                    href={s.href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={s.label}
                    className="grid h-11 w-11 place-items-center rounded-full border border-white/20 bg-white/5 text-white transition hover:bg-white/15 active:scale-[0.96] [&_svg]:size-5"
                  >
                    {s.icon}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </CtaTunnel>

      <div data-footer-body className="overflow-hidden">
      <div data-footer-inner>
      {/* Cuerpo */}
      <div className="z-10 flex flex-col pt-24">
        <div className="w-full max-w-[1280px] mx-auto px-6 md:px-8">
          <div className="grid grid-cols-2 md:grid-cols-12 gap-x-6 gap-y-10">
            <div data-footer-col className="col-span-2 md:col-span-5">
              <p className="text-base text-[var(--color-ink-3)] leading-relaxed max-w-sm">
                {t("tagline")}
              </p>
            </div>

            <nav data-footer-col aria-label={t("navAria")} className="md:col-span-2 md:col-start-7 flex flex-col gap-3">
              <h4 className="text-xs font-mono font-medium uppercase tracking-[0.08em] text-[var(--color-accent-ink)]">
                {t("navigation")}
              </h4>
              <ul className="flex flex-col gap-2">
                {links.map((l) => (
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
              <h4 className="text-xs font-mono font-medium uppercase tracking-[0.08em] text-[var(--color-accent-ink)]">
                {t("connect")}
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
              <h4 className="text-xs font-mono font-medium uppercase tracking-[0.08em] text-[var(--color-accent-ink)]">
                {t("location")}
              </h4>
              <p className="text-base text-[var(--color-ink-3)]">{t("country")}</p>
              <p className="text-base tabular-nums text-[var(--color-ink-1)]">
                {localTime ? `${localTime} ART` : "\u00a0"}
              </p>
            </div>
          </div>
        </div>

        {/* Wordmark: sized to fill the container, letters rise in with scroll */}
        <div className="mt-16 md:mt-24 w-full max-w-[1280px] mx-auto px-6 md:px-8">
          <div ref={wordmarkBoxRef} className="overflow-hidden pt-[0.1em]">
            {/* Decorative: the name is read in the copyright line below. */}
            <p
              ref={wordmarkRef}
              aria-hidden
              className="relative inline-block whitespace-nowrap font-semibold tracking-[-0.05em] leading-[0.8] text-[var(--black)] text-[12vw] md:text-[10vw] pb-[0.12em]"
            >
              Jesús Hernández
            </p>
          </div>
        </div>

        <div
          data-footer-col
          className="w-full flex flex-col-reverse pb-24 md:pb-8 max-w-[1280px] mx-auto px-6 md:px-8 sm:flex-row items-center justify-between gap-3 pt-5 relative before:absolute before:top-0 before:inset-x-6 md:before:inset-x-8 before:h-px before:bg-black/15"
        >
          <p className="text-sm text-center text-[var(--color-ink-3)]">
            © {year} Jesús Hernández. {t("copyright")}
          </p>
          <button
            type="button"
            onClick={scrollToTop}
            className="group hidden md:inline-flex items-center gap-1.5 text-sm text-[var(--color-ink-3)] hover:text-[var(--color-ink-1)] transition-colors"
          >
            {t("backToTop")}
            <ArrowUp
              size={14}
              className="transition-transform duration-200 ease-out group-hover:-translate-y-0.5"
            />
          </button>
        </div>
        <button
          type="button"
          onClick={scrollToTop}
          aria-label={t("backToTop")}
          tabIndex={floatTop ? undefined : -1}
          style={{ bottom: "calc(env(safe-area-inset-bottom, 0px) + 20px)", right: "calc(env(safe-area-inset-right, 0px) + 20px)" }}
          className={`md:hidden fixed z-50 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--black)] text-white shadow-lg transition-[opacity,translate] duration-300 ease-out ${
            floatTop ? "opacity-100 translate-y-0" : "pointer-events-none opacity-0 translate-y-3"
          }`}
        >
          <ArrowUp size={20} />
        </button>
      </div>
      </div>
      </div>
      <div className="dark-bottom-sentinel h-10 w-full absolute bottom-0" />
    </footer>
  );
}
