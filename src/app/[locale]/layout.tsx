import type { Metadata, Viewport } from "next";

import { notFound } from "next/navigation";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Inter, JetBrains_Mono } from "next/font/google";

import IntroOverlay from "@/components/motion/IntroOverlay";
import PageTransition from "@/components/motion/PageTransition";
import SmoothScroll from "@/components/motion/SmoothScroll";
import UiSounds from "@/components/UiSounds";
import { routing } from "@/i18n/routing";
import { SITE, absoluteUrl, shareFor } from "@/i18n/seo";

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
  preload: true,
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
    keywords: [
      "Product Engineer",
      "Design Engineer",
      "Product Designer",
      "AI Engineer",
      "Frontend Engineer",
      "Full-Stack Developer",
      "React",
      "Next.js",
      "TypeScript",
      "Portfolio",
      "Web Design",
      "Web Development",
    ],
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

  const personJsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Jesús Hernández",
    url: SITE,
    jobTitle: "Product Engineer & Designer",
    description: t("description"),
    inLanguage: locale,
    image: `${SITE}/images/about_me.webp`,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Buenos Aires",
      addressCountry: "AR",
    },
    knowsAbout: [
      "Product Design",
      "UX/UI Design",
      "Design Systems",
      "React",
      "Next.js",
      "TypeScript",
      "React Native",
      "AI Engineering",
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
    name: "Jesús Hernández",
    url: absoluteUrl("/", locale),
    inLanguage: locale,
    author: { "@type": "Person", name: "Jesús Hernández", url: SITE },
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
      </body>
    </html>
  );
}
