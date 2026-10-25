import { ArrowRight } from "@/components/icons";
import ServiceArtwork from "@/components/Services/ServiceArtwork";
import type { ServiceId } from "@/data/services";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { pathInLocale } from "@/i18n/slugs";

export type ServiceCopy = { title: string; short: string; tagline: string; body: string; duration: string };
export type ServiceLabels = { price: string; priceValue: string; duration: string; view: string };

type Props = {
  id: ServiceId;
  locale: Locale;
  copy: ServiceCopy;
  labels: ServiceLabels;
  /** "h3" when the rows sit under a section heading (the other services on a service page). */
  as?: "h2" | "h3";
};

const META = "font-mono text-xs uppercase tracking-[0.08em] text-[var(--gray)]";

/** One service as a full-width row linking to its page: sketch, title, terms and an arrow. */
export default function ServiceRow({ id, locale, copy, labels, as: Heading = "h2" }: Props) {
  return (
    <li id={id} className="scroll-mt-24 border-t border-[var(--color-line-1)]">
      <Link
        href={pathInLocale(`/services/${id}`, "en", locale)}
        aria-label={`${copy.title}. ${labels.view}`}
        className="group grid gap-8 py-12 md:grid-cols-12 md:items-center md:gap-10 md:py-16"
      >
        <ServiceArtwork id={id} className="w-full max-w-[320px] md:col-span-3" />

        <div className="flex flex-col gap-3 md:col-span-6">
          <Heading className="text-[clamp(28px,3vw,44px)] font-semibold leading-[1] tracking-title text-balance text-[var(--black)] transition-colors duration-300 group-hover:text-[var(--color-accent-ink)]">
            {copy.title}
          </Heading>
          <p className="text-lg text-balance text-[var(--muted)]">{copy.tagline}</p>
          <p className="mt-2 max-w-md text-base text-[var(--muted)]">{copy.body}</p>
        </div>

        <dl className="flex flex-col gap-1 md:col-span-2">
          <dt className={META}>{labels.price}</dt>
          <dd className="text-base md:text-lg text-[var(--black)]">{labels.priceValue}</dd>
        </dl>

        <div className="hidden md:col-span-1 md:flex md:justify-end">
          <span
            aria-hidden="true"
            className="flex size-12 items-center justify-center rounded-full border border-[var(--color-line-2)] text-[var(--black)] transition-colors duration-300 group-hover:border-[var(--black)] group-hover:bg-[var(--black)] group-hover:text-white"
          >
            <ArrowRight size={18} className="transition-transform duration-300 ease-out group-hover:translate-x-0.5" />
          </span>
        </div>
      </Link>
    </li>
  );
}
