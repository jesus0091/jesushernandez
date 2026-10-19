import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "es"],
  defaultLocale: "en",
  // English lives at the root, Spanish under /es.
  localePrefix: "as-needed",
  // The visitor picks the language; never redirect by browser or cookie.
  localeDetection: false,
});

export type Locale = (typeof routing.locales)[number];
