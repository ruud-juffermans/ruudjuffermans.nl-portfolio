import { getBlogPost, getBlogPosts } from "@/lib/content";
import { MARKDOWN_HEADERS, postAsMarkdown } from "@/lib/markdown";
import { routing, type Locale } from "@/i18n/routing";

// Markdown twin of every blog post, exposed as /blog/[slug].md (nl) and
// /en/blog/[slug].md via the rewrites in next.config.ts — dotted paths skip
// the i18n middleware, so the pretty URLs land here directly. Linked from
// each post's <head> as rel="alternate" type="text/markdown".
export const dynamic = "force-static";

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    getBlogPosts(locale).map((post) => ({ locale, slug: post.slug })),
  );
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ locale: string; slug: string }> },
) {
  const { locale, slug } = await params;
  if (!routing.locales.includes(locale as Locale)) {
    return new Response("Not found", { status: 404 });
  }
  const post = getBlogPost(locale as Locale, slug);
  if (!post) return new Response("Not found", { status: 404 });

  return new Response(postAsMarkdown(post.meta, post.content, locale as Locale), {
    headers: MARKDOWN_HEADERS,
  });
}
