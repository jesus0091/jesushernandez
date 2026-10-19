import { setupGsap } from "@/lib/motion";

type Timeline = ReturnType<ReturnType<typeof setupGsap>["timeline"]>;

// The site's one brush: the intro, the page transitions and the Skills →
// "What sets me apart" handoff all paint with it.

// Zigzag sweep across a 100×100 box; once thick enough it covers the viewport.
const BRUSH_PATH =
  "M -20 8 C 20 -6, 60 22, 120 4 C 80 30, 30 22, -20 42 C 20 54, 70 38, 120 56 C 80 76, 30 68, -20 88 C 20 100, 70 94, 120 106";

// A bundle of strokes on BRUSH_PATH, not one round line: a solid core and
// thinner bristles fraying off both edges. o: vertical offset and s: stroke
// width, both as a fraction of the brush width; lag: how far behind the core a
// bristle moves (fraction of the stroke), which frays the tip and the tail.
type Bristle = { o: number; s: number; lag: number };
const BRISTLES: Bristle[] = [
  { o: 0, s: 0.72, lag: 0 },
  { o: -0.34, s: 0.1, lag: 0.01 },
  { o: -0.42, s: 0.07, lag: 0.04 },
  { o: -0.48, s: 0.035, lag: 0.07 },
  { o: -0.53, s: 0.015, lag: 0.1 },
  { o: 0.33, s: 0.1, lag: 0.02 },
  { o: 0.4, s: 0.08, lag: 0.05 },
  { o: 0.47, s: 0.04, lag: 0.03 },
  { o: 0.52, s: 0.02, lag: 0.08 },
];
/** Brush width (viewBox units) at the start and once it covers the screen. */
const BRUSH_W = { from: 8, to: 70 };

/**
 * The brush's strokes, stretched over whatever box holds them (usually the
 * viewport). `covered` renders it already covering, straight from the server
 * (the intro hides the page before any script runs).
 */
export function BrushSvg({ className = "", covered = false }: { className?: string; covered?: boolean }) {
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className={`h-full w-full overflow-visible ${className}`}>
      {BRISTLES.map((b, i) => (
        <path
          key={i}
          d={BRUSH_PATH}
          fill="none"
          stroke="var(--color-ink-1)"
          strokeLinecap="round"
          strokeLinejoin="round"
          {...(covered && { strokeWidth: BRUSH_W.to * b.s, transform: `translate(0 ${BRUSH_W.to * b.o})` })}
        />
      ))}
    </svg>
  );
}

const bristlesOf = (root: Element) => Array.from(root.querySelectorAll<SVGPathElement>("path"));

/** Sets every bristle's width and offset for a brush `w` units wide. */
function setWidth(paths: SVGPathElement[], w: number) {
  paths.forEach((p, i) => {
    const b = BRISTLES[i];
    p.setAttribute("stroke-width", String(w * b.s));
    p.setAttribute("transform", `translate(0 ${w * b.o})`);
  });
}

/** Paints the brush over the box: the stroke draws and widens until it covers. Linear; ease it from outside. */
export function brushIn(root: Element, duration = 1) {
  const gsap = setupGsap();
  const paths = bristlesOf(root);
  const width = { v: BRUSH_W.from };
  setWidth(paths, width.v);
  const tl = gsap.timeline();
  paths.forEach((p, i) => {
    const lag = BRISTLES[i].lag * duration;
    tl.fromTo(p, { drawSVG: "0% 0%" }, { drawSVG: "0% 100%", duration: duration - lag, ease: "none" }, lag);
  });
  tl.fromTo(
    width,
    { v: BRUSH_W.from },
    { v: BRUSH_W.to, duration: duration * 0.9, ease: "none", onUpdate: () => setWidth(paths, width.v) },
    duration * 0.1
  );
  return tl;
}

/** Shows the brush already covering the box. */
export function brushCovered(root: Element) {
  const gsap = setupGsap();
  const paths = bristlesOf(root);
  setWidth(paths, BRUSH_W.to);
  gsap.set(paths, { drawSVG: "0% 100%" });
}

/**
 * Lifts the brush off the box, the way it went on in reverse: the stroke is
 * erased from its start while it thins, the bristles trailing a little.
 * Linear; ease it from outside.
 */
export function brushOut(root: Element, duration = 1) {
  const gsap = setupGsap();
  const paths = bristlesOf(root);
  const width = { v: BRUSH_W.to };
  const tl = gsap.timeline();
  paths.forEach((p, i) => {
    // Half the entrance's lag: enough to fray the tail without the bristles
    // drifting apart.
    const lag = BRISTLES[i].lag * 0.5 * duration;
    tl.fromTo(p, { drawSVG: "0% 100%" }, { drawSVG: "100% 100%", duration: duration - lag, ease: "none" }, lag);
  });
  tl.fromTo(
    width,
    { v: BRUSH_W.to },
    { v: BRUSH_W.from, duration, ease: "none", onUpdate: () => setWidth(paths, width.v) },
    0
  );
  return tl;
}

/** Plays a linear brush timeline over `duration` seconds with an ease; resolves when done. */
export function playEased(tl: Timeline, duration: number, ease: string) {
  const gsap = setupGsap();
  tl.pause(0);
  return new Promise<void>((resolve) => {
    gsap.to(tl, { progress: 1, duration, ease, onComplete: resolve });
  });
}
