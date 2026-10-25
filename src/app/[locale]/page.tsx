import { Suspense } from "react";
import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { alternatesFor } from "@/i18n/seo";
import AboutText from "@/components/AboutMe/AboutText";
import Skills from "@/components/AboutMe/Skills";
import Footer from "@/components/Footer";
import HomePage from "@/components/HomePage";
import LatestsProjects from "@/components/Projects/LatestsProjects";
import Navbar from "@/components/Navbar";
import HomeServices from "@/components/Services/HomeServices";
import WSMAQuote from "@/components/WSMAQuote";

// Title, description and Open Graph come from the layout; only the URLs are per page.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return { alternates: alternatesFor("/", locale) };
}

export default async function LandingPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <Navbar />
      <main id="main-content">
        <HomePage />
        {/* Each boundary hydrates on its own, so the sections below the hero
            don't add to one long task on load. */}
        <Suspense>
          <AboutText />
        </Suspense>
        <Suspense>
          <Skills />
        </Suspense>
        <Suspense>
          <WSMAQuote />
        </Suspense>
        <HomeServices />
        <Suspense>
          <LatestsProjects />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
