/** What a block shows under its text. */
export type CaseVisual =
  | { kind: "devices"; desktop: string; tablet: string; phone: string }
  | { kind: "phones"; screens: { src: string; label: string }[] }
  | {
      kind: "metrics";
      /** Lighthouse scores, out of 100, on the live home page, October 2026. */
      scores: { label: string; value: number }[];
    }
  | { kind: "rows"; rows: { title: string; text: string }[] }
  | { kind: "stack"; items: { brand: Brand; name: string; text: string }[] };

/** A tool the stack tiles have a mark for. */
export type Brand = "next" | "react" | "tailwind" | "vercel" | "figma";

export type CaseBlock = {
  kicker: string;
  title: string;
  text?: string;
  /** Short labelled lines under the text, such as what changes at each size. */
  points?: { label: string; text: string }[];
  visual?: CaseVisual;
};

/** Icon of a scope item; the component maps the name to the glyph. */
export type WorkIcon = "research" | "structure" | "identity" | "responsive" | "code" | "seo" | "performance" | "testing" | "launch";

/** A search for the client that ends on their site; plays under a process step. */
export type SearchDemo = { query: string; url: string; title: string; description: string; image: string };

/** What a process step looks like; drawn in the page, and built up by the scroll. */
export type ProcessVisual =
  | { kind: "notes"; groups: { label: string; notes: string[] }[] }
  | { kind: "sitemap"; root: string; pages: { label: string; children?: string[] }[] }
  | { kind: "prototype"; desktop: { label: string; image: string }; phone: { label: string; image: string }; reviewer: string; comment: string }
  | { kind: "code"; file: string; lines: string[]; status: string }
  | { kind: "checks"; label: string; checks: string[]; done: string };

export type CaseStudy = {
  challenge: string;
  /** The project as the client lived it; `client` is what they saw or received at that step. */
  process: { heading: string; summary: string; steps: { phase: string; icon: WorkIcon; title: string; text: string; client: string; visual?: ProcessVisual; demo?: SearchDemo }[] };
  identity: {
    heading: string;
    summary: string;
    type: { title: string; text: string; fonts: { family: string; role: string; weight: number; sample: string }[] };
    color: { title: string; text: string };
    /** `group` is the color's role; the colors of one role are shown together. */
    palette: { name: string; hex: string; group: string }[];
  };
  /**
   * Deep dives, each laid out its own way: "zigzag" alternates text and visual
   * side to side, "cards" turns the rows into a grid, "panel" is a dark sheet.
   */
  chapters: { label: string; heading: string; summary: string; layout: "zigzag" | "cards" | "panel"; blocks: CaseBlock[] }[];
  closing: { heading: string; href: string; label: string };
};

const img = (name: string) => `/images/pataro/${name}.webp`;

