"use client";

import { useEffect } from "react";
import { isSoundEnabled, playHoverSound, playSound, unlockAudio, type SoundName } from "@/lib/sound";

// Opt-in hover sounds via data-sfx="cta" | "nav" | "social" on any element.
const HOVER: Record<string, SoundName> = {
  cta: "ctaHover",
  nav: "navHover",
  social: "socialHover",
};

/** Delegated UI sounds: hover on [data-sfx] elements, click on every link/button. */
export default function UiSounds() {
  useEffect(() => {
    const onOver = (e: PointerEvent) => {
      const el = (e.target as Element | null)?.closest<HTMLElement>("[data-sfx]");
      // pointerover bubbles from children; only fire when entering the element itself
      if (!el || el.contains(e.relatedTarget as Node | null)) return;
      const name = HOVER[el.dataset.sfx ?? ""];
      if (name) playHoverSound(e, name);
    };
    const onClick = (e: MouseEvent) => {
      if (window.matchMedia("(max-width: 767px)").matches) return;
      const el = (e.target as Element | null)?.closest("a, button");
      if (el && !el.closest("[data-no-click-sfx]")) playSound("buttonClick");
    };
    // The browser keeps audio blocked until the first click/tap/key press;
    // unlock on any of them, not just on links and buttons.
    const onGesture = () => {
      if (isSoundEnabled()) unlockAudio();
    };
    document.addEventListener("pointerover", onOver);
    document.addEventListener("click", onClick, true);
    document.addEventListener("pointerdown", onGesture, true);
    document.addEventListener("keydown", onGesture, true);
    return () => {
      document.removeEventListener("pointerover", onOver);
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("pointerdown", onGesture, true);
      document.removeEventListener("keydown", onGesture, true);
    };
  }, []);
  return null;
}
