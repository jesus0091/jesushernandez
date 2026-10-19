import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { OG_LOCALE, absoluteUrl, alternatesFor, robotsFor } from "@/i18n/seo";
import { WORKS, getWorkById } from "@/data/works";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WorkDetail from "@/components/Works/WorkDetail";

type Props = { params: Promise<{ locale: Locale; id: string }> };

// Unknown ids are unmatched URLs, so they get the global 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return WORKS.map((w) => ({ id: w.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, id } = await params;
  const work = getWorkById(id);
  if (!work) return {};

  const title = `${work.productName} — ${work.title}`;
  // Search and share previews show about 160 characters: cut at a word, never mid-word.
  const summary = work.overview?.about ?? work.description;
  const description = summary.length <= 160 ? summary : `${summary.slice(0, 157).replace(/\s+\S*$/, "")}…`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: absoluteUrl(`/works/${work.id}`, locale),
      locale: OG_LOCALE[locale],
      images: [{ url: work.cover, alt: title }],
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [work.cover],
    },
    alternates: alternatesFor(`/works/${work.id}`, locale),
    robots: robotsFor(`/works/${work.id}`, locale),
  };
}

export default async function WorkDetailPage({ params }: Props) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const work = getWorkById(id);
  if (!work) notFound();

  return (
    <>
      <Navbar />
      <main>
        <WorkDetail work={work} />
      </main>
      <Footer cta="card" />
    </>
  );
}
