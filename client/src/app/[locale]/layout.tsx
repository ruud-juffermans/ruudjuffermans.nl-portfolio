import type { Metadata } from "next";
import localFont from "next/font/local";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import InitColorSchemeScript from "@mui/material/InitColorSchemeScript";
import ThemeRegistry from "@/theme/ThemeRegistry";
import Header from "@/components/Header";
import SkipLink from "@/components/SkipLink";
import Footer from "@/components/Footer";
import { routing } from "@/i18n/routing";

// Self-hosted fonts (no CDN), via next/font so the woff2 files are preloaded
// and get a size-adjusted fallback — swapping in the web font then doesn't
// reflow the page (the desktop hero was shifting a full CLS point on it).
// The variables feed the MUI theme and CSS modules as before; the woff2 files
// are the latin subsets copied from @fontsource-variable.
const headingFont = localFont({
  src: "../../assets/fonts/plus-jakarta-sans-latin-wght-normal.woff2",
  weight: "200 800",
  display: "swap",
  variable: "--font-heading",
});
const bodyFont = localFont({
  src: "../../assets/fonts/outfit-latin-wght-normal.woff2",
  weight: "100 900",
  display: "swap",
  variable: "--font-body",
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  // Guard here, not just in the layout component: metadata resolves before
  // render, and getTranslations throws a 500 on an invalid language tag
  // (e.g. /llms.txt reaching [locale] because dotted paths skip the
  // middleware). notFound() turns those into a 404 via app/not-found.tsx.
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  const t = await getTranslations({ locale, namespace: "site" });
  return {
    title: {
      default: t("title"),
      template: t("titleTemplate"),
    },
    description: t("description"),
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
    openGraph: {
      type: "website",
      locale: locale === "nl" ? "nl_NL" : "en_US",
      siteName: t("siteName"),
    },
    twitter: {
      card: "summary_large_image",
    },
    // No `alternates` here on purpose: canonical + hreflang are per-page
    // (see buildAlternates in lib/seo.ts) — a layout-level value would claim
    // the homepage as every page's language alternate.
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);

  const tc = await getTranslations({ locale, namespace: "common" });
  const apiOrigin = process.env.NEXT_PUBLIC_API_URL;

  return (
    <html
      lang={locale}
      className={`${headingFont.variable} ${bodyFont.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* The analytics beacon + forms hit the platform API on first
            interaction; warming the connection saves a TLS handshake. Unset
            in dev, where /api/* is a same-origin rewrite. */}
        {apiOrigin ? <link rel="preconnect" href={apiOrigin} /> : null}
        <InitColorSchemeScript
          defaultMode="system"
          attribute="data-mui-color-scheme"
          modeStorageKey="ruudjuf-color-mode"
        />
      </head>
      <body>
        <NextIntlClientProvider>
          <ThemeRegistry>
            <SkipLink label={tc("skipToContent")} />
            <Header />
            <main id="main">{children}</main>
            <Footer />
          </ThemeRegistry>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
