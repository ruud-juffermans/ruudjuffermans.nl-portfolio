import { Box, Container, Typography } from "@mui/material";
import { getTranslations, setRequestLocale } from "next-intl/server";
import Reveal from "@/components/Reveal";
import BlogFilters, { type ProjectOption } from "@/components/BlogFilters";
import { CUSTOM_PROJECT_PAGES, getBlogPosts, POST_TOPICS } from "@/lib/content";
import type { Locale } from "@/i18n/routing";
import { buildAlternates, buildOpenGraph, formatDate } from "@/lib/seo";
import SplitText from "@/components/SplitText";
import { palette } from "@/theme/theme";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "blog" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: buildAlternates("/blog", locale),
    openGraph: buildOpenGraph("/blog", locale),
  };
}

export default async function BlogPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("blog");
  const tc = await getTranslations("common");
  const posts = getBlogPosts(locale);
  // "date · reading time" is formatted here: the filter is a client component
  // and this keeps the server-side date formatting and translations.
  const metaFor = Object.fromEntries(
    posts.map((p) => [
      p.slug,
      `${formatDate(p.date, locale)} · ${p.readingTime} ${tc("readingTimeSuffix")}`,
    ])
  );
  const projectOptions: ProjectOption[] = Array.from(CUSTOM_PROJECT_PAGES).map(
    (slug) => ({ slug, label: t(`filters.projects.${slug}`) })
  );
  const filterLabels = {
    topicLabel: t("filters.topicLabel"),
    projectLabel: t("filters.projectLabel"),
    all: t("filters.all"),
    standalone: t("filters.standalone"),
    topics: Object.fromEntries(
      POST_TOPICS.map((topic) => [topic, t(`filters.topics.${topic}`)])
    ) as Record<(typeof POST_TOPICS)[number], string>,
    reset: t("filters.reset"),
    countOne: t("filters.countOne"),
    countOther: t("filters.countOther"),
    emptyTitle: t("filters.empty.title"),
    emptyBody: t("filters.empty.body"),
  };

  return (
    <>
      <Box sx={{ pt: { xs: 10, md: 15 }, pb: { xs: 6, md: 9 } }}>
        <Container>
          <Box sx={{ maxWidth: 800 }}>
            <Reveal variant="rise" delay={0}>
              <Typography variant="overline" sx={{ mb: 2, display: "block" }}>
                {t("eyebrow")}
              </Typography>
            </Reveal>
            <Reveal variant="rise" delay={100}>
              <Typography variant="h1" sx={{ mb: 3 }}>
                <SplitText text={t("title")} />
              </Typography>
            </Reveal>
            <Reveal variant="rise" delay={200}>
              <Typography variant="subtitle1">{t("subtitle")}</Typography>
            </Reveal>
          </Box>
        </Container>
      </Box>

      <Box sx={{ pb: { xs: 10, md: 14 } }}>
        <Container maxWidth="lg">
          {posts.length === 0 ? (
            <Reveal variant="zoom">
              <Box
                sx={{
                  textAlign: "center",
                  py: 10,
                  px: 4,
                  backgroundColor: palette.offWhite,
                  borderRadius: 4,
                }}
              >
                <Typography variant="h3" sx={{ mb: 2 }}>
                  {t("empty.title")}
                </Typography>
                <Typography variant="body1" sx={{ maxWidth: 500, mx: "auto" }}>
                  {t("empty.body")}
                </Typography>
              </Box>
            </Reveal>
          ) : (
            <BlogFilters
              posts={posts}
              projects={projectOptions}
              metaFor={metaFor}
              labels={filterLabels}
            />
          )}
        </Container>
      </Box>
    </>
  );
}
