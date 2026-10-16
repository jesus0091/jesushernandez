"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";

const ROWS = 7;
// Three identical sets per row (each set: its pool of covers, twice); the
// CSS loop shifts by exactly one set.
const SETS = 3;
const SPOT_RADIUS = 300;

function Wall({ tiles }: { tiles: string[] }) {
  // Neighbouring rows slide in opposite directions, so any cover they shared
  // would keep drifting next to its own copy. Even rows only use the
  // even-numbered covers and odd rows the rest: two touching rows never show
  // the same image.
  const pools = [tiles.filter((_, i) => i % 2 === 0), tiles.filter((_, i) => i % 2 === 1)];

  return (
    <div className="absolute left-1/2 top-1/2 w-[150vmax] -translate-x-1/2 -translate-y-1/2 -rotate-12">
      {Array.from({ length: ROWS }, (_, r) => {
        const pool = pools[r % 2];
        // Rows of the same parity move together; start each one further along
        // so the same cover does not line up two rows apart either.
        const start = Math.floor(r / 2) * (r % 2 ? 1 : 2);
        return (
          // Outer: pointer parallax (JS). Inner: the endless slide (CSS).
          <div key={r} data-wall-shift className="mb-3.5">
            <div className="works-wall-row flex w-max" data-reverse={r % 2 ? "" : undefined}>
              {Array.from({ length: SETS * pool.length * 2 }, (_, i) => (
                // Plain <img>: the same few small files repeat across the wall.
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={i}
                  src={pool[(i + start) % pool.length]}
                  alt=""
                  decoding="async"
                  draggable={false}
                  className="mr-3.5 aspect-[1600/707] h-[22svh] min-h-[150px] flex-none rounded-xl object-cover select-none"
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/**
 * Tilted wall of project covers behind the works hero. Two identical walls run
 * the same CSS animation: a grey, dimmed one that is always there, and a
 * color one on top that only shows through a soft circle around the pointer.
 * Moving the pointer also pushes the rows sideways, alternating by row.
 */
export default function WorksWall({ covers }: { covers: string[] }) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const colorRef = useRef<HTMLDivElement | null>(null);
  // Pre-dimmed greyscale copies and same-size color copies of the covers
  // (public/images/wall), so nothing is filtered at runtime.
  const grey = covers.map((c) => c.replace("/images/", "/images/wall/"));
  const color = covers.map((c) => c.replace("/images/", "/images/wall/color/"));

  useLayoutEffect(() => {
    const root = rootRef.current;
    const colorEl = colorRef.current;
    const hero = root?.parentElement;
    if (!root || !colorEl || !hero) return;

    const mm = gsap.matchMedia();
    mm.add("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)", () => {
      const shifts = gsap.utils.toArray<HTMLElement>("[data-wall-shift]", root);
      const moveRow = shifts.map((el) => gsap.quickTo(el, "x", { duration: 1.1, ease: "power3.out" }));

      // The mask is written straight onto the color wall (not as an inherited
      // CSS variable, which would restyle every tile on each move).
      const spot = { x: 0, y: 0 };
      const paint = () => {
        const mask = `radial-gradient(circle ${SPOT_RADIUS}px at ${spot.x.toFixed(1)}px ${spot.y.toFixed(1)}px, #000 30%, transparent 100%)`;
        colorEl.style.maskImage = mask;
        colorEl.style.webkitMaskImage = mask;
      };
      const spotX = gsap.quickTo(spot, "x", { duration: 0.5, ease: "power3.out", onUpdate: paint });
      const spotY = gsap.quickTo(spot, "y", { duration: 0.5, ease: "power3.out" });

      let inside = false;
      const onMove = (e: PointerEvent) => {
        const r = hero.getBoundingClientRect();
        const x = e.clientX - r.left;
        const y = e.clientY - r.top;
        if (!inside) {
          // Start under the pointer instead of sweeping in from the corner.
          inside = true;
          spot.x = x;
          spot.y = y;
          paint();
          gsap.to(colorEl, { autoAlpha: 1, duration: 0.4, ease: "power2.out" });
        }
        spotX(x);
        spotY(y);
        const push = (x / r.width - 0.5) * 2 * (r.height * 0.3);
        // Both walls list their rows in order, so the row number is i % ROWS;
        // the grey and color copies of a row must get the same push.
        moveRow.forEach((move, i) => move(push * ((i % ROWS) % 2 ? -1 : 1)));
      };
      const onLeave = () => {
        inside = false;
        gsap.to(colorEl, { autoAlpha: 0, duration: 0.5, ease: "power2.out" });
        moveRow.forEach((move) => move(0));
      };

      hero.addEventListener("pointermove", onMove);
      hero.addEventListener("pointerleave", onLeave);
      return () => {
        hero.removeEventListener("pointermove", onMove);
        hero.removeEventListener("pointerleave", onLeave);
      };
    });

    return () => mm.revert();
  }, []);

  return (
    <div ref={rootRef} aria-hidden className="absolute inset-0 -z-20 overflow-hidden">
      <Wall tiles={grey} />
      <div ref={colorRef} className="invisible absolute inset-0 opacity-0">
        <Wall tiles={color} />
      </div>
    </div>
  );
}
