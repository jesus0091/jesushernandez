import { ImageResponse } from "next/og";
import { getTranslations } from "next-intl/server";
import { hasLocale } from "next-intl";
import { routing } from "@/i18n/routing";

// A route handler, not the opengraph-image file convention: the convention
// injects "/en/opengraph-image" into every page's metadata, which the
// middleware redirects. Pages point at the public URL themselves (see shareFor).
export const dynamic = "force-static";

const size = { width: 1200, height: 630 };

// Inter, like the site. Built at deploy time; falls back to the default font
// if Google Fonts can't be reached.
async function loadInter(weight: number) {
  try {
    const css = await (
      await fetch(`https://fonts.googleapis.com/css2?family=Inter:wght@${weight}&display=swap`)
    ).text();
    const url = css.match(/src: url\((.+?)\) format\('(?:opentype|truetype)'\)/)?.[1];
    return url ? await (await fetch(url)).arrayBuffer() : null;
  } catch {
    return null;
  }
}

// One image per language, rendered at build time.
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ locale: string }> },
) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return new Response(null, { status: 404 });
  const t = await getTranslations({ locale, namespace: "og" });
  const [regular, bold] = await Promise.all([loadInter(400), loadInter(700)]);
  const fonts = [
    regular && { name: "Inter", data: regular, weight: 400 as const, style: "normal" as const },
    bold && { name: "Inter", data: bold, weight: 700 as const, style: "normal" as const },
  ].filter((f) => !!f);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          backgroundColor: "#f4f1ea",
          color: "#111111",
          fontFamily: "Inter",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 26, letterSpacing: 6, color: "#ff6600" }}>
          <div style={{ width: 48, height: 2, background: "#ff6600" }} />
          {t("portfolio")}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ fontSize: 96, fontWeight: 700, letterSpacing: -4, lineHeight: 1 }}>Jesús Hernández</div>
          {/* Set like the home title: the lead word heavy, the rest light. */}
          <div style={{ display: "flex", fontSize: 48, fontWeight: 400, letterSpacing: -1, color: "#3a3a3a" }}>
            <span style={{ color: "#111111", fontWeight: 700, marginRight: 14 }}>Product</span>
            Engineer &amp; Designer
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 26, color: "#6b6b6b" }}>
          <span>{t("location")}</span>
          <span>jesushernandez.site</span>
        </div>
      </div>
    ),
    { ...size, fonts }
  );
}