export const FUNDACION_PATARO: CaseStudy = {
  challenge:
    "The front door to six health programs. It had to explain a lot in little time, feel as trustworthy as the people behind it, work on any phone, and be found.",
  process: {
    heading: "From the first conversation\nto launch day",
    summary:
      "How a website gets made end to end: designed, developed, tested and launched, with the client seeing and approving something real at every step, long before there is code.",
    steps: [
      {
        phase: "Discovery",
        icon: "research",
        title: "Listen first",
        text: "Kickoff with the foundation to learn what it does, who it serves and what the site has to achieve.",
        client: "A shared brief with goals and audiences",
        visual: {
          kind: "notes",
          groups: [
            { label: "Audiences", notes: ["Health professionals", "Partner institutions", "The community"] },
            { label: "Goals", notes: ["Explain the work fast", "Feel trustworthy", "Work on a phone", "Be found"] },
          ],
        },
      },
      {
        phase: "Ideation",
        icon: "structure",
        title: "Structure before pixels",
        text: "Sitemap and wireframes, with the six programs on one shared template, so hierarchy is settled before styling.",
        client: "Sitemap and wireframes to review",
        visual: {
          kind: "sitemap",
          root: "Home",
          pages: [
            { label: "About" },
            { label: "Programs", children: ["01", "02", "03", "04", "05", "06"] },
            { label: "Contact" },
          ],
        },
      },
      {
        phase: "Design",
        icon: "identity",
        title: "Show it, don't describe it",
        text: "A clickable Figma prototype with the identity applied: the client navigates it, and a change costs minutes.",
        client: "A clickable prototype, revised and signed off",
        visual: {
          kind: "prototype",
          desktop: { label: "Home / Desktop", image: img("hero") },
          phone: { label: "Home / Mobile", image: img("responsive-phone") },
          reviewer: "Client",
          comment: "Approved",
        },
      },
      {
        phase: "Development",
        icon: "code",
        title: "Design into code",
        text: "The approved design built with Next.js and Tailwind CSS, with SEO and performance done alongside the pages.",
        client: "A preview link to follow progress",
        // Illustrative, not a file from the project.
        visual: {
          kind: "code",
          file: "app/page.tsx",
          lines: [
            "export default function Home() {",
            "  return (",
            '    <section className="grid md:grid-cols-2">',
            '      <h1 className="font-serif text-5xl">',
            "        Innovación y cuidado",
            "      </h1>",
            '      <Button href="/programas">Ver programas</Button>',
            "    </section>",
            "  );",
            "}",
          ],
          status: "Compiled · 10 static pages",
        },
      },
      {
        phase: "Testing",
        icon: "testing",
        title: "Check it before anyone else does",
        text: "Every page reviewed on phone, tablet and desktop, then measured with Lighthouse for speed, SEO and layout shift.",
        client: "A tested site, ready to go live",
        visual: {
          kind: "checks",
          label: "Pre-launch checks",
          checks: ["Phone", "Tablet", "Desktop", "Contrast", "Reading sizes", "Performance", "SEO", "Layout shift"],
          done: "All checks passed, ready to go live",
        },
      },
      {
        phase: "Launch",
        icon: "launch",
        title: "Launch and hand over",
        text: "Deployment on Vercel under the foundation's own domain, and the site handed over live and measured.",
        client: "The live site, on their domain",
        demo: {
          query: "Fundación Patricio Pataro",
          url: "www.fundacionpatriciopataro.com",
          title: "Inicio | Fundación Patricio Pataro",
          description: "Impulsamos la excelencia médica mediante educación, investigación e innovación.",
          image: img("hero"),
        },
      },
    ],
  },
  identity: {
    heading: "Human first,\nclinical second.",
    summary:
      "A foundation asks for trust before it asks for anything else. The identity is built to feel like the people in it: warm in its type, calm in its color, and precise in everything else.",
    type: {
      title: "A serif that sounds like a person",
      text: "Source Serif 4 gives headings a human voice; Inter keeps everything else clear.",
      fonts: [
        {
          family: "Source Serif 4",
          role: "Headings · Semibold, Bold",
          weight: 700,
          sample: "Innovación y cuidado para una vida más saludable",
        },
        {
          family: "Inter",
          role: "Body and interface · Regular to Bold",
          weight: 400,
          sample: "Impulsamos la excelencia médica mediante educación, investigación e innovación.",
        },
      ],
    },
    color: {
      title: "One blue, used with restraint",
      text: "One blue does the talking; teal is the only second voice.",
    },
    palette: [
      { name: "Primary", hex: "#0B5ED7", group: "Blue" },
      { name: "Primary dark", hex: "#0A4DB8", group: "Blue" },
      { name: "Primary hover", hex: "#083A8F", group: "Blue" },
      { name: "Secondary", hex: "#1E3A5F", group: "Accents" },
      { name: "Teal", hex: "#0D9488", group: "Accents" },
      { name: "Sky", hex: "#BAE6FD", group: "Surfaces" },
      { name: "Soft blue", hex: "#EAF2FF", group: "Surfaces" },
      { name: "Background", hex: "#F8FAFC", group: "Surfaces" },
      { name: "Border", hex: "#E2E8F0", group: "Surfaces" },
    ],
  },
  chapters: [
    {
      label: "Responsive",
      layout: "zigzag",
      heading: "Built for the phone in someone's hand",
      summary:
        "Most visitors arrive on a phone, so every screen was designed for it, not shrunk down.",
      blocks: [
        {
          kicker: "Layout",
          title: "One design, three sizes",
          text: "The same content, ordered for each screen instead of shrunk to fit it.",
          points: [
            { label: "Desktop · 1440", text: "Two columns: the message beside the photo collage." },
            { label: "Tablet · 768", text: "One column, with the collage moving under the text." },
            { label: "Mobile · 390", text: "A full-height menu and the action within thumb reach." },
          ],
          visual: {
            kind: "devices",
            desktop: img("responsive-desktop"),
            tablet: img("responsive-tablet"),
            phone: img("responsive-phone"),
          },
        },
      ],
    },
    {
      label: "Technology",
      layout: "cards",
      heading: "A stack chosen for speed and upkeep",
      summary:
        "A foundation's site has to stay fast and keep working without an engineering team behind it. Each piece of the stack is there to remove a class of problems, not to add a feature.",
      blocks: [
        {
          kicker: "Stack",
          title: "What it is built with",
          visual: {
            kind: "stack",
            items: [
              { brand: "next", name: "Next.js", text: "Every page built ahead of time and served as HTML." },
              { brand: "react", name: "React", text: "One component library behind all ten pages." },
              { brand: "tailwind", name: "Tailwind CSS", text: "The Figma tokens, written once as theme values." },
              { brand: "figma", name: "Figma", text: "Design, prototype and the tokens behind the code." },
              { brand: "vercel", name: "Vercel", text: "Deploys from Git, served from the edge." },
            ],
          },
        },
      ],
    },
    {
      label: "Search",
      layout: "panel",
      heading: "Built to be found",
      summary: "When someone searches for the foundation, the site is there. It was built from day one so Google understands every page.",
      blocks: [
        {
          kicker: "Speed",
          title: "Fast is part of being found",
          text: "Google favours sites that open quickly, and people don't wait for slow ones. This one is on screen in under a second.",
          visual: {
            kind: "metrics",
            scores: [
              { label: "Speed", value: 96 },
              { label: "Search", value: 100 },
            ],
          },
        },
        {
          kicker: "On every page",
          title: "Everything Google needs to understand it",
          text: "Each page tells search engines what it is about, so the right page shows up for the right search.",
          visual: {
            kind: "rows",
            rows: [
              { title: "A title and summary per page", text: "Unique on each of the ten pages, written for the search that leads there." },
              { title: "Who the foundation is, for Google", text: "JSON-LD for the organization (NGO), each program (Service), breadcrumbs, About and Contact." },
              { title: "A clear page structure", text: "One h1 per page, real landmarks, a skip link, and the language declared as Spanish." },
              { title: "A map of every page", text: "A generated sitemap.xml listing every page, referenced from robots.txt." },
              { title: "Previews when a link is shared", text: "Open Graph and Twitter cards, so a shared link arrives with its title, description and image." },
              { title: "Images described in words", text: "Alt text on every image, so the content exists for screen readers and image search too." },
            ],
          },
        },
      ],
    },
  ],
  closing: {
    heading: "See it live",
    href: "https://www.fundacionpatriciopataro.com/",
    label: "fundacionpatriciopataro.com",
  },
};
