"use client";

import { getLenis, prefersReducedMotion, setupGsap } from "@/lib/motion";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

import { BrushSvg, brushIn, brushOut, playEased } from "./Brush";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
import { destinationName } from "./destination";
import { stripLocale } from "@/i18n/paths";
import { transition as en } from "../../../messages/en.json";
import { transition as es } from "../../../messages/es.json";

// If the new page never arrives (a failed navigation), uncover anyway.
const FAILSAFE_MS = 5000;
// The destination's name stays up at least this long, so it can be read
// even when the page is ready at once.
const MIN_LABEL_MS = 250;
// Same alphabet as the skills tags' decode.
const CHARS = "abcdefghijklmnopqrstuvwxyz<>/{}#_";

// The name is shown in the destination's language, which may not be the
// current one (the language switch), so it reads the messages directly.
const PAGES = { en: en.pages, es: es.pages };
const pageName = (locale: "en" | "es") => (key: string) =>
  PAGES[locale][key.replace("pages.", "") as keyof typeof en.pages];

/**
 * Page-to-page transition, with the site's brush and no signature: an
 * internal link click paints the brush over the screen, the route changes
 * underneath it, and the brush lifts off to reveal the new page. The
 * signature stays for the first load only (IntroOverlay).
 */
export default function PageTransition() {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  // True from the click until the new page is revealed.
  const covering = useRef(false);
  const failsafe = useRef<number | null>(null);
  const labelRef = useRef<HTMLParagraphElement | null>(null);
  const labelAt = useRef(0);

  const reveal = async () => {
    const wrap = wrapRef.current;
    if (!wrap || !covering.current) return;
    if (failsafe.current) window.clearTimeout(failsafe.current);
    failsafe.current = null;
    const wait = MIN_LABEL_MS - (performance.now() - labelAt.current);
    if (wait > 0) await new Promise((r) => setTimeout(r, wait));
    // The new page starts at the top, under the brush.
    window.scrollTo(0, 0);
    getLenis()?.scrollTo(0, { immediate: true, force: true });
    getLenis()?.start();
    const gsap = setupGsap();
    gsap.to(labelRef.current, { autoAlpha: 0, y: -8, duration: 0.2, ease: "power2.in" });
    await playEased(brushOut(wrap), 0.55, "sine.inOut");
    wrap.style.visibility = "hidden";
    covering.current = false;
  };

  // Intercept internal link clicks: cover first, then navigate.
  useEffect(() => {
    if (prefersReducedMotion()) return;
    const onClick = async (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest?.("a");
      if (!a || (a.target && a.target !== "_self") || a.hasAttribute("download")) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin) return;
      // Same page (a hash, or the page you're on): no transition.
      if (url.pathname === location.pathname) return;
      const wrap = wrapRef.current;
      if (!wrap || covering.current) return;

      // Runs before Next's Link handler (capture on the document), which
      // then sees the event as handled and leaves the navigation to us.
      e.preventDefault();
      covering.current = true;
      getLenis()?.stop();
      const href = url.pathname + url.search + url.hash;
      // The page loads while the brush covers the screen, not after.
      router.prefetch(href);
      wrap.style.visibility = "visible";
      await playEased(brushIn(wrap), 0.45, "power2.inOut");
      // On the black: where you're going, decoding like the skills tags.
      const label = labelRef.current;
      if (label) {
        const gsap = setupGsap();
        gsap.registerPlugin(ScrambleTextPlugin);
        const name = destinationName(url.pathname, pageName(stripLocale(url.pathname).locale));
        labelAt.current = performance.now();
        gsap.set(label, { autoAlpha: 1, y: 0 });
        gsap.fromTo(
          label,
          { scrambleText: { text: name.replace(/\S/g, "_"), chars: CHARS } },
          { scrambleText: { text: name, chars: CHARS, speed: 0.8 }, duration: 0.25, ease: "none" }
        );
      }
      router.push(href, { scroll: false });
      failsafe.current = window.setTimeout(reveal, FAILSAFE_MS);
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
    // reveal and router are stable for this component's life.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // The new route has rendered under the brush: let it go.
  useEffect(() => {
    if (covering.current) reveal();
  }, [pathname]);

  return (
    <div ref={wrapRef} aria-hidden="true" className="intro" style={{ visibility: "hidden" }}>
      <BrushSvg />
      <p
        ref={labelRef}
        className="invisible absolute inset-0 m-auto h-fit w-fit font-mono text-2xl md:text-3xl uppercase tracking-[0.08em] text-white/45"
      />
    </div>
  );
}
