import { SERVICES } from "@/data/services";
import { WORKS } from "@/data/works";
import { PAGES } from "@/i18n/pages";
import { absoluteUrl } from "@/i18n/seo";
import { getPosts } from "@/lib/blog";
import { CONTACT_EMAIL } from "@/lib/contact";
import en from "../../../messages/en.json";
import es from "../../../messages/es.json";

// llms.txt (llmstxt.org): the site in plain Markdown for AI agents and answer
// engines, built from the same sources as the pages, so it never drifts.
export const dynamic = "force-static";

const link = (title: string, path: string, locale: "en" | "es", note?: string) =>
  `- [${title}](${absoluteUrl(path, locale)})${note ? `: ${note}` : ""}`;

// The Spanish path of a page (absoluteUrl adds the /es prefix).
const es_ = (key: string) => PAGES[key].paths.es ?? key;

export function GET() {
  const services = SERVICES.map((id) => link(en.services.items[id].title, `/services/${id}`, "en", en.services.items[id].body));
  const works = WORKS.filter((w) => PAGES[`/works/${w.id}`]?.index).map((w) =>
    link(`${w.productName}: ${w.title}`, `/works/${w.id}`, "en", w.description),
  );
  const posts = getPosts()
    .filter((p) => !p.draft)
    .map((p) => link(p.title, `/blog/${p.slug}`, p.locale, `${p.description} (${p.locale.toUpperCase()})`));

  const body = [
    "# Jesús Hernández",
    "",
    `> ${en.meta.description}`,
    "",
    "Product Engineer, Product Designer, Front-End Developer, Web Developer and Web Designer based in Buenos Aires, Argentina. " +
      "Designs in Figma and builds with React, Next.js and TypeScript (React Native for mobile), one person from research to production. " +
      "Available for freelance work with clients in Latin America, the United States and Spain, in English and Spanish.",
    "",
    `Contact: ${CONTACT_EMAIL}`,
    "",
    "## Pages",
    "",
    link("Home", "/", "en", en.meta.description),
    link("Services", "/services", "en", en.meta.services.description),
    link("About", "/about", "en", en.meta.about.description),
    link("Works", "/works", "en", en.meta.works.description),
    link("Blog", "/blog", "en", en.meta.blog.description),
    "",
    "## En español",
    "",
    link("Inicio", "/", "es", es.meta.description),
    link("Servicios", es_("/services"), "es", es.meta.services.description),
    link("Sobre mí", es_("/about"), "es", es.meta.about.description),
    link("Blog", "/blog", "es", es.meta.blog.description),
    "",
    "## Services",
    "",
    ...services,
    "",
    "## Case studies",
    "",
    ...works,
    "",
    "## Writing",
    "",
    ...posts,
    "",
  ].join("\n");

  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
