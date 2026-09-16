import type { MetadataRoute } from "next";
import { getBlogPosts, getProjectItems } from "@/lib/content";
import { absoluteUrl } from "@/lib/seo";
import type { AppPathname } from "@/i18n/routing";
import { EXPERTISE_FIELDS } from "@/lib/expertise";

const STATIC_ROUTES: AppPathname[] = [
  "/",
  "/projects",
  "/blog",
  "/about",
  "/contact",
  "/privacy",
];

// The sitemap renders once per build; entries without their own content date
// use the build moment as lastmod (better than omitting it entirely).
const BUILD_DATE = new Date();

function entry(
  href: AppPathname,
  params?: Record<string, string>,
  lastModified?: string,
): MetadataRoute.Sitemap {
  const nl = absoluteUrl(href, "nl", params);
  const en = absoluteUrl(href, "en", params);
  // Google's guidance: every language version gets its own <url> entry, each
  // carrying the full reciprocal alternate set — matching the page-level
  // hreflang (which also declares x-default = nl, the primary audience).
  const languages = { nl, en, "x-default": nl };
  const lastMod = lastModified ? new Date(lastModified) : BUILD_DATE;
  return [
    { url: nl, lastModified: lastMod, alternates: { languages } },
    { url: en, lastModified: lastMod, alternates: { languages } },
  ];
}

export default function sitemap(): MetadataRoute.Sitemap {
  // getBlogPosts/getProjectItems already union locale + fallback slugs, so the
  // default-locale listing covers every published slug.
  const posts = getBlogPosts("nl");
  const projects = getProjectItems("nl");

  return [
    ...STATIC_ROUTES.flatMap((href) => entry(href)),
    ...Object.keys(EXPERTISE_FIELDS).flatMap((field) => entry("/expertise/[field]", { field })),
    ...projects.flatMap((p) => entry("/projects/[slug]", { slug: p.slug })),
    ...posts.flatMap((p) => entry("/blog/[slug]", { slug: p.slug }, p.date)),
  ];
}
