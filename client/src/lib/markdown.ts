import { SITE_URL, formatDate } from "@/lib/seo";
import type { PostMeta } from "@/lib/content";
import type { Locale } from "@/i18n/routing";

/**
 * Helpers for the plain-Markdown surfaces (llms.txt, llms-full.txt, the
 * /blog/*.md endpoints and the RSS bodies). Those documents are fetched
 * standalone, so root-relative links must become absolute.
 */
export function absolutizeLinks(markdown: string): string {
  return markdown
    .replace(/\]\(\//g, `](${SITE_URL}/`)
    .replace(/href="\//g, `href="${SITE_URL}/`)
    .replace(/src="\//g, `src="${SITE_URL}/`);
}

/** A blog post as a self-contained Markdown document: title, meta line, body. */
export function postAsMarkdown(meta: PostMeta, content: string, locale: Locale): string {
  const metaLine = [formatDate(meta.date, locale), meta.tags.join(", ")]
    .filter(Boolean)
    .join(" · ");
  return `# ${meta.title}\n\n> ${meta.excerpt}\n\n_${metaLine}_\n\n${absolutizeLinks(content.trim())}\n`;
}

export const MARKDOWN_HEADERS = {
  "Content-Type": "text/markdown; charset=utf-8",
};
