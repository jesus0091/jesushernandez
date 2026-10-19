import "./globals.css";

import Link from "next/link";
import { getLocale } from "next-intl/server";

// Every unmatched URL ends here, in either language. It brings its own <html>
// because it bypasses the layouts; the middleware tells it the locale.
export default async function GlobalNotFound() {
  const locale = await getLocale();
  return (
    <html lang={locale} data-color-scheme="light">
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
