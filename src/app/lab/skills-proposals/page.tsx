import type { Metadata } from "next";
import ProposalScramble from "./ProposalScramble";

// Chosen redesign for the skills section ("What I bring to the table"), being
// polished here before it replaces the live one; not linked or indexed.
export const metadata: Metadata = {
  title: "Skills — preview",
  robots: { index: false, follow: false },
};

export default function SkillsPreviewPage() {
  return (
    <main className="pt-24">
      <div className="h-[40vh]" />
      <ProposalScramble />
      <div className="h-[60vh]" />
    </main>
  );
}
