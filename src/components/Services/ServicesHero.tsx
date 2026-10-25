import { ButtonInner, buttonClass } from "@/components/PillButton";
import SectionLabel from "@/components/SectionLabel";
import ServiceSketch from "@/components/Services/ServiceSketch";
import { SERVICES, type ServiceId } from "@/data/services";

type Props = {
  label: string;
  title: string;
  lead: string;
  cta: string;
  ctaHref: string;
  /** Service titles by id, for the board's captions. */
  titles: Record<ServiceId, string>;
};

const META = "font-mono text-xs uppercase tracking-[0.08em] text-[var(--gray)]";

/**
 * The services page opening, one screen tall: a drawing board with the four
 * service sketches drawing themselves on top, the title and the CTA below.
 */
export default function ServicesHero({ label, title, lead, cta, ctaHref, titles }: Props) {
  return (
    <header className="flex min-h-[100svh] flex-col gap-10 pt-28 pb-10 md:gap-12 md:pt-32 md:pb-14">
      <div className="flex items-center justify-between">
        <SectionLabel animate="none">{label}</SectionLabel>
        <span className={META}>{String(SERVICES.length).padStart(2, "0")}</span>
      </div>

      {/* Hairline grid like a drafting sheet; each cell jumps to its row below. */}
      <ol className="grid flex-1 grid-cols-2 border-t border-l border-[var(--color-line-1)] md:grid-cols-4">
        {SERVICES.map((id, i) => (
          <li key={id} className="border-r border-b border-[var(--color-line-1)]">
            <a
              href={`#${id}`}
              className="group flex h-full flex-col justify-between gap-6 p-4 transition-colors duration-300 hover:bg-[var(--color-bg-elevated)] md:p-6"
            >
              <span className={META}>{String(i + 1).padStart(2, "0")}</span>
              <div className="mx-auto w-full max-w-[220px] transition-transform duration-500 ease-[var(--ease-out)] group-hover:-translate-y-1">
                <ServiceSketch id={id} play="load" />
              </div>
              <span className="text-sm font-medium text-balance text-[var(--black)] transition-colors duration-300 group-hover:text-[var(--color-accent-ink)] md:text-base">
                {titles[id]}
              </span>
            </a>
          </li>
        ))}
      </ol>

      <div className="grid gap-8 md:grid-cols-12 md:items-end">
        <h1 className="font-semibold tracking-[-0.035em] text-[var(--black)] text-[clamp(48px,8.5vw,136px)] leading-[0.9] text-balance md:col-span-8">
          {title}
        </h1>
        <div className="flex flex-col gap-6 md:col-span-4">
          <p className="text-base md:text-lg text-[var(--muted)]">{lead}</p>
          <a href={ctaHref} data-sfx="cta" className={buttonClass({ className: "self-start" })}>
            <ButtonInner>{cta}</ButtonInner>
          </a>
        </div>
      </div>
    </header>
  );
}
