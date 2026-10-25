"use client";

import { ButtonInner, buttonClass } from "@/components/PillButton";
import Link from "next/link";
import { useEffect, useState } from "react";
import { House, ArrowLeft } from "@/components/icons";

type NotFoundViewProps = {
  /** Where "home" points: "/" or "/es". This page renders outside the locale layout. */
  homeHref: string;
  labels: {
    title: string;
    message: string;
    home: string;
    back: string;
    lostBefore: string;
    lostLink: string;
    lostAfter: string;
  };
};

// The 404 page (app/global-not-found.tsx). It gets its copy as props because
// the server component that renders it knows the locale.
export default function NotFoundView({ homeHref, labels }: NotFoundViewProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen w-full flex items-center justify-center px-4 bg-gradient-to-br from-background via-background to-orange-50/10">
      <div className="max-w-2xl w-full text-center space-y-8">
        {/* 404 Number */}
        <div className="relative">
          <h1
            className={`text-[120px] md:text-[200px] font-black leading-none text-transparent bg-clip-text bg-gradient-to-br from-orange-500 to-orange-600 transition-all duration-1000 ${
              mounted
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-10"
            }`}
          >
            404
          </h1>
          <div
            className={`absolute inset-0 -z-10 blur-3xl opacity-20 transition-all duration-1000 delay-200 ${
              mounted ? "scale-100" : "scale-0"
            }`}
          >
            <div className="w-full h-full bg-gradient-to-r from-orange-400 to-orange-600" />
          </div>
        </div>

        {/* Message */}
        <div
          className={`space-y-4 transition-all duration-700 delay-300 ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          <h2 className="text-3xl md:text-5xl font-bold tracking-title text-[var(--black)]">
            {labels.title}
          </h2>
          <p className="text-lg md:text-xl text-[var(--muted)] max-w-md mx-auto">
            {labels.message}
          </p>
        </div>

        {/* Actions */}
        <div
          className={`flex flex-col sm:flex-row gap-4 justify-center items-center transition-all duration-700 delay-500 ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          <Link
            href={homeHref}
            className={buttonClass()}
          >
            <ButtonInner icon={House}>{labels.home}</ButtonInner>
          </Link>
          <button
            onClick={() => window.history.back()}
            className={buttonClass()}
          >
            <ButtonInner icon={ArrowLeft} iconSide="start">{labels.back}</ButtonInner>
          </button>
        </div>

        {/* Decoration */}
        <div
          className={`pt-8 transition-all duration-700 delay-700 ${
            mounted ? "opacity-100" : "opacity-0"
          }`}
        >
          <p className="text-sm text-[var(--muted)]">
            {labels.lostBefore}{" "}
            <Link
              href={homeHref}
              className="text-[var(--color-accent-ink)] hover:underline font-medium"
            >
              {labels.lostLink}
            </Link>
            {labels.lostAfter}
          </p>
        </div>
      </div>
    </div>
  );
}
