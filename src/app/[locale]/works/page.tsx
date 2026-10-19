import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { alternatesFor, robotsFor, shareFor } from "@/i18n/seo";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WorksHero from "@/components/Works/WorksHero";
import WorksList from "@/components/Works/WorksList";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta.works" });
  return {
    title: t("title"),
    description: t("description"),
    ...shareFor("/works", locale, {
      title: `${t("title")} | Jesús Hernández`,
      description: t("description"),
    }),
    alternates: alternatesFor("/works", locale),
    robots: robotsFor("/works", locale),
  };
}

export default async function WorksPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <Navbar />
      <main>
        <WorksHero />
        <WorksList />
      </main>
      <Footer />
    </>
  );
}
