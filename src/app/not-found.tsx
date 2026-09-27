"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { House, ArrowLeft } from "@/components/icons";

export default function NotFound() {
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
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-[var(--black)]">
            Page Not Found
          </h2>
          <p className="text-lg md:text-xl text-[var(--muted)] max-w-md mx-auto">
            Oops! The page you&apos;re looking for seems to have wandered off
            into the digital void.
          </p>
        </div>

        {/* Actions */}
        <div
          className={`flex flex-col sm:flex-row gap-4 justify-center items-center transition-all duration-700 delay-500 ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          <Link
            href="/"
            className="group flex items-center gap-2 px-6 py-3 bg-[var(--black)] text-[var(--white)] rounded-full font-semibold transition-all hover:scale-105 hover:shadow-lg active:scale-95"
          >
            <House size={20} />
            Go Home
          </Link>
          <button
            onClick={() => window.history.back()}
            className="group flex items-center gap-2 px-6 py-3 border-2 border-[var(--black)] text-[var(--black)] rounded-full font-semibold transition-all hover:scale-105 hover:shadow-lg active:scale-95"
          >
            <ArrowLeft size={20} />
            Go Back
          </button>
        </div>

        {/* Decoration */}
        <div
          className={`pt-8 transition-all duration-700 delay-700 ${
            mounted ? "opacity-100" : "opacity-0"
          }`}
        >
          <p className="text-sm text-[var(--muted)]">
            Lost? Try checking the URL or head back to the{" "}
            <Link
              href="/"
              className="text-[var(--orange)] hover:underline font-medium"
            >
              homepage
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
