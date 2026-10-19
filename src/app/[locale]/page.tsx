import { setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import AboutText from "@/components/AboutMe/AboutText";
import Skills from "@/components/AboutMe/Skills";
import Footer from "@/components/Footer";
import HomePage from "@/components/HomePage";
import LatestsProjects from "@/components/Projects/LatestsProjects";
import Navbar from "@/components/Navbar";
import WSMAQuote from "@/components/WSMAQuote";

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
        <AboutText />
        <Skills />
        <WSMAQuote />
        <LatestsProjects />
      </main>
      <Footer />
    </>
  );
}
