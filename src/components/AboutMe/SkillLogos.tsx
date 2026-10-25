import { SKILL_LOGO_NAMES } from "./skillLogoNames";

/**
 * Greyed-out brand marks drifting right to left under the skills. Two
 * identical sets slide by exactly one set's width, so the loop has no seam;
 * the edges fade out so marks never pop in or out. Purely decorative: the
 * names are already listed above as tags.
 */
export default function SkillLogos() {
  const set = (
    <ul className="flex shrink-0 items-center gap-12 pr-12 md:gap-16 md:pr-16">
      {SKILL_LOGO_NAMES.map((name, index) => (
        <li key={name} className="shrink-0">
          <svg
            viewBox="0 0 24 24"
            className="size-7 fill-current text-[var(--color-ink-4)] opacity-60 transition-opacity duration-300 hover:opacity-100 md:size-8"
          >
            <title>{name}</title>
            <use href={`/images/skill-logos.svg#skill-${index}`} />
          </svg>
        </li>
      ))}
    </ul>
  );

  return (
    <div aria-hidden className="skill-logos relative mt-12 overflow-hidden py-8 md:mt-20 md:py-10">
      <div className="skill-logos-track flex w-max">
        {set}
        {set}
      </div>
    </div>
  );
}
