import { getProjectItem } from "@/lib/content";
import { OG_CONTENT_TYPE, OG_SIZE, renderOgImage } from "@/lib/og";
import type { Locale } from "@/i18n/routing";
import { SLUG } from "./content";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "Ruud Juffermans — project";

// Same card as the generic project pages, from the project's MDX frontmatter.
export default async function Image({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const item = getProjectItem(locale, SLUG);
  return renderOgImage({
    eyebrow: item?.meta.industry || "Project",
    title: item?.meta.title ?? "Project",
    meta: item?.meta.tags.join(" · "),
  });
}
