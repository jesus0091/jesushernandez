import "./globals.css";

import { Inter } from "next/font/google";
import { getLocale, getTranslations } from "next-intl/server";

import NotFoundView from "@/components/NotFoundView";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  axes: ["opsz"],
  display: "swap",
});

// Every unmatched URL ends here, in either language. It brings its own <html>
// because it bypasses the layouts; the middleware tells it the locale, and the
// links stay in that language ("/" for English, "/es" for Spanish).
export default async function GlobalNotFound() {
  const locale = await getLocale();
  const t = await getTranslations({ locale, namespace: "notFound" });

  return (
    <html lang={locale} data-color-scheme="light" className={inter.variable}>
      <body className="antialiased w-full">
        <NotFoundView
          homeHref={locale === "en" ? "/" : `/${locale}`}
          labels={{
            title: t("title"),
            message: t("message"),
            home: t("home"),
            back: t("back"),
            lostBefore: t("lostBefore"),
            lostLink: t("lostLink"),
            lostAfter: t("lostAfter"),
          }}
        />
      </body>
    </html>
  );
}
