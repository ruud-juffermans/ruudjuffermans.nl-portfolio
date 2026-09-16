import { Box, Button, Chip, Container, Typography } from "@mui/material";
import Grid from "@mui/material/Grid2";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import GitHubIcon from "@mui/icons-material/GitHub";
import CheckIcon from "@mui/icons-material/CheckRounded";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import Reveal from "@/components/Reveal";
import SplitText from "@/components/SplitText";
import LinkButton from "@/components/LinkButton";
import { getProjectItems } from "@/lib/content";
import { EXPERTISE_FIELDS, isExpertiseField, type ExpertiseField } from "@/lib/expertise";
import { buildAlternates, buildOpenGraph } from "@/lib/seo";
import { routing, type Locale } from "@/i18n/routing";
import { palette } from "@/theme/theme";
import type { Metadata } from "next";

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    (Object.keys(EXPERTISE_FIELDS) as ExpertiseField[]).map((field) => ({ locale, field })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale; field: string }>;
}): Promise<Metadata> {
  const { locale, field } = await params;
  if (!isExpertiseField(field)) return {};
  const t = await getTranslations({ locale, namespace: "expertise" });
  const f = `fields.${EXPERTISE_FIELDS[field].key}` as const;
  return {
    title: t(`${f}.metaTitle`),
    description: t(`${f}.metaDescription`),
    alternates: buildAlternates("/expertise/[field]", locale, { field }),
    openGraph: buildOpenGraph("/expertise/[field]", locale, { field }),
  };
}

