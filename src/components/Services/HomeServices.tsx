import { getLocale, getTranslations } from "next-intl/server";
import { ButtonInner, buttonClass } from "@/components/PillButton";
import SectionLabel from "@/components/SectionLabel";
import SectionHeading from "@/components/motion/SectionHeading";
import { ArrowRight } from "@/components/icons";
import { SERVICE_THEME, ServiceGrain } from "@/components/Services/ServiceArtwork";
import ServiceSketch from "@/components/Services/ServiceSketch";
import type { ServiceCopy, ServiceLabels } from "@/components/Services/ServiceRow";
import { SERVICES, type ServiceId } from "@/data/services";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { pathInLocale } from "@/i18n/slugs";
import { contactHref } from "@/lib/contact";


/** The services on the home page: three cards, one per service page, each with its own colour and sketch, then the way to get in touch. */
export default async function HomeServices() {
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("homeServices");
  const s = await getTranslations("services");
  const items = s.raw("items") as Record<ServiceId, ServiceCopy>;
  const labels = s.raw("ui") as ServiceLabels;

  return (
    // Opaque, above the section before it: it slides over "What sets me apart".
    <section id="services" data-covers-quote className="grain-surface relative z-10 w-full pt-28 pb-12 md:pt-32 md:pb-20">
      <div className="mx-auto w-full max-w-[1280px] px-6 md:px-8">
        <div className="flex flex-col gap-2">
          <SectionLabel className="mb-1">{t("label")}</SectionLabel>
          <SectionHeading className="max-w-3xl text-2xl sm:text-3xl md:text-6xl leading-tighter text-[var(--black)] font-semibold tracking-title">
            {t("heading")}
          </SectionHeading>
          <p className="mt-1 max-w-xl text-sm md:text-lg font-medium text-[var(--muted)] text-pretty">{t("subtitle")}</p>
        </div>

        <div className="mt-10 md:mt-14">
          <ul className="grid gap-4 lg:grid-cols-3 lg:gap-5">
            {SERVICES.map((id) => (
              <li key={id}>
                <Link
                  href={pathInLocale(`/services/${id}`, "en", locale)}
                  aria-label={`${items[id].title}. ${labels.view}`}
                  className={`group relative isolate flex h-full flex-col overflow-hidden rounded-3xl text-[var(--black)] [--sk-width:1.5] [--sk-fill:#fff] ${SERVICE_THEME[id]}`}
                >
                  <ServiceGrain />
                  <div className="flex aspect-[4/3] items-center justify-center px-6 pt-8 md:px-8">
                    <div className="w-full max-w-[280px] transition-transform duration-500 ease-[var(--ease-out)] group-hover:scale-[1.03]">
                      <ServiceSketch id={id} />
                    </div>
                  </div>

                  <div className="mt-auto flex items-center justify-between gap-4 px-6 pb-6 pt-2 md:px-8 md:pb-8">
                    <h3 className="text-xl md:text-2xl font-semibold leading-tight tracking-title">{items[id].short}</h3>
                    <span
                      className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white/70 text-[var(--black)] transition-colors duration-300 group-hover:bg-[var(--color-accent)] group-hover:text-white"
                    >
                      <ArrowRight size={18} weight="bold" aria-hidden className="transition-transform duration-300 group-hover:translate-x-0.5" />
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-10 flex md:mt-14">
          <a href={contactHref(locale)} data-sfx="cta" className={buttonClass()}>
            <ButtonInner>{s("cta")}</ButtonInner>
          </a>
        </div>
      </div>
    </section>
  );
}
