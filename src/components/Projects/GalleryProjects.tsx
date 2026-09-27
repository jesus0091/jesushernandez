"use client";

import { onIntroReveal, setupGsap } from "@/lib/motion";
import { useLayoutEffect, useRef } from "react";

import Image from "next/image";
import { SignatureIcon } from "../SignatureIcon";

const AMPLITUDE = 140;
export default function GalleryProjects() {
  const rootRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const gsap = setupGsap();
    const cards = gsap.utils.toArray<HTMLElement>(".g-item", root);
    if (!cards.length) return;

    const center = (cards.length - 1) / 2;
    const curveY = (i: number) => {
      const x = i - center;
      return (AMPLITUDE * (x * x)) / (center * center || 1);
    };

    // The entrance owns opacity + yPercent and the scroll curve owns y, so
    // they compose instead of overwriting each other (the entrance used to
    // tween y back to 0 and flatten the curve until the first scroll).
    const mm = gsap.matchMedia(root);
    mm.add(
      {
        desktop: "(min-width: 768px)",
        finePointer: "(hover: hover) and (pointer: fine)",
        reduce: "(prefers-reduced-motion: reduce)",
      },
      (context) => {
        const { desktop, finePointer, reduce } = context.conditions!;
        if (reduce) return;

        gsap.set(cards, { autoAlpha: 0, yPercent: desktop ? 30 : 15 });
        const stopWaiting = onIntroReveal(() => {
          gsap.to(cards, {
            autoAlpha: 1,
            yPercent: 0,
            duration: 1.2,
            delay: 0.6,
            stagger: 0.08,
            ease: "power3.out",
          });
        });

        if (desktop) {
          // Rendered immediately at the current scroll position, so the
          // curve is already there on load.
          gsap
            .timeline({
              defaults: { ease: "none" },
              scrollTrigger: {
                trigger: root,
                start: "top bottom",
                end: "bottom top",
                scrub: true,
              },
            })
            .fromTo(cards, { y: (i) => 100 - curveY(i) }, { y: 0, duration: 1 })
            .to(cards, { y: (i) => curveY(i), duration: 1 });
        }

        if (!finePointer) return stopWaiting;

        gsap.set(cards, { transformPerspective: 900 });
        const cleanups = cards.map((card) => {
          const rotY = gsap.quickTo(card, "rotateY", { duration: 0.4, ease: "power3.out" });
          const rotX = gsap.quickTo(card, "rotateX", { duration: 0.4, ease: "power3.out" });

          const onMouseMove = (e: MouseEvent) => {
            const rect = card.getBoundingClientRect();
            const nx = (e.clientX - rect.left) / rect.width - 0.5;
            const ny = (e.clientY - rect.top) / rect.height - 0.5;
            rotY(nx * 16);
            rotX(-ny * 12);
          };
          const onMouseEnter = () =>
            gsap.to(card, { scale: 1.02, duration: 0.3, ease: "power3.out" });
          const onMouseLeave = () => {
            rotY(0);
            rotX(0);
            gsap.to(card, { scale: 1, duration: 0.6, ease: "power3.out" });
          };

          card.addEventListener("mousemove", onMouseMove);
          card.addEventListener("mouseenter", onMouseEnter);
          card.addEventListener("mouseleave", onMouseLeave);
          return () => {
            card.removeEventListener("mousemove", onMouseMove);
            card.removeEventListener("mouseenter", onMouseEnter);
            card.removeEventListener("mouseleave", onMouseLeave);
          };
        });

        return () => {
          stopWaiting();
          cleanups.forEach((fn) => fn());
        };
      }
    );

    return () => mm.revert();
  }, []);

  const gallery = [
    { id: 1, urlImage: "/images/gallery-2.webp" },
    { id: 2, urlImage: "/images/gallery-3.webp" },
    { id: 3, urlImage: "/images/gallery-1.webp" },
    { id: 4, urlImage: "/images/gallery-4.webp" },
    { id: 5, urlImage: "/images/gallery-2.webp" },
    { id: 6, urlImage: "/images/gallery-6.webp" },
    { id: 7, urlImage: "/images/gallery-4.webp" },
  ];

  return (
    <div
      ref={rootRef}
      className="overflow-hidden pt-6 pb-10 md:py-0 md:h-[70vh] md:-mt-[18vh] flex flex-col justify-center items-center"
    >
      <div className="flex flex-row gap-1 md:gap-4">
        {gallery.map((item) => (
          <div
            key={item.id}
            className="g-item w-[15vw] relative min-w-[110px] rounded-md md:rounded-xl overflow-clip md:min-w-[260px] flex items-start aspect-[9/11] shadow-2xs bg-gray-500 mb-4 md:[transform-style:preserve-3d] md:[will-change:transform]"
          >
            <Image
              src={item.urlImage}
              alt=""
              fill
              sizes="(min-width: 768px) max(15vw, 260px), max(15vw, 110px)"
              className="object-top object-cover"
            />
          </div>
        ))}
      </div>
      <div className="flex flex-col items-center mt-4">
        <p className="text-center text-xl font-medium">
          Join to my projects
        </p>
        <SignatureIcon className="h-25 md:h-40" />
      </div>
    </div>
  );
}
