import type { Brand } from "@/data/case-studies";

/** Each tool's mark, drawn small and simplified, in its own colors. */
function Mark({ brand }: { brand: Brand }) {
  switch (brand) {
    case "next":
      return (
        <svg viewBox="0 0 24 24" className="h-6 w-6">
          <circle cx="12" cy="12" r="11" fill="#000" stroke="#fff" strokeOpacity="0.25" />
          <path d="M8.5 16.5V7.5l8 10.5M15.5 7.5v6" fill="none" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "react":
      return (
        <svg viewBox="-12 -12 24 24" className="h-6 w-6" fill="none" stroke="#61DAFB" strokeWidth="1">
          <circle r="2" fill="#61DAFB" stroke="none" />
          {[0, 60, 120].map((angle) => (
            <ellipse key={angle} rx="10.5" ry="4" transform={`rotate(${angle})`} />
          ))}
        </svg>
      );
    case "tailwind":
      return (
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="#fff">
          <path d="M12 4.8c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.91.23 1.57.89 2.29 1.62C13.67 10.62 15.03 12 18 12c3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.91-.23-1.57-.89-2.29-1.62C16.34 6.18 14.98 4.8 12 4.8zM6 12c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.91.23 1.57.89 2.29 1.62C7.67 17.82 9.03 19.2 12 19.2c3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.91-.23-1.57-.89-2.29-1.62C10.34 13.38 8.98 12 6 12z" />
        </svg>
      );
    case "vercel":
      return (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="#fff">
          <path d="M12 3l10 17.5H2z" />
        </svg>
      );
    case "figma":
      return (
        <svg viewBox="0 0 16 24" className="h-6 w-auto">
          <path d="M4 0h4v8H4a4 4 0 010-8z" fill="#F24E1E" />
          <path d="M8 0h4a4 4 0 010 8H8z" fill="#FF7262" />
          <path d="M4 8h4v8H4a4 4 0 010-8z" fill="#A259FF" />
          <circle cx="12" cy="12" r="4" fill="#1ABCFE" />
          <path d="M4 16h4v4a4 4 0 11-4-4z" fill="#0ACF83" />
        </svg>
      );
  }
}

/** Each tool's ground: a gradient in its colors. */
const GROUNDS: Record<Brand, string> = {
  next: "bg-[radial-gradient(120%_120%_at_100%_0%,#3a3a3a_0%,#0a0a0a_55%)]",
  react: "bg-[radial-gradient(120%_120%_at_100%_0%,#1d5a70_0%,#0b1620_60%)]",
  tailwind: "bg-[linear-gradient(135deg,#38BDF8_0%,#0E7490_100%)]",
  vercel: "bg-[radial-gradient(90%_120%_at_50%_120%,#3f3f46_0%,#09090b_65%)]",
  figma: "bg-[#1E1E1E] bg-[image:radial-gradient(80%_100%_at_0%_100%,#A259FF66_0%,transparent_60%),radial-gradient(80%_100%_at_100%_0%,#F24E1E55_0%,transparent_60%)]",
};

/** The stack as the brands it is built on, in one row on wide screens. */
export default function StackTiles({ items }: { items: { brand: Brand; name: string; text: string }[] }) {
  return (
    <ul data-tiles className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
      {items.map((item) => (
        <li
          key={item.brand}
          className={`relative isolate flex flex-col gap-6 overflow-hidden rounded-2xl p-5 text-white ${GROUNDS[item.brand]}`}
        >
          {/* The site's grain, so the gradients sit in the same paper as the rest. */}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10 opacity-60 mix-blend-overlay"
            style={{ backgroundImage: "var(--grain-image)", backgroundSize: "var(--grain-size) var(--grain-size)" }}
          />
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-white/10 ring-1 ring-white/15 backdrop-blur">
            <Mark brand={item.brand} />
          </span>
          <span className="mt-auto flex flex-col gap-1">
            <span className="text-lg font-semibold tracking-title">{item.name}</span>
            {/* Two lines in every tile, so the names line up across the row. */}
            <span className="line-clamp-2 min-h-[2.75em] text-pretty text-[13px] leading-snug text-white/70">{item.text}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}
