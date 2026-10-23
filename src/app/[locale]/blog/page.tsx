import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowRight } from "@/components/icons";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import SectionLabel from "@/components/SectionLabel";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { alternatesFor, robotsFor, shareFor } from "@/i18n/seo";
import { formatPostDate, getPosts } from "@/lib/blog";

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta.blog" });
  return {
    title: t("title"),
    description: t("description"),
    ...shareFor("/blog", locale, {
      title: `${t("title")} | Jesús Hernández`,
      description: t("description"),
    }),
    alternates: alternatesFor("/blog", locale),
    robots: robotsFor("/blog", locale),
  };
}

export default async function BlogPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "blog" });
  const posts = getPosts(locale);

  return (
    <>
      <Navbar />
      <main id="main-content" className="mx-auto min-h-svh w-full max-w-[1280px] px-6 pt-32 pb-24 md:px-8 md:pt-40">
        <header className="flex max-w-4xl flex-col gap-4">
          <SectionLabel animate="none">{t("label")}</SectionLabel>
          <h1 className="font-semibold tracking-title text-[var(--black)] text-[clamp(40px,6.5vw,96px)] leading-[1.02] text-balance">
            {t("title")}
          </h1>
          <p className="max-w-2xl text-base md:text-lg text-[var(--muted)]">{t("lead")}</p>
        </header>

        {posts.length === 0 ? (
          <p className="mt-20 text-base text-[var(--muted)]">{t("empty")}</p>
        ) : (
          <ol className="mt-16 flex flex-col border-t border-black/10 md:mt-24">
            {posts.map((post) => (
              <li key={post.slug} className="border-b border-black/10">
                <Link
                  href={`/blog/${post.slug}`}
                  data-sfx="nav"
                  className="group grid gap-3 py-8 md:grid-cols-[180px_1fr_auto] md:gap-10 md:py-10"
                >
                  <span className="font-mono text-xs uppercase tracking-[0.08em] text-[var(--color-ink-4)] md:pt-2">
                    <time dateTime={post.date}>{formatPostDate(post.date, locale)}</time>
                    {post.draft && <span className="ml-2 text-[var(--color-accent-ink)]">· {t("draft")}</span>}
                  </span>
                  <span className="flex max-w-3xl flex-col gap-2">
                    <span className="text-xl md:text-2xl font-semibold tracking-title text-[var(--black)] text-balance transition-colors group-hover:text-[var(--color-accent-ink)]">
                      {post.title}
                    </span>
                    <span className="text-base text-[var(--muted)]">{post.description}</span>
                    <span className="font-mono text-xs uppercase tracking-[0.08em] text-[var(--color-ink-4)]">
                      {t("minutes", { minutes: post.minutes })}
                    </span>
                  </span>
                  <ArrowRight
                    size={20}
                    aria-hidden
                    className="hidden text-[var(--black)] transition-transform group-hover:translate-x-1 md:block md:mt-2"
                  />
                </Link>
              </li>
            ))}
          </ol>
        )}
      </main>
      <Footer />
    </>
  );
}
