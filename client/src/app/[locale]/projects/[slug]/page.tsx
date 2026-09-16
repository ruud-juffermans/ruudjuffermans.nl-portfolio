import { Box, Container, Typography, Chip, Button, Alert } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { MDXRemote } from "next-mdx-remote/rsc";
import rehypePrettyCode from "rehype-pretty-code";
import remarkGfm from "remark-gfm";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { CUSTOM_PROJECT_PAGES, getProjectItem, getProjectItems } from "@/lib/content";
import JsonLd from "@/components/JsonLd";
import {
  absoluteUrl,
  buildAlternates,
  buildOpenGraph,
  fallbackAlternates,
  SITE_URL,
} from "@/lib/seo";
import { routing, type Locale } from "@/i18n/routing";
import { palette } from "@/theme/theme";
import PageViewTracker from "@/components/PageViewTracker";

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    getProjectItems(locale)
      .filter((item) => !CUSTOM_PROJECT_PAGES.has(item.slug))
      .map((item) => ({ locale, slug: item.slug })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}) {
  const { locale, slug } = await params;
  if (CUSTOM_PROJECT_PAGES.has(slug)) return {};
  const item = getProjectItem(locale, slug);
  if (!item) return {};
  return {
    title: item.meta.title,
    description: item.meta.summary,
    alternates: item.usedFallback
      ? fallbackAlternates("/projects/[slug]", { slug })
      : buildAlternates("/projects/[slug]", locale, { slug }),
    openGraph: {
      // og:url follows the canonical: fallback pages point at the Dutch original.
      ...buildOpenGraph("/projects/[slug]", item.usedFallback ? "nl" : locale, { slug }),
      type: "article",
      title: item.meta.title,
      description: item.meta.summary,
      tags: item.meta.tags,
    },
  };
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  // Slugs with a bespoke sibling route never render as an article.
  if (CUSTOM_PROJECT_PAGES.has(slug)) notFound();
  const item = getProjectItem(locale, slug);
  if (!item) notFound();

  const t = await getTranslations("projects");
  const tc = await getTranslations("common");

  return (
    <Box sx={{ py: { xs: 4, md: 8 } }}>
      <PageViewTracker path={`/projects/${slug}`} locale={locale} />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
            {
              "@type": "ListItem",
              position: 2,
              name: locale === "nl" ? "Projecten" : "Projects",
              item: absoluteUrl("/projects", locale),
            },
            { "@type": "ListItem", position: 3, name: item.meta.title },
          ],
        }}
      />
      <Container maxWidth="md">
        <Button
          component={Link}
          href="/projects"
          startIcon={<ArrowBackIcon />}
          sx={{ mb: 3, color: palette.gray500 }}
        >
          {tc("backToProjects")}
        </Button>

        {item.usedFallback && (
          <Alert severity="info" sx={{ mb: 3 }}>
            {t("detail.fallbackNotice")}
          </Alert>
        )}

        <Box sx={{ display: "flex", gap: 1, mb: 2, flexWrap: "wrap" }}>
          {item.meta.tags.map((tag) => (
            <Chip key={tag} label={tag} size="small" variant="outlined" />
          ))}
        </Box>

        <Typography variant="h1" sx={{ mb: 1.5, fontSize: { xs: "2rem", md: "2.75rem" } }}>
          {item.meta.title}
        </Typography>

        <Box sx={{ display: "flex", gap: 3, mb: 4, color: palette.gray400 }}>
          <Typography variant="body2">{item.meta.industry}</Typography>
          {item.meta.duration && (
            <Typography variant="body2">{item.meta.duration}</Typography>
          )}
        </Box>

        <Box
          sx={{
            "& h2": {
              fontFamily: "var(--font-heading)",
              fontSize: "1.5rem",
              fontWeight: 600,
              mt: 4,
              mb: 1,
              color: palette.gray900,
            },
            "& h3": {
              fontFamily: "var(--font-heading)",
              fontSize: "1.2rem",
              fontWeight: 600,
              mt: 3,
              mb: 0.75,
              color: palette.gray900,
            },
            "& p": {
              fontSize: "1rem",
              lineHeight: 1.65,
              color: palette.gray600,
              mb: 1.5,
            },
            "& ul, & ol": {
              pl: 2.5,
              mb: 1.5,
              "& li": {
                fontSize: "1rem",
                lineHeight: 1.6,
                color: palette.gray600,
                mb: 0.25,
              },
            },
            "& strong": {
              color: palette.gray800,
              fontWeight: 600,
            },
            "& a": {
              color: palette.red,
              textDecoration: "underline",
              textUnderlineOffset: "3px",
              textDecorationColor: palette.redMuted,
              "&:hover": {
                textDecorationColor: palette.red,
              },
            },
            "& blockquote": {
              borderLeft: `3px solid ${palette.red}`,
              py: 0.5,
              pl: 2.5,
              ml: 0,
              my: 3.5,
              "& p": {
                fontFamily: "var(--font-heading)",
                fontSize: "20px",
                color: palette.gray800,
                mb: 0,
              },
            },
            "& table": {
              display: "block",
              overflowX: "auto",
              borderCollapse: "collapse",
              mb: 2.5,
              fontSize: "0.92em",
            },
            "& th, & td": {
              border: `1px solid ${palette.gray200}`,
              px: 1.5,
              py: 1,
              color: palette.gray600,
              verticalAlign: "top",
            },
            "& th": {
              fontFamily: "var(--font-heading)",
              fontWeight: 600,
              color: palette.gray900,
              textAlign: "left",
            },
            "& th:empty": {
              display: "none",
            },
            "& hr": {
              border: "none",
              borderTop: `1px solid ${palette.gray100}`,
              my: 3,
            },
            "& img": {
              maxWidth: "100%",
              borderRadius: "12px",
              my: 2,
            },
            // Content figures (diagrams, screenshots) — distinct from the
            // rehype-pretty-code figures that wrap code blocks below.
            "& figure:not([data-rehype-pretty-code-figure])": {
              my: 3.5,
              mx: 0,
              "& a": {
                display: "block",
                textDecoration: "none",
              },
              "& img": {
                display: "block",
                width: "100%",
                height: "auto",
                my: 0,
                borderRadius: "12px",
                border: `1px solid ${palette.gray200}`,
                boxShadow: "0 2px 12px rgba(11, 17, 32, 0.06)",
              },
              "& figcaption": {
                mt: 1.25,
                fontSize: "0.85rem",
                lineHeight: 1.5,
                color: palette.gray500,
              },
            },
            // draw.io exports are dark-only (see scripts/drawio-to-web.mjs),
            // so they sit on navy in both colour schemes, like code blocks.
            "& figure.diagram img": {
              backgroundColor: palette.navy,
              p: { xs: 1.5, md: 2.5 },
              boxSizing: "border-box",
            },
            "& code": {
              backgroundColor: palette.offWhite,
              border: `1px solid ${palette.gray100}`,
              px: 0.7,
              py: 0.2,
              borderRadius: "6px",
              fontSize: "0.85em",
              fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
              fontWeight: 500,
            },
            "& figure[data-rehype-pretty-code-figure]": {
              my: 2.5,
              mx: 0,
              borderRadius: "12px",
              overflow: "hidden",
              border: `1px solid ${palette.gray200}`,
              boxShadow: "0 2px 12px rgba(11, 17, 32, 0.06)",
            },
            "& figcaption[data-rehype-pretty-code-title]": {
              backgroundColor: palette.gray50,
              borderBottom: `1px solid ${palette.gray200}`,
              px: 2,
              py: 1,
              fontSize: "0.75rem",
              fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
              fontWeight: 600,
              color: palette.gray500,
              letterSpacing: "0.03em",
              textTransform: "uppercase",
            },
            "& figure[data-rehype-pretty-code-figure] pre": {
              backgroundColor: `${palette.navy} !important`,
              m: 0,
              p: 2.5,
              borderRadius: 0,
              border: "none",
              boxShadow: "none",
              overflowX: "auto",
              "& code": {
                backgroundColor: "transparent",
                border: "none",
                p: 0,
                fontSize: "0.875rem",
                lineHeight: 1.7,
                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                fontWeight: 400,
                display: "block",
              },
            },
            "& pre:not(figure pre)": {
              backgroundColor: palette.navy,
              color: palette.gray200,
              p: 2.5,
              borderRadius: "12px",
              overflowX: "auto",
              mb: 2.5,
              border: `1px solid ${palette.gray200}`,
              boxShadow: "0 2px 12px rgba(11, 17, 32, 0.06)",
              "& code": {
                backgroundColor: "transparent",
                border: "none",
                p: 0,
                color: "inherit",
                fontSize: "0.875rem",
                fontWeight: 400,
              },
            },
          }}
        >
          <MDXRemote
            source={item.content}
            options={{
              mdxOptions: {
                remarkPlugins: [remarkGfm],
                rehypePlugins: [
                  [
                    rehypePrettyCode,
                    {
                      theme: "github-dark-default",
                      keepBackground: true,
                      defaultLang: "plaintext",
                    },
                  ],
                ],
              },
            }}
          />
        </Box>
      </Container>
    </Box>
  );
}
