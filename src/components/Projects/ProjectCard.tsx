"use client";

import { ArrowUpRight, User, Users } from "@/components/icons";

import Image from "next/image";
import Link from "next/link";
import { LinkOut } from "./LatestsProjects";

export type Mode = "solo" | "collab";
export type Category = "frontend" | "design";

export type Project = {
  id: string;
  title: string;
  productName: string;
  role: string;
  summary: string;
  stack: string[];
  cover: string;
  category: Category;
  mode: Mode;
  links?: LinkOut[];
};

export default function ProjectCard({ project }: { project: Project }) {
  const p = project;

  return (
    <Link
      href={`/works/${p.id}`}
      aria-label={`Open ${p.productName} — ${p.role}`}
      className="group relative block overflow-hidden rounded-2xl border border-black/[0.06] bg-white/70 backdrop-blur-sm transition-colors duration-300 ease-out hover:border-black/[0.12] hover:bg-white"
    >
      <article>
        {/* Covers are exported at 1600×707. */}
        <div className="relative aspect-[1600/707] w-full overflow-hidden bg-zinc-100">
          <Image
            src={p.cover}
            alt={`${p.title} cover`}
            fill
            sizes="(max-width: 768px) 100vw, 860px"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
            priority={p.id === "ristario"}
          />

          <span
            className={`absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium backdrop-blur-md ${
              p.mode === "solo"
                ? "bg-white/85 text-[var(--orange)]"
                : "bg-black/70 text-white"
            }`}
          >
            {p.mode === "solo" ? (
              <User className="h-3.5 w-3.5" />
            ) : (
              <Users className="h-3.5 w-3.5" />
            )}
            {p.mode === "solo" ? "Solo" : "Collaborative"}
          </span>
        </div>

        <div className="flex items-center justify-between gap-4 px-5 md:px-6 pt-4 md:pt-5 pb-5 md:pb-6">
          <div>
            <h3 className="text-lg md:text-xl font-semibold leading-tight text-[var(--black)]">
              {p.productName}
            </h3>

            <p className="mt-1 text-sm text-[var(--muted)]">{p.role}</p>
          </div>

          <span
            aria-hidden
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--black)] text-white opacity-0 translate-y-1 transition-[opacity,translate] duration-300 ease-out group-hover:opacity-100 group-hover:translate-y-0"
          >
            <ArrowUpRight size={16} />
          </span>
        </div>
      </article>
    </Link>
  );
}
