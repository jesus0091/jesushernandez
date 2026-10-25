import { ButtonInner, buttonClass } from "@/components/PillButton";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { ComponentType } from "react";
import {
  ArrowLeft,
  ArrowRight,
  ArrowsClockwise,
  Bell,
  Check,
  Code,
  CreditCard,
  Database,
  DeviceMobile,
  Devices,
  Gauge,
  type IconProps,
  MagnifyingGlass,
  PenNib,
  RocketLaunch,
  Sparkle,
  Storefront,
} from "@/components/icons";
import Footer from "@/components/Footer";
import JsonLd from "@/components/JsonLd";
import Navbar from "@/components/Navbar";
import SectionHeading from "@/components/motion/SectionHeading";
import type { ServiceCopy, ServiceLabels } from "@/components/Services/ServiceRow";
import ServiceArtwork, { SERVICE_THEME, ServiceGrain } from "@/components/Services/ServiceArtwork";
import ScrubWords from "@/components/motion/ScrubWords";
import FaqAccordion from "@/components/Services/FaqAccordion";
import ServiceHeroArtwork from "@/components/Services/ServiceHeroArtwork";
import { SERVICES, isServiceId, type ServiceId } from "@/data/services";
import { Link } from "@/i18n/navigation";
import { pageFor } from "@/i18n/pages";
import { pathInLocale } from "@/i18n/slugs";
import type { Locale } from "@/i18n/routing";
import { PERSON_ID, absoluteUrl, alternatesFor, robotsFor, shareFor } from "@/i18n/seo";
import { contactHref } from "@/lib/contact";

type Props = { params: Promise<{ locale: Locale; id: string }> };
type Qa = { q: string; a: string };
type Service = ServiceCopy & {
  metaTitle: string;
  metaDescription: string;
  intro: string[];
  includes: string[];
  fit: string[];
  faq: Qa[];
};
type Labels = ServiceLabels & {
  number: string;
  back: string;
  includesTitle: string;
  fitTitle: string;
  faqTitle: string;
  moreTitle: string;
};

// Unknown ids are unmatched URLs, so they get the global 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return SERVICES.map((id) => ({ id }));
}

const HEADING = "text-[28px] md:text-[40px] leading-tighter font-semibold tracking-title text-balance text-[var(--black)]";
// One icon per included item, in the order of the copy (services.items.<id>.includes).
const INCLUDE_ICONS: Record<ServiceId, ComponentType<IconProps>[]> = {
  "web-development": [PenNib, Code, Storefront, Gauge, MagnifyingGlass, RocketLaunch],
  "web-apps": [PenNib, Code, Database, CreditCard, Sparkle, RocketLaunch],
  "mobile-apps": [DeviceMobile, Code, ArrowsClockwise, Bell, Devices, Storefront],
};
// The icons' tint, per service.
const CHECK_TINT: Record<ServiceId, string> = {
  "web-development": "bg-[#f3e2d4] text-[#a03f00]",
  "web-apps": "bg-[#ece0e9] text-[#7a3f68]",
  "mobile-apps": "bg-[#e1e6f4] text-[#2b3f8f]",
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, id } = await params;
  if (!isServiceId(id)) return {};
  const t = await getTranslations({ locale, namespace: "services" });
  const s = t.raw(`items.${id}`) as Service;
  const key = `/services/${id}`;
  const path = pageFor(key).paths[locale] ?? key;
  return {
    title: s.metaTitle,
    description: s.metaDescription,
    ...shareFor(path, locale, { title: `${s.metaTitle} | Jesús Hernández`, description: s.metaDescription }),
    alternates: alternatesFor(key, locale),
    robots: robotsFor(key, locale),
  };
}

