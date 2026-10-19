import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Blog",
  description: "Writing by Jesús Hernández on product, design and engineering.",
  alternates: {
    canonical: "https://jesushernandez.site/blog",
  },
};

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
