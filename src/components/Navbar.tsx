"use client";

import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import { getLenis } from "@/lib/motion";
import { Envelope } from "@/components/icons";
import SoundToggle from "@/components/SoundToggle";
import MotionToggle from "@/components/MotionToggle";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { usePathname } from "@/i18n/navigation";
import { useLocale, useTranslations } from "next-intl";
import { contactHref } from "@/lib/contact";
import type { Locale } from "@/i18n/routing";
import LocaleSwitch from "@/components/LocaleSwitch";
import { pathInLocale } from "@/i18n/slugs";
import gsap from "gsap";

// Lab is hidden until it has its first entries (the page still exists, out of
// the index); bring it back by moving it into the list.
const links = [
  { href: "/works", key: "works", sectionId: undefined },
  { href: "/services", key: "services", sectionId: undefined },
  { href: "/blog", key: "blog", sectionId: undefined },
] as const;
// const hidden = [{ href: "/lab", key: "lab", sectionId: undefined }];

// Vertical center of the navbar; a dark section counts once it covers it.
const NAV_PROBE_Y = 36;

function isDarkBehindNav() {
  const els = document.querySelectorAll<HTMLElement>(
    '[data-nav-dark]:not([data-nav-dark="false"])'
  );
  for (const el of els) {
    const r = el.getBoundingClientRect();
    if (r.top <= NAV_PROBE_Y && r.bottom >= NAV_PROBE_Y) return true;
  }
  return false;
}

// A section can ask the navbar to drop its background while it sits behind it:
// "true" just goes transparent (the CTA tunnel grows up under it); "blend" also
// blends the links with `difference` (the brush handoff in WSMAQuote paints
// between the background and the links, half cream and half black).
type Clear = false | "true" | "blend";
function clearBehindNav(): Clear {
  for (const el of document.querySelectorAll<HTMLElement>('[data-nav-clear="true"], [data-nav-clear="blend"]')) {
    const r = el.getBoundingClientRect();
    if (r.top <= NAV_PROBE_Y && r.bottom >= NAV_PROBE_Y) return el.dataset.navClear as Clear;
  }
  return false;
}

