"use client";

import { useNearViewport } from "@/components/motion/useNearViewport";

import { useLayoutEffect, useRef } from "react";
import { useTranslations } from "next-intl";

export type TunnelVariant = "rings" | "warp";

/**
 * CtaTunnel's ride: the card grows to fill the screen and becomes a tunnel.
 * The light, the tunnel, the grain and the card's rounded edge are one WebGL
 * shader, so nothing but the words and the title is laid out or painted per frame.
 */
export default function ShaderTunnel({ variant, children }: { variant: TunnelVariant; children: React.ReactNode }) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const wordsRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const tr = useTranslations("tunnel");
  const words = tr.raw("words") as string[];
  // The ride only needs how many words there are, the same in every language.
  const wordCount = words.length;

  const near = useNearViewport(sectionRef);

  useLayoutEffect(() => {
    if (!near) return;
    const section = sectionRef.current;
    const stage = stageRef.current;
    const canvas = canvasRef.current;
    if (!section || !stage || !canvas) return;
    const words = wordsRef.current;
    const content = contentRef.current;
    if (!words || !content) return;
    let disposed = false;
    let cleanup: (() => void) | undefined;
    // The shader source, compiler and GPU setup are fetched only near the CTA.
    import("./shaderTunnelEffect").then(({ setupTunnel }) => {
      if (!disposed) cleanup = setupTunnel({ section, stage, canvas, words, content, variant });
    }).catch(() => {
      if (!disposed) stage.dataset.fallback = "true";
    });
    return () => {
      disposed = true;
      cleanup?.();
    };
  }, [near, variant, wordCount]);

  return (
    <section ref={sectionRef} className="relative h-[280vh] md:h-[340vh]">
      <div
        ref={stageRef}
        // Tints Safari's bars while it fills the screen (BrowserTint).
        data-browser-tint
        // The navbar goes transparent over it, so the card grows up under the links.
        data-nav-clear="true"
        className="sticky top-0 h-lvh w-full overflow-hidden data-[fallback=true]:bg-[#01020c]"
      >
        <canvas ref={canvasRef} aria-hidden className="absolute inset-0 h-full w-full" />
        <p className="sr-only">{tr("srIntro")} {words.join(", ")}.</p>
        <div ref={wordsRef} aria-hidden className="absolute inset-0 pointer-events-none">
          {words.map((w) => (
            <span
              key={w}
              className="absolute left-1/2 top-1/2 whitespace-nowrap text-3xl md:text-7xl font-semibold tracking-title text-white/90 invisible will-change-transform"
            >
              {w}
            </span>
          ))}
        </div>
        <div ref={contentRef} className="relative z-10 h-full flex items-center justify-center will-change-transform">
          {children}
        </div>
      </div>
    </section>
  );
}
