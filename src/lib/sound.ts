// UI sound effects synthesized with Web Audio (no audio files).
// Profiles were measured from reference UI sounds: short, quiet, mostly
// band-passed noise ticks and tonal blips.

const STORAGE_KEY = "jh:sound-enabled";
const CHANGE_EVENT = "jh:sound-enabled-change";

let ctx: AudioContext | null = null;
let noise: AudioBuffer | null = null;

function getCtx() {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    ctx = new Ctor();
    // Let the toggle reflect when the browser actually allows audio.
    ctx.addEventListener("statechange", () => window.dispatchEvent(new Event(CHANGE_EVENT)));
    noise = ctx.createBuffer(1, ctx.sampleRate * 0.2, ctx.sampleRate);
    const data = noise.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  }
  // Browsers start the context suspended until a user gesture.
  if (ctx.state === "suspended") ctx.resume().catch(() => {});
  return ctx;
}

/** Browsers block audio until the first click/tap/key press on the page. */
function hasUserActivation() {
  const ua = (navigator as Navigator & { userActivation?: { hasBeenActive: boolean } }).userActivation;
  return ua ? ua.hasBeenActive : true;
}

/** Call from a click/tap/key handler: starts the audio context the browser kept suspended. */
export function unlockAudio() {
  getCtx();
}

/** True once the browser lets the page play sound. */
export function isAudioUnlocked() {
  return ctx?.state === "running";
}

export function isSoundEnabled() {
  try {
    return window.localStorage.getItem(STORAGE_KEY) !== "false";
  } catch {
    return true;
  }
}

export function setSoundEnabled(enabled: boolean) {
  try {
    window.localStorage.setItem(STORAGE_KEY, String(enabled));
  } catch {}
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function onSoundEnabledChange(cb: () => void) {
  window.addEventListener(CHANGE_EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(CHANGE_EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}

/** Exponential-decay gain envelope starting at `t`. */
function envelope(ac: AudioContext, t: number, peak: number, decay: number, attack = 0.001) {
  const g = ac.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(peak, t + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t + attack + decay);
  return g;
}

/** Band-passed noise burst. */
function noiseTick(ac: AudioContext, out: AudioNode, t: number, freq: number, amp: number, decay: number, highpass = 3000) {
  const src = ac.createBufferSource();
  src.buffer = noise;
  const bp = ac.createBiquadFilter();
  bp.type = "bandpass";
  bp.frequency.value = freq;
  bp.Q.value = 2.5;
  const hp = ac.createBiquadFilter();
  hp.type = "highpass";
  hp.frequency.value = highpass;
  const g = envelope(ac, t, amp, decay);
  src.connect(bp).connect(hp).connect(g).connect(out);
  src.start(t, Math.random() * 0.1, decay + 0.02);
}

/** Sine/triangle blip with optional pitch drop. */
function blip(
  ac: AudioContext,
  out: AudioNode,
  t: number,
  { freq, amp, decay, type = "sine", drop = 1 }: { freq: number; amp: number; decay: number; type?: OscillatorType; drop?: number },
) {
  const osc = ac.createOscillator();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  if (drop !== 1) osc.frequency.exponentialRampToValueAtTime(freq * drop, t + decay);
  const g = envelope(ac, t, amp, decay);
  osc.connect(g).connect(out);
  osc.start(t);
  osc.stop(t + decay + 0.02);
}

export const SOUNDS = {
  /** CTA hover: airy swoosh rising into a bright glint (~200 ms). */
  ctaHover(ac: AudioContext, out: AudioNode, t: number) {
    const src = ac.createBufferSource();
    src.buffer = noise;
    const bp = ac.createBiquadFilter();
    bp.type = "bandpass";
    bp.Q.value = 3;
    bp.frequency.setValueAtTime(700, t);
    bp.frequency.exponentialRampToValueAtTime(7000, t + 0.18);
    const g = ac.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(1, t + 0.14);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.2);
    src.connect(bp).connect(g).connect(out);
    src.start(t, 0, 0.2);
    blip(ac, out, t + 0.15, { freq: 2637, amp: 0.5, decay: 0.18 });
    blip(ac, out, t + 0.15, { freq: 5274, amp: 0.2, decay: 0.1 });
  },
  /** Soft ~1 kHz double tap with a bright transient, ~50 ms. */
  navHover(ac: AudioContext, out: AudioNode, t: number) {
    noiseTick(ac, out, t, 4200, 1.2, 0.008, 2500);
    blip(ac, out, t + 0.015, { freq: 1000, amp: 1, decay: 0.07, drop: 0.9 });
    noiseTick(ac, out, t + 0.015, 6500, 0.6, 0.02, 3000);
  },
  /** Clean ~1.7 kHz tick with a 2nd partial, ~60 ms. */
  buttonClick(ac: AudioContext, out: AudioNode, t: number) {
    blip(ac, out, t, { freq: 1721, amp: 1, decay: 0.12 });
    blip(ac, out, t, { freq: 3950, amp: 0.3, decay: 0.05 });
    noiseTick(ac, out, t, 6600, 0.08, 0.01, 3000);
  },
  /** Tiny ~2.6 kHz flick, ~20 ms. */
  socialHover(ac: AudioContext, out: AudioNode, t: number) {
    blip(ac, out, t, { freq: 2600, amp: 0.5, decay: 0.006 });
    blip(ac, out, t + 0.006, { freq: 2600, amp: 1, decay: 0.025, type: "triangle" });
    noiseTick(ac, out, t + 0.006, 10500, 0.3, 0.012, 6000);
  },
} satisfies Record<string, (ac: AudioContext, out: AudioNode, t: number) => void>;

export type SoundName = keyof typeof SOUNDS;

// Global level for all UI sounds (1 = loudness-matched to the reference site).
const MASTER_VOLUME = 0.6;

// Loudness-matched to the reference sounds at their playback volume.
export const VOLUME: Record<SoundName, number> = {
  ctaHover: 0.033,
  navHover: 0.019,
  buttonClick: 0.028,
  socialHover: 0.026,
};

export function playSound(name: SoundName, { force = false, volume }: { force?: boolean; volume?: number } = {}) {
  if (!force && !isSoundEnabled()) return;
  // Before any user gesture the browser would silently drop it; don't even try.
  if (!hasUserActivation()) return;
  const ac = getCtx();
  if (!ac) return;
  const master = ac.createGain();
  master.gain.value = volume ?? VOLUME[name] * MASTER_VOLUME;
  master.connect(ac.destination);
  SOUNDS[name](ac, master, ac.currentTime + 0.005);
}

/** Hover sounds only for a real mouse on desktop-sized viewports. */
export function playHoverSound(e: { pointerType: string }, name: SoundName) {
  if (e.pointerType !== "mouse") return;
  if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
  if (window.matchMedia("(max-width: 767px)").matches) return;
  playSound(name);
}
