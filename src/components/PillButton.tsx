import type { ComponentType } from "react";
import { ArrowUpRight, type IconProps } from "@/components/icons";

type Tone = "light" | "dark";
type Size = "md" | "sm";

const TONES: Record<Tone, { button: string; chip: string }> = {
  light: {
    button: "border-[var(--color-line-2)] text-[var(--black)] hover:bg-black/[0.03]",
    chip: "bg-black/[0.06] group-hover/btn:bg-black/10",
  },
  // On dark or colored surfaces (the footer CTA).
  dark: {
    button: "border-white/20 text-white hover:bg-white/[0.06]",
    chip: "bg-white/10 group-hover/btn:bg-white/15",
  },
};

const SIZES: Record<Size, { button: string; chip: string; icon: number; label: string }> = {
  md: { button: "text-base", chip: "size-10", icon: 18, label: "px-4" },
  sm: { button: "text-sm", chip: "size-8", icon: 15, label: "px-3" },
};

type ClassOptions = {
  tone?: Tone;
  size?: Size;
  /** An orange glint that sweeps the border and label every few seconds (globals.css, .btn-shine). On by default. */
  shine?: boolean;
  className?: string;
};

/**
 * The site's button: an outlined pill with the label and its icon in a round
 * chip. Put it on any element (a, Link, button) and fill it with <ButtonInner>.
 */
export function buttonClass({ tone = "light", size = "md", shine = true, className = "" }: ClassOptions = {}) {
  return [
    "group/btn inline-flex w-fit items-center rounded-full border p-1.5 font-medium transition-colors duration-200 active:scale-[0.98]",
    TONES[tone].button,
    SIZES[size].button,
    shine ? "btn-shine relative" : "",
    className,
  ].join(" ");
}

type InnerProps = {
  children: React.ReactNode;
  /** The icon in the chip; an arrow pointing out by default. */
  icon?: ComponentType<IconProps>;
  /** "start" for icons that point back (a back arrow). */
  iconSide?: "start" | "end";
  tone?: Tone;
  size?: Size;
};

/** Label and icon chip of a button styled with buttonClass(). */
export function ButtonInner({ children, icon: Icon = ArrowUpRight, iconSide = "end", tone = "light", size = "md" }: InnerProps) {
  const chip = (
    <span
      aria-hidden="true"
      className={`flex shrink-0 items-center justify-center rounded-full transition-colors duration-200 ${SIZES[size].chip} ${TONES[tone].chip}`}
    >
      <Icon size={SIZES[size].icon} weight="bold" />
    </span>
  );
  return (
    <>
      {iconSide === "start" && chip}
      <span className={`btn-label whitespace-nowrap ${SIZES[size].label}`}>{children}</span>
      {iconSide === "end" && chip}
    </>
  );
}
