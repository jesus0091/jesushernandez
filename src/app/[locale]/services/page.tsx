import { ButtonInner, buttonClass } from "@/components/PillButton";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import Footer from "@/components/Footer";
import JsonLd from "@/components/JsonLd";
import Navbar from "@/components/Navbar";
import SectionHeading from "@/components/motion/SectionHeading";
import ServiceRow, { type ServiceCopy, type ServiceLabels } from "@/components/Services/ServiceRow";
import ServicesHero from "@/components/Services/ServicesHero";
import { SERVICES, type ServiceId } from "@/data/services";
import { pageFor } from "@/i18n/pages";
import type { Locale } from "@/i18n/routing";
import { absoluteUrl, alternatesFor, robotsFor, shareFor } from "@/i18n/seo";
import { contactHref } from "@/lib/contact";

type Props = { params: Promise<{ locale: Locale }> };
type Item = { title: string; body: string };
type Qa = { q: string; a: string };

const PAGE = "/services";
const HEADING =
  "text-2xl sm:text-3xl md:text-5xl leading-tighter font-semibold tracking-title text-[var(--black)]";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta.services" });
  const path = pageFor(PAGE).paths[locale] ?? PAGE;
  return {
    title: t("title"),
    description: t("description"),
    ...shareFor(path, locale, { title: `${t("title")} | Jesús Hernández`, description: t("description") }),
    alternates: alternatesFor(PAGE, locale),
    robots: robotsFor(PAGE, locale),
  };
}

export default async function ServicesPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "services" });
  const page = pageFor(PAGE);
  const items = t.raw("items") as Record<string, ServiceCopy>;
  const labels = t.raw("ui") as ServiceLabels;
  const forWhom = t.raw("for") as string[];
  const process = t.raw("process") as Item[];
  const faq = t.raw("faq") as Qa[];
  const url = absoluteUrl(page.paths[locale] ?? PAGE, locale);

  return (
    <>
      {/* The services as a list of their pages; each page describes its own Service. */}
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          "@id": `${url}#services`,
          itemListElement: SERVICES.map((id, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: items[id].title,
            url: absoluteUrl(pageFor(`/services/${id}`).paths[locale]!, locale),
          })),
        }}
      />
      <Navbar />
      <main id="main-content" className="mx-auto w-full max-w-[1280px] px-6 pb-24 md:px-8">
        <ServicesHero
          label={t("label")}
          title={t("title")}
          lead={t("lead")}
          cta={t("cta")}
          ctaHref={contactHref(locale)}
          titles={Object.fromEntries(SERVICES.map((id) => [id, items[id].title])) as Record<ServiceId, string>}
        />

        <ul className="border-b border-[var(--color-line-1)]">
          {SERVICES.map((id, i) => (
            <ServiceRow key={id} id={id} index={i} locale={locale} copy={items[id]} labels={labels} />
          ))}
        </ul>

        <section className="mt-20 md:mt-28">
          <SectionHeading className={HEADING}>{t("forTitle")}</SectionHeading>
          <ul className="mt-8 flex flex-col border-t border-black/10">
            {forWhom.map((w) => (
              <li key={w} className="border-b border-black/10 py-4 text-base md:text-lg text-[var(--black)]">
                {w}
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-20 md:mt-28">
          <SectionHeading className={HEADING}>{t("processTitle")}</SectionHeading>
          <ol className="mt-8 grid gap-8 md:grid-cols-4 md:gap-8">
            {process.map((p, i) => (
              <li key={p.title} className="flex flex-col gap-2 border-t border-black/10 pt-5">
                <span className="font-mono text-xs uppercase tracking-[0.08em] text-[var(--color-accent-ink)]">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="text-lg font-semibold text-[var(--black)]">{p.title}</h3>
                <p className="text-base text-[var(--muted)]">{p.body}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="mt-20 md:mt-28">
          <SectionHeading className={HEADING}>{t("pricingTitle")}</SectionHeading>
          <p className="mt-6 max-w-2xl text-base md:text-lg text-[var(--black)]">{t("pricing")}</p>
        </section>

        <section className="mt-20 md:mt-28">
          <SectionHeading className={HEADING}>{t("faqTitle")}</SectionHeading>
          <dl className="mt-8 flex flex-col border-t border-black/10">
            {faq.map((f) => (
              <div key={f.q} className="flex flex-col gap-2 border-b border-black/10 py-5">
                <dt className="text-lg font-semibold text-[var(--black)]">{f.q}</dt>
                <dd className="max-w-3xl text-base text-[var(--muted)]">{f.a}</dd>
              </div>
            ))}
          </dl>
          <a
            href={contactHref(locale)}
            data-sfx="cta"
            className={buttonClass({ className: "mt-12" })}
          >
            <ButtonInner>{t("cta")}</ButtonInner>
          </a>
        </section>
      </main>
      <Footer cta="card" />
    </>
  );
}
