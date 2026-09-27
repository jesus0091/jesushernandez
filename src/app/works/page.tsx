import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WorksHero from "@/components/Works/WorksHero";
import WorksList from "@/components/Works/WorksList";

export const metadata: Metadata = {
  title: "Works",
  description:
    "All projects by Jesús Hernández — frontend development, UX/UI design, and full-stack digital products.",
  openGraph: {
    title: "Works | Jesus Hernandez",
    description:
      "All projects by Jesús Hernández — frontend development, UX/UI design, and full-stack digital products.",
    url: "https://jesushernandez.vercel.app/works",
    type: "website",
    images: [{ url: "/opengraph-image", width: 1200, height: 630 }],
  },
  alternates: {
    canonical: "https://jesushernandez.vercel.app/works",
  },
};

export default function WorksPage() {
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
