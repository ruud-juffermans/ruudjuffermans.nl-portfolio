import type { Metadata } from "next";
import { routing, type AppPathname, type Locale } from "@/i18n/routing";

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

type PathParams = Record<string, string>;

/**
 * Resolve an internal pathname key (e.g. "/projects/[slug]") to the concrete
 * URL path for a locale, honoring the localized pathnames in routing.ts and
 * the "as-needed" locale prefix (nl unprefixed, en under /en).
 *
 * This deliberately re-implements next-intl's getPathname: the createNavigation
 * export lives in a "use client" module, which generateMetadata can't import.
 */
export function localizePathname(
  href: AppPathname,
  locale: Locale,
  params?: PathParams,
): string {
  const entry = routing.pathnames[href];
  let path: string = typeof entry === "string" ? entry : entry[locale];
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      path = path.replace(`[${key}]`, encodeURIComponent(value));
    }
  }
  if (locale === routing.defaultLocale) return path;
  return path === "/" ? `/${locale}` : `/${locale}${path}`;
}

export function absoluteUrl(href: AppPathname, locale: Locale, params?: PathParams): string {
  return `${SITE_URL}${localizePathname(href, locale, params)}`;
}

/**
 * Per-page canonical + hreflang pair. Every page's generateMetadata should
 * spread this in — the layout intentionally sets none, because alternates
 * declared there would claim the homepage as every page's alternate.
 */
export function buildAlternates(
  href: AppPathname,
  locale: Locale,
  params?: PathParams,
): Metadata["alternates"] {
  const nl = localizePathname(href, "nl", params);
  const en = localizePathname(href, "en", params);
  return {
    canonical: locale === "nl" ? nl : en,
    languages: {
      nl,
      en,
      // Dutch is the default locale and the primary audience.
      "x-default": nl,
    },
    types: { "application/rss+xml": "/feed.xml" },
  };
}

/**
 * Per-page Open Graph base: og:url (resolved against metadataBase) plus the
 * fields the locale layout would otherwise provide. Next.js replaces a
 * parent's `openGraph` object wholesale when a page defines one, so pages
 * must carry the full set — spread this and override/extend as needed.
 */
export function buildOpenGraph(
  href: AppPathname,
  locale: Locale,
  params?: PathParams,
): NonNullable<Metadata["openGraph"]> {
  return {
    type: "website",
    url: localizePathname(href, locale, params),
    locale: locale === "nl" ? "nl_NL" : "en_US",
    // Mirrors site.siteName in messages/{nl,en}.json (identical in both).
    siteName: "Ruud Juffermans — Data Engineer",
  };
}

/**
 * For pages rendered from fallback content (Dutch MDX served under /en/…):
 * canonicalize to the Dutch original and skip hreflang, so the two URLs
 * aren't presented to crawlers as distinct translations of each other.
 */
export function fallbackAlternates(href: AppPathname, params?: PathParams): Metadata["alternates"] {
  return {
    canonical: localizePathname(href, routing.defaultLocale, params),
    types: { "application/rss+xml": "/feed.xml" },
  };
}

export function formatDate(isoDate: string, locale: Locale): string {
  const parsed = new Date(isoDate);
  if (Number.isNaN(parsed.getTime())) return isoDate;
  // Date-only strings parse as UTC midnight; format in UTC too, or the
  // build machine's timezone shifts the displayed day.
  return new Intl.DateTimeFormat(locale === "nl" ? "nl-NL" : "en-US", {
    dateStyle: "long",
    timeZone: "UTC",
  }).format(parsed);
}
