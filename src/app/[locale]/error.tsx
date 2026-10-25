"use client";

import { ButtonInner, buttonClass } from "@/components/PillButton";
import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { Warning, ArrowClockwise, House } from "@/components/icons";
import { Link } from "@/i18n/navigation";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("error");

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
          <h2 className="text-3xl md:text-5xl font-bold tracking-title text-[var(--black)]">
            {t("title")}
          </h2>
          <p className="text-lg md:text-xl text-[var(--muted)] max-w-md mx-auto">
            {t("message")}
          </p>

          {/* Error details (only in development) */}
          {process.env.NODE_ENV === "development" && error.message && (
            <details className="mt-4 text-left max-w-xl mx-auto">
              <summary className="cursor-pointer text-sm text-[var(--muted)] hover:text-[var(--color-accent-ink)] font-medium">
                {t("details")}
              </summary>
              <pre className="mt-2 p-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-control text-xs overflow-auto text-red-900 dark:text-red-400">
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
            className={buttonClass()}
          >
            <ButtonInner icon={ArrowClockwise}>{t("tryAgain")}</ButtonInner>
          </button>
          <Link
            href="/"
            className={buttonClass()}
          >
            <ButtonInner icon={House}>{t("home")}</ButtonInner>
          </Link>
        </div>

        {/* Help text */}
        <div className="pt-8">
          <p className="text-sm text-[var(--muted)]">
            {t("persistsBefore")}{" "}
            <a
              href="mailto:jesushernandez120491@gmail.com"
              className="text-[var(--color-accent-ink)] hover:underline font-medium"
            >
              {t("contact")}
            </a>
            {t("persistsAfter")}
          </p>
        </div>
      </div>
    </div>
  );
}
