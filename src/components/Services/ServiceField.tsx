"use client";

import type { ServiceId } from "@/data/services";
import { prefersReducedMotion } from "@/lib/motion";
import { useEffect, useRef } from "react";

// What each service's field is made of: code for websites, figures for web
// apps, app-icon pixels for mobile. `color` is the field's ink, in the
// service's hue; the accent lights the cells right under the pointer.
const FIELDS: Record<ServiceId, { glyphs: string | null; cell: number; color: [number, number, number] }> = {
  "web-development": { glyphs: "<>/{}[]();=:.#*divspanhtml", cell: 22, color: [176, 84, 30] },
  "web-apps": { glyphs: "0123456789%$+.-", cell: 22, color: [122, 63, 104] },
  "mobile-apps": { glyphs: null, cell: 20, color: [43, 63, 143] },
};
const ACCENT: [number, number, number] = [255, 102, 0];

const REACH = 200; // px around the pointer that wakes up
const IDLE = 0.1; // how visible the field is at rest
const EASE = 0.12; // how fast cells follow their target

/**
 * A field behind a service's hero sketch, made of that service's material.
 * At rest it's barely there; around the pointer it wakes up: glyphs brighten
 * and scramble, pixels swell, and the closest ones take the accent.
 */
export default function ServiceField({ id, className = "" }: { id: ServiceId; className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const box = canvas?.parentElement;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !box || !ctx) return;
    const { glyphs, cell, color } = FIELDS[id];
    const still = prefersReducedMotion();

    let w = 0;
    let h = 0;
    let cols = 0;
    let rows = 0;
    let level = new Float32Array(0); // 0 rest → 1 fully awake, per cell
    let chars: string[] = [];
    const pointer = { x: -1e4, y: -1e4, in: false };
    let frame = 0;
    let visible = false;

    const pick = () => (glyphs ? glyphs[(Math.random() * glyphs.length) | 0] : "");

    const resize = () => {
      const r = box.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = r.width;
      h = r.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols = Math.ceil(w / cell);
      rows = Math.ceil(h / cell);
      level = new Float32Array(cols * rows);
      chars = Array.from({ length: cols * rows }, pick);
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      if (glyphs) {
        ctx.font = `500 ${Math.round(cell * 0.55)}px ${getComputedStyle(document.body).getPropertyValue("--font-mono") || "monospace"}`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
      }
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const i = r * cols + c;
          const e = level[i];
          const a = IDLE + e * 0.85;
          // The closest cells blend from the service's ink to the accent.
          const k = Math.max(0, e - 0.6) / 0.4;
          const R = color[0] + (ACCENT[0] - color[0]) * k;
          const G = color[1] + (ACCENT[1] - color[1]) * k;
          const B = color[2] + (ACCENT[2] - color[2]) * k;
          ctx.fillStyle = `rgba(${R | 0},${G | 0},${B | 0},${a})`;
          const x = c * cell + cell / 2;
          const y = r * cell + cell / 2;
          if (glyphs) {
            ctx.fillText(chars[i], x, y);
          } else {
            // A rounded pixel that swells as it wakes.
            const s = cell * (0.28 + e * 0.5);
            ctx.beginPath();
            ctx.roundRect(x - s / 2, y - s / 2, s, s, s * 0.3);
            ctx.fill();
          }
        }
      }
    };

    const loop = () => {
      let busy = false;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const i = r * cols + c;
          const d = pointer.in ? Math.hypot(c * cell + cell / 2 - pointer.x, r * cell + cell / 2 - pointer.y) : Infinity;
          const target = d < REACH ? (1 - d / REACH) ** 1.5 : 0;
          level[i] += (target - level[i]) * EASE;
          if (Math.abs(target - level[i]) > 0.002) busy = true;
          // Awake glyphs keep changing; the more awake, the faster.
          if (glyphs && level[i] > 0.05 && Math.random() < level[i] * 0.25) chars[i] = pick();
        }
      }
      draw();
      frame = visible && (busy || pointer.in) ? requestAnimationFrame(loop) : 0;
    };
    const start = () => {
      if (!frame && visible && !still) frame = requestAnimationFrame(loop);
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const r = box.getBoundingClientRect();
      pointer.x = e.clientX - r.left;
      pointer.y = e.clientY - r.top;
      pointer.in = true;
      start();
    };
    const onLeave = () => {
      pointer.in = false;
      start();
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
    }
    return () => {
      cancelAnimationFrame(frame);
      ro.disconnect();
      io.disconnect();
      box.removeEventListener("pointermove", onMove);
      box.removeEventListener("pointerleave", onLeave);
    };
  }, [id]);

  return <canvas ref={canvasRef} aria-hidden className={`pointer-events-none absolute inset-0 h-full w-full ${className}`} />;
}
