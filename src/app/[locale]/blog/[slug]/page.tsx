import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowLeft } from "@/components/icons";
import Footer from "@/components/Footer";
import JsonLd from "@/components/JsonLd";
import Navbar from "@/components/Navbar";
import SectionLabel from "@/components/SectionLabel";
import { Link } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";
import { PERSON_ID, SITE, absoluteUrl, alternatesFor, robotsFor, shareFor } from "@/i18n/seo";
import { formatPostDate, getPost, getPosts } from "@/lib/blog";

// The param is the post's key (its English slug); the Spanish URL is
// rewritten to it by next.config.ts (see src/i18n/slugs.ts).
type Props = { params: Promise<{ locale: Locale; slug: string }> };

// Unknown slugs, and a locale a post has no version in, get the 404.
export const dynamicParams = false;

export function generateStaticParams({ params }: { params: { locale: string } }) {
  return getPosts(params.locale as Locale).map((p) => ({ slug: p.key }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const post = getPost(locale, slug);
  if (!post) return {};

  const key = `/blog/${post.key}`;
  const share = shareFor(`/blog/${post.slug}`, locale, { title: post.title, description: post.description });
  return {
    // The titles are long: the site name only goes on the share card.
    title: { absolute: post.title },
    description: post.description,
    keywords: post.keywords,
    ...share,
    openGraph: {
      ...share.openGraph,
      type: "article",
      publishedTime: post.date,
      modifiedTime: post.updated,
      authors: [SITE],
    },
    alternates: alternatesFor(key, locale),
    robots: robotsFor(key, locale),
  };
}

export default async function PostPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const post = getPost(locale, slug);
  if (!post) notFound();
  const t = await getTranslations({ locale, namespace: "blog" });
  const url = absoluteUrl(`/blog/${post.slug}`, locale);

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          "@id": `${url}#article`,
          headline: post.title,
          description: post.description,
          datePublished: post.date,
          dateModified: post.updated,
          inLanguage: locale === routing.defaultLocale ? "en" : "es",
          keywords: post.keywords.join(", "),
          author: { "@id": PERSON_ID },
          publisher: { "@id": PERSON_ID },
          mainEntityOfPage: url,
          url,
        }}
      />
      <Navbar />
      <main id="main-content" className="mx-auto w-full max-w-[1280px] px-6 pt-32 pb-24 md:px-8 md:pt-40">
        <article className="mx-auto max-w-[720px]">
          <header className="flex flex-col gap-5">
            <Link
              href="/blog"
              data-sfx="nav"
              className="inline-flex w-fit items-center gap-2 font-mono text-xs uppercase tracking-[0.08em] text-[var(--muted)] transition-colors hover:text-[var(--black)]"
            >
              <ArrowLeft size={14} aria-hidden />
              {t("back")}
            </Link>
            <SectionLabel animate="none">
              {t("label")}
              {post.draft && ` · ${t("draft")}`}
            </SectionLabel>
            <h1 className="font-semibold tracking-title text-[var(--black)] text-[clamp(32px,4.6vw,56px)] leading-[1.06] text-balance">
              {post.title}
            </h1>
            <p className="text-lg md:text-xl text-[var(--muted)] text-pretty">{post.description}</p>
            <p className="flex flex-wrap gap-x-3 gap-y-1 border-y border-black/10 py-4 font-mono text-xs uppercase tracking-[0.08em] text-[var(--color-ink-4)]">
              <time dateTime={post.date}>{formatPostDate(post.date, locale)}</time>
              <span aria-hidden>·</span>
              <span>{t("minutes", { minutes: post.minutes })}</span>
              {post.updated !== post.date && (
                <>
                  <span aria-hidden>·</span>
                  <time dateTime={post.updated}>
                    {t("updated", { date: formatPostDate(post.updated, locale) })}
                  </time>
                </>
              )}
            </p>
          </header>

          {/* Server-rendered HTML, so crawlers that don't run JS read the whole post. */}
          <div className="post-body mt-12" dangerouslySetInnerHTML={{ __html: post.html }} />
        </article>
      </main>
      <Footer cta="card" />
    </>
  );
}
