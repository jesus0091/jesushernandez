import type { Metadata, Viewport } from "next";

import { notFound } from "next/navigation";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Inter, JetBrains_Mono } from "next/font/google";

import Analytics from "@/components/Analytics";
import BrowserTint from "@/components/BrowserTint";
import IntroOverlay from "@/components/motion/IntroOverlay";
import PageTransition from "@/components/motion/PageTransition";
import SmoothScroll from "@/components/motion/SmoothScroll";
import UiSounds from "@/components/UiSounds";
import { routing } from "@/i18n/routing";
import { PERSON_ID, SITE, absoluteUrl, shareFor } from "@/i18n/seo";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  // Optical sizing: large titles get the display cut, the closest to SF Pro Display.
  axes: ["opsz"],
  display: "swap",
  preload: true,
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
  // Only small labels use it, none visible before the intro ends: not worth
  // competing with the first screen for bandwidth.
  preload: false,
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: "meta" });

  return {
    metadataBase: new URL(SITE),
    title: {
      default: t("siteTitle"),
      template: t("titleTemplate"),
    },
    description: t("description"),
    authors: [{ name: "Jesús Hernández", url: SITE }],
    creator: "Jesús Hernández",
    publisher: "Jesús Hernández",
    robots: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
    ...shareFor("/", locale, { title: t("siteTitle"), description: t("description") }),
    category: "technology",
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // Edge to edge: sections paint behind the status bar and Safari's toolbars
  // too (fixed UI keeps to the safe areas). BrowserTint colors the bars.
  viewportFit: "cover",
  themeColor: "#f4f1ea",
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  // Opt in to static rendering for this locale.
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "meta" });

  // One person entity with a stable @id: the site, and later every article,
  // points at it instead of describing the author again.
  const personJsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": PERSON_ID,
    name: "Jesús Hernández",
    url: `${SITE}/`,
    // Every role he's searched for under, not just the headline one.
    jobTitle: ["Product Engineer", "Product Designer", "Front-End Developer", "Web Developer", "Web Designer"],
    description: t("description"),
    image: `${SITE}/images/about_me.webp`,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Buenos Aires",
      addressCountry: "AR",
    },
    knowsLanguage: ["es", "en"],
    knowsAbout: [
      "Product Engineering",
      "Product Design",
      "Web Design",
      "Web Development",
      "Front-End Development",
      "UX/UI Design",
      "Design Systems",
      "Web Animation",
      "GSAP",
      "React",
      "Next.js",
      "TypeScript",
      "React Native",
      "AI Engineering",
      "AI-assisted Development",
    ],
    sameAs: [
      "https://www.linkedin.com/in/jesushernandez91/",
      "https://github.com/jesus0091",
      "https://www.behance.net/devjesushernandez",
    ],
  };

  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE}/#website`,
    name: "Jesús Hernández",
    url: absoluteUrl("/", locale),
    inLanguage: locale,
    author: { "@id": PERSON_ID },
    publisher: { "@id": PERSON_ID },
  };

  return (
    <html
      lang={locale}
      data-color-scheme="light"
      className={`${inter.variable} ${jetbrainsMono.variable} scrollbar-hide`}
    >
      <body className="antialiased w-full">
        <a href="#main-content" className="skip-link">
          Skip to content
        </a>

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />

        <NextIntlClientProvider>
          <SmoothScroll />
          <UiSounds />
          <IntroOverlay />
          <PageTransition />

          {children}
        </NextIntlClientProvider>
        <BrowserTint />
        <Analytics />
      </body>
    </html>
  );
}
