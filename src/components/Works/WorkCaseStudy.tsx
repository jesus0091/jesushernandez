"use client";

import { Fragment, useLayoutEffect, useRef } from "react";
import { Source_Serif_4 } from "next/font/google";
import { Link } from "@/i18n/navigation";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  ArrowUpRight,
  Code,
  Compass,
  Devices,
  Gauge,
  ListChecks,
  MagnifyingGlass,
  Palette,
  RocketLaunch,
  TreeStructure,
} from "@/components/icons";
import { prefersReducedMotion, setupGsap } from "@/lib/motion";
import ScrubWords from "../motion/ScrubWords";
import ProcessVisual from "./ProcessVisual";
import ResponsiveCanvas from "./ResponsiveCanvas";
import SearchDemo from "./SearchDemo";
import StackTiles from "./StackTiles";
import SectionHeading from "../motion/SectionHeading";
import type { CaseBlock, CaseStudy, CaseVisual, WorkIcon } from "@/data/case-studies";

// Only the specimens use it, so it is not worth a preload.
const sourceSerif = Source_Serif_4({ subsets: ["latin"], weight: ["600", "700"], display: "swap", preload: false });

// Families the specimens can be set in; anything else falls back to the page font.
const FAMILIES: Record<string, string> = {
  "Source Serif 4": sourceSerif.style.fontFamily,
  Inter: "var(--font-inter), sans-serif",
};

const HEADING = "text-balance font-semibold tracking-title text-3xl md:text-4xl leading-none";
const LEAD = "text-pretty text-base md:text-lg leading-relaxed";
const BODY = "text-pretty text-sm md:text-base leading-relaxed text-[var(--muted)]";
const KICKER = "font-mono font-medium text-xs uppercase tracking-[0.08em]";
const RULE = "border-[var(--color-line-2)]";
const CARD = "rounded-card border border-black/[0.06] bg-white";
// Tinted stage the screenshots sit on, in the project's own colors (see CaseTheme).
// A full-screen panel's content: as wide as the page's column.
const PANEL = "w-[min(1216px,calc(100vw-4rem))]";
// Panels hang from the same height, so every node sits on one line.
const PANEL_TOP = "pt-[clamp(2.5rem,9svh,7rem)]";
// Panel type sized by the window's width and height alike, so a short window shrinks the
// text instead of pushing the step's visual off the panel.
const PANEL_LEAD = "text-pretty text-[clamp(15px,min(1.25vw,2.2svh),18px)] leading-relaxed";
// A step's visual: takes what is left of the panel, capped so it never runs down to the screen's edge.
const PANEL_VISUAL = "max-h-[min(19rem,34svh)] min-h-0 w-full max-w-3xl flex-[1_1_0px]";
// The dark sheet: night blue with the project's blue and teal glowing in from the corners.
const NIGHT =
  "bg-[#0a0d14] bg-[image:radial-gradient(70%_60%_at_100%_0%,color-mix(in_srgb,var(--cs-glow-a)_40%,transparent)_0%,transparent_70%),radial-gradient(60%_60%_at_0%_100%,color-mix(in_srgb,var(--cs-glow-b)_33%,transparent)_0%,transparent_70%)]";
// Segments in a score gauge; each is 100 / GAUGE_SEGMENTS points.
const GAUGE_SEGMENTS = 50;
const STAGE = "rounded-card bg-[linear-gradient(135deg,var(--cs-stage-from),var(--cs-stage-to))]";

const two = (n: number) => String(n).padStart(2, "0");
const slug = (label: string) => label.toLowerCase().replace(/[^a-z0-9]+/g, "-");

/**
 * The path a hand would draw from one stop to the next. It leaves `from` over
 * the top of that panel's content (`clear` wide), drops down the open space
 * beside it as far as `drop`, curls into a loop there, and climbs back up into
 * the next node, `gap` further on. `alt` gives every other stretch a shallower
 * drop and an earlier loop, so two in a row don't read as a pattern.
 */
function stretch(from: number, gap: number, clear: number, drop: number, alt: boolean) {
  const at = (x: number, y: number) => `${(from + x).toFixed(1)},${y.toFixed(1)}`;
  const curve = (...points: [number, number][]) => ` C${points.map(([x, y]) => at(x, y)).join(" ")}`;
  const free = gap - clear;
  const depth = drop * (alt ? 0.62 : 1);
  const loop = clear + free * (alt ? 0.4 : 0.52);
  const r = Math.min(70, free * 0.11);
  return (
    `M${at(0, 0)}` +
    curve([clear * 0.4, -30], [clear * 0.8, -30], [clear + free * 0.06, 12]) +
    curve([clear + free * 0.2, 60], [clear + free * 0.08, depth], [loop - r * 0.6, depth]) +
    curve([loop + r, depth], [loop + r, depth - r * 1.3], [loop, depth - r * 1.3]) +
    curve([loop - r, depth - r * 1.3], [loop - r, depth], [loop + r * 0.6, depth]) +
    curve([clear + free * 0.82, depth], [gap - free * 0.3, 0], [gap, 0])
  );
}

