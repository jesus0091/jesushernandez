import { FUNDACION_PATARO, type CaseStudy } from "./case-studies";

export type LinkOut = {
  type: "behance" | "github" | "website";
  href: string;
  label: string;
};

export type Work = {
  id: string;
  index: string;
  category: string;
  title: string;
  /** The title as set on the project's own page, one entry per line. */
  titleLines?: string[];
  productName: string;
  role: string;
  description: string;
  /** Who the client is and what was done for them; opens the project's page in place of the description. */
  overview?: { client: string; sector: string; about: string; work: string };
  cover: string;
  /** Screens of the project (800×354). When set, a mosaic of them replaces the cover. */
  mosaic?: string[];
  caseStudy?: CaseStudy;
  technologies: string[];
  integrations?: string[];
  tools: string[];
  links?: LinkOut[];
};

export const WORKS: Work[] = [
  {
    id: "ristario",
    index: "01",
    category: "Design & Development",
    title: "Website Design & Development",
    productName: "Ristario",
    role: "UX/UI Designer & FullStack Developer",
    description:
      "Full ownership of Ristario's digital presence from concept to production. Designed the brand identity, UI system, and all visual assets, then implemented the full website in Next.js. Shipped as a single handoff-free project.",
    cover: "/images/linkedin.webp",
    technologies: ["NextJS", "TypeScript", "TailwindCSS", "ReactJS"],
    integrations: ["Vercel", "Google Analytics"],
    tools: ["Figma", "Git", "Vercel", "Photoshop"],
    links: [
      { type: "behance", href: "https://www.behance.net/devjesushernandez", label: "Behance" },
      { type: "github", href: "#", label: "GitHub" },
    ],
  },
  {
    id: "move-the-chain",
    index: "02",
    category: "UX/UI Design & Frontend Dev",
    title: "SaaS Platform",
    productName: "Move The Chain",
    role: "UX/UI Designer & Developer",
    description:
      "End-to-end design and development of a SaaS platform focused on employee engagement. Led design for onboarding flows, the dashboard redesign and the full component design system, delivering wireframes, interactive prototypes and production-ready specs. Then built and maintained complex feature workflows and a reusable component library, bringing the design system into code in a collaborative Agile team shipping production features weekly.",
    cover: "/images/mtc-design.webp",
    technologies: ["ReactJS", "NextJS", "TypeScript", "TailwindCSS", "StyledComponents", "Figma", "Design System", "Prototyping", "UX Research"],
    integrations: ["REST API", "Auth0", "Intercom", "Mixpanel"],
    tools: ["Figma", "FigJam", "Git", "Jira", "Notion", "Loom", "Vercel"],
    links: [
      { type: "github", href: "#", label: "GitHub" },
      { type: "behance", href: "https://www.behance.net/devjesushernandez", label: "Behance" },
    ],
  },
  {
    id: "fundacion-pataro",
    index: "03",
    category: "Design & Development",
    title: "Six health programs, one site built to be found",
    titleLines: ["Six health programs,", "one site built to be found"],
    productName: "Fundación Pataro",
    role: "UX/UI Designer & Developer",
    description:
      "End-to-end website for Fundación Patricio Pataro, a foundation that works on medical training, research and healthcare management. An end-to-end project: I designed it, developed it, tested it and launched it to production.",
    overview: {
      client: "Fundación Patricio Pataro",
      sector: "Healthcare · Foundation",
      about:
        "Fundación Patricio Pataro is a foundation that works on medical training, research and healthcare management. It runs six programs, for the doctors, institutions and families they reach.",
      work: "An end-to-end project, by one person: I designed the website, developed it, tested it and launched it to production.",
    },
    cover: "/images/Banner-10.webp",
    // Order matters: the mosaic deals even and odd entries to alternating rows.
    mosaic: ["hero", "purpose", "training", "impact", "audience", "research", "mission"].map(
      (name) => `/images/pataro/${name}.webp`,
    ),
    technologies: ["NextJS", "ReactJS", "TailwindCSS", "Figma", "Design System", "Accessibility"],
    integrations: ["Vercel", "Tabler Icons"],
    tools: ["Figma", "FigJam", "Notion", "Git"],
    links: [
      { type: "website", href: "https://www.fundacionpatriciopataro.com/", label: "Visit website" },
    ],
    caseStudy: FUNDACION_PATARO,
  },
  {
    id: "iacon",
    index: "04",
    category: "UX/UI Design",
    title: "Landing Page Redesign",
    productName: "IACON",
    role: "UX/UI Designer",
    description:
      "Redesign of IACON's corporate landing page with modern aesthetics and stronger brand positioning. Created new visual assets, a refreshed type system, and a component-based layout system in Figma.",
    cover: "/images/iacon.webp",
    technologies: ["Figma", "Design System", "Branding"],
    integrations: [],
    tools: ["Figma", "FigJam", "Illustrator"],
    links: [{ type: "behance", href: "https://www.behance.net/devjesushernandez", label: "Behance" }],
  },
  {
    id: "smart-factory",
    index: "05",
    category: "UX/UI Design",
    title: "Industrial Dashboard",
    productName: "Smart Factory",
    role: "UX/UI Designer",
    description:
      "Data-first dashboard design for factory floor operators to monitor production machinery in real time. Designed for high-density information display with a focus on clarity under stress conditions.",
    cover: "/images/smart-f.webp",
    technologies: ["Figma", "Dashboard Design", "Data Viz", "Design System"],
    integrations: [],
    tools: ["Figma", "FigJam"],
    links: [{ type: "behance", href: "https://www.behance.net/devjesushernandez", label: "Behance" }],
  },
  {
    id: "cc-webapp",
    index: "06",
    category: "UX/UI Design",
    title: "Web Application",
    productName: "Omnipad",
    role: "UX/UI Designer",
    description:
      "Task management web app for call center teams. Designed end-to-end flows for scheduling, tracking, and managing client calls, validated with real call center agents before handoff.",
    cover: "/images/omnipad.webp",
    technologies: ["Figma", "UI Design", "Prototyping", "UX Research"],
    integrations: [],
    tools: ["Figma", "FigJam", "Maze", "Notion"],
    links: [{ type: "behance", href: "https://www.behance.net/devjesushernandez", label: "Behance" }],
  },
  {
    id: "psy-app",
    index: "07",
    category: "UX/UI Design",
    title: "Mobile App — iOS",
    productName: "Academic Project",
    role: "UX/UI Designer",
    description:
      "Full Design Thinking process applied to an iOS application for psychologists. From discovery interviews and empathy maps to wireframes, high-fidelity prototypes, and usability testing.",
    cover: "/images/therapia.webp",
    technologies: ["Figma", "iOS Design", "Design System", "Prototyping"],
    integrations: [],
    tools: ["Figma", "FigJam", "Maze"],
    links: [{ type: "behance", href: "https://www.behance.net/devjesushernandez", label: "Behance" }],
  },
];

export function getWorkById(id: string): Work | undefined {
  return WORKS.find((w) => w.id === id);
}
