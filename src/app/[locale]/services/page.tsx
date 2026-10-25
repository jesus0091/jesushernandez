import { ButtonInner, buttonClass } from "@/components/PillButton";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import Footer from "@/components/Footer";
import JsonLd from "@/components/JsonLd";
import Navbar from "@/components/Navbar";
import SectionHeading from "@/components/motion/SectionHeading";
import ServiceRow, { type ServiceCopy, type ServiceLabels } from "@/components/Services/ServiceRow";
import ServicesHero from "@/components/Services/ServicesHero";
import { SERVICES } from "@/data/services";
import { pageFor } from "@/i18n/pages";
import type { Locale } from "@/i18n/routing";
import { absoluteUrl, alternatesFor, robotsFor, shareFor } from "@/i18n/seo";
import { contactHref } from "@/lib/contact";
import { ListChecks, PenNib, RocketLaunch, Users } from "@/components/icons";

type Props = { params: Promise<{ locale: Locale }> };
type Item = { title: string; body: string };
type Qa = { q: string; a: string };

const PAGE = "/services";

// One icon per step of the process (call, scope, build, launch), on the services' tints;
// the launch sits on the orange.
const STEP_ICONS = [Users, ListChecks, PenNib, RocketLaunch];
const STEP_TINTS = [
  "bg-[#f3e2d4] text-[#a03f00]",
  "bg-[#ece0e9] text-[#7a3f68]",
  "bg-[#e1e6f4] text-[#2b3f8f]",
  "bg-[var(--color-accent)] text-white",
];
// Each section below the services: its title in the left column, its content in the right.
const SECTION = "mt-20 grid gap-6 border-t border-[var(--color-line-1)] pt-8 md:mt-28 md:grid-cols-12 md:gap-10 md:pt-10";
const HEADING =
  "text-2xl md:text-3xl leading-tighter font-semibold tracking-title text-balance text-[var(--black)] md:col-span-4";
const BODY = "md:col-span-8";

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
        <ServicesHero label={t("label")} title={t("title")} line={t("heroLine")} />

        <ul className="border-b border-[var(--color-line-1)]">
          {SERVICES.map((id) => (
            <ServiceRow key={id} id={id} locale={locale} copy={items[id]} labels={labels} />
          ))}
        </ul>

        <section className="mt-20 md:mt-28">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between md:gap-10">
            <SectionHeading className="text-3xl md:text-5xl leading-tighter font-semibold tracking-title text-[var(--black)]">
              {t("processTitle")}
            </SectionHeading>
            <p className="max-w-sm text-base md:text-lg text-balance text-[var(--muted)] md:text-right">{t("processLead")}</p>
          </div>

          {/* Four stops on one track; the stretch into launch is lit in the accent. */}
          <ol className="relative mt-10 grid gap-4 md:mt-14 md:grid-cols-4 md:gap-5">
            <span aria-hidden className="absolute top-[7px] left-[7px] hidden h-px w-[calc(75%-12px)] bg-[var(--color-line-2)] md:block" />
            <span
              aria-hidden
              className="absolute top-[7px] left-[calc(50%+3px)] hidden h-px w-[calc(25%-2px)] bg-gradient-to-r from-[var(--color-line-2)] to-[var(--color-accent)] md:block"
            />
            {process.map((p, i) => {
              const last = i === process.length - 1;
              const Icon = STEP_ICONS[i];
              return (
                <li key={p.title} className="flex flex-col gap-4">
                  <span
                    aria-hidden
                    className={`relative z-10 hidden size-[15px] rounded-full border-2 md:block ${
                      last
                        ? "border-[var(--color-accent)] bg-[var(--color-accent)] shadow-[0_0_0_6px_rgba(255,102,0,0.15)]"
                        : "border-[var(--color-line-2)] bg-[var(--color-bg)]"
                    }`}
                  />
                  <div
                    className={`group/step relative isolate flex flex-1 flex-col gap-10 overflow-hidden rounded-3xl p-6 transition-transform duration-500 ease-[var(--ease-out)] hover:-translate-y-1 md:p-7 ${
                      last ? "bg-[var(--color-ink-1)] text-[var(--color-bg)]" : "bg-[var(--color-bg-elevated)] text-[var(--black)]"
                    }`}
                  >
                    {/* The launch card carries the film grain over its ink. */}
                    {last && (
                      <div
                        aria-hidden
                        className="pointer-events-none absolute inset-0 -z-10 bg-[image:var(--grain-image)] bg-[size:var(--grain-size)_var(--grain-size)] opacity-30 mix-blend-overlay"
                      />
                    )}
                    <span className={`flex size-12 items-center justify-center rounded-2xl ${STEP_TINTS[i]}`}>
                      <Icon size={24} />
                    </span>
                    <div className="mt-auto flex flex-col gap-2">
                      {/* Titles carry their own line break, so all four sit on two lines. */}
                      <h3 className="whitespace-pre-line text-[26px] font-semibold leading-tight tracking-title">{p.title}</h3>
                      <p className={`text-sm text-pretty ${last ? "text-white/70" : "text-[var(--muted)]"}`}>{p.body}</p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        </section>

        <section className={SECTION}>
          <SectionHeading className={HEADING}>{t("faqTitle")}</SectionHeading>
          <div className={BODY}>
            <dl className="flex flex-col">
              {faq.map((f, i) => (
                <div
                  key={f.q}
                  className={`flex flex-col gap-2 py-5 first:pt-0 ${i < faq.length - 1 ? "border-b border-[var(--color-line-1)]" : ""}`}
                >
                  <dt className="text-lg font-semibold text-[var(--black)]">{f.q}</dt>
                  <dd className="max-w-2xl text-base text-[var(--muted)]">{f.a}</dd>
                </div>
              ))}
            </dl>
            <a href={contactHref(locale)} data-sfx="cta" className={buttonClass({ className: "mt-10" })}>
              <ButtonInner>{t("cta")}</ButtonInner>
            </a>
          </div>
        </section>
      </main>
      <Footer cta="card" />
    </>
  );
}
