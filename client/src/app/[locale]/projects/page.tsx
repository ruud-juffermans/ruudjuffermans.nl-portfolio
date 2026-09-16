import { Box, Container, Typography } from "@mui/material";
import { getTranslations, setRequestLocale } from "next-intl/server";
import Reveal from "@/components/Reveal";
import ProjectSection from "@/components/ProjectSection";
import { getProjectItems } from "@/lib/content";
import type { Locale } from "@/i18n/routing";
import { buildAlternates, buildOpenGraph } from "@/lib/seo";
import SplitText from "@/components/SplitText";
import { palette } from "@/theme/theme";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "projects" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: buildAlternates("/projects", locale),
    openGraph: buildOpenGraph("/projects", locale),
  };
}

export default async function ProjectsPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("projects");
  const items = getProjectItems(locale);
  const sectionLabels = {
    view: t("view"),
    repo: t("repoLabel"),
  };

  return (
    <>
      <Box sx={{ pt: { xs: 10, md: 15 }, pb: { xs: 6, md: 9 } }}>
        <Container>
          <Box sx={{ maxWidth: 700 }}>
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

      {items.length === 0 ? (
        <Box sx={{ pb: { xs: 10, md: 14 } }}>
          <Container>
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
                <Typography variant="h3" component="h2" sx={{ mb: 2 }}>
                  {t("empty.title")}
                </Typography>
                <Typography variant="body1" sx={{ maxWidth: 500, mx: "auto" }}>
                  {t("empty.body")}
                </Typography>
              </Box>
            </Reveal>
          </Container>
        </Box>
      ) : (
        <Box sx={{ pb: { xs: 4, md: 6 } }}>
          {items.map((item, i) => (
            <ProjectSection
              key={item.slug}
              project={item}
              accent={item.accent ?? palette.red}
              index={i}
              shaded={i % 2 === 0}
              labels={sectionLabels}
            />
          ))}
        </Box>
      )}
    </>
  );
}
