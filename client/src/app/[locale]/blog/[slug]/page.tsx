import { Box, Container, Typography, Button, Divider, Alert } from "@mui/material";
import { MDXRemote } from "next-mdx-remote/rsc";
import rehypePrettyCode from "rehype-pretty-code";
import remarkGfm from "remark-gfm";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getBlogPost, getBlogPosts } from "@/lib/content";
import BlogFigure from "@/components/BlogFigure";
import JsonLd from "@/components/JsonLd";
import {
  absoluteUrl,
  buildAlternates,
  buildOpenGraph,
  fallbackAlternates,
  formatDate,
  SITE_URL,
} from "@/lib/seo";
import { routing, type Locale } from "@/i18n/routing";
import { palette } from "@/theme/theme";
import PageViewTracker from "@/components/PageViewTracker";

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    getBlogPosts(locale).map((post) => ({ locale, slug: post.slug })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}) {
  const { locale, slug } = await params;
  const post = getBlogPost(locale, slug);
  if (!post) return {};
  const alternates = post.usedFallback
    ? fallbackAlternates("/blog/[slug]", { slug })
    : buildAlternates("/blog/[slug]", locale, { slug });
  // The Markdown twin served by the rewrites in next.config.ts; fallback
  // pages carry Dutch content, so they point at the Dutch .md as well.
  const markdownPath =
    post.usedFallback || locale === "nl" ? `/blog/${slug}.md` : `/en/blog/${slug}.md`;
  return {
    title: post.meta.title,
    description: post.meta.excerpt,
    // Fallback pages serve the Dutch MDX under the /en/ URL — canonicalize
    // those to the Dutch original instead of claiming a translation pair.
    alternates: {
      ...alternates,
      types: { "application/rss+xml": "/feed.xml", "text/markdown": markdownPath },
    },
    openGraph: {
      // og:url follows the canonical: fallback pages point at the Dutch original.
      ...buildOpenGraph("/blog/[slug]", post.usedFallback ? "nl" : locale, { slug }),
      type: "article",
      title: post.meta.title,
      description: post.meta.excerpt,
      publishedTime: post.meta.date,
      tags: post.meta.tags,
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const post = getBlogPost(locale, slug);
  if (!post) notFound();

  const t = await getTranslations("blog.post");
  const tc = await getTranslations("common");

  return (
    <Box sx={{ pt: { xs: 6, md: 10 }, pb: { xs: 8, md: 11 } }}>
      <PageViewTracker path={`/blog/${slug}`} locale={locale} />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "BlogPosting",
              headline: post.meta.title,
              description: post.meta.excerpt,
              datePublished: post.meta.date,
              // No separate modified date is tracked; publishing an edit
              // should bump the frontmatter date.
              dateModified: post.meta.date,
              // The per-slug OG image route (locale-prefixed — unprefixed
              // opengraph-image paths are excluded from the i18n middleware).
              image: [`${SITE_URL}/${locale}/blog/${slug}/opengraph-image`],
              inLanguage: locale,
              keywords: post.meta.tags.join(", "),
              mainEntityOfPage: absoluteUrl("/blog/[slug]", locale, { slug }),
              author: {
                "@type": "Person",
                "@id": `${SITE_URL}/#person`,
                name: "Ruud Juffermans",
                url: SITE_URL,
              },
            },
            {
              "@type": "BreadcrumbList",
              itemListElement: [
                { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
                {
                  "@type": "ListItem",
                  position: 2,
                  name: "Blog",
                  item: absoluteUrl("/blog", locale),
                },
                { "@type": "ListItem", position: 3, name: post.meta.title },
              ],
            },
          ],
        }}
      />
      <Container maxWidth="md">
        <Typography
          component={Link}
          href="/blog"
          sx={{
            display: "inline-flex",
            alignItems: "center",
            gap: 1,
            fontSize: "0.8rem",
            color: palette.gray500,
            textDecoration: "none",
            mb: 4.5,
            transition: "color 0.2s ease",
            "&:hover": { color: palette.red },
          }}
        >
          <span aria-hidden="true">←</span> {tc("backToBlog")}
        </Typography>

        {post.usedFallback && (
          <Alert severity="info" sx={{ mb: 3 }}>
            {t("fallbackNotice")}
          </Alert>
        )}

        <Box sx={{ mb: 5 }}>
          <Typography
            variant="overline"
            sx={{ color: palette.red, display: "block", letterSpacing: "0.12em" }}
          >
            {post.meta.tags.join(" · ")}
          </Typography>
          <Typography
            variant="h1"
            sx={{ mt: 1.75, mb: 2, fontSize: "clamp(30px, 4.4vw, 44px)" }}
          >
            {post.meta.title}
          </Typography>
          <Typography sx={{ fontSize: 14, color: palette.gray500 }}>
            <time dateTime={post.meta.date}>{formatDate(post.meta.date, locale)}</time>{" "}
            &middot; {post.meta.readingTime} {tc("readingTimeSuffix")}
          </Typography>
        </Box>

        <Box
          sx={{
            fontSize: 17,
            lineHeight: 1.7,
            "& h2": {
              fontFamily: "var(--font-heading)",
              fontSize: "26px",
              fontWeight: 600,
              mt: 5.5,
              mb: 2,
              color: palette.gray900,
            },
            "& h3": {
              fontFamily: "var(--font-heading)",
              fontSize: "20px",
              fontWeight: 600,
              mt: 4,
              mb: 1.5,
              color: palette.gray900,
            },
            "& p": {
              color: palette.gray600,
              fontSize: "inherit",
              lineHeight: "inherit",
              mb: 2.5,
            },
            "& ul, & ol": {
              pl: 3,
              mb: 2.5,
              "& li": {
                lineHeight: "inherit",
                color: palette.gray600,
                mb: 1.5,
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
                fontSize: "0.8rem",
                lineHeight: 1.7,
                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                fontWeight: 400,
                display: "block",
              },
            },
            "& code[data-line-numbers] > [data-line]::before": {
              counterIncrement: "line",
              content: "counter(line)",
              display: "inline-block",
              width: "1.5rem",
              marginRight: "1.5rem",
              textAlign: "right",
              color: palette.gray600,
              fontSize: "0.8rem",
            },
            "& [data-highlighted-line]": {
              backgroundColor: "rgba(37, 99, 235, 0.1)",
              borderLeft: `2px solid ${palette.red}`,
              pl: "calc(1rem - 2px)",
              mx: -2.5,
              px: 2.5,
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
            "& a": {
              color: palette.red,
              textDecoration: "underline",
              textUnderlineOffset: "3px",
              textDecorationColor: palette.redMuted,
              "&:hover": {
                textDecorationColor: palette.red,
              },
            },
            "& img": {
              maxWidth: "100%",
              borderRadius: "12px",
              my: 2,
            },
            "& hr": {
              border: "none",
              borderTop: `1px solid ${palette.gray100}`,
              my: 3,
            },
            "& strong": {
              color: palette.gray800,
              fontWeight: 600,
            },
          }}
        >
          <MDXRemote
            source={post.content}
            components={{ img: BlogFigure }}
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

        <Divider sx={{ my: 4 }} />

        <Box
          sx={{
            backgroundColor: palette.offWhite,
            border: `1px solid var(--app-border-soft)`,
            borderRadius: "20px",
            p: { xs: 4, md: 5 },
            textAlign: "center",
          }}
        >
          <Typography variant="h4" sx={{ mb: 0.75 }}>
            {t("ctaTitle")}
          </Typography>
          <Typography variant="body2" sx={{ mb: 2.5, color: palette.gray500 }}>
            {t("ctaBody")}
          </Typography>
          <Button variant="contained" component={Link} href="/contact">
            {t("ctaButton")}
          </Button>
        </Box>
      </Container>
    </Box>
  );
}
