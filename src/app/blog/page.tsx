import type { Metadata } from "next";
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
export default function BlogPage() {
  return (
    <>
      <Navbar />
      <main id="main-content" className="min-h-svh" />
      <Footer />
    </>
  );
}