export default async function ServicePage({ params }: Props) {
  const { locale, id } = await params;
  if (!isServiceId(id)) notFound();
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "services" });
  const s = t.raw(`items.${id}`) as Service;
  const items = t.raw("items") as Record<string, ServiceCopy>;
  const labels = t.raw("ui") as Labels;
  const listPath = pageFor("/services").paths[locale] ?? "/services";
  const url = absoluteUrl(pageFor(`/services/${id}`).paths[locale]!, locale);

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Service",
              "@id": `${url}#service`,
              name: s.title,
              description: s.metaDescription,
              provider: { "@id": PERSON_ID },
              areaServed: ["United States", "Latin America"],
              availableLanguage: ["es", "en"],
              url,
            },
            {
              "@type": "BreadcrumbList",
              itemListElement: [
                { "@type": "ListItem", position: 1, name: t("label"), item: absoluteUrl(listPath, locale) },
                { "@type": "ListItem", position: 2, name: s.title, item: url },
              ],
            },
          ],
        }}
      />
      <Navbar />
      <main id="main-content" className="mx-auto w-full max-w-[1280px] px-6 pt-28 pb-24 md:px-8">
        {/* One screen, like the works and services heroes: the service's colour and
            sketch on top, the name low on the left, the line, price and CTA on the right. */}
        <header className="flex min-h-[calc(100svh-7rem)] flex-col gap-10 border-b border-[var(--color-line-1)] pb-10 md:min-h-[calc(100svh-7rem)]">
          <div className="relative flex min-h-[280px] flex-1">
            <ServiceHeroArtwork id={id} className="w-full flex-1" />
            <Link
              href={listPath}
              className={buttonClass({ size: "sm", shine: false, className: "absolute top-5 left-5 bg-white/70 backdrop-blur-sm hover:bg-white md:top-6 md:left-6" })}
            >
              <ButtonInner icon={ArrowLeft} iconSide="start" size="sm">
                {labels.back}
              </ButtonInner>
            </Link>
          </div>

          <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between md:gap-10">
            <h1 className="whitespace-nowrap font-semibold tracking-[-0.045em] text-[var(--black)] text-[clamp(52px,9.5vw,148px)] leading-[0.85]">
              {/* The short name on screen; the keyword title stays in the h1 for search and screen readers. */}
              {s.short}
              <span className="sr-only"> · {s.title}</span>
            </h1>
            <div className="flex shrink-0 flex-col items-start gap-5 md:items-end md:text-right">
              <p className="text-lg md:text-xl font-medium text-[var(--muted)] md:whitespace-nowrap">{s.tagline}</p>
              <a href={contactHref(locale)} data-sfx="cta" className={buttonClass()}>
                <ButtonInner>{t("cta")}</ButtonInner>
              </a>
            </div>
          </div>
        </header>

        {/* The intro in the middle of the page, reading itself as it scrolls by. */}
        <div className="mx-auto mt-20 flex max-w-2xl flex-col gap-6 md:mt-32">
          {s.intro.map((p) => (
            <ScrubWords key={p} className="text-lg md:text-xl leading-relaxed font-medium tracking-title text-[var(--black)]">
              {p}
            </ScrubWords>
          ))}
        </div>

        {/* What's included: a tile per item, its icon on the service's tint carrying most of the reading. */}
        <section className="mt-20 md:mt-28">
          <SectionHeading className={HEADING}>{labels.includesTitle}</SectionHeading>
          <ul className="mt-8 grid gap-4 sm:grid-cols-2 md:mt-10 lg:grid-cols-3 lg:gap-5">
            {s.includes.map((item, i) => {
              const Icon = INCLUDE_ICONS[id][i] ?? Check;
              return (
                <li key={item} className="flex items-start gap-5 rounded-3xl bg-[var(--color-bg-elevated)] p-6 md:p-7">
                  <span className={`flex size-12 shrink-0 items-center justify-center rounded-2xl ${CHECK_TINT[id]}`}>
                    <Icon size={24} aria-hidden />
                  </span>
                  <span className="pt-0.5 text-base leading-snug text-pretty text-[var(--black)]">{item}</span>
                </li>
              );
            })}
          </ul>
        </section>

        {/* A good fit if…: the heading opens the sentence, each card finishes it, on the service's colour. */}
        <section className="mt-20 md:mt-28">
          <SectionHeading className={HEADING}>{labels.fitTitle}…</SectionHeading>
          <ul className="mt-8 grid gap-4 md:mt-10 md:grid-cols-3 md:gap-5">
            {s.fit.map((item) => (
              <li
                key={item}
                className={`relative isolate flex min-h-[180px] flex-col justify-between gap-8 overflow-hidden rounded-3xl p-6 md:min-h-[200px] md:p-7 ${SERVICE_THEME[id]}`}
              >
                <ServiceGrain />
                <span className="flex size-9 items-center justify-center rounded-full bg-white/70 text-[var(--black)]">
                  <Check size={16} weight="bold" aria-hidden />
                </span>
                <p className="text-[17px] md:text-[19px] font-medium leading-snug tracking-title text-balance text-[var(--black)]">{item}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* Questions centred in a narrower column, as an accordion. */}
        <section className="mx-auto mt-20 max-w-2xl md:mt-28">
          <SectionHeading className={`${HEADING} text-center`}>
            {labels.faqTitle}
          </SectionHeading>
          <div className="mt-8 flex flex-col items-center md:mt-10">
            <FaqAccordion items={s.faq} />
            <a href={contactHref(locale)} data-sfx="cta" className={buttonClass({ className: "mt-10" })}>
              <ButtonInner>{t("cta")}</ButtonInner>
            </a>
          </div>
        </section>

        <section className="mt-24 md:mt-36">
          <SectionHeading className={HEADING}>{labels.moreTitle}</SectionHeading>
          {/* The other two services side by side, as cards like the home page's. */}
          <ul className="mt-8 grid gap-4 sm:grid-cols-2 md:gap-5">
            {SERVICES.filter((other) => other !== id).map((other) => (
              <li key={other}>
                <Link
                  href={pathInLocale(`/services/${other}`, "en", locale)}
                  aria-label={`${items[other].title}. ${labels.view}`}
                  className="group flex h-full flex-col gap-5"
                >
                  <ServiceArtwork id={other} className="w-full" />
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex flex-col gap-1">
                      <h3 className="text-2xl md:text-3xl font-semibold leading-tight tracking-title text-[var(--black)] transition-colors duration-300 group-hover:text-[var(--color-accent-ink)]">
                        {items[other].short}
                      </h3>
                      <p className="text-base text-[var(--muted)]">{items[other].tagline}</p>
                    </div>
                    <span className="flex size-11 shrink-0 items-center justify-center rounded-full border border-[var(--color-line-2)] text-[var(--black)] transition-colors duration-300 group-hover:border-[var(--black)] group-hover:bg-[var(--black)] group-hover:text-white">
                      <ArrowRight size={18} aria-hidden className="transition-transform duration-300 group-hover:translate-x-0.5" />
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </main>
      <Footer cta="card" />
    </>
  );
}
