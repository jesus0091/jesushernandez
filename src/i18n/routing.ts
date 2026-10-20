import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "es"],
  defaultLocale: "en",
  // English lives at the root, Spanish under /es.
  localePrefix: "as-needed",
  // The visitor picks the language; never redirect by browser or cookie.
  localeDetection: false,
  // No hreflang in a Link header: each page declares its own alternates in
  // <head> (src/i18n/pages.ts). The header listed both languages for every
  // page, contradicting English-only and noindexed ones.
  alternateLinks: false,
});

export type Locale = (typeof routing.locales)[number];
