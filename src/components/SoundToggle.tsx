"use client";

import { useSyncExternalStore } from "react";
import { SpeakerHigh, SpeakerSlash } from "@/components/icons";
import { isAudioUnlocked, isSoundEnabled, onSoundEnabledChange, setSoundEnabled, unlockAudio } from "@/lib/sound";

// "on" only when sound is enabled AND the browser actually allows audio
// (it blocks it until the first click/key press), so the icon never lies.
const getOn = () => isSoundEnabled() && isAudioUnlocked();

export default function SoundToggle({ dark }: { dark: boolean }) {
  const on = useSyncExternalStore(onSoundEnabledChange, getOn, () => false);
  const Icon = on ? SpeakerHigh : SpeakerSlash;

  const toggle = () => {
    if (on) return setSoundEnabled(false);
    setSoundEnabled(true);
    unlockAudio();
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={on}
      aria-label={on ? "Mute interface sounds" : "Turn on interface sounds"}
      className={[
        "flex w-10 h-10 items-center justify-center rounded-full transition-colors duration-300",
        dark
          ? "text-white/70 hover:text-white hover:bg-white/10"
          : "text-[var(--muted)] hover:text-[var(--black)] hover:bg-black/[0.05]",
      ].join(" ")}
    >
      <Icon size={18} />
    </button>
  );
}