function Shot({ src, alt, className = "h-auto" }: { src: string; alt: string; className?: string }) {
  return (
    // Plain <img>: small pre-sized captures, several per block.
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} loading="lazy" decoding="async" className={`block w-full ${className}`} />
  );
}

/**
 * One chapter of the story. Every chapter opens the same way (a rule that
 * draws in, its number and name, then the heading against a summary) so the
 * page reads as a sequence; what sits under that is each chapter's own.
 */
function Chapter({
  n,
  total,
  label,
  heading,
  summary,
  dark = false,
  bleed = false,
  rule = true,
  children,
}: {
  n: number;
  total: number;
  label: string;
  heading?: string;
  summary?: string;
  /** A dark sheet inside the column. */
  dark?: boolean;
  /** A dark sheet that opens from the column out to the edges of the screen as it scrolls in. */
  bleed?: boolean;
  /** The line drawn above the chapter's name. */
  rule?: boolean;
  children: React.ReactNode;
}) {
  const onDark = dark || bleed;
  const strong = onDark ? "text-[var(--color-bg)]" : "text-[var(--black)]";
  const soft = onDark ? "text-[var(--color-bg)]/60" : "text-[var(--muted)]";

  return (
    <section
      id={slug(label)}
      className={`flex scroll-mt-28 flex-col gap-10 md:gap-14 ${dark ? `relative isolate overflow-hidden rounded-card p-6 md:p-12 ${NIGHT}` : ""} ${
        bleed ? "relative isolate py-16 md:py-28" : ""
      } group-data-[h=on]/h:min-h-0 group-data-[h=on]/h:flex-1 group-data-[h=on]/h:gap-0`}
    >
      {dark && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 opacity-70 mix-blend-overlay"
          style={{ backgroundImage: "var(--grain-image)", backgroundSize: "var(--grain-size) var(--grain-size)" }}
        />
      )}
      {bleed && (
        // As wide as the screen; the scroll opens it from the column's edges (see [data-bleed] below).
        <span
          aria-hidden
          data-bleed
          className="pointer-events-none absolute inset-y-0 left-1/2 -z-10 w-screen -translate-x-1/2 bg-[var(--color-ink-1)]"
        />
      )}
      <div className="flex flex-col gap-5">
        {rule && <span data-rule className={`h-px w-full origin-left ${onDark ? "bg-white/20" : "bg-[var(--color-line-2)]"}`} />}
        <p data-rise className={`${KICKER} flex items-center justify-between`}>
          <span className="flex items-center gap-3">
            <span className={onDark ? "text-[var(--orange)]" : "text-[var(--color-accent-ink)]"}>{two(n)}</span>
            <span className={strong}>{label}</span>
          </span>
          <span className={soft}>
            {two(n)} / {two(total)}
          </span>
        </p>
      </div>

      {heading && (
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between md:gap-12 group-data-[h=on]/h:hidden">
          <SectionHeading className={`${HEADING} ${strong} max-w-3xl`}>
            {/* A "\n" in the heading is where it breaks. */}
            {heading.split("\n").map((line, i) => (
              <Fragment key={line}>
                {i > 0 && <br />}
                {line}
              </Fragment>
            ))}
          </SectionHeading>
          {summary && (
            <p data-rise className={`max-w-md ${LEAD} ${soft}`}>
              {summary}
            </p>
          )}
        </div>
      )}

      {children}
    </section>
  );
}