// One discipline in depth: what the work is, how I approach it, where I did
// it, what I work with, and the case studies on this site that show it.
export default async function ExpertisePage({
  params,
}: {
  params: Promise<{ locale: Locale; field: string }>;
}) {
  const { locale, field } = await params;
  if (!isExpertiseField(field)) notFound();
  setRequestLocale(locale);
  const t = await getTranslations("expertise");
  const spec = EXPERTISE_FIELDS[field];
  const f = `fields.${spec.key}` as const;

  const approach = t.raw(`${f}.approach`) as { title: string; body: string }[];
  const experience = t.raw(`${f}.experience`) as {
    period: string;
    role: string;
    org: string;
    body: string;
  }[];
  const skills = t.raw(`${f}.skills`) as string[];

  // Frontmatter for the field's case studies, kept in the field's own order.
  const all = getProjectItems(locale);
  const projects = spec.projects
    .map((slug) => all.find((p) => p.slug === slug))
    .filter((p) => p !== undefined);

  return (
    <>
      {/* Intro */}
      <Box sx={{ pt: { xs: 10, md: 15 }, pb: { xs: 8, md: 10 } }}>
        <Container>
          <Box sx={{ maxWidth: 760 }}>
            <Reveal variant="rise" delay={0}>
              <Typography variant="overline" sx={{ mb: 2, display: "block" }}>
                {t(`${f}.eyebrow`)}
              </Typography>
            </Reveal>
            <Reveal variant="rise" delay={100}>
              <Typography variant="h1" sx={{ mb: 3 }}>
                <SplitText text={t(`${f}.title`)} />
              </Typography>
            </Reveal>
            <Reveal variant="rise" delay={200}>
              <Typography variant="subtitle1" sx={{ mb: 3 }}>
                {t(`${f}.intro`)}
              </Typography>
              <Typography variant="body1" sx={{ mb: 4 }}>
                {t(`${f}.intro2`)}
              </Typography>
            </Reveal>
            <Reveal variant="rise" delay={300}>
              <Box sx={{ display: "flex", gap: 2, flexDirection: { xs: "column", sm: "row" } }}>
                <Button
                  variant="contained"
                  size="large"
                  component={Link}
                  href="/contact"
                  sx={{ px: 6, width: { xs: "100%", sm: "auto" } }}
                >
                  {t("cta.primary")}
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  component={Link}
                  href="/projects"
                  endIcon={<ArrowForwardIcon />}
                  sx={{ px: 6, width: { xs: "100%", sm: "auto" } }}
                >
                  {t("allProjects")}
                </Button>
              </Box>
            </Reveal>
          </Box>
        </Container>
      </Box>

      {/* Approach — the three or four things a team can count on */}
      <Box
        sx={{
          py: { xs: 9, md: 12 },
          backgroundColor: palette.offWhite,
          borderTop: `1px solid var(--app-border-soft)`,
          borderBottom: `1px solid var(--app-border-soft)`,
        }}
      >
        <Container>
          <Reveal variant="rise">
            <Typography variant="overline" sx={{ mb: 1, display: "block" }}>
              {t("approachEyebrow")}
            </Typography>
            <Typography variant="h2" sx={{ mb: { xs: 4, md: 6 }, maxWidth: 640 }}>
              {t(`${f}.approachTitle`)}
            </Typography>
          </Reveal>
          <Grid container spacing={{ xs: 2.5, md: 3 }}>
            {approach.map((item, i) => (
              <Grid size={{ xs: 12, sm: 6, md: 3 }} key={item.title}>
                <Reveal variant="rise" delay={i * 90} sx={{ height: "100%" }}>
                  <Box
                    sx={{
                      height: "100%",
                      p: { xs: 3.5, md: 4 },
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
                        mb: 1.5,
                      }}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </Typography>
                    <Typography variant="h4" component="h3" sx={{ mb: 1.25 }}>
                      {item.title}
                    </Typography>
                    <Typography variant="body1">{item.body}</Typography>
                  </Box>
                </Reveal>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Experience in this field, plus what I work with */}
      <Box sx={{ py: { xs: 9, md: 13 } }}>
        <Container>
          <Grid container spacing={{ xs: 6, md: 8 }}>
            <Grid size={{ xs: 12, md: 7 }}>
              <Reveal variant="rise">
                <Typography variant="overline" sx={{ mb: 1, display: "block" }}>
                  {t("experienceEyebrow")}
                </Typography>
                <Typography variant="h2" sx={{ mb: { xs: 4, md: 5 } }}>
                  {t(`${f}.experienceTitle`)}
                </Typography>
              </Reveal>
              <Box sx={{ display: "grid", gap: { xs: 2.5, md: 3 } }}>
                {experience.map((item, i) => (
                  <Reveal variant="rise" delay={i * 100} key={`${item.org}-${item.period}`}>
                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: { xs: "1fr", sm: "130px 1fr" },
                        gap: { xs: 1, sm: 4 },
                        p: { xs: 3.5, md: 4 },
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
                          sx={{ color: "var(--app-text-secondary)", fontWeight: 500, mb: 1.5 }}
                        >
                          {item.org}
                        </Typography>
                        <Typography variant="body1">{item.body}</Typography>
                      </Box>
                    </Box>
                  </Reveal>
                ))}
              </Box>
            </Grid>
            <Grid size={{ xs: 12, md: 5 }}>
              <Reveal variant="slide-left" delay={200}>
                <Box
                  sx={{
                    p: { xs: 4, md: 5 },
                    borderRadius: "20px",
                    border: `1px solid var(--app-border-soft)`,
                    backgroundColor: palette.offWhite,
                  }}
                >
                  <Typography variant="overline" sx={{ mb: 2.5, display: "block" }}>
                    {t("skillsEyebrow")}
                  </Typography>
                  <Box sx={{ display: "flex", gap: 0.8, flexWrap: "wrap", mb: 4 }}>
                    {skills.map((skill) => (
                      <Chip
                        key={skill}
                        label={skill}
                        size="small"
                        variant="outlined"
                        sx={{ fontSize: "0.8rem" }}
                      />
                    ))}
                  </Box>
                  <Typography variant="overline" sx={{ mb: 2, display: "block" }}>
                    {t("principlesEyebrow")}
                  </Typography>
                  <Box
                    component="ul"
                    sx={{ listStyle: "none", m: 0, p: 0, display: "grid", gap: 1.25 }}
                  >
                    {(t.raw(`${f}.principles`) as string[]).map((line) => (
                      <Box
                        component="li"
                        key={line}
                        sx={{ display: "flex", gap: 1.5, alignItems: "flex-start" }}
                      >
                        <CheckIcon
                          sx={{ fontSize: 19, color: palette.red, mt: "3px", flexShrink: 0 }}
                        />
                        <Typography variant="body1">{line}</Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>
              </Reveal>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* The case studies that show this field */}
      <Box
        sx={{
          py: { xs: 9, md: 13 },
          backgroundColor: palette.offWhite,
          borderTop: `1px solid var(--app-border-soft)`,
          borderBottom: `1px solid var(--app-border-soft)`,
        }}
      >
        <Container>
          <Reveal variant="rise">
            <Typography variant="overline" sx={{ mb: 1, display: "block" }}>
              {t("relatedEyebrow")}
            </Typography>
            <Typography variant="h2" sx={{ mb: 2, maxWidth: 640 }}>
              {t(`${f}.relatedTitle`)}
            </Typography>
            <Typography variant="subtitle1" sx={{ mb: { xs: 4, md: 6 }, maxWidth: 640 }}>
              {t(`${f}.relatedSubtitle`)}
            </Typography>
          </Reveal>
          <Grid container spacing={{ xs: 2.5, md: 3 }}>
            {projects.map((project, i) => {
              const accent = project.accent ?? palette.red;
              return (
                <Grid size={{ xs: 12, md: 6 }} key={project.slug}>
                  <Reveal variant="rise" delay={i * 100} sx={{ height: "100%" }}>
                    <Box
                      sx={{
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                        p: { xs: 3.5, md: 4.5 },
                        borderRadius: "20px",
                        border: `1px solid var(--app-border-soft)`,
                        backgroundColor: "var(--app-surface-elevated)",
                        position: "relative",
                        overflow: "hidden",
                        "&::before": {
                          content: '""',
                          position: "absolute",
                          top: 0,
                          left: 0,
                          right: 0,
                          height: 3,
                          background: `linear-gradient(to right, ${accent}, transparent 80%)`,
                        },
                      }}
                    >
                      <Typography variant="overline" sx={{ mb: 1.5, display: "block" }}>
                        {project.industry}
                        {project.duration && ` · ${project.duration}`}
                      </Typography>
                      <Typography variant="h3" component="h3" sx={{ mb: 1.5 }}>
                        <Box
                          component={Link}
                          href={{ pathname: "/projects/[slug]", params: { slug: project.slug } }}
                          sx={{
                            color: "inherit",
                            textDecoration: "none",
                            transition: "color 0.2s ease",
                            "@media (hover: hover)": { "&:hover": { color: accent } },
                          }}
                        >
                          {project.title}
                        </Box>
                      </Typography>
                      <Typography variant="body1" sx={{ mb: 2.5 }}>
                        {project.summary}
                      </Typography>
                      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 3 }}>
                        {project.tags.map((tag) => (
                          <Chip key={tag} label={tag} size="small" variant="outlined" />
                        ))}
                      </Box>
                      <Box
                        sx={{
                          mt: "auto",
                          display: "flex",
                          alignItems: "center",
                          gap: 2,
                          flexWrap: "wrap",
                        }}
                      >
                        <LinkButton
                          variant="contained"
                          href={{ pathname: "/projects/[slug]", params: { slug: project.slug } }}
                          endIcon={<ArrowForwardIcon />}
                        >
                          {t("view")}
                        </LinkButton>
                        {project.repo && (
                          <Button
                            component="a"
                            href={project.repo}
                            target="_blank"
                            rel="noopener noreferrer"
                            startIcon={<GitHubIcon />}
                          >
                            {t("repo")}
                          </Button>
                        )}
                      </Box>
                    </Box>
                  </Reveal>
                </Grid>
              );
            })}
          </Grid>
          <Reveal variant="fade" delay={300}>
            <Button
              component={Link}
              href="/projects"
              endIcon={<ArrowForwardIcon />}
              sx={{ mt: 4, ml: -2 }}
            >
              {t("allProjects")}
            </Button>
          </Reveal>
        </Container>
      </Box>

      {/* CTA — same full-bleed dark band as the About page */}
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
              {t(`${f}.ctaTitle`)}
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
                href="/about"
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
