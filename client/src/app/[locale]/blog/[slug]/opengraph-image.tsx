import { getBlogPost } from "@/lib/content";
import { formatDate } from "@/lib/seo";
import { OG_CONTENT_TYPE, OG_SIZE, renderOgImage } from "@/lib/og";
import type { Locale } from "@/i18n/routing";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "Ruud Juffermans — blog";

export default async function Image({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}) {
  const { locale, slug } = await params;
  const post = getBlogPost(locale, slug);
  return renderOgImage({
    eyebrow: post?.meta.tags.join(" · ") || "Blog",
    title: post?.meta.title ?? "Blog",
    meta: post ? `${formatDate(post.meta.date, locale)} · ${post.meta.readingTime}` : undefined,
  });
}