export default function Navbar() {
  const headerRef = useRef<HTMLElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const scrollYRef = useRef(0);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const menuButtonRef = useRef<HTMLButtonElement | null>(null);
  const wasOpen = useRef(false);
  const prevBodyPaddingRightRef = useRef<string>("");

  const [open, setOpen] = useState(false);
  const [elevated, setElevated] = useState(false);
  // True while a dark section ([data-nav-dark]) sits behind the navbar.
  const [dark, setDark] = useState(false);
  const [clear, setClear] = useState<Clear>(false);
  // While blending, the header is drawn in its light (dark-section) colors:
  // white inverts whatever is behind it, so it reads on the cream and on the
  // brush alike.
  const blend = clear === "blend";
  const light = dark || blend;
  const [activeSection, setActiveSection] = useState<string>("hero");
  // Without the locale prefix, so it compares with the links' hrefs.
  const pathname = usePathname();
  const t = useTranslations("nav");
  const locale = useLocale() as Locale;
  // Spanish pages have Spanish URLs (/servicios), so the links skip the redirect.
  const navLinks = links.map((link) => ({ ...link, href: pathInLocale(link.href, "en", locale) }));

  // A link to the page you're already on does nothing in Next: take it to
  // the top instead.
  // (The mobile menu restores the scroll position as it closes, so it waits
  // a frame for that first.)
  const onSamePage = (href: string, afterClose = false) => (e: React.MouseEvent) => {
    if (pathname !== href) return;
    e.preventDefault();
    const toTop = () => {
      const lenis = getLenis();
      if (lenis) lenis.scrollTo(0);
      else window.scrollTo({ top: 0, behavior: "smooth" });
    };
    if (afterClose) requestAnimationFrame(() => requestAnimationFrame(toTop));
    else toTop();
  };

  const getScrollbarW = () =>
    typeof window === "undefined"
      ? 0
      : window.innerWidth - document.documentElement.clientWidth;

  const lockScroll = useCallback(() => {
    if (typeof window === "undefined") return;
    const body = document.body;
    const sbw = getScrollbarW();
    scrollYRef.current = window.scrollY || 0;
    prevBodyPaddingRightRef.current = body.style.paddingRight;
    if (sbw > 0) body.style.paddingRight = `${sbw}px`;
    body.style.position = "fixed";
    body.style.top = `-${scrollYRef.current}px`;
    body.style.left = "0";
    body.style.right = "0";
    body.style.width = "100%";
    body.style.overflow = "hidden";
    getLenis()?.stop();
  }, []);

  const unlockScroll = useCallback(() => {
    if (typeof window === "undefined") return;
    const body = document.body;
    body.style.position = "";
    body.style.top = "";
    body.style.left = "";
    body.style.right = "";
    body.style.width = "";
    body.style.overflow = "";
    body.style.paddingRight = prevBodyPaddingRightRef.current || "";
    window.scrollTo(0, scrollYRef.current || 0);
    getLenis()?.start();
  }, []);

  useEffect(() => {
    if (open) {
      lockScroll();
      const items = overlayRef.current?.querySelectorAll<HTMLElement>(".menu-item");
      if (items?.length) {
        gsap.fromTo(
          Array.from(items),
          { y: 50, opacity: 0 },
          { y: 0, opacity: 1, stagger: 0.07, duration: 0.55, ease: "power3.out", delay: 0.3 }
        );
      }
    } else {
      unlockScroll();
    }
    return () => { unlockScroll(); };
  }, [open, lockScroll, unlockScroll]);

  // Keyboard: opening moves focus into the menu and keeps it there (with the
  // close button); closing hands it back to the button (WCAG 2.4.3, 2.1.2).
  useEffect(() => {
    const overlay = overlayRef.current;
    const button = menuButtonRef.current;
    if (!open) {
      if (wasOpen.current) button?.focus();
      wasOpen.current = false;
      return;
    }
    wasOpen.current = true;
    const focusables = () => [
      ...(overlay?.querySelectorAll<HTMLElement>("a[href], button:not([disabled])") ?? []),
      ...(button ? [button] : []),
    ];
    focusables()[0]?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const list = focusables();
      const i = list.indexOf(document.activeElement as HTMLElement);
      const next = e.shiftKey ? (i <= 0 ? list.length - 1 : i - 1) : (i === list.length - 1 ? 0 : i + 1);
      e.preventDefault();
      list[next]?.focus();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const onScroll = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      setElevated(window.scrollY > 8);
      setDark(isDarkBehindNav());
      setClear(clearBehindNav());
    });
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener("keydown", onKey);
    };
  }, [onScroll]);

  useEffect(() => {
    const sectionIds = ["hero", "projects", "about", "contact"];
    const observers: IntersectionObserver[] = [];
    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveSection(id); },
        { rootMargin: "-30% 0px -60% 0px", threshold: 0 }
      );
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach((o) => o.disconnect());
  }, []);

  return (
    <Fragment>
      {/* ── Desktop header ── */}
      <header
        ref={headerRef}
        className={[
          "w-full hidden md:block fixed top-0 left-0 right-0 z-50",
          "transition-all duration-300 ease-out",
          blend && "mix-blend-difference",
          !elevated || clear
            ? "bg-transparent border-b border-transparent"
            : dark
              ? "bg-[var(--color-ink-1)] border-b border-white/[0.08]"
              : "grain-surface border-b border-black/[0.08]",
        ].filter(Boolean).join(" ")}
      >
        <nav className="max-w-[1280px] mx-auto px-6 lg:px-8 flex items-center justify-between h-[72px]">
          <div className="flex items-center gap-3 lg:gap-4">
            <Link
              href="/"
              className={[
                "flex items-center gap-2.5 font-semibold shrink-0 transition-colors duration-300",
                light ? "text-white" : "text-[var(--black)]",
              ].join(" ")}
            >
              {/* The face is drawn by the layer below the header, outside the blend. */}
              <span aria-hidden className="w-10 h-10 shrink-0" />
              <span className="text-lg font-semibold tracking-tight">
                Jesús Hernández
              </span>
            </Link>

            <span
              aria-hidden
              className={[
                "text-lg font-light transition-colors duration-300",
                light ? "text-white/50" : "text-[var(--color-ink-4)]",
              ].join(" ")}
            >
              /
            </span>

            <ul className="flex items-center gap-1">
              {navLinks.map((link) => {
                const selected = activeSection === link.sectionId;
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      onClick={onSamePage(link.href)}
                      data-sfx="nav"
                      aria-current={selected ? "page" : undefined}
                      className={[
                        // Set like the section eyebrows (SectionLabel): caps, wide tracking.
                        "px-2.5 lg:px-4 py-2 rounded-full text-xs font-mono font-medium uppercase tracking-[0.08em] transition-all duration-200",
                        light
                          ? selected
                            ? "text-white bg-white/15"
                            : "text-white/70 hover:text-white hover:bg-white/10"
                          : selected
                            ? "text-[var(--black)] bg-black/[0.08]"
                            : "text-[var(--muted)] hover:text-[var(--black)] hover:bg-black/[0.05]",
                      ].join(" ")}
                    >
                      {t(link.key)}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="flex items-center gap-2">
            <LocaleSwitch light={light} />
            <MotionToggle dark={light} />
            <SoundToggle dark={light} />
            <Link
              href={contactHref(locale)}
              data-sfx="cta"
              className={[
                "flex items-center gap-2 whitespace-nowrap rounded-full font-medium transition-all duration-300 px-4 lg:px-5 py-2 text-[15px]",
                light
                  ? "bg-white text-[var(--black)] hover:bg-white/85"
                  : "bg-[var(--black)] text-white hover:bg-zinc-800",
              ].join(" ")}
            >
              <Envelope size={16} />
              hello @jesus
            </Link>
          </div>
        </nav>
      </header>

      {/* Logo layer: same grid as the header's nav, but outside its blend, so
          the face and its square never invert while the brush passes. */}
      <div aria-hidden className="hidden md:block fixed top-0 left-0 right-0 z-50 pointer-events-none">
        <div className="max-w-[1280px] mx-auto px-6 lg:px-8 flex items-center h-[72px]">
          <Image
            src="/images/facebrand.png"
            alt=""
            className={[
              "border rounded-control object-contain w-10 h-10 transition-colors duration-300",
              dark ? "border-white/20 bg-white/10" : "border-black/10 bg-black/5",
            ].join(" ")}
            width={40}
            height={40}
            priority
          />
        </div>
      </div>

      {/* ── Mobile static header (visible at top) ── */}
      <header
        className="w-full md:hidden flex items-center justify-between px-6 absolute top-0 left-0 right-0 z-10"
        // Clear of the status bar now that the page runs edge to edge.
        style={{ paddingTop: "env(safe-area-inset-top, 0px)", height: "calc(64px + env(safe-area-inset-top, 0px))" }}
      >
        <Link
          href="/"
          className="flex items-center gap-2.5 font-semibold text-[var(--black)] shrink-0"
        >
          {/* The face is the fixed avatar below; this keeps its place. */}
          <span aria-hidden className="w-11 h-11 shrink-0" />
          <span className="text-base font-semibold tracking-tight">
            Jesús Hernández
          </span>
        </Link>
      </header>

      {/* ── Mobile avatar (fixed, always visible, the hamburger's size and level) ── */}
      <Link
        href="/"
        onClick={onSamePage("/")}
        className="md:hidden fixed z-[70]"
        style={{
          top: "calc(env(safe-area-inset-top, 0px) + 12px)",
          left: "calc(env(safe-area-inset-left, 0px) + 24px)",
        }}
      >
        <Image
          src="/images/facebrand.png"
          alt={t("logoAlt")}
          className={[
            "border rounded-control object-contain w-11 h-11 transition-colors duration-300",
            dark || open ? "border-white/20 bg-white/10" : "border-black/10 bg-[var(--color-bg)]",
          ].join(" ")}
          width={44}
          height={44}
          priority
        />
      </Link>

      {/* ── Mobile hamburger button (fixed, always visible) ── */}
      <button
        type="button"
        aria-label={open ? t("closeMenu") : t("openMenu")}
        aria-expanded={open}
        ref={menuButtonRef}
        aria-controls="mobile-fullscreen-menu"
        onClick={() => setOpen((v) => !v)}
        className="md:hidden fixed z-[70] flex items-center justify-center w-11 h-11 rounded-full transition-colors duration-300"
        style={{
          top: "calc(env(safe-area-inset-top, 0px) + 12px)",
          right: "calc(env(safe-area-inset-right, 0px) + 16px)",
          background: open ? "rgba(255,255,255,0.15)" : dark ? "white" : "var(--black)",
          color: open || !dark ? "white" : "var(--black)",
        }}
      >
        <span className="sr-only">{open ? t("closeSr") : t("menuSr")}</span>
        <div className="relative w-5 h-4 flex items-center justify-center">
          <span
            className="absolute block h-[2px] w-5 bg-current rounded-full transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
            style={{ transform: open ? "rotate(45deg) translateY(0)" : "translateY(-6px)" }}
          />
          <span
            className="absolute block h-[2px] bg-current rounded-full transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
            style={{
              width: open ? "0" : "20px",
              opacity: open ? 0 : 1,
            }}
          />
          <span
            className="absolute block h-[2px] w-5 bg-current rounded-full transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
            style={{ transform: open ? "rotate(-45deg) translateY(0)" : "translateY(6px)" }}
          />
        </div>
      </button>

      {/* ── Mobile full-screen overlay ── */}
      <div
        id="mobile-fullscreen-menu"
        ref={overlayRef}
        role="dialog"
        aria-modal="true"
        aria-label={t("menuLabel")}
        // Hidden by a clip-path when closed: keep its links out of the tab order and the a11y tree too.
        inert={!open}
        className="md:hidden fixed inset-0 z-[60] bg-[var(--black)] flex flex-col justify-center px-8 pb-16"
        style={{
          clipPath: open
            ? "circle(150vmax at calc(100% - 36px) 36px)"
            : "circle(0% at calc(100% - 36px) 36px)",
          transition: "clip-path 0.65s cubic-bezier(0.16, 1, 0.3, 1)",
          pointerEvents: open ? "auto" : "none",
        }}
      >
        <nav>
          <ul className="flex flex-col gap-1 mb-12">
            {navLinks.map((link, i) => (
              <li key={link.href} className="menu-item overflow-hidden">
                <Link
                  href={link.href}
                  onClick={(e) => {
                    setOpen(false);
                    onSamePage(link.href, true)(e);
                  }}
                  className="group flex items-baseline gap-4 py-3"
                >
                  <span className="text-white/50 text-xs font-mono tabular-nums w-5 shrink-0">
                    0{i + 1}
                  </span>
                  <span className="text-white text-[clamp(2.5rem,10vw,3.5rem)] font-bold tracking-tight leading-none transition-opacity duration-200 group-hover:opacity-60">
                    {t(link.key)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>

          <div className="menu-item border-t border-white/10 pt-8 flex flex-col gap-6">
            <div className="-ml-2 flex items-center gap-2">
              <LocaleSwitch light />
              <MotionToggle dark />
            </div>
            <Link
              href={contactHref(locale)}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 text-white/50 text-base font-medium hover:text-white transition-colors duration-200"
            >
              <Envelope size={18} />
              jesushernandez120491@gmail.com
            </Link>
          </div>
        </nav>
      </div>
    </Fragment>
  );
}
