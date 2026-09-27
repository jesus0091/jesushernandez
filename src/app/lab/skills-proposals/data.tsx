// Skills, updated from what shows up in recent projects (2026 repos).
export type Category = { key: "dev" | "design" | "soft"; label: string; skills: string[] };

export const CATEGORIES: Category[] = [
  {
    key: "dev",
    label: "Development",
    skills: [
      "React", "Next.js", "TypeScript", "JavaScript", "Vite", "TailwindCSS",
      "GSAP", "Framer Motion", "Zustand", "TanStack Query", "React Hook Form",
      "React Native", "Expo",
      "Supabase", "PostgreSQL", "Prisma", "Drizzle", "Convex", "Redis", "Hono",
      "Playwright", "Vitest", "Testing Library", "Zod", "Storybook", "Git",
      "Claude API", "AI Prompting",
    ],
  },
  {
    key: "design",
    label: "Design",
    skills: ["Figma", "Design System", "Prototyping", "UX Research", "Accessibility", "AI Design", "Midjourney"],
  },
  {
    key: "soft",
    label: "Soft Skills",
    skills: [
      "Communication", "Teamwork", "Problem Solving", "Empathy",
      "Ownership", "Mentoring", "Adaptability", "Critical Thinking", "Self-management",
    ],
  },
];
