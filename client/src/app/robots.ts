import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // Explicitly welcome the AI crawlers behind ChatGPT, Claude, Perplexity
      // and the AI training opt-ins: citation traffic is welcome, and an
      // explicit allow survives a future "block everything" refactor.
      {
        userAgent: [
          "GPTBot",
          "OAI-SearchBot",
          "ClaudeBot",
          "Claude-Web",
          "PerplexityBot",
          "Google-Extended",
          "Applebot-Extended",
        ],
        allow: "/",
      },
      // Bytespider (ByteDance) is an aggressive scraper with no citation value.
      { userAgent: "Bytespider", disallow: "/" },
      { userAgent: "*", allow: "/" },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
