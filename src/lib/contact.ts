import type { Locale } from "@/i18n/routing";

export const CONTACT_EMAIL = "jesushernandez120491@gmail.com";

// Visits from AI answers usually arrive without a referrer, so the email asks.
const BODY: Record<Locale, string> = {
  en: "Hi Jesús,\n\n\n\n—\nHow did you find me? (Google / ChatGPT / Perplexity / another AI / LinkedIn / other): ",
  es: "Hola Jesús,\n\n\n\n—\n¿Cómo me encontraste? (Google / ChatGPT / Perplexity / otra IA / LinkedIn / otro): ",
};

/** mailto: link to the contact email, with the "how did you find me?" line filled in. */
export function contactHref(locale: Locale): string {
  return `mailto:${CONTACT_EMAIL}?body=${encodeURIComponent(BODY[locale])}`;
}
