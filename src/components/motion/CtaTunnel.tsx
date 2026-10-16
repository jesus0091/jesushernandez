"use client";

import { prefersReducedMotion, setupGsap } from "@/lib/motion";
import { useLayoutEffect, useRef, useState } from "react";

import { ScrollTrigger } from "gsap/ScrollTrigger";

const RINGS = 10;
// Card size before it grows to fill the viewport.
const CARD_MAX_W = 1216;
const CARD_GUTTER = 24;
// Portrait screens get a taller card so it doesn't float in empty space.
const CARD_H = (vw: number, vh: number) =>
  vh > vw ? Math.min(vh * 0.72, 640) : Math.min(Math.max(vh * 0.55, 420), 560);
const CARD_RADIUS = 24;
// Share of the scroll spent growing the card; the rest flies through the tunnel.
const EXPAND_END = 0.4;

// Soft band of light rather than a hard line, so rings read as depth, not stripes.
// Offsets are relative to the ring's gradient radius (half its box diagonal).
const RING_STOPS: [number, string][] = [
  [0.54, "rgba(129,140,248,0)"],
  [0.62, "rgba(129,140,248,0.05)"],
  [0.66, "rgba(165,180,252,0.08)"],
  [0.7, "rgba(129,140,248,0.05)"],
  [0.78, "rgba(129,140,248,0)"],
];
// Glow and rings are drawn into one canvas at this share of CSS pixels and
// stretched by the browser: they're soft gradients, so it's invisible, and it
// replaces a dozen full-screen layers the GPU had to blend every frame (which
// froze whole machines on 4K/retina screens).
const CANVAS_RES = 0.5;
// The tunnel's light, simplified from BACKGROUND (fewer stops, same look).
const GLOW_STOPS: [number, string][] = [
  [0, "#ff7a1a"],
  [0.12, "#d24e22"],
  [0.27, "#5e2b4f"],
  [0.46, "#161a5c"],
  [0.72, "#070b33"],
  [1, "#01020c"],
];

// Things we can build together — they fly out of the tunnel one after another.
const WORDS = [
  "Web Apps",
  "Mobile Apps",
  "SaaS Platforms",
  "Design Systems",
  "Dashboards",
  "Automations",
  "MVPs",
  "E-commerce",
  "Internal Tools",
  "Landing Pages",
  "Brand Identity",
];
// Spacing between words along the tunnel (in ring-depth units).
const WORD_GAP = 0.12;
// Directions kept off the horizontal band where the title sits.
const WORD_ANGLES = [-35, 145, 35, -145, -75, 105, 75, -105, -55, 125, 55, -125];

// Wireframe cylinder that shows up for a stretch of the ride only.
const CYL_LINES = 28;
const CYL_CIRCLES = 8;
const CYL_START = 0.5;
const CYL_END = 0.86;
// Matches the soft ring band (66% of a 160vmax disc) in the SVG's vmax units.
const CYL_RADIUS = 80 * 0.66;
const CYL_R0 = CYL_RADIUS * 0.04;
const CYL_REACH = 150;
// Rounded so server and client render identical attributes.
const cylPoint = (i: number, r: number) => {
  const a = (i / CYL_LINES) * Math.PI * 2;
  const round = (n: number) => Math.round(n * 1000) / 1000;
  return { x: round(Math.cos(a) * r), y: round(Math.sin(a) * r) };
};

const BACKGROUND =
  "radial-gradient(circle at 50% 50%, #ff7a1a 0%, #f2631a 6%, #d24e22 12%, #9c3a36 19%, #5e2b4f 27%, #2e2163 36%, #161a5c 46%, #0c1148 58%, #070b33 72%, #03061d 86%, #01020c 100%)";

/**
 * CTA card that, once centered, grows to fill the screen and then flies the
 * viewer through a tunnel of rings and the things we can build together.
 */
