import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { WORKS, getWorkById } from "@/data/works";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WorkDetail from "@/components/Works/WorkDetail";

const CANONICAL = "https://jesushernandez.site";

type Props = { params: Promise<{ id: string }> };

export function generateStaticParams() {
  return WORKS.map((w) => ({ id: w.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
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
      url: `${CANONICAL}/works/${work.id}`,
      images: [{ url: work.cover, alt: title }],
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [work.cover],
    },
    alternates: {
      canonical: `${CANONICAL}/works/${work.id}`,
    },
  };
}

export default async function WorkDetailPage({ params }: Props) {
  const { id } = await params;
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
