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
  const t = await getTranslations({ locale, namespace: "meta.blog" });
  return {
    title: t("title"),
    description: t("description"),
    ...shareFor("/blog", locale, {
      title: `${t("title")} | Jesús Hernández`,
      description: t("description"),
    }),
    alternates: alternatesFor("/blog", locale),
    robots: robotsFor("/blog", locale),
  };
}

// Blank for now: the post list goes here.
export default async function BlogPage({
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
