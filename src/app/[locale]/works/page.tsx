import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WorksHero from "@/components/Works/WorksHero";
import WorksList from "@/components/Works/WorksList";

export const metadata: Metadata = {
  title: "Works",
  description:
    "Selected work by Jesús Hernández: websites and products designed and built end to end, from research to launch.",
  openGraph: {
    title: "Works | Jesús Hernández",
    description:
      "Selected work by Jesús Hernández: websites and products designed and built end to end, from research to launch.",
    url: "https://jesushernandez.site/works",
    type: "website",
    images: [{ url: "/opengraph-image", width: 1200, height: 630 }],
  },
  alternates: {
    canonical: "https://jesushernandez.site/works",
  },
};

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
