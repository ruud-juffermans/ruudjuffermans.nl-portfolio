import { Box, Container, Typography, Chip, Button } from "@mui/material";
import Grid from "@mui/material/Grid2";
import Image from "next/image";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CheckIcon from "@mui/icons-material/CheckRounded";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import Reveal from "@/components/Reveal";
import ProofStrip from "@/components/ProofStrip";
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
  const t = await getTranslations({ locale, namespace: "about" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: buildAlternates("/about", locale),
    openGraph: buildOpenGraph("/about", locale),
  };
}

// Every chip is backed by a project or an article on this site.
const skills: Record<"data" | "ai" | "engineering", string[]> = {
  data: ["Data modeling", "Kimball / star schema", "dbt", "ELT pipelines", "Power BI"],
  ai: ["LLMs", "RAG", "Retrieval evaluation", "Document processing", "AI agents"],
  engineering: ["Python", "SQL", "PostgreSQL", "Kafka", "Docker", "CI/CD", "Azure"],
};

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("about");
  const timeline = t.raw("timeline") as { year: string; label: string }[];
  const experience = t.raw("experience") as {
    period: string;
    role: string;
    org: string;
    bullets: string[];
  }[];

  return (
    <>
      <Box sx={{ pt: { xs: 10, md: 15 }, pb: { xs: 8, md: 10 } }}>
        <Container>
          <Grid container spacing={{ xs: 6, md: 8 }} alignItems="flex-start">
            <Grid size={{ xs: 12, md: 7 }}>
              <Reveal variant="rise" delay={0}>
                <Typography variant="overline" sx={{ mb: 2, display: "block" }}>
                  {t("eyebrow")}
                </Typography>
                <Typography variant="h1" sx={{ mb: 3 }}>
                  <SplitText text={t("name")} />
                </Typography>
              </Reveal>
              {/* Same three credentials as the homepage hero — they lead here
                  too, rather than waiting until the timeline further down. */}
              <Reveal variant="fade" delay={90}>
                <Box sx={{ mb: 4 }}>
                  <ProofStrip />
                </Box>
              </Reveal>
              <Reveal variant="rise" delay={140}>
                <Typography variant="body1" sx={{ mb: 3 }}>
                  {t("intro1")}
                </Typography>
                <Typography variant="body1" sx={{ mb: 3 }}>
                  {t("intro2")}
                </Typography>
                <Typography variant="body1" sx={{ mb: 3 }}>
                  {t("intro3")}
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500, color: palette.gray900 }}>
                  {t("pullQuote")}
                </Typography>
              </Reveal>
            </Grid>
            <Grid size={{ xs: 12, md: 5 }}>
              {/* Portrait first, expertise card below it. The photo is the
                  first thing above the fold on desktop, so it loads eagerly;
                  intrinsic size keeps the column from shifting as it lands. */}
              <Reveal variant="slide-left" delay={200}>
                <Box
                  sx={{
                    mb: { xs: 3, md: 3.5 },
                    borderRadius: "20px",
                    overflow: "hidden",
                    border: `1px solid var(--app-border-soft)`,
                    backgroundColor: palette.offWhite,
                    lineHeight: 0,
                  }}
                >
                  <Image
                    src="/images/ruud-juffermans-portrait.jpg"
                    alt={t("portraitAlt")}
                    width={1152}
                    height={1366}
                    priority
                    sizes="(min-width: 1200px) 450px, (min-width: 900px) 40vw, 100vw"
                    style={{ width: "100%", height: "auto", display: "block" }}
                  />
                </Box>
              </Reveal>
              <Reveal variant="slide-left" delay={280}>
              <Box
                sx={{
                  backgroundColor: palette.offWhite,
                  borderRadius: "20px",
                  p: { xs: 4, md: 5 },
                  border: `1px solid var(--app-border-soft)`,
                }}
              >
                <Typography variant="overline" sx={{ mb: 3, display: "block" }}>
                  {t("expertiseTitle")}
                </Typography>
                {(Object.keys(skills) as Array<keyof typeof skills>).map((category) => (
                  <Box key={category} sx={{ mb: 3 }}>
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: 600, color: palette.gray900, mb: 1 }}
                    >
                      {t(`skills.${category}`)}
                    </Typography>
                    <Box sx={{ display: "flex", gap: 0.8, flexWrap: "wrap" }}>
                      {skills[category].map((skill) => (
                        <Chip
                          key={skill}
                          label={skill}
                          size="small"
                          variant="outlined"
                          sx={{ fontSize: "0.8rem" }}
                        />
                      ))}
                    </Box>
                  </Box>
                ))}
              </Box>
              </Reveal>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Experience — the résumé part: role, organisation, what I did there */}
      <Box sx={{ py: { xs: 9, md: 13 } }}>
        <Container>
          <Reveal variant="rise">
            <Typography variant="overline" sx={{ mb: 1, display: "block" }}>
              {t("experienceEyebrow")}
            </Typography>
            <Typography variant="h2" sx={{ mb: { xs: 5, md: 7 } }}>
              {t("experienceTitle")}
            </Typography>
          </Reveal>
          <Box sx={{ display: "grid", gap: { xs: 2.5, md: 3 } }}>
            {experience.map((item, i) => (
              <Reveal variant="rise" delay={i * 100} key={`${item.org}-${item.period}`}>
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", md: "160px 1fr" },
                    gap: { xs: 1, md: 5 },
                    p: { xs: 3.5, md: 4.5 },
                    borderRadius: "20px",
                    border: `1px solid var(--app-border-soft)`,
                    backgroundColor: "var(--app-surface-elevated)",
                  }}
                >
                  <Typography
                    sx={{
                      fontFamily: "var(--font-heading)",
                      fontWeight: 700,
                      color: palette.red,
                      pt: 0.4,
                    }}
                  >
                    {item.period}
                  </Typography>
                  <Box>
                    <Typography variant="h4" component="h3" sx={{ mb: 0.5 }}>
                      {item.role}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: "var(--app-text-secondary)", fontWeight: 500, mb: 2 }}
                    >
                      {item.org}
                    </Typography>
                    <Box
                      component="ul"
                      sx={{ listStyle: "none", m: 0, p: 0, display: "grid", gap: 1.25 }}
                    >
                      {item.bullets.map((bullet) => (
                        <Box
                          component="li"
                          key={bullet}
                          sx={{ display: "flex", gap: 1.5, alignItems: "flex-start" }}
                        >
                          <CheckIcon
                            sx={{ fontSize: 19, color: palette.red, mt: "3px", flexShrink: 0 }}
                          />
                          <Typography variant="body1">{bullet}</Typography>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                </Box>
              </Reveal>
            ))}
          </Box>
        </Container>
      </Box>

      {/* Timeline */}
      <Box
        sx={{
          py: { xs: 9, md: 13 },
          backgroundColor: palette.offWhite,
          borderTop: `1px solid var(--app-border-soft)`,
          borderBottom: `1px solid var(--app-border-soft)`,
        }}
      >
        <Container maxWidth="md">
          <Reveal variant="rise">
            <Typography variant="overline" sx={{ mb: 1, display: "block" }}>
              {t("timelineEyebrow")}
            </Typography>
            <Typography variant="h2" sx={{ mb: 6 }}>
              {t("timelineTitle")}
            </Typography>
          </Reveal>
          <Box>
            {timeline.map((item, i) => (
              <Reveal variant="slide-left" delay={i * 120} key={item.year}>
              <Box
                sx={{
                  display: "flex",
                  gap: 4,
                  pb: i < timeline.length - 1 ? 4 : 0,
                  position: "relative",
                  "&::before":
                    i < timeline.length - 1
                      ? {
                          content: '""',
                          position: "absolute",
                          left: 32,
                          top: 28,
                          bottom: 0,
                          width: 2,
                          backgroundColor: palette.gray200,
                        }
                      : {},
                }}
              >
                <Typography
                  sx={{
                    fontFamily: "var(--font-heading)",
                    fontWeight: 700,
                    fontSize: "1.1rem",
                    color: palette.red,
                    minWidth: 48,
                    pt: 0.3,
                  }}
                >
                  {item.year}
                </Typography>
                <Box
                  sx={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    backgroundColor: palette.red,
                    mt: 1,
                    flexShrink: 0,
                    position: "relative",
                    zIndex: 1,
                  }}
                />
                <Typography variant="body1" sx={{ color: palette.gray700, pt: 0.1 }}>
                  {item.label}
                </Typography>
              </Box>
              </Reveal>
            ))}
          </Box>
        </Container>
      </Box>

      {/* CTA — full-bleed dark section that blends into the footer (same
          #070B15); the radial glow rises from the bottom edge */}
      <Box
        sx={{
          position: "relative",
          overflow: "hidden",
          backgroundColor: "#070B15",
          py: { xs: 12, md: 15 },
          textAlign: "center",
          "&::before": {
            content: '""',
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(640px 340px at 50% 115%, rgba(37, 99, 235, 0.35), transparent 70%)",
            pointerEvents: "none",
          },
        }}
      >
        <Container sx={{ position: "relative" }}>
          <Reveal variant="rise">
            <Typography
              variant="h2"
              sx={{
                color: palette.white,
                fontSize: "clamp(32px, 5vw, 56px)",
                maxWidth: 720,
                mx: "auto",
              }}
            >
              {t("cta.title")}
            </Typography>
            <Typography
              sx={{ mt: 2.25, mb: 6, color: "#a3a3a3", fontSize: 17, maxWidth: 560, mx: "auto" }}
            >
              {t("cta.subtitle")}
            </Typography>
            <Box
              sx={{
                display: "flex",
                gap: 2,
                justifyContent: "center",
                flexDirection: { xs: "column", sm: "row" },
                alignItems: "center",
              }}
            >
              <Button
                variant="contained"
                size="large"
                component={Link}
                href="/contact"
                sx={{ px: 7, width: { xs: "100%", sm: "auto" }, maxWidth: 360 }}
              >
                {t("cta.primary")}
              </Button>
              <Button
                variant="outlined"
                size="large"
                component={Link}
                href="/projects"
                endIcon={<ArrowForwardIcon />}
                sx={{
                  px: 7,
                  width: { xs: "100%", sm: "auto" },
                  maxWidth: 360,
                  color: palette.white,
                  borderColor: "rgba(255,255,255,0.28)",
                  "@media (hover: hover)": {
                    "&:hover": {
                      borderColor: palette.white,
                      backgroundColor: "rgba(255,255,255,0.08)",
                    },
                  },
                }}
              >
                {t("cta.secondary")}
              </Button>
            </Box>
          </Reveal>
        </Container>
      </Box>
    </>
  );
}
