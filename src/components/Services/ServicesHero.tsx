import SectionHeading from "@/components/motion/SectionHeading";
import TunnelGlow from "@/components/motion/TunnelGlow";
import { SERVICES } from "@/data/services";

type Props = {
  /** The visible title: the page's one word. */
  label: string;
  /** The keyword title, read by assistive tech and search engines after the word. */
  title: string;
  /** The short line beside the title. */
  line: string;
};

/** The services page opening, laid out like the works one: the tunnel's light on top, the word and a line below. */
export default function ServicesHero({ label, title, line }: Props) {
  return (
    <header className="flex min-h-svh w-full flex-col justify-end gap-10 pt-28 pb-12 md:pt-32 md:pb-16">
      {/* Phones skip the light. */}
      <TunnelGlow className="hidden min-h-[320px] w-full flex-1 md:block" />
      {/* The title low on the left, the line beside it on the right, both on one baseline. */}
      <div className="flex w-full flex-col gap-6 md:flex-row md:items-end md:justify-between md:gap-10">
        <SectionHeading
          as="h1"
          className="font-semibold tracking-[-0.045em] text-[var(--black)] text-[clamp(72px,15vw,208px)] leading-[0.82]"
        >
          {label}
          <sup
            aria-hidden
            className="relative top-[0.9em] ml-[0.04em] align-top font-mono text-[0.16em] font-medium tracking-normal leading-none text-[var(--color-accent)]"
          >
            {SERVICES.length}
          </sup>
          <span className="sr-only"> · {title}</span>
        </SectionHeading>
        <p className="max-w-sm text-balance text-base md:pb-[0.5em] md:text-right md:text-xl font-medium text-[var(--muted)]">{line}</p>
      </div>
    </header>
  );
}
