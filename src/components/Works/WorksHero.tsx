import SectionHeading from "../motion/SectionHeading";
import { WORKS } from "@/data/works";
import TunnelGlow from "../motion/TunnelGlow";

export default function WorksHero() {
  return (
    // Type only, on the page's own background, one screen tall: the list below carries the images.
    <section className="flex min-h-svh w-full flex-col justify-end gap-10 pt-28 pb-12 md:pt-32 md:pb-16">
      {/* The top of the screen holds the tunnel's light, as wide as the content. Phones skip it. */}
      <div className="mx-auto hidden min-h-0 w-full max-w-[1280px] flex-1 px-6 md:flex md:px-8">
        <TunnelGlow className="min-h-[320px] w-full flex-1" />
      </div>
      {/* The title low on the left, the line beside it on the right, both on one baseline. */}
      <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-6 px-6 md:flex-row md:items-end md:justify-between md:gap-10 md:px-8">
        <SectionHeading
          as="h1"
          className="font-semibold tracking-[-0.045em] text-[var(--black)] text-[clamp(72px,15vw,208px)] leading-[0.82]"
        >
          Works
          <sup
            aria-hidden
            className="relative top-[0.9em] ml-[0.04em] align-top font-mono text-[0.16em] font-medium tracking-normal leading-none text-[var(--color-accent)]"
          >
            {WORKS.length}
          </sup>
          <span className="sr-only"> in web design, product design and front-end development</span>
        </SectionHeading>
        <p className="max-w-sm text-balance text-base md:pb-[0.5em] md:text-right md:text-xl font-medium text-[var(--muted)]">
          Real projects where design meets code, craft meets delivery.
        </p>
      </div>
    </section>
  );
}
