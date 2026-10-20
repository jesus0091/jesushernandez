"use client";

import Script from "next/script";
import { useEffect } from "react";

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

// Which contact channel a link opens, if any.
function contactMethod(href: string): string | null {
  if (href.startsWith("mailto:")) return "email";
  if (href.includes("linkedin.com")) return "linkedin";
  if (href.includes("github.com")) return "github";
  if (href.includes("behance.net")) return "behance";
  return null;
}

/**
 * Google Analytics 4, only when NEXT_PUBLIC_GA_ID is set. Loaded once the page
 * is idle so it never competes with the first screen. Contact clicks are sent
 * as a "contact_click" event with the channel and the page they came from.
 */
export default function Analytics() {
  useEffect(() => {
    if (!GA_ID) return;
    const onClick = (e: MouseEvent) => {
      const link = (e.target as Element | null)?.closest?.("a[href]");
      const method = link && contactMethod(link.getAttribute("href") ?? "");
      if (method) window.gtag?.("event", "contact_click", { method, page_path: location.pathname });
    };
    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, []);

  if (!GA_ID) return null;
  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="lazyOnload" />
      <Script id="ga4" strategy="lazyOnload">
        {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}window.gtag=gtag;gtag('js',new Date());gtag('config','${GA_ID}');`}
      </Script>
    </>
  );
}
