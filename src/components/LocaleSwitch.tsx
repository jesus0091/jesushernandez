"use client";

import { useLocale, useTranslations } from "next-intl";
import NextLink from "next/link";
import { usePathname } from "@/i18n/navigation";
import { localizePath } from "@/i18n/paths";
import { pathInLocale } from "@/i18n/slugs";
import { routing, type Locale } from "@/i18n/routing";

type Props = {
  className?: string;
  /** Drawn for a dark (or blended) background. */
  light?: boolean;
};

/** EN / ES: the current language is plain text, the other one switches to the same page. */
export default function LocaleSwitch({ className = "", light = false }: Props) {
  const current = useLocale();
  const pathname = usePathname();
  const t = useTranslations("nav");

  return (
    <div
      role="group"
      aria-label={t("language")}
      className={[
        // Set like the navbar links: mono, caps, wide tracking.
        "flex items-center gap-1 text-xs font-mono font-medium uppercase tracking-[0.08em]",
        className,
      ].join(" ")}
    >
      {routing.locales.map((locale, i) => {
        const isCurrent = locale === current;
        const tone = light
          ? isCurrent
            ? "text-white"
            : "text-white/70 hover:text-white hover:bg-white/10"
          : isCurrent
            ? "text-[var(--black)]"
            : "text-[var(--muted)] hover:text-[var(--black)] hover:bg-black/[0.05]";
        return (
          <span key={locale} className="flex items-center gap-1">
            {i > 0 && (
              <span aria-hidden className={light ? "text-white/30" : "text-[var(--color-ink-4)]"}>
                /
              </span>
            )}
            {isCurrent ? (
              <span aria-current="true" className={`px-2 py-2 ${tone}`}>
                {locale}
              </span>
            ) : (
              // Not next-intl's Link: with locale="en" it would point at /en, a redirect.
              <NextLink
                href={localizePath(pathInLocale(pathname, current as Locale, locale), locale)}
                lang={locale}
                data-sfx="nav"
                aria-label={t(`switchTo.${locale}`)}
                className={`px-2 py-2 rounded-full transition-all duration-200 ${tone}`}
              >
                {locale}
              </NextLink>
            )}
          </span>
        );
      })}
    </div>
  );
}
