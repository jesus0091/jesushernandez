import type { MetadataRoute } from "next";

const CANONICAL = "https://jesushernandez.site";

// Every crawler may read the whole site. The AI ones are listed by name so the
// decision is explicit (and easy to change per bot): search/answer bots put the
// site in ChatGPT, Claude, Perplexity, Copilot and AI Overviews; training bots
// are allowed too, since the goal is to be known.
const AI_SEARCH_BOTS = [
  "OAI-SearchBot", // ChatGPT search
  "ChatGPT-User", // a ChatGPT user's own fetch
  "Claude-SearchBot", // Claude search
  "Claude-User", // a Claude user's own fetch
  "PerplexityBot", // Perplexity search
  "Perplexity-User", // a Perplexity user's own fetch
];
const AI_TRAINING_BOTS = ["GPTBot", "ClaudeBot", "Google-Extended", "CCBot"];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: [...AI_SEARCH_BOTS, ...AI_TRAINING_BOTS], allow: "/" },
      { userAgent: "*", allow: "/" },
    ],
    sitemap: `${CANONICAL}/sitemap.xml`,
  };
}
