"use client";

import { useEffect } from "react";
import { Warning, ArrowClockwise, House } from "@/components/icons";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to error reporting service
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="min-h-screen w-full flex items-center justify-center px-4 bg-gradient-to-br from-background via-background to-red-50/10">
      <div className="max-w-2xl w-full text-center space-y-8">
        {/* Error Icon */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 animate-ping">
              <Warning
                size={80}
                className="text-red-500 opacity-20"
              />
            </div>
            <Warning size={80} className="text-red-500 relative" />
          </div>
        </div>

        {/* Message */}
        <div className="space-y-4">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-[var(--black)]">
            Something Went Wrong
          </h2>
          <p className="text-lg md:text-xl text-[var(--muted)] max-w-md mx-auto">
            We encountered an unexpected error. Don&apos;t worry, it&apos;s not
            your fault!
          </p>

          {/* Error details (only in development) */}
          {process.env.NODE_ENV === "development" && error.message && (
            <details className="mt-4 text-left max-w-xl mx-auto">
              <summary className="cursor-pointer text-sm text-[var(--muted)] hover:text-[var(--orange)] font-medium">
                View error details
              </summary>
              <pre className="mt-2 p-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg text-xs overflow-auto text-red-900 dark:text-red-400">
                {error.message}
                {error.digest && `\n\nDigest: ${error.digest}`}
              </pre>
            </details>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button
            onClick={reset}
            className="group flex items-center gap-2 px-6 py-3 bg-[var(--black)] text-[var(--white)] rounded-full font-semibold transition-all hover:scale-105 hover:shadow-lg active:scale-95"
          >
            <ArrowClockwise size={20} className="group-hover:rotate-180 transition-transform duration-500" />
            Try Again
          </button>
          <Link
            href="/"
            className="group flex items-center gap-2 px-6 py-3 border-2 border-[var(--black)] text-[var(--black)] rounded-full font-semibold transition-all hover:scale-105 hover:shadow-lg active:scale-95"
          >
            <House size={20} />
            Go Home
          </Link>
        </div>

        {/* Help text */}
        <div className="pt-8">
          <p className="text-sm text-[var(--muted)]">
            If this problem persists, please{" "}
            <a
              href="mailto:jesushernandez120491@gmail.com"
              className="text-[var(--orange)] hover:underline font-medium"
            >
              contact support
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
