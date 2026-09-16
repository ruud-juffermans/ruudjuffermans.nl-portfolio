import { getProjectItem } from "@/lib/content";
import { OG_CONTENT_TYPE, OG_SIZE, renderOgImage } from "@/lib/og";
import type { Locale } from "@/i18n/routing";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "Ruud Juffermans — project";

export default async function Image({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}) {
  const { locale, slug } = await params;
  const item = getProjectItem(locale, slug);
  return renderOgImage({
    eyebrow: item?.meta.industry || "Project",
    title: item?.meta.title ?? "Project",
    meta: item?.meta.tags.join(" · "),
  });
}
