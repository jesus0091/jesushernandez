import SectionHeading from "../motion/SectionHeading";
import { WORKS } from "@/data/works";

export default function WorksHero() {
  return (
    // Type only, on the page's own background: the list right below carries the images.
    <section className="w-full pt-32 md:pt-40">
      <div className="mx-auto w-full max-w-[1280px] px-6 md:px-8">
        <SectionHeading
          as="h1"
          className="font-semibold tracking-[-0.045em] text-[var(--black)] text-[clamp(96px,22vw,300px)] leading-[0.82]"
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
        <p className="mt-6 md:mt-8 max-w-md text-base md:text-xl font-medium text-[var(--muted)]">
          Real projects where design meets code, craft meets delivery.
        </p>
      </div>
    </section>
  );
}
