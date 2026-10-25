import { ButtonInner, buttonClass } from "@/components/PillButton";
import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowRight, BehanceLogo, GithubLogo, LinkedinLogo } from "@/components/icons";
import Footer from "@/components/Footer";
import JsonLd from "@/components/JsonLd";
import Navbar from "@/components/Navbar";
import SectionLabel from "@/components/SectionLabel";
import SectionHeading from "@/components/motion/SectionHeading";
import { getWorkById } from "@/data/works";
import { Link } from "@/i18n/navigation";
import { pageFor } from "@/i18n/pages";
import type { Locale } from "@/i18n/routing";
import { PERSON_ID, absoluteUrl, alternatesFor, robotsFor, shareFor } from "@/i18n/seo";
import { contactHref } from "@/lib/contact";

type Props = { params: Promise<{ locale: Locale }> };
type Fact = { term: string; value: string };
type Item = { title: string; body: string };

const PAGE = "/about";
// The case studies indexed so far (see src/i18n/pages.ts).
const SELECTED = ["ristario", "fundacion-pataro"];
const PROFILES = [
  { label: "LinkedIn", href: "https://www.linkedin.com/in/jesushernandez91/", Icon: LinkedinLogo },
  { label: "GitHub", href: "https://github.com/jesus0091", Icon: GithubLogo },
  { label: "Behance", href: "https://www.behance.net/devjesushernandez", Icon: BehanceLogo },
];

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta.about" });
  const path = pageFor(PAGE).paths[locale] ?? PAGE;
  return {
    title: t("title"),
    description: t("description"),
    ...shareFor(path, locale, { title: `${t("title")} | Jesús Hernández`, description: t("description") }),
    alternates: alternatesFor(PAGE, locale),
    robots: robotsFor(PAGE, locale),
  };
}

export default async function AboutPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "aboutPage" });
  const page = pageFor(PAGE);
  const facts = t.raw("facts") as Fact[];
  const what = t.raw("what") as Item[];
  const works = SELECTED.map(getWorkById).filter((w) => w !== undefined);

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ProfilePage",
          url: absoluteUrl(page.paths[locale] ?? PAGE, locale),
          inLanguage: locale,
          dateModified: page.updated,
          mainEntity: { "@id": PERSON_ID },
        }}
      />
      <Navbar />
      <main id="main-content" className="mx-auto w-full max-w-[1280px] px-6 pt-32 pb-24 md:px-8 md:pt-40">
        <header className="grid gap-10 md:grid-cols-[1.3fr_1fr] md:items-end md:gap-16">
          <div className="flex flex-col gap-4">
            <SectionLabel animate="none">{t("label")}</SectionLabel>
            {/* The role is part of the title (it says what the page is about), set on its own line. */}
            <h1 className="flex flex-col gap-4 text-[var(--black)]">
              <span className="font-semibold tracking-title text-[clamp(44px,8vw,112px)] leading-[1.02]">
                {t("title")}
              </span>
              <span className="sr-only">, </span>
              <span className="text-xl md:text-2xl font-medium">{t("role")}</span>
            </h1>
            <p className="max-w-xl text-base md:text-lg text-[var(--muted)]">{t("lead")}</p>
          </div>
          <div className="relative aspect-[16/10] w-full overflow-hidden rounded-card md:aspect-[4/5] md:max-w-md md:justify-self-end">
            <Image
              src="/images/about_me.webp"
              alt="Jesús Hernández"
              fill
              priority
              sizes="(max-width: 768px) 100vw, 28rem"
              className="object-cover object-[50%_20%] md:object-top"
            />
          </div>
        </header>

        <section className="mt-20 md:mt-28">
          <SectionHeading className="text-2xl sm:text-3xl md:text-5xl leading-tighter font-semibold tracking-title text-[var(--black)]">
            {t("factsTitle")}
          </SectionHeading>
          <dl className="mt-8 grid border-t border-black/10 md:grid-cols-2 md:gap-x-16">
            {facts.map((f) => (
              <div key={f.term} className="flex flex-col gap-1 border-b border-black/10 py-4 md:flex-row md:gap-6">
                <dt className="shrink-0 font-mono text-xs uppercase tracking-[0.08em] text-[var(--color-ink-3)] md:w-36 md:pt-1">
                  {f.term}
                </dt>
                <dd className="text-base md:text-lg text-[var(--black)]">{f.value}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="mt-20 md:mt-28">
          <SectionHeading className="text-2xl sm:text-3xl md:text-5xl leading-tighter font-semibold tracking-title text-[var(--black)]">
            {t("whatTitle")}
          </SectionHeading>
          <ul className="mt-8 grid gap-8 md:grid-cols-3 md:gap-10">
            {what.map((w) => (
              <li key={w.title} className="flex flex-col gap-2 border-t border-black/10 pt-5">
                <h3 className="text-lg md:text-xl font-semibold text-[var(--black)]">{w.title}</h3>
                <p className="text-base text-[var(--muted)]">{w.body}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-20 md:mt-28">
          <SectionHeading className="text-2xl sm:text-3xl md:text-5xl leading-tighter font-semibold tracking-title text-[var(--black)]">
            {t("workTitle")}
          </SectionHeading>
          <ul className="mt-8 grid gap-6 md:grid-cols-2">
            {works.map((w) => (
              <li key={w.id}>
                <Link href={`/works/${w.id}`} className="group flex flex-col gap-3">
                  <div className="relative aspect-[1600/707] overflow-hidden rounded-card bg-zinc-100">
                    <Image
                      src={w.cover}
                      alt={`${w.productName} — ${w.title}`}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                  </div>
                  <span className="text-lg font-semibold text-[var(--black)]">{w.productName}</span>
                  <span className="-mt-2 text-base text-[var(--muted)]">{w.title}</span>
                </Link>
              </li>
            ))}
          </ul>
          <Link href="/works" className="mt-6 inline-flex items-center gap-2 text-base font-medium text-[var(--black)] hover:underline">
            {t("workLink")}
            <ArrowRight size={16} />
          </Link>
        </section>

        <section className="mt-20 md:mt-28">
          <SectionHeading className="text-2xl sm:text-3xl md:text-5xl leading-tighter font-semibold tracking-title text-[var(--black)]">
            {t("elsewhereTitle")}
          </SectionHeading>
          <ul className="mt-8 flex flex-wrap gap-3">
            {PROFILES.map(({ label, href, Icon }) => (
              <li key={label}>
                <a
                  href={href}
                  target="_blank"
                  rel="me noopener noreferrer"
                  data-sfx="social"
                  className={buttonClass()}
                >
                  <ButtonInner icon={Icon}>{label}</ButtonInner>
                </a>
              </li>
            ))}
          </ul>
          <div className="mt-12 flex flex-wrap gap-3">
            <a
              href={contactHref(locale)}
              data-sfx="cta"
              className={buttonClass()}
            >
              <ButtonInner>{t("cta")}</ButtonInner>
            </a>
            <Link
              href={pageFor("/services").paths[locale] ?? "/services"}
              className={buttonClass()}
            >
              <ButtonInner icon={ArrowRight}>{t("ctaServices")}</ButtonInner>
            </Link>
          </div>
        </section>
      </main>
      <Footer cta="card" />
    </>
  );
}
