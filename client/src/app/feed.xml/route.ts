import { marked } from "marked";
import { getBlogPost, getBlogPosts } from "@/lib/content";
import { absolutizeLinks } from "@/lib/markdown";
import { absoluteUrl, SITE_URL } from "@/lib/seo";
import nlMessages from "../../../messages/nl.json";

// The feed carries the Dutch posts — the site's default locale and primary
// audience. Rendered once at build time; a deploy accompanies every new post.
export const dynamic = "force-static";

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function GET() {
  const posts = getBlogPosts("nl");
  const items = posts
    .map((post) => {
      const url = absoluteUrl("/blog/[slug]", "nl", { slug: post.slug });
      // Full post body as HTML in content:encoded — a summaries-only feed
      // forces every AI/RSS ingester into a second fetch of the heavy HTML
      // page. The MDX is plain Markdown (no JSX), so marked can render it.
      const body = getBlogPost("nl", post.slug)!.content;
      const html = (marked.parse(absolutizeLinks(body), { async: false }) as string)
        // A "]]>" inside the body would terminate the CDATA section early.
        .replaceAll("]]>", "]]]]><![CDATA[>");
      return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${new Date(post.date).toUTCString()}</pubDate>
      <description>${escapeXml(post.excerpt)}</description>
      <content:encoded><![CDATA[${html}]]></content:encoded>
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>${escapeXml(nlMessages.site.title)}</title>
    <link>${SITE_URL}</link>
    <description>${escapeXml(nlMessages.site.description)}</description>
    <language>nl</language>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>
`;

  return new Response(xml, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
