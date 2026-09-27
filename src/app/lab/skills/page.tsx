import type { Metadata } from "next";
import SkillsDisciplines from "@/components/AboutMe/SkillsDisciplines";

// Design preview for the skills section redesign; not linked or indexed.
export const metadata: Metadata = {
  title: "Skills preview",
  robots: { index: false, follow: false },
};

export default function SkillsPreviewPage() {
  return (
    <main className="pt-24">
      <div className="h-[40vh]" />
      <SkillsDisciplines />
      <div className="h-[60vh]" />
    </main>
  );
}