export default function CtaTunnel({
  children,
  still = false,
}: {
  children: React.ReactNode;
  /** Just the card, with no scroll ride: for pages that already end on a strong note. */
  still?: boolean;
}) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const layerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const wordsRef = useRef<HTMLDivElement | null>(null);
  const cylRef = useRef<SVGSVGElement | null>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const cardGlowRef = useRef<HTMLDivElement | null>(null);
  const [animated, setAnimated] = useState(!still);

  useLayoutEffect(() => {
    if (still || prefersReducedMotion()) {
      setAnimated(false);
      return;
    }
    const section = sectionRef.current;
    const layer = layerRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d", { alpha: false }) ?? null;
    const words = Array.from(wordsRef.current?.children ?? []) as HTMLElement[];
    const cyl = cylRef.current;
    const cylLines = Array.from(cyl?.querySelectorAll("line") ?? []);
    const cylCircles = Array.from(cyl?.querySelectorAll("circle") ?? []);
    const cylGroup = cyl?.querySelector("g") ?? null;
    if (!section || !layer || !canvas || !ctx) return;
    const gsap = setupGsap();

    const render = (progress: number) => {
      // Card → full screen
      const e = gsap.parseEase("brand")(gsap.utils.clamp(0, 1, progress / EXPAND_END));
      // Measure the stage (100lvh), not innerHeight: on mobile innerHeight
      // changes every time the address bar shows or hides.
      const vw = layer.clientWidth;
      const vh = layer.clientHeight;
      const x = Math.max(CARD_GUTTER, (vw - CARD_MAX_W) / 2) * (1 - e);
      const y = Math.max(0, (vh - CARD_H(vw, vh)) / 2) * (1 - e);
      // A clip-path animated every frame makes Firefox repaint everything
      // inside it, so drop it as soon as the card fills the screen.
      layer.style.clipPath = e >= 1 ? "none" : `inset(${y}px ${x}px round ${CARD_RADIUS * (1 - e)}px)`;
      // The navbar goes dark once the card has grown under it.
      layer.dataset.navDark = y < 36 ? "true" : "false";

      // Tunnel: each ring travels from the vanishing point past the viewer,
      // wrapping so there's always another one coming.
      const travel = progress * 2.2;
      const cw = Math.max(1, Math.round(vw * CANVAS_RES));
      const ch = Math.max(1, Math.round(vh * CANVAS_RES));
      if (canvas.width !== cw || canvas.height !== ch) {
        canvas.width = cw;
        canvas.height = ch;
      }
      const cx = cw / 2;
      const cy = ch / 2;
      const halfDiagonal = Math.hypot(cw, ch) / 2;

      // The light at the end of the tunnel opens up as we go in.
      ctx.globalAlpha = 1;
      const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, halfDiagonal * (1 + progress * 0.3));
      GLOW_STOPS.forEach(([o, c]) => glow.addColorStop(o, c));
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, cw, ch);

      const ringBase = Math.max(cw, ch) * 0.4; // 40vmax
      for (let i = 0; i < RINGS; i++) {
        const z = (i / RINGS + travel) % 1;
        const fade = Math.min(z / 0.25, 1) * Math.min((1 - z) / 0.2, 1);
        const opacity = fade * (0.2 + 0.5 * e);
        // Disc of 40vmax; its gradient reaches the box corner (√2 × half).
        const disc = (ringBase * 0.16 * Math.pow(60, z)) / 2;
        const radius = disc * Math.SQRT2;
        const inner = radius * RING_STOPS[0][0];
        // Skip rings nobody can see: faded out or band past the corners.
        if (opacity < 0.01 || inner > halfDiagonal) continue;
        const band = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
        RING_STOPS.forEach(([o, c]) => band.addColorStop(o, c));
        ctx.globalAlpha = opacity;
        ctx.fillStyle = band;
        // Fill only the band (an annulus), not the transparent middle.
        ctx.beginPath();
        ctx.arc(cx, cy, Math.min(disc, radius * 0.78), 0, Math.PI * 2);
        ctx.arc(cx, cy, inner, 0, Math.PI * 2, true);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // Cylinder: lines draw out from the vanishing point, the tube turns a
      // little, then everything fades before the tunnel ends.
      if (cyl && cylGroup) {
        const w = gsap.utils.clamp(0, 1, (progress - CYL_START) / (CYL_END - CYL_START));
        const alpha = w <= 0 || w >= 1 ? 0 : Math.min(w / 0.2, 1) * Math.min((1 - w) / 0.3, 1);
        cyl.style.opacity = String(alpha);
        // Hidden, not just transparent, so it isn't repainted while unused.
        cyl.style.display = alpha > 0 ? "block" : "none";
        if (alpha > 0) {
          const draw = gsap.parseEase("brand")(Math.min(w / 0.45, 1));
          const reach = CYL_R0 + (CYL_REACH - CYL_R0) * draw;
          cylLines.forEach((line, i) => {
            const end = cylPoint(i, reach);
            line.setAttribute("x2", String(end.x));
            line.setAttribute("y2", String(end.y));
          });
          cylGroup.setAttribute("transform", `rotate(${w * 40})`);
          cylCircles.forEach((circle, i) => {
            const z = (i / CYL_CIRCLES + travel) % 1;
            const scale = 0.04 * Math.pow(60, z);
            const fade = Math.min(z / 0.25, 1) * Math.min((1 - z) / 0.2, 1);
            circle.setAttribute("r", String(CYL_RADIUS * scale));
            circle.style.opacity = String(fade * draw);
          });
        }
      }

      // Words ride the same perspective as the rings, but pass only once each.
      const t = gsap.utils.clamp(0, 1, (progress - EXPAND_END * 0.75) / (1 - EXPAND_END * 0.75));
      // Portrait: fly mostly up and down, so words clear the full-width title.
      const portrait = vh > vw;
      const spreadX = portrait ? vw * 0.5 : Math.max(vw, vh) * 0.55;
      const spreadY = portrait ? vh * 0.6 : Math.max(vw, vh) * 0.55 * 0.7;
      words.forEach((word, i) => {
        const z = t * (1 + (WORDS.length - 1) * WORD_GAP) - i * WORD_GAP;
        if (z <= 0 || z >= 1) {
          word.style.visibility = "hidden";
          return;
        }
        word.style.visibility = "visible";
        const scale = 0.04 * Math.pow(60, z);
        const a = (WORD_ANGLES[i % WORD_ANGLES.length] * Math.PI) / 180;
        const dx = Math.cos(a) * spreadX * scale;
        const dy = Math.sin(a) * spreadY * scale;
        const fade = gsap.utils.clamp(0, 1, (z - 0.45) / 0.15) * gsap.utils.clamp(0, 1, (1 - z) / 0.15);
        word.style.transform = `translate(-50%, -50%) translate(${dx}px, ${dy}px) scale(${scale})`;
        word.style.opacity = String(fade);
      });

      if (contentRef.current) {
        contentRef.current.style.transform = `scale(${1 + t * 0.08})`;
      }
    };

    render(0);
    const st = ScrollTrigger.create({
      trigger: section,
      start: "top top",
      end: "bottom bottom",
      scrub: true,
      onUpdate: (self) => render(self.progress),
      onRefresh: (self) => render(self.progress),
    });

    return () => st.kill();
  }, [still]);

  // Still card: the orange glow trails the pointer and drifts back on leave.
  useLayoutEffect(() => {
    const card = cardRef.current;
    const glow = cardGlowRef.current;
    if (animated || !card || !glow) return;
    if (prefersReducedMotion() || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const gsap = setupGsap();
    const xTo = gsap.quickTo(glow, "x", { duration: 0.9, ease: "power3.out" });
    const yTo = gsap.quickTo(glow, "y", { duration: 0.9, ease: "power3.out" });

    const onMove = (e: PointerEvent) => {
      const rect = card.getBoundingClientRect();
      xTo(e.clientX - rect.left - rect.width / 2);
      yTo(e.clientY - rect.top - rect.height / 2);
    };
    const onLeave = () => {
      xTo(0);
      yTo(0);
    };
    card.addEventListener("pointermove", onMove);
    card.addEventListener("pointerleave", onLeave);
    return () => {
      card.removeEventListener("pointermove", onMove);
      card.removeEventListener("pointerleave", onLeave);
      gsap.killTweensOf(glow);
      gsap.set(glow, { clearProps: "transform" });
    };
  }, [animated]);

  if (!animated) {
    return (
      <section className={`max-w-[1280px] mx-auto w-full px-6 md:px-8 pb-8 ${still ? "" : "pt-16"}`}>
        <div
          ref={cardRef}
          className="relative overflow-hidden rounded-3xl bg-[#01020c] py-8 md:py-10"
        >
          {/* A square bigger than the card that fades to the card color at
              its edge, so moving it never shows a seam. */}
          <div
            aria-hidden
            className="absolute left-1/2 top-1/2 aspect-square w-[max(116%,640px)] -translate-x-1/2 -translate-y-1/2 pointer-events-none"
          >
            {/* Own element for the pointer offset: GSAP would overwrite the centering. */}
            <div
              ref={cardGlowRef}
              className="h-full w-full will-change-transform"
              style={{ background: BACKGROUND.replace("circle at", "circle closest-side at") }}
            />
          </div>
          <div
            aria-hidden
            className="absolute inset-0 pointer-events-none mix-blend-overlay opacity-70"
            style={{ backgroundImage: "var(--grain-image)", backgroundSize: "var(--grain-size) var(--grain-size)" }}
          />
          <div className="relative z-10">{children}</div>
        </div>
      </section>
    );
  }

  return (
    <section ref={sectionRef} className="relative h-[280vh] md:h-[340vh]">
      <div className="sticky top-0 h-lvh w-full overflow-hidden">
        <div
          ref={layerRef}
          className="absolute inset-0 overflow-hidden bg-[#01020c]"
        >
          <canvas ref={canvasRef} aria-hidden className="absolute inset-0 h-full w-full" />
          {/* Noise: the site's cached grain tile, not a live SVG filter. */}
          <div
            aria-hidden
            className="absolute inset-0 pointer-events-none opacity-[0.12]"
            style={{ backgroundImage: "var(--grain-image)", backgroundSize: "var(--grain-size) var(--grain-size)" }}
          />
        </div>
        {/* Outside the clipped layer: only visible once the card is (almost)
            full screen, so they don't need the clip and don't repaint with it. */}
        <svg
          ref={cylRef}
          aria-hidden
          className="absolute inset-0 w-full h-full pointer-events-none opacity-0 hidden"
          viewBox="-50 -50 100 100"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            {/* Lines fade out toward the vanishing point instead of bunching up. */}
            <radialGradient id="cyl-fade" gradientUnits="userSpaceOnUse" cx={0} cy={0} r={CYL_REACH}>
              <stop offset="0.02" stopColor="rgb(165,180,252)" stopOpacity={0} />
              <stop offset="0.14" stopColor="rgb(165,180,252)" stopOpacity={0.3} />
              <stop offset="1" stopColor="rgb(165,180,252)" stopOpacity={0.3} />
            </radialGradient>
          </defs>
          <g fill="none">
            {Array.from({ length: CYL_LINES }).map((_, i) => {
              const start = cylPoint(i, CYL_R0);
              return (
                <line
                  key={i}
                  x1={start.x}
                  y1={start.y}
                  x2={start.x}
                  y2={start.y}
                  stroke="url(#cyl-fade)"
                  vectorEffect="non-scaling-stroke"
                />
              );
            })}
            {Array.from({ length: CYL_CIRCLES }).map((_, i) => (
              <circle
                key={i}
                r={0}
                stroke="rgb(165,180,252)"
                strokeOpacity={0.22}
                vectorEffect="non-scaling-stroke"
              />
            ))}
          </g>
        </svg>
        <p className="sr-only">Things we can build together: {WORDS.join(", ")}.</p>
        <div ref={wordsRef} aria-hidden className="absolute inset-0 pointer-events-none">
          {WORDS.map((w) => (
            <span
              key={w}
              className="absolute left-1/2 top-1/2 whitespace-nowrap text-3xl md:text-7xl font-semibold tracking-title text-white/90 invisible will-change-transform [text-shadow:0_2px_12px_rgba(1,2,12,0.5)]"
            >
              {w}
            </span>
          ))}
        </div>
        <div
          ref={contentRef}
          className="relative z-10 h-full flex items-center justify-center will-change-transform"
        >
          {children}
        </div>
      </div>
    </section>
  );
}
