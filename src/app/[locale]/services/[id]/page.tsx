import { ButtonInner, buttonClass } from "@/components/PillButton";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowLeft } from "@/components/icons";
import Footer from "@/components/Footer";
import JsonLd from "@/components/JsonLd";
import Navbar from "@/components/Navbar";
import SectionHeading from "@/components/motion/SectionHeading";
import ServiceRow, { type ServiceCopy, type ServiceLabels } from "@/components/Services/ServiceRow";
import ServiceArtwork from "@/components/Services/ServiceArtwork";
import { SERVICES, isServiceId } from "@/data/services";
import { Link } from "@/i18n/navigation";
import { pageFor } from "@/i18n/pages";
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

const HEADING = "text-2xl sm:text-3xl md:text-4xl leading-tighter font-semibold tracking-title text-[var(--black)]";
const META = "font-mono text-xs uppercase tracking-[0.08em] text-[var(--gray)]";
// A section: its heading on the left third, the content on the rest.
const SECTION = "mt-20 grid gap-6 md:mt-28 md:grid-cols-12 md:gap-10";

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
  const pad = (n: number) => String(n).padStart(2, "0");

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
      <main id="main-content" className="mx-auto w-full max-w-[1280px] px-6 pt-32 pb-24 md:px-8 md:pt-40">
        <Link
          href={listPath}
          className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.08em] text-[var(--muted)] transition-colors hover:text-[var(--black)]"
        >
          <ArrowLeft size={14} />
          {labels.back}
        </Link>

        <header className="mt-10 grid gap-10 border-b border-[var(--color-line-1)] pb-12 md:grid-cols-12 md:items-center md:pb-16">
          <div className="flex flex-col gap-4 md:col-span-7">
            <h1 className="font-semibold tracking-title text-[var(--black)] text-[clamp(44px,7vw,104px)] leading-[0.98] text-balance">
              {s.title}
            </h1>
            <p className="text-xl md:text-3xl text-[var(--muted)]">{s.tagline}</p>
          </div>
          <ServiceArtwork id={id} play="load" className="w-full max-w-[460px] md:col-span-5 md:justify-self-end" />

          <dl className="grid grid-cols-2 gap-6 md:col-span-7 md:max-w-lg">
            <div className="flex flex-col gap-1">
              <dt className={META}>{labels.price}</dt>
              <dd className="text-lg md:text-xl text-[var(--black)]">{labels.priceValue}</dd>
            </div>
          </dl>
          <a
            href={contactHref(locale)}
            data-sfx="cta"
            className={buttonClass({ className: "md:col-span-5 md:justify-self-end" })}
          >
            <ButtonInner>{t("cta")}</ButtonInner>
          </a>
        </header>

        <div className="mt-16 flex max-w-3xl flex-col gap-6 md:mt-24 md:ml-[calc(100%/3)]">
          {s.intro.map((p) => (
            <p key={p} className="text-lg md:text-2xl leading-snug text-[var(--black)]">
              {p}
            </p>
          ))}
        </div>

        <section className={SECTION}>
          <SectionHeading className={`${HEADING} md:col-span-4`}>{labels.includesTitle}</SectionHeading>
          <ol className="flex flex-col border-t border-[var(--color-line-1)] md:col-span-8">
            {s.includes.map((item, i) => (
              <li key={item} className="flex gap-6 border-b border-[var(--color-line-1)] py-5">
                <span className="pt-1 font-mono text-xs text-[var(--color-accent-ink)]">{pad(i + 1)}</span>
                <span className="text-base md:text-lg text-[var(--black)]">{item}</span>
              </li>
            ))}
          </ol>
        </section>

        <section className={SECTION}>
          <SectionHeading className={`${HEADING} md:col-span-4`}>{labels.fitTitle}</SectionHeading>
          <ul className="flex flex-col border-t border-[var(--color-line-1)] md:col-span-8">
            {s.fit.map((item) => (
              <li key={item} className="flex gap-4 border-b border-[var(--color-line-1)] py-5 text-base md:text-lg text-[var(--black)]">
                <span aria-hidden="true" className="mt-2.5 size-2 shrink-0 rounded-full bg-[var(--color-accent)]" />
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section className={SECTION}>
          <SectionHeading className={`${HEADING} md:col-span-4`}>{labels.faqTitle}</SectionHeading>
          <dl className="flex flex-col border-t border-[var(--color-line-1)] md:col-span-8">
            {s.faq.map((f) => (
              <div key={f.q} className="flex flex-col gap-2 border-b border-[var(--color-line-1)] py-5">
                <dt className="text-lg font-semibold text-[var(--black)]">{f.q}</dt>
                <dd className="text-base text-[var(--muted)]">{f.a}</dd>
              </div>
            ))}
          </dl>
        </section>

        <div className="mt-12 md:ml-[calc(100%/3)] md:pl-0">
          <a
            href={contactHref(locale)}
            data-sfx="cta"
            className={buttonClass()}
          >
            <ButtonInner>{t("cta")}</ButtonInner>
          </a>
        </div>

        <section className="mt-24 md:mt-36">
          <SectionHeading className={HEADING}>{labels.moreTitle}</SectionHeading>
          <ul className="mt-8 border-b border-[var(--color-line-1)]">
            {SERVICES.filter((other) => other !== id).map((other) => (
              <ServiceRow
                key={other}
                id={other}
               
                locale={locale}
                copy={items[other]}
                labels={labels}
                as="h3"
              />
            ))}
          </ul>
        </section>
      </main>
      <Footer cta="card" />
    </>
  );
}
