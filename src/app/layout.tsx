import "./globals.css";

import type { Metadata, Viewport } from "next";

import { Inter, JetBrains_Mono } from "next/font/google";

import IntroOverlay from "@/components/motion/IntroOverlay";
import SmoothScroll from "@/components/motion/SmoothScroll";
import UiSounds from "@/components/UiSounds";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  preload: true,
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
  preload: false,
});

const CANONICAL = "https://jesushernandez.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(CANONICAL),
  title: {
    default: "Jesus Hernandez | AI-Driven Engineer & Product Designer",
    template: "%s | Jesus Hernandez",
  },
  description:
    "Portfolio of Jesus Hernandez, AI-Driven Engineer & Product Designer who designs and ships full-stack products end to end with React, Next.js, and AI agents built into every step of the workflow.",
  keywords: [
    "AI-Driven Engineer",
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
  authors: [{ name: "Jesus Hernandez", url: CANONICAL }],
  creator: "Jesus Hernandez",
  publisher: "Jesus Hernandez",
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
    siteName: "Jesus Hernandez Portfolio",
    url: CANONICAL,
    title: "Jesus Hernandez | AI-Driven Engineer & Product Designer",
    description:
      "Explore the portfolio of Jesus Hernandez: AI-driven engineering, product design, and full-stack products shipped end to end.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Jesus Hernandez | AI-Driven Engineer & Product Designer",
    description:
      "AI-driven engineering and product design portfolio by Jesus Hernandez.",
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
    name: "Jesus Hernandez",
    url: CANONICAL,
    jobTitle: "AI-Driven Engineer & Product Designer",
    description:
      "AI-Driven Engineer & Product Designer who designs and ships full-stack digital products end to end.",
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
    name: "Jesus Hernandez Portfolio",
    url: CANONICAL,
    inLanguage: "en",
    author: { "@type": "Person", name: "Jesus Hernandez", url: CANONICAL },
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
