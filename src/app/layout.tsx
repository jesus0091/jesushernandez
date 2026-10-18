import "./globals.css";

import type { Metadata, Viewport } from "next";

import { Inter, JetBrains_Mono } from "next/font/google";

import IntroOverlay from "@/components/motion/IntroOverlay";
import SmoothScroll from "@/components/motion/SmoothScroll";
import UiSounds from "@/components/UiSounds";

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
  preload: false,
});

const CANONICAL = "https://jesushernandez.site";

export const metadata: Metadata = {
  metadataBase: new URL(CANONICAL),
  title: {
    default: "Jesús Hernández | Product Engineer & Designer",
    template: "%s | Jesús Hernández",
  },
  description:
    "Product Engineer and Designer based in Argentina. I design and build digital products end to end, from the first sketch to production.",
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
  authors: [{ name: "Jesús Hernández", url: CANONICAL }],
  creator: "Jesús Hernández",
  publisher: "Jesús Hernández",
  robots: {
    index: true,
    follow: true,
    "max-image-preview": "large",
    "max-snippet": -1,
    "max-video-preview": -1,
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Jesús Hernández",
    url: CANONICAL,
    title: "Jesús Hernández | Product Engineer & Designer",
    description:
      "Product Engineer and Designer based in Argentina. I design and build digital products end to end, from the first sketch to production.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Jesús Hernández | Product Engineer & Designer",
    description:
      "Product Engineer and Designer based in Argentina. I design and build digital products end to end, from the first sketch to production.",
  },
  category: "technology",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f4f1ea",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const personJsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Jesús Hernández",
    url: CANONICAL,
    jobTitle: "Product Engineer & Designer",
    description:
      "Product Engineer and Designer based in Argentina. I design and build digital products end to end, from the first sketch to production.",
    image: `${CANONICAL}/images/about_me.webp`,
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
    url: CANONICAL,
    inLanguage: "en",
    author: { "@type": "Person", name: "Jesús Hernández", url: CANONICAL },
  };

  return (
    <html
      lang="en"
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

        <SmoothScroll />
        <UiSounds />
        <IntroOverlay />

        {children}
      </body>
    </html>
  );
}
