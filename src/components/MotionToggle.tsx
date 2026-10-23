"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Pause, Play } from "@/components/icons";

const KEY = "motion-paused";

/**
 * Pauses the animations that move on their own (the project walls, the logo
 * strip): WCAG 2.2.2 wants a way to stop anything that moves for more than
 * five seconds next to other content. Scroll-driven motion follows the user,
 * so it stays. The choice is remembered in this browser.
 */
export default function MotionToggle({ dark, className = "" }: { dark: boolean; className?: string }) {
  const t = useTranslations("nav");
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    try {
      setPaused(localStorage.getItem(KEY) === "1");
    } catch {}
  }, []);

  useEffect(() => {
    document.documentElement.dataset.motion = paused ? "paused" : "";
    try {
      localStorage.setItem(KEY, paused ? "1" : "0");
    } catch {}
  }, [paused]);

  const Icon = paused ? Play : Pause;
  return (
    <button
      type="button"
      onClick={() => setPaused((p) => !p)}
      aria-pressed={paused}
      aria-label={paused ? t("playMotion") : t("pauseMotion")}
      className={[
        "flex h-10 w-10 items-center justify-center rounded-full transition-colors duration-300",
        dark ? "text-white/70 hover:bg-white/10 hover:text-white" : "text-[var(--muted)] hover:bg-black/[0.05] hover:text-[var(--black)]",
        className,
      ].join(" ")}
    >
      <Icon size={18} />
    </button>
  );
}
