import "./globals.css";

import Link from "next/link";

// Fallback for URLs outside any locale. It brings its own <html> because the
// root layout does not render one.
export default function RootNotFound() {
  return (
    <html lang="en" data-color-scheme="light">
      <body className="antialiased w-full">
        <main className="min-h-screen w-full flex flex-col items-center justify-center gap-6 px-4 text-center">
          <h1 className="text-3xl md:text-5xl font-bold tracking-title text-[var(--black)]">
            Page Not Found
          </h1>
          <Link
            href="/"
            className="px-6 py-3 bg-[var(--black)] text-[var(--white)] rounded-full font-semibold"
          >
            Go Home
          </Link>
        </main>
      </body>
    </html>
  );
}
