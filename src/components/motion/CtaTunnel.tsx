"use client";

import { prefersReducedMotion, setupGsap } from "@/lib/motion";
import { useLayoutEffect, useRef, useState } from "react";

import { ScrollTrigger } from "gsap/ScrollTrigger";

const RINGS = 10;
// Card size before it grows to fill the viewport.
const CARD_MAX_W = 1216;
const CARD_GUTTER = 24;
const CARD_H = () => Math.min(Math.max(window.innerHeight * 0.55, 420), 560);
const CARD_RADIUS = 24;
// Share of the scroll spent growing the card; the rest flies through the tunnel.
const EXPAND_END = 0.4;

// Soft band of light rather than a hard line, so rings read as depth, not stripes.
const RING =
  "radial-gradient(circle, transparent 54%, rgba(129,140,248,0.05) 62%, rgba(165,180,252,0.08) 66%, rgba(129,140,248,0.05) 70%, transparent 78%)";

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
export default function CtaTunnel({ children }: { children: React.ReactNode }) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const layerRef = useRef<HTMLDivElement | null>(null);
  const glowRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const ringsRef = useRef<HTMLDivElement | null>(null);
  const wordsRef = useRef<HTMLDivElement | null>(null);
  const cylRef = useRef<SVGSVGElement | null>(null);
  const [animated, setAnimated] = useState(true);

  useLayoutEffect(() => {
    if (prefersReducedMotion()) {
      setAnimated(false);
      return;
    }
    const section = sectionRef.current;
    const layer = layerRef.current;
    const rings = Array.from(ringsRef.current?.children ?? []) as HTMLElement[];
    const words = Array.from(wordsRef.current?.children ?? []) as HTMLElement[];
    const cyl = cylRef.current;
    const cylLines = Array.from(cyl?.querySelectorAll("line") ?? []);
    const cylCircles = Array.from(cyl?.querySelectorAll("circle") ?? []);
    const cylGroup = cyl?.querySelector("g") ?? null;
    if (!section || !layer) return;
    const gsap = setupGsap();

    const render = (progress: number) => {
      // Card → full screen
      const e = gsap.parseEase("brand")(gsap.utils.clamp(0, 1, progress / EXPAND_END));
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const x = Math.max(CARD_GUTTER, (vw - CARD_MAX_W) / 2) * (1 - e);
      const y = Math.max(0, (vh - CARD_H()) / 2) * (1 - e);
      layer.style.clipPath = `inset(${y}px ${x}px round ${CARD_RADIUS * (1 - e)}px)`;
      // The navbar goes dark once the card has grown under it.
      layer.dataset.navDark = y < 36 ? "true" : "false";

      // Tunnel: each ring travels from the vanishing point past the viewer,
      // wrapping so there's always another one coming.
      const travel = progress * 2.2;
      rings.forEach((ring, i) => {
        const z = (i / RINGS + travel) % 1;
        const scale = 0.04 * Math.pow(60, z);
        const fade = Math.min(z / 0.25, 1) * Math.min((1 - z) / 0.2, 1);
        ring.style.transform = `translate(-50%, -50%) scale(${scale})`;
        ring.style.opacity = String(fade * (0.2 + 0.5 * e));
      });

      // Cylinder: lines draw out from the vanishing point, the tube turns a
      // little, then everything fades before the tunnel ends.
      if (cyl && cylGroup) {
        const w = gsap.utils.clamp(0, 1, (progress - CYL_START) / (CYL_END - CYL_START));
        const alpha = w <= 0 || w >= 1 ? 0 : Math.min(w / 0.2, 1) * Math.min((1 - w) / 0.3, 1);
        cyl.style.opacity = String(alpha);
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
      const spread = Math.max(vw, vh) * 0.55;
      words.forEach((word, i) => {
        const z = t * (1 + (WORDS.length - 1) * WORD_GAP) - i * WORD_GAP;
        if (z <= 0 || z >= 1) {
          word.style.opacity = "0";
          return;
        }
        const scale = 0.04 * Math.pow(60, z);
        const a = (WORD_ANGLES[i % WORD_ANGLES.length] * Math.PI) / 180;
        const dx = Math.cos(a) * spread * scale;
        const dy = Math.sin(a) * spread * scale * 0.7;
        const fade = gsap.utils.clamp(0, 1, (z - 0.45) / 0.15) * gsap.utils.clamp(0, 1, (1 - z) / 0.15);
        word.style.transform = `translate(-50%, -50%) translate(${dx}px, ${dy}px) scale(${scale})`;
        word.style.opacity = String(fade);
        word.style.filter = `blur(${Math.max(0, z - 0.8) * 20}px)`;
      });

      // The light at the end of the tunnel opens up as we go in.
      if (glowRef.current) glowRef.current.style.transform = `scale(${1 + progress * 0.3})`;
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
  }, []);

  if (!animated) {
    return (
      <section className="max-w-[1280px] mx-auto w-full px-6 md:px-8 pt-16 pb-8">
        <div
          className="relative overflow-hidden rounded-3xl py-20"
          style={{ background: BACKGROUND }}
        >
          <div className="relative z-10">{children}</div>
        </div>
      </section>
    );
  }

  return (
    <section ref={sectionRef} className="relative h-[280vh] md:h-[340vh]">
      <div className="sticky top-0 h-[100dvh] w-full overflow-hidden">
        <div
          ref={layerRef}
          className="absolute inset-0 overflow-hidden bg-[#01020c] will-change-[clip-path]"
        >
          <div
            ref={glowRef}
            className="absolute inset-0 will-change-transform"
            style={{ background: BACKGROUND }}
          />
          <div ref={ringsRef} aria-hidden className="absolute inset-0 pointer-events-none">
            {Array.from({ length: RINGS }).map((_, i) => (
              <div
                key={i}
                className="absolute left-1/2 top-1/2 aspect-square w-[160vmax] rounded-full will-change-transform"
                style={{ background: RING }}
              />
            ))}
          </div>
          <svg
            ref={cylRef}
            aria-hidden
            className="absolute inset-0 w-full h-full pointer-events-none opacity-0"
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
                className="absolute left-1/2 top-1/2 whitespace-nowrap text-5xl md:text-7xl font-semibold tracking-tight text-white/90 opacity-0 will-change-transform [text-shadow:0_2px_30px_rgba(1,2,12,0.6)]"
              >
                {w}
              </span>
            ))}
          </div>
          {/* Noise overlay */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.12]" aria-hidden="true">
            <filter id="cta-noise">
              <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
              <feColorMatrix type="saturate" values="0" />
            </filter>
            <rect width="100%" height="100%" filter="url(#cta-noise)" />
          </svg>
          <div
            ref={contentRef}
            className="relative z-10 h-full flex items-center justify-center will-change-transform"
          >
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}
