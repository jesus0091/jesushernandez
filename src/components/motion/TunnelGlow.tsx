"use client";

import { prefersReducedMotion } from "@/lib/motion";
import { useEffect, useRef } from "react";

// The CTA tunnel's light, core to edge (CtaTunnel's TUNNEL_STOPS). A painted
// pixel walks it as it fades: orange when fresh, then plum, then night blue.
const STOPS: [number, [number, number, number]][] = [
  [0, [255, 122, 26]],
  [0.08, [242, 99, 26]],
  [0.18, [210, 78, 34]],
  [0.3, [156, 58, 54]],
  [0.45, [94, 43, 79]],
  [0.6, [46, 33, 99]],
  [0.78, [22, 26, 92]],
  [1, [12, 17, 72]],
];

const CELL = 14; // px per pixel, gap included
const GAP = 2;
const BRUSH = 30; // px reach of the pointer
const DECAY = 0.972; // how much light a pixel keeps per frame
const RING_SPEED = 8; // px per frame for a click's ripple
const REST_RGB = "rgba(10,10,10,0.045)"; // an unlit pixel, barely there on the paper

function colorAt(age: number): [number, number, number] {
  const t = Math.min(1, Math.max(0, age));
  for (let i = 1; i < STOPS.length; i++) {
    const [p1, c1] = STOPS[i];
    if (t <= p1) {
      const [p0, c0] = STOPS[i - 1];
      const k = (t - p0) / (p1 - p0);
      return [c0[0] + (c1[0] - c0[0]) * k, c0[1] + (c1[1] - c0[1]) * k, c0[2] + (c1[2] - c0[2]) * k];
    }
  }
  return STOPS[STOPS.length - 1][1];
}

/**
 * A pixel grid to play with: the mouse paints with light, each pixel fading
 * through the CTA tunnel's colours, and a click sends a ripple across. Fills
 * its parent.
 */
export default function TunnelGlow({ className = "" }: { className?: string }) {
  const boxRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const box = boxRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!box || !canvas || !ctx) return;
    const still = prefersReducedMotion();

    let cols = 0;
    let rows = 0;
    let energy = new Float32Array(0);
    let w = 0;
    let h = 0;
    const pointer = { x: 0, y: 0, px: 0, py: 0, in: false };
    const rings: { x: number; y: number; r: number }[] = [];
    let frame = 0;
    let visible = false;

    const resize = () => {
      const r = box.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = r.width;
      h = r.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols = Math.ceil(w / CELL);
      rows = Math.ceil(h / CELL);
      energy = new Float32Array(cols * rows);
    };

    // Light the pixels near a point.
    const brush = (x: number, y: number, reach: number, amount: number) => {
      const c0 = Math.max(0, Math.floor((x - reach) / CELL));
      const c1 = Math.min(cols - 1, Math.floor((x + reach) / CELL));
      const r0 = Math.max(0, Math.floor((y - reach) / CELL));
      const r1 = Math.min(rows - 1, Math.floor((y + reach) / CELL));
      for (let r = r0; r <= r1; r++) {
        for (let c = c0; c <= c1; c++) {
          const k = 1 - Math.hypot(c * CELL + CELL / 2 - x, r * CELL + CELL / 2 - y) / reach;
          if (k > 0) energy[r * cols + c] = Math.min(1, energy[r * cols + c] + k * amount);
        }
      }
    };

    // Paint along a path, so fast moves leave a line, not dots.
    const stroke = (s: { x: number; y: number; px: number; py: number }, reach: number, amount: number) => {
      const steps = Math.max(1, Math.ceil(Math.hypot(s.x - s.px, s.y - s.py) / (CELL / 2)));
      for (let i = 1; i <= steps; i++) {
        brush(s.px + ((s.x - s.px) * i) / steps, s.py + ((s.y - s.py) * i) / steps, reach, amount);
      }
      s.px = s.x;
      s.py = s.y;
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      const size = CELL - GAP;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x = c * CELL + GAP / 2;
          const y = r * CELL + GAP / 2;
          const e = energy[r * cols + c];
          if (e < 0.02) {
            ctx.fillStyle = REST_RGB;
            ctx.fillRect(x, y, size, size);
            continue;
          }
          const [R, G, B] = colorAt(1 - e);
          ctx.fillStyle = `rgba(${R | 0},${G | 0},${B | 0},${Math.min(1, e * 3)})`;
          ctx.fillRect(x, y, size, size);
        }
      }
    };

    const loop = () => {
      if (pointer.in) stroke(pointer, BRUSH, 0.5);

      // A click's ripple lights the band it passes; the light stays and fades,
      // so the wave leaves a disc that cools through the tunnel's colours.
      for (let i = rings.length - 1; i >= 0; i--) {
        const ring = rings[i];
        ring.r += RING_SPEED;
        const fade = Math.max(0, 1 - ring.r / Math.hypot(w, h));
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            const d = Math.hypot(c * CELL + CELL / 2 - ring.x, r * CELL + CELL / 2 - ring.y);
            const k = 1 - Math.abs(d - ring.r) / CELL;
            if (k > 0) energy[r * cols + c] = Math.min(1, energy[r * cols + c] + k * 0.7 * fade);
          }
        }
        if (fade === 0) rings.splice(i, 1);
      }

      for (let i = 0; i < energy.length; i++) energy[i] *= DECAY;
      draw();
      frame = visible ? requestAnimationFrame(loop) : 0;
    };

    const start = () => {
      if (!frame && visible && !still) frame = requestAnimationFrame(loop);
    };

    const local = (e: PointerEvent) => {
      const r = box.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top };
    };
    const onMove = (e: PointerEvent) => {
      const p = local(e);
      if (!pointer.in) {
        pointer.px = p.x;
        pointer.py = p.y;
      }
      pointer.x = p.x;
      pointer.y = p.y;
      pointer.in = true;
    };
    const onLeave = () => (pointer.in = false);
    const onDown = (e: PointerEvent) => {
      rings.push({ ...local(e), r: 0 });
    };

    resize();
    draw();
    const ro = new ResizeObserver(() => {
      resize();
      draw();
    });
    ro.observe(box);
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      start();
    });
    io.observe(box);
    if (!still) {
      box.addEventListener("pointermove", onMove);
      box.addEventListener("pointerleave", onLeave);
      box.addEventListener("pointerdown", onDown);
    }

    return () => {
      cancelAnimationFrame(frame);
      ro.disconnect();
      io.disconnect();
      box.removeEventListener("pointermove", onMove);
      box.removeEventListener("pointerleave", onLeave);
      box.removeEventListener("pointerdown", onDown);
    };
  }, []);

  return (
    <div
      ref={boxRef}
      aria-hidden
      className={`relative cursor-crosshair touch-pan-y overflow-hidden rounded-3xl border border-[var(--color-line-1)] ${className}`}
    >
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
    </div>
  );
}
