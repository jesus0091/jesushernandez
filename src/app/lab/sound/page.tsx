"use client";

import { playSound, VOLUME, SOUNDS, type SoundName } from "@/lib/sound";

// Tuning bench for src/lib/sound.ts; not linked or indexed.
// Reference files are streamed from the site the nav/click/social sounds were matched to.
const REF = "https://pensatori-irrazionali.com/static/audio/";
const REFS: Partial<Record<SoundName, { file: string; volume: number }>> = {
  navHover: { file: "hover.wav", volume: 0.05 },
  buttonClick: { file: "button-click.wav", volume: 0.2 },
  socialHover: { file: "social-hover.wav", volume: 0.05 },
};

// Everything is very quiet at real volume; boost both sides equally to compare timbre.
const BOOST = 4;

function playRef(file: string, volume: number) {
  const a = new Audio(REF + file);
  a.volume = Math.min(1, volume * BOOST);
  a.play().catch(() => {});
}

export default function SoundLabPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 pt-32 pb-24">
      <h1 className="mb-2 text-3xl font-semibold">Sound lab</h1>
      <p className="mb-10 text-sm opacity-60">Hover or click. A = reference, B = ours (both ×{BOOST} volume).</p>
      <ul className="flex flex-col gap-4">
        {(Object.keys(SOUNDS) as SoundName[]).map((name) => {
          const ref = REFS[name];
          const play = () => playSound(name, { force: true, volume: VOLUME[name] * BOOST });
          return (
            <li key={name} className="flex items-center gap-4">
              <span className="w-40 font-mono text-sm">{name}</span>
              {ref && (
                <button
                  type="button"
                  data-no-click-sfx
                  onPointerEnter={() => playRef(ref.file, ref.volume)}
                  onClick={() => playRef(ref.file, ref.volume)}
                  className="rounded-full border px-6 py-3"
                >
                  A · original
                </button>
              )}
              <button
                type="button"
                data-no-click-sfx
                onPointerEnter={play}
                onClick={play}
                className="rounded-full border px-6 py-3"
              >
                B · ours
              </button>
            </li>
          );
        })}
      </ul>
    </main>
  );
}
