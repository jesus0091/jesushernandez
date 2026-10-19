import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Lab",
  description: "An open workshop: experiments with AI, animation and whatever else I'm trying out.",
  alternates: {
    canonical: "https://jesushernandez.site/lab",
  },
};

// Blank for now: the public workshop's index goes here.
export default function LabPage() {
  return (
    <>
      <Navbar />
      <main id="main-content" className="min-h-svh" />
      <Footer />
    </>
  );
}
