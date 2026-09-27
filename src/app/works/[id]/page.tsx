import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { WORKS, getWorkById } from "@/data/works";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WorkDetail from "@/components/Works/WorkDetail";

const CANONICAL = "https://jesushernandez.vercel.app";

type Props = { params: Promise<{ id: string }> };

export function generateStaticParams() {
  return WORKS.map((w) => ({ id: w.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const work = getWorkById(id);
  if (!work) return {};

  const title = `${work.productName} — ${work.title}`;
  const description = work.description.slice(0, 160);

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
      <Footer />
    </>
  );
}
