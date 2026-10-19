import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { alternatesFor, robotsFor, shareFor } from "@/i18n/seo";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta.lab" });
  return {
    title: t("title"),
    description: t("description"),
    ...shareFor("/lab", locale, {
      title: `${t("title")} | Jesús Hernández`,
      description: t("description"),
    }),
    alternates: alternatesFor("/lab", locale),
    robots: robotsFor("/lab", locale),
  };
}

// Blank for now: the public workshop's index goes here.
export default async function LabPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <Navbar />
      <main id="main-content" className="min-h-svh" />
      <Footer />
    </>
  );
}
