import React from "react";

type SectionLabelProps = {
  children: React.ReactNode;
  align?: "left" | "center";
  /** "inverse" for dark/colored surfaces where the orange accent lacks contrast. */
  tone?: "accent" | "inverse";
  className?: string;
};

const SectionLabel = React.forwardRef<HTMLDivElement, SectionLabelProps>(
  function SectionLabel({ children, align = "left", tone = "accent", className = "" }, ref) {
    const isCenter = align === "center";
    const line = tone === "inverse" ? "bg-[var(--color-bg)]/60" : "bg-[var(--orange)]/70";
    const text = tone === "inverse" ? "text-[var(--color-bg)]" : "text-[var(--orange)]";
    return (
      <div
        ref={ref}
        data-section-label
        className={`inline-flex items-center gap-3 ${isCenter ? "justify-center" : ""} ${className}`}
      >
        <span aria-hidden className={`h-px w-8 ${line}`} />
        <span className={`text-xs md:text-sm font-semibold uppercase tracking-[0.2em] ${text}`}>
          {children}
        </span>
        {isCenter && <span aria-hidden className={`h-px w-8 ${line}`} />}
      </div>
    );
  }
);

export default SectionLabel;
