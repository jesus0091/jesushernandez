"use client";

import { useId, useState } from "react";
import { Plus } from "@/components/icons";

type Qa = { q: string; a: string };

/**
 * Questions that open one at a time. The answer's row animates from 0fr to
 * 1fr, so it slides open to its own height; the text fades and rises in a
 * beat later, and the plus turns into a cross.
 */
export default function FaqAccordion({ items }: { items: Qa[] }) {
  const [open, setOpen] = useState<number | null>(null);
  const base = useId();

  return (
    <div className="flex w-full flex-col border-t border-[var(--color-line-1)]">
      {items.map((f, i) => {
        const isOpen = open === i;
        const id = `${base}-${i}`;
        return (
          <div key={f.q} className="border-b border-[var(--color-line-1)]">
            <h3>
              <button
                type="button"
                id={`${id}-q`}
                aria-expanded={isOpen}
                aria-controls={`${id}-a`}
                onClick={() => setOpen(isOpen ? null : i)}
                className="group flex w-full items-center justify-between gap-6 py-4 text-left"
              >
                <span
                  className={`text-base md:text-lg font-semibold tracking-title text-balance transition-colors duration-300 ${
                    isOpen ? "text-[var(--color-accent-ink)]" : "text-[var(--black)] group-hover:text-[var(--color-accent-ink)]"
                  }`}
                >
                  {f.q}
                </span>
                <span
                  className={`flex size-8 shrink-0 items-center justify-center rounded-full transition-[transform,background-color,color] duration-500 ease-[var(--ease-out)] ${
                    isOpen ? "rotate-[135deg] bg-[var(--color-accent)] text-white" : "bg-black/[0.06] text-[var(--black)] group-hover:bg-black/10"
                  }`}
                >
                  <Plus size={14} weight="bold" aria-hidden />
                </span>
              </button>
            </h3>
            <div
              id={`${id}-a`}
              role="region"
              aria-labelledby={`${id}-q`}
              inert={!isOpen}
              className={`grid transition-[grid-template-rows] duration-500 ease-[var(--ease-out)] motion-reduce:transition-none ${
                isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
              }`}
            >
              <div className="overflow-hidden">
                <p
                  className={`pr-14 pb-6 text-base text-pretty text-[var(--muted)] transition-[opacity,transform] ease-[var(--ease-out)] motion-reduce:transition-none ${
                    isOpen ? "translate-y-0 opacity-100 duration-500 delay-100" : "-translate-y-1 opacity-0 duration-200"
                  }`}
                >
                  {f.a}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
