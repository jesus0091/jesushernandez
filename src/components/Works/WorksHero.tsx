import { ArrowDown } from "@/components/icons";
import SectionHeading from "../motion/SectionHeading";
import SectionLabel from "../SectionLabel";
import WorksWall from "./WorksWall";
import { WORKS } from "@/data/works";

const COVERS = WORKS.map((w) => w.cover);

export default function WorksHero() {
  return (
    // svh, not vh: stays put when the mobile address bar collapses.
    <section
      data-nav-dark
      className="relative isolate flex min-h-svh w-full flex-col overflow-hidden bg-[var(--color-ink-1)]"
    >
      {/* A slow, tilted wall of the project covers themselves. */}
      <WorksWall covers={COVERS} />
      {/* Scrim: keeps the title readable and fades the wall out at the edges. */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_60%_55%_at_center,rgb(10_10_10/0.9),rgb(10_10_10/0.45)_60%,rgb(10_10_10/0.75))]"
      />

      <div className="mx-auto flex w-full max-w-[1280px] flex-1 flex-col items-center justify-center gap-4 px-6 pt-24 text-center md:px-8">
        <SectionLabel align="center" surface="dark">Works</SectionLabel>
        <SectionHeading
          as="h1"
          className="font-semibold tracking-title text-[var(--color-bg)] text-[clamp(44px,8vw,128px)] leading-[1.02]"
        >
          Selected Projects
        </SectionHeading>
        <p className="max-w-md text-sm md:text-lg font-medium text-[var(--color-bg)]/60">
          Real projects where design meets code, craft meets delivery.
        </p>
      </div>

      <div className="flex justify-center pb-8 font-mono font-medium text-xs uppercase tracking-[0.08em] text-[var(--orange)]">
        <span className="inline-flex items-center gap-2">
          Scroll
          <ArrowDown size={14} />
        </span>
      </div>
    </section>
  );
}
