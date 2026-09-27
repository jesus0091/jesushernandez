import AboutText from "@/components/AboutMe/AboutText";
import Skills from "@/components/AboutMe/Skills";
import Footer from "@/components/Footer";
import GalleryProjects from "@/components/Projects/GalleryProjects";
import HomePage from "@/components/HomePage";
import LatestsProjects from "@/components/Projects/LatestsProjects";
import Navbar from "@/components/Navbar";
import WSMAQuote from "@/components/WSMAQuote";

export default function LandingPage() {
  return (
    <>
      <Navbar />
      <main id="main-content">
        <HomePage />
        <GalleryProjects />
        <AboutText />
        <Skills />
        <WSMAQuote />
        <LatestsProjects />
      </main>
      <Footer />
    </>
  );
}
