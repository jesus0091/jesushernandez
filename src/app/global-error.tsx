"use client";

import { useEffect } from "react";
import { Warning } from "@/components/icons";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <div className="min-h-screen w-full flex items-center justify-center px-4 bg-gradient-to-br from-slate-50 to-red-50">
          <div className="max-w-2xl w-full text-center space-y-8">
            <div className="flex justify-center">
              <Warning size={80} className="text-red-500" />
            </div>

            <div className="space-y-4">
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-gray-900">
                Critical Error
              </h2>
              <p className="text-lg md:text-xl text-gray-600 max-w-md mx-auto">
                A critical error occurred. Please refresh the page to continue.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={reset}
                className="px-6 py-3 bg-black text-white rounded-full font-semibold transition-all hover:scale-105 hover:shadow-lg active:scale-95"
              >
                Try Again
              </button>
              <button
                onClick={() => window.location.href = "/"}
                className="px-6 py-3 border-2 border-black text-black rounded-full font-semibold transition-all hover:scale-105 hover:shadow-lg active:scale-95"
              >
                Go Home
              </button>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