function Visual({ visual, dark = false }: { visual: CaseVisual; dark?: boolean }) {
  const strong = dark ? "text-[var(--color-bg)]" : "text-[var(--black)]";
  const soft = dark ? "text-[var(--color-bg)]/60" : "text-[var(--muted)]";

  switch (visual.kind) {
    case "devices":
      return <ResponsiveCanvas desktop={visual.desktop} tablet={visual.tablet} phone={visual.phone} />;
    case "phones":
      return (
        <div data-devices className={`${STAGE} grid grid-cols-3 gap-3 overflow-hidden px-4 pt-6 md:gap-8 md:px-12 md:pt-10`}>
          {visual.screens.map((screen) => (
            <figure key={screen.src} className="flex flex-col gap-3">
              <figcaption className="text-center text-xs font-medium text-[#1E3A5F]">{screen.label}</figcaption>
              <div className="overflow-hidden rounded-t-[18px] border-[4px] border-b-0 border-[#0c0d10] shadow-xl md:rounded-t-[26px] md:border-[6px]">
                <Shot src={screen.src} alt={`${screen.label} on a phone`} />
              </div>
            </figure>
          ))}
        </div>
      );
    // Lighthouse's scores, as its own rings.
    case "metrics":
      return (
        <div className="flex flex-col gap-10">
          {/* One gauge per half of the column, each centered in it. */}
          <ul data-stagger className="grid grid-cols-2 justify-items-center gap-8">
            {visual.scores.map((score) => (
              <li key={score.label} className="flex flex-col items-center gap-4">
                <span
                  data-meter={score.value}
                  className="relative grid h-40 w-40 shrink-0 place-items-center md:h-44 md:w-44"
                  style={{ "--p": score.value } as React.CSSProperties}
                >
                  {/* A ring of segments, each two points of the score; they light up as --p passes them. */}
                  <svg aria-hidden viewBox="-50 -50 100 100" className="absolute inset-0" strokeLinecap="round">
                    {Array.from({ length: GAUGE_SEGMENTS }, (_, i) => (
                      <line
                        key={i}
                        y1="-47"
                        y2="-40"
                        stroke="#0CCE6B"
                        strokeWidth="2.6"
                        transform={`rotate(${(i * 360) / GAUGE_SEGMENTS})`}
                        style={{ opacity: `clamp(0.14, calc(var(--p) - ${((i + 1) * 100) / GAUGE_SEGMENTS} + 1), 1)` }}
                      />
                    ))}
                  </svg>
                  <span className="flex flex-col items-center">
                    <span data-count className="text-5xl font-semibold leading-none tracking-title text-[#0CCE6B] md:text-6xl">
                      {score.value}
                    </span>
                    <span className={`mt-1 text-[11px] ${soft}`}>/ 100</span>
                  </span>
                </span>
                <span className={`text-xl font-semibold ${strong}`}>{score.label}</span>
              </li>
            ))}
          </ul>
        </div>
      );
    // What there is, ticked off; the detail is in the names.
    case "rows":
      return (
        <ul data-stagger className="flex flex-wrap content-start gap-2">
          {visual.rows.map((row) => (
            <li
              key={row.title}
              className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium ${
                dark ? "border-white/15 bg-white/[0.06]" : "border-black/10 bg-white/70"
              } ${strong}`}
            >
              <svg aria-hidden viewBox="0 0 12 12" className="h-3 w-3" fill="none" stroke="#2DD4BF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2.5 6.5l2.5 2.5 4.5-5.5" />
              </svg>
              {row.title}
            </li>
          ))}
        </ul>
      );
    case "stack":
      return <StackTiles items={visual.items} />;
  }
}

function BlockText({ block, dark = false }: { block: CaseBlock; dark?: boolean }) {
  return (
    <div data-rise className="flex flex-col gap-3">
      <p className={`${KICKER} ${dark ? "text-[var(--orange)]" : "text-[var(--color-accent-ink)]"}`}>{block.kicker}</p>
      <h3
        className={`text-balance text-xl md:text-2xl leading-[1.1] font-semibold tracking-title ${dark ? "text-[var(--color-bg)]" : "text-[var(--black)]"}`}
      >
        {block.title}
      </h3>
      <p className={dark ? "text-pretty text-sm md:text-base leading-relaxed text-[var(--color-bg)]/60" : BODY}>{block.text}</p>
      {block.points && (
        <dl className={`mt-3 flex flex-col border-t ${dark ? "border-white/15" : RULE}`}>
          {block.points.map((point) => (
            // [data-on] is set by a visual that steps through the same items (ResponsiveCanvas).
            <div
              key={point.label}
              data-point
              className={`group/point flex flex-col gap-0.5 border-b py-3 transition-opacity duration-300 data-[on=false]:opacity-[0.85] ${dark ? "border-white/15" : RULE}`}
            >
              <dt
                className={`font-mono font-medium text-[11px] uppercase tracking-[0.08em] transition-colors duration-300 group-data-[on=true]/point:text-[var(--color-select-ink)] ${dark ? "text-[var(--color-bg)]/60" : "text-[var(--muted)]"}`}
              >
                {point.label}
              </dt>
              <dd className={`text-pretty text-sm leading-snug ${dark ? "text-[var(--color-bg)]" : "text-[var(--black)]"}`}>{point.text}</dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}

function ChapterBody({ chapter }: { chapter: CaseStudy["chapters"][number] }) {
  if (chapter.layout === "panel") {
    return (
      <>
        {chapter.blocks.map((block) => (
          <div key={block.title} className="grid grid-cols-1 gap-8 border-t border-white/15 pt-8 lg:grid-cols-[4fr_8fr] lg:gap-12">
            <BlockText block={block} dark />
            {block.visual && <Visual visual={block.visual} dark />}
          </div>
        ))}
      </>
    );
  }

  if (chapter.layout === "zigzag") {
    return (
      <>
        {chapter.blocks.map((block, i) => (
          // Text and visual swap sides from one block to the next.
          <div key={block.title} className="grid grid-cols-1 items-center gap-6 lg:grid-cols-12 lg:gap-12">
            <div className={`lg:col-span-6 ${i % 2 ? "lg:order-2" : ""}`}>
              <BlockText block={block} />
            </div>
            <div className="lg:col-span-6">{block.visual && <Visual visual={block.visual} />}</div>
          </div>
        ))}
      </>
    );
  }

  return (
    <>
      {chapter.blocks.map((block) => (
        <div key={block.title} className="flex flex-col gap-6">
          {block.text && (
            <p data-rise className={`max-w-2xl ${LEAD} text-[var(--muted)]`}>
              {block.text}
            </p>
          )}
          {block.visual?.kind === "rows" && (
            <ul data-tiles className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {block.visual.rows.map((row, i) => (
                <li key={row.title} className={`${CARD} flex min-h-44 flex-col justify-between gap-6 p-6`}>
                  <span className={`${KICKER} text-[var(--color-ink-4)]`}>{two(i + 1)}</span>
                  <span className="flex flex-col gap-1.5">
                    <span className="text-xl font-semibold tracking-title text-[var(--black)]">{row.title}</span>
                    <span className="text-sm leading-relaxed text-[var(--muted)]">{row.text}</span>
                  </span>
                </li>
              ))}
            </ul>
          )}
          {block.visual?.kind === "stack" && <StackTiles items={block.visual.items} />}
        </div>
      ))}
    </>
  );
}

/** The full story of a project: the problem, the work, the system and the technical detail. */
const WORK_ICONS: Record<WorkIcon, typeof Code> = {
  research: Compass,
  structure: TreeStructure,
  identity: Palette,
  responsive: Devices,
  code: Code,
  seo: MagnifyingGlass,
  performance: Gauge,
  testing: ListChecks,
  launch: RocketLaunch,
};

function WorkGlyph({ name, size = 22 }: { name: WorkIcon; size?: number }) {
  const Icon = WORK_ICONS[name];
  return <Icon size={size} aria-hidden />;
}

export default function WorkCaseStudy({ study }: { study: CaseStudy }) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const { identity } = study;
  const [primary] = identity.palette;
  // The palette in its roles, in the order they first appear.
  const groups = [...new Set(identity.palette.map((c) => c.group))].map(
    (group) => [group, identity.palette.filter((c) => c.group === group)] as const,
  );

  // The page in order; the chapter numbers come from it.
  const chapters = ["The challenge", "Process", "Visual identity", ...study.chapters.map((c) => c.label)];
  const total = chapters.length;
  const at = (label: string) => chapters.indexOf(label) + 1;

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || prefersReducedMotion()) return;
    const gsap = setupGsap();

    const ctx = gsap.context(() => {
      const all = <T extends Element = HTMLElement>(selector: string) => gsap.utils.toArray<T>(selector, root);
      const enter = (trigger: Element, start = "top 85%") => ({ trigger, start, once: true });

      // Horizontal chapters: the section holds the whole screen while its panels
      // slide sideways with the scroll. Set up first, because it changes the
      // page's height under every trigger below. Wide screens only, and only
      // where a panel fits in the window; otherwise it stays a grid.
      const mm = gsap.matchMedia();
      mm.add("(min-width: 1024px)", () => {
        const undo: (() => void)[] = [];
        all("[data-hscroll]").forEach((wrap) => {
          const track = wrap.querySelector<HTMLElement>("[data-hscroll-track]");
          if (!track) return;
          wrap.dataset.h = "on";
          if (track.scrollHeight > track.clientHeight) {
            delete wrap.dataset.h;
            return;
          }
          // Every panel is a screen wide; the last one stops where the first started.
          const distance = () => Math.max(0, track.offsetWidth - window.innerWidth);
          const nodes = gsap.utils.toArray<HTMLElement>("[data-hscroll-node]", track);
          const rail = track.querySelector<SVGElement>("[data-hscroll-rail]");
          const start = track.querySelector<HTMLElement>("[data-hscroll-start]");
          // Each stretch is drawn by its real length: a dash as long as the path,
          // pulled back by what is left to draw. (A normalized pathLength breaks
          // up on paths this long in Firefox.)
          const fills = gsap.utils.toArray<SVGPathElement>("[data-hscroll-fill]", track);
          const lengths: number[] = [];
          // Everything that follows the scroll besides the track is painted from
          // the timeline's time (one unit per panel), not tweened: a refresh then
          // has nothing to reset. The line reaches a node as its panel comes to rest.
          let time = 0;
          const draw = (i: number) => {
            const length = lengths[i] ?? 0;
            const p = gsap.utils.clamp(0, 1, time - i);
            fills[i].style.strokeDasharray = `${length} ${length}`;
            fills[i].style.strokeDashoffset = `${length * (1 - p)}`;
            fills[i].style.visibility = p > 0 ? "visible" : "hidden";
          };
          // Each step's visual is played by the scroll as its panel arrives. The one
          // on the last panel plays once the track has stopped, on scroll of its own.
          const demos = nodes.map((node) => node.closest("li")?.querySelector<HTMLElement>("[data-demo]") ?? null);
          const panels = nodes.length;
          const extra = demos[panels - 1]?.offsetParent ? 1.5 : 0;
          const size = () => {
            // Half a screen of scroll per panel, so six of them don't take forever.
            wrap.style.height = `${window.innerHeight + (distance() / 2) * ((panels + extra) / panels)}px`;
            // The trail leaves the opening panel and wanders to each node in turn.
            if (!rail || !start) return;
            const origin = track.getBoundingClientRect();
            const stops = [start, ...nodes].map((el) => el.getBoundingClientRect());
            const x = stops.map((stop) => stop.left + stop.width / 2 - stops[0].left - stops[0].width / 2);
            rail.style.left = `${stops[0].left + stops[0].width / 2 - origin.left}px`;
            rail.style.top = `${stops[0].top + stops[0].height / 2 - origin.top}px`;
            // How far down the trail may wander, and how wide the content it has to pass first is.
            const drop = Math.max(60, track.clientHeight - (stops[0].top + stops[0].height / 2 - origin.top) - 56);
            const clear = [start, ...nodes].map((el) => el.closest<HTMLElement>("[data-hscroll-clear]")?.offsetWidth ?? 0);
            const stretches = nodes.map((_, i) => stretch(x[i], x[i + 1] - x[i], clear[i], drop, i % 2 === 1));
            rail.querySelector("[data-hscroll-base]")?.setAttribute("d", stretches.join(""));
            fills.forEach((path, i) => {
              path.setAttribute("d", stretches[i]);
              lengths[i] = path.getTotalLength();
              draw(i);
            });
          };
          size();
          ScrollTrigger.addEventListener("refreshInit", size);
          const paint = (progress: number) => {
            time = progress * (panels + extra);
            fills.forEach((_, i) => draw(i));
            nodes.forEach((node, i) => (node.dataset.on = String(time >= i + 0.98)));
            demos.forEach((demo, i) => {
              // The last one is done a little before the scroll lets go of the section.
              const p = i === panels - 1 && extra ? (time - panels) / (extra * 0.85) : (time - i - 0.45) / 0.5;
              demo?.dispatchEvent(new CustomEvent("demo-progress", { detail: gsap.utils.clamp(0, 1, p) }));
            });
          };
          gsap
            .timeline({
              defaults: { ease: "none" },
              scrollTrigger: {
                trigger: wrap,
                start: "top top",
                end: "bottom bottom",
                scrub: true,
                invalidateOnRefresh: true,
                onUpdate: (self) => paint(self.progress),
                onRefresh: (self) => paint(self.progress),
              },
            })
            .to(track, { x: () => -distance(), duration: panels }, 0)
            .to({}, { duration: extra }, panels);
          undo.push(() => {
            ScrollTrigger.removeEventListener("refreshInit", size);
            wrap.style.height = "";
            delete wrap.dataset.h;
          });
        });
        return () => undo.forEach((fn) => fn());
      });
      // Chapter rules draw across before the chapter's text arrives.
      all("[data-rule]").forEach((el) =>
        gsap.from(el, { scaleX: 0, duration: 1.2, ease: "power3.inOut", scrollTrigger: enter(el, "top 92%") }),
      );
      all("[data-rise]").forEach((el) =>
        gsap.from(el, { y: 28, autoAlpha: 0, duration: 0.9, ease: "power3.out", scrollTrigger: enter(el, "top 90%") }),
      );
      // Lists: one item after another.
      all("[data-stagger]").forEach((group) =>
        gsap.from(group.children, {
          y: 24,
          autoAlpha: 0,
          duration: 0.8,
          ease: "power3.out",
          stagger: 0.07,
          scrollTrigger: enter(group),
        }),
      );
      // Cards and tiles: they settle from slightly small as well.
      all("[data-tiles]").forEach((group) =>
        gsap.from(group.children, {
          y: 44,
          scale: 0.96,
          autoAlpha: 0,
          duration: 1,
          ease: "power3.out",
          stagger: 0.1,
          scrollTrigger: enter(group),
        }),
      );
      // Devices rise out of the stage they sit on, back to front.
      all("[data-devices]").forEach((stage) =>
        gsap.from(stage.children, {
          yPercent: 35,
          autoAlpha: 0,
          duration: 1.1,
          ease: "power4.out",
          stagger: 0.14,
          scrollTrigger: enter(stage, "top 80%"),
        }),
      );
      // Full-bleed sheets: a card the width of the column that opens out to the
      // screen's edges on the way in, and closes back on the way out.
      all("[data-bleed]").forEach((el) => {
        const card = () => `inset(0px ${root.getBoundingClientRect().left}px round 20px)`;
        const open = "inset(0px 0px round 0px)";
        gsap.fromTo(
          el,
          { clipPath: card },
          { clipPath: open, ease: "none", scrollTrigger: { trigger: el, start: "top 90%", end: "top 30%", scrub: true, invalidateOnRefresh: true } },
        );
        gsap.fromTo(
          el,
          { clipPath: open },
          {
            clipPath: card,
            ease: "none",
            immediateRender: false,
            scrollTrigger: { trigger: el, start: "bottom 70%", end: "bottom 10%", scrub: true, invalidateOnRefresh: true },
          },
        );
      });
      // Process: the line travels from one step to the next.
      all("[data-steps]").forEach((list) => {
        const tl = gsap.timeline({ scrollTrigger: enter(list, "top 80%") });
        gsap.utils.toArray<HTMLElement>(list.children).forEach((step, i) => {
          const delay = i * 0.22;
          tl.from(step.querySelector("[data-step-dot]"), { scale: 0, duration: 0.5, ease: "back.out(2)" }, delay)
            .from(step.querySelector("[data-step-line]"), { scaleX: 0, duration: 0.7, ease: "power2.inOut" }, delay + 0.1)
            .from(step.querySelectorAll("[data-step-body]"), { y: 20, autoAlpha: 0, duration: 0.7, ease: "power3.out", stagger: 0.08 }, delay + 0.1);
        });
      });
      // Numbers count up to their value, keeping their unit and decimals.
      all("[data-count]").forEach((el) => {
        const match = el.textContent?.match(/^(\D*)(\d+(?:\.\d+)?)(.*)$/);
        if (!match) return;
        const [, before, number, after] = match;
        const decimals = number.split(".")[1]?.length ?? 0;
        const counter = { value: 0 };
        gsap.to(counter, {
          value: parseFloat(number),
          duration: 1.4,
          ease: "power2.out",
          scrollTrigger: enter(el, "top 90%"),
          onUpdate: () => {
            el.textContent = `${before}${counter.value.toFixed(decimals)}${after}`;
          },
        });
      });
      all("[data-meter]").forEach((el) =>
        // fromTo: from() alone reads the variable's end value back as 0.
        gsap.fromTo(
          el,
          { "--p": 0 },
          { "--p": Number(el.dataset.meter), duration: 1.4, ease: "power2.out", scrollTrigger: enter(el, "top 90%") },
        ),
      );
    }, root);

    // Captures have no intrinsic size until they load; re-measure once they do.
    let frame = 0;
    const refresh = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => ScrollTrigger.refresh());
    };
    const pending = Array.from(root.querySelectorAll("img")).filter((img) => !img.complete);
    pending.forEach((img) => img.addEventListener("load", refresh, { once: true }));

    return () => {
      cancelAnimationFrame(frame);
      pending.forEach((img) => img.removeEventListener("load", refresh));
      ctx.revert();
    };
  }, []);

  return (
    <div ref={rootRef} className="mt-16 flex flex-col gap-28 md:mt-24 md:gap-40">
      {/* The brief reads itself on a dark sheet. */}
      <Chapter n={at("The challenge")} total={total} label="The challenge" bleed>
        <ScrubWords className="text-2xl leading-snug tracking-title text-[var(--color-bg)] md:text-[40px] md:leading-[1.2]">
          {study.challenge}
        </ScrubWords>
      </Chapter>

      {/* The project as the client lived it; on wide screens the steps slide past sideways (see [data-hscroll]). */}
      <div data-hscroll className="group/h">
        <div
          data-hscroll-pane
          className="group-data-[h=on]/h:sticky group-data-[h=on]/h:top-0 group-data-[h=on]/h:flex group-data-[h=on]/h:h-[100svh] group-data-[h=on]/h:flex-col group-data-[h=on]/h:pb-[clamp(2rem,9svh,6rem)] group-data-[h=on]/h:pt-20"
        >
          <Chapter
            n={at("Process")}
            total={total}
            label="Process"
            rule={false}
            heading={study.process.heading}
            summary={study.process.summary}
          >
            <ol
              data-steps
              className="grid grid-cols-1 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 group-data-[h=on]/h:hidden"
            >
              {study.process.steps.map((step) => (
                <li key={step.phase} className="flex flex-col gap-5">
                  <span className="flex items-center gap-3" aria-hidden>
                    <span
                      data-step-dot
                      className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[var(--color-ink-1)] font-mono text-xs text-[var(--color-bg)]"
                    >
                      <WorkGlyph name={step.icon} size={18} />
                    </span>
                    <span data-step-line className="h-px flex-1 origin-left bg-[var(--color-line-2)]" />
                  </span>
                  <span data-step-body className="flex flex-1 flex-col gap-2 pr-8">
                    <span className={`${KICKER} text-[var(--color-accent-ink)]`}>{step.phase}</span>
                    <span className="text-xl font-semibold tracking-title text-[var(--black)]">{step.title}</span>
                    <span className={BODY}>{step.text}</span>
                  </span>
                  <span data-step-body className="mr-8 flex flex-col gap-0.5 rounded-control bg-white/70 px-4 py-3">
                    <span className="text-xs text-[var(--muted)]">The client gets</span>
                    <span className="text-sm font-semibold text-[var(--black)]">{step.client}</span>
                  </span>
                  {step.visual && <ProcessVisual visual={step.visual} className="mr-8 aspect-[4/3]" />}
                  {step.demo && <SearchDemo demo={step.demo} className="mr-8 aspect-[16/10]" />}
                </li>
              ))}
            </ol>
            {/* The same steps as full-screen panels, the heading being the first one. */}
            <div
              data-hscroll-track
              className="relative hidden w-max will-change-transform group-data-[h=on]/h:flex group-data-[h=on]/h:min-h-0 group-data-[h=on]/h:flex-1"
            >
              {/* The trail that joins the steps; its shape and place come from the scroll setup (see stretch()). */}
              <svg
                aria-hidden
                data-hscroll-rail
                width="1"
                height="1"
                fill="none"
                strokeLinecap="round"
                className="pointer-events-none absolute overflow-visible"
              >
                <path data-hscroll-base stroke="var(--color-line-2)" strokeWidth="1" />
                {study.process.steps.map((step) => (
                  <path
                    key={step.phase}
                    data-hscroll-fill
                    visibility="hidden"
                    stroke="var(--orange)"
                    strokeWidth="1.5"
                  />
                ))}
              </svg>
              {/* Laid out like a step, so the trail can leave from here on the nodes' own line. */}
              <div className={`flex w-screen shrink-0 items-start ${PANEL_TOP}`}>
                <div className={PANEL}>
                <div data-hscroll-clear className="flex w-max max-w-5xl flex-col items-start gap-[clamp(16px,3svh,32px)]">
                  <span data-hscroll-start className="relative z-10 grid h-14 w-3 place-items-center">
                    <span className="h-3 w-3 rounded-full bg-[var(--orange)]" />
                  </span>
                  <h2 className="max-w-5xl text-balance whitespace-pre-line font-semibold leading-[0.92] tracking-title text-[var(--black)] text-[clamp(40px,min(6.4vw,10svh),112px)]">
                    {study.process.heading}
                  </h2>
                  <p className={`max-w-xl ${PANEL_LEAD} text-[var(--muted)]`}>{study.process.summary}</p>
                </div>
                </div>
              </div>
              <ol className="flex">
                {study.process.steps.map((step) => (
                  <li key={step.phase} className={`flex w-screen shrink-0 ${PANEL_TOP}`}>
                    <div className={`${PANEL} grid grid-cols-12 gap-10`}>
                      {/* Set in from the left, so the drawn part of the line has room to show. */}
                      <div data-hscroll-clear className="col-span-8 col-start-3 flex min-h-0 flex-col items-start gap-[clamp(10px,2.2svh,24px)]">
                        <span
                          data-hscroll-node
                          className="relative z-10 mb-[clamp(0px,1.5svh,16px)] grid h-14 w-14 place-items-center rounded-full border border-[var(--color-line-2)] bg-[var(--color-bg)] text-[var(--muted)] transition-colors duration-500 data-[on=true]:border-[var(--orange)] data-[on=true]:bg-[var(--color-accent-soft)] data-[on=true]:text-[var(--orange)]"
                        >
                          <WorkGlyph name={step.icon} size={24} />
                        </span>
                        <span className={`${KICKER} text-[var(--color-accent-ink)]`}>{step.phase}</span>
                        <h3 className="text-balance font-semibold leading-[1.05] tracking-title text-[var(--black)] text-[clamp(28px,min(4.2vw,6.5svh),72px)]">
                          {step.title}
                        </h3>
                        <p className={`max-w-xl ${PANEL_LEAD} text-[var(--muted)]`}>{step.text}</p>
                        {/* Where a visual has room to show what the client gets, it stands in for naming it. */}
                        {!step.demo && (
                          <p
                            className={`flex flex-col gap-0.5 rounded-control bg-white/70 px-5 py-4 ${step.visual ? "[@media(min-height:640px)]:hidden" : ""}`}
                          >
                            <span className="text-xs text-[var(--muted)]">The client gets</span>
                            <span className="text-base font-semibold text-[var(--black)]">{step.client}</span>
                          </p>
                        )}
                        {/* Takes what is left of the panel; only where the window is tall enough to give it room. */}
                        {step.visual && (
                          <ProcessVisual
                            visual={step.visual}
                            hosted
                            className={`hidden ${PANEL_VISUAL} [@media(min-height:640px)]:block`}
                          />
                        )}
                        {step.demo && (
                          <SearchDemo
                            demo={step.demo}
                            hosted
                            className={`hidden ${PANEL_VISUAL} [@media(min-height:640px)]:flex`}
                          />
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </Chapter>
        </div>
      </div>

      {/* A mosaic of the system's parts. */}
      <Chapter
        n={at("Visual identity")}
        total={total}
        label="Visual identity"
        heading={identity.heading}
        summary={identity.summary}
      >
        <div data-tiles className="grid grid-cols-1 gap-4 lg:grid-cols-12">
          {/* Type: each family at a reading size, with what it is used for. */}
          <div className={`${CARD} flex flex-col gap-4 p-6 md:p-7 lg:col-span-7`}>
            <div className="flex flex-col gap-1.5">
              <h3 className="text-balance text-xl leading-tight font-semibold tracking-title text-[var(--black)]">{identity.type.title}</h3>
              <p className={`max-w-lg ${BODY}`}>{identity.type.text}</p>
            </div>
            {/* Each family takes an equal share of the card's height, so it matches the color card. */}
            <div className="flex flex-1 flex-col">
              {identity.type.fonts.map((font) => (
                <div
                  key={`${font.family}-${font.role}`}
                  className={`grid flex-1 grid-cols-[auto_1fr] content-center items-center gap-x-5 gap-y-1.5 border-t py-3.5 text-[#1E293B] ${RULE}`}
                  style={{ fontFamily: FAMILIES[font.family], fontWeight: font.weight }}
                >
                  <span aria-hidden className="row-span-2 text-4xl leading-none md:text-5xl">
                    Aa
                  </span>
                  <span className="truncate text-base leading-snug md:text-lg">{font.sample}</span>
                  <span
                    className="flex flex-wrap gap-x-2 text-xs text-[var(--muted)]"
                    style={{ fontFamily: FAMILIES.Inter, fontWeight: 400 }}
                  >
                    <span className="font-semibold text-[var(--black)]">{font.family}</span>
                    <span>· {font.role}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Color: one strip per role, the primary twice as wide as anything else. */}
          <div className={`${CARD} flex flex-col gap-4 p-6 md:p-7 lg:col-span-5`}>
            <div className="flex flex-col gap-1.5">
              <h3 className="text-balance text-xl leading-tight font-semibold tracking-title text-[var(--black)]">{identity.color.title}</h3>
              <p className={BODY}>{identity.color.text}</p>
            </div>
            <div className="flex flex-1 flex-col justify-between gap-3">
              {groups.map(([group, colors]) => (
                <div key={group} className="flex flex-col gap-1.5">
                  <span className={`${KICKER} text-[10px] text-[var(--color-accent-ink)]`}>{group}</span>
                  <div className="flex h-8 overflow-hidden rounded-control border border-black/[0.06]">
                    {colors.map((color) => (
                      <span key={color.hex} className={color === primary ? "flex-[2]" : "flex-1"} style={{ backgroundColor: color.hex }} />
                    ))}
                  </div>
                  <div className="flex">
                    {colors.map((color) => (
                      <span key={color.hex} className={`flex min-w-0 flex-col pr-2 ${color === primary ? "flex-[2]" : "flex-1"}`}>
                        <span className="truncate text-[11px] font-medium text-[var(--black)]">{color.name}</span>
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Chapter>

      {study.chapters.map((chapter) => (
        <Chapter
          key={chapter.label}
          n={at(chapter.label)}
          total={total}
          label={chapter.label}
          heading={chapter.heading}
          summary={chapter.summary}
          // The measured part of the story reads as a report, on a dark sheet.
          dark={chapter.layout === "panel"}
        >
          <ChapterBody chapter={chapter} />
        </Chapter>
      ))}

      {/* Pulled up to the last chapter, so the way out reads as part of it. */}
      <div data-rise className="-mt-24 md:-mt-36">
        <Link
          href={study.closing.href}
          target="_blank"
          rel="noreferrer"
          className="group relative isolate flex flex-col gap-4 overflow-hidden rounded-card bg-[var(--cs-brand)] p-6 text-white transition-colors duration-300 hover:bg-[var(--cs-brand-hover)] md:flex-row md:items-center md:justify-between md:px-10 md:py-7"
        >
          {/* The site's grain tile; overlay so it reads on the saturated brand color. */}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10 opacity-80 mix-blend-overlay"
            style={{ backgroundImage: "var(--grain-image)", backgroundSize: "var(--grain-size) var(--grain-size)" }}
          />
          <span className="flex flex-col gap-1">
            {/* Sans like SectionLabel: mono at this tracking breaks a short phrase apart. */}
            <span className="text-xs font-mono font-medium uppercase tracking-[0.08em] text-white/90 md:text-sm">{study.closing.heading}</span>
            <span className="text-base sm:text-2xl md:text-3xl font-semibold tracking-title break-all">{study.closing.label}</span>
          </span>
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-white text-[var(--cs-brand)] transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1">
            <ArrowUpRight size={24} />
          </span>
        </Link>
      </div>
    </div>
  );
}
