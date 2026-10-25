import type { NextRequest } from "next/server";
import createMiddleware from "next-intl/middleware";
import { SERVICES } from "./data/services";
import { WORKS } from "./data/works";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);
// Ids each dynamic route renders; anything else under it is a 404.
const KNOWN_IDS: Record<string, Set<string>> = {
  works: new Set(WORKS.map((w) => w.id)),
  services: new Set(SERVICES),
};

// AI crawlers and AI user fetches. Static pages leave no function logs, so the
// middleware notes each visit in the runtime log (Vercel → Logs, filter "ai-bot").
// The *-User agents mean a person asked an assistant something that led here.
const AI_BOT = /OAI-SearchBot|ChatGPT-User|GPTBot|Claude-SearchBot|Claude-User|ClaudeBot|PerplexityBot|Perplexity-User|Google-Extended|CCBot|bingbot/i;

export default function middleware(request: NextRequest) {
  const bot = request.headers.get("user-agent")?.match(AI_BOT)?.[0];
  if (bot) console.log(JSON.stringify({ tag: "ai-bot", bot, path: request.nextUrl.pathname }));

  const response = intlMiddleware(request);

  // An unknown id matches [locale]/works/[id] (or services/[id]), but Next then renders the
  // 404 without the locale layout (no <html lang>) whenever the default
  // locale was rewritten. Point it at a path no route owns instead, so it
  // takes the same global 404 as every other unmatched URL.
  const match = request.nextUrl.pathname.match(
    /^(?:\/(es))?\/(works|services)\/([^/]+)\/?$/,
  );
  if (match && !KNOWN_IDS[match[2]].has(match[3])) {
    const locale = match[1] ?? routing.defaultLocale;
    response.headers.set(
      "x-middleware-rewrite",
      new URL(`/${locale}/${match[2]}/${match[3]}/not-found`, request.url).toString(),
    );
  }
  return response;
}

export const config = {
  // Skip API routes, Next internals and anything with a file extension.
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
