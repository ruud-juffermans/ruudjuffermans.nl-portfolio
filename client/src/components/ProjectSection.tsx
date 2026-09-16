import { Box, Button, Chip, Container, Typography } from "@mui/material";
import Grid from "@mui/material/Grid2";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import GitHubIcon from "@mui/icons-material/GitHub";
import { Link } from "@/i18n/navigation";
import Reveal from "./Reveal";
import LinkButton from "./LinkButton";
import MetaPair from "./MetaPair";
import { palette } from "@/theme/theme";
import type { ProjectMeta } from "@/lib/content";

export interface ProjectSectionLabels {
  view: string;
  repo: string;
}

/**
 * One case study as a full-width page section: alternating shaded
 * backgrounds, overline + h2, and a two-column split with the story on the
 * left and the numbers that back it up on the right.
 */
export default function ProjectSection({
  project,
  accent,
  index,
  shaded,
  labels,
}: {
  project: ProjectMeta;
  accent: string;
  /** Zero-based position on the page, rendered as the "01" section marker. */
  index: number;
  shaded: boolean;
  labels: ProjectSectionLabels;
}) {
  return (
    <Box
      component="section"
      sx={{
        py: { xs: 8, md: 11 },
        backgroundColor: shaded ? palette.offWhite : "transparent",
        borderTop: shaded ? `1px solid var(--app-border-soft)` : "none",
        borderBottom: shaded ? `1px solid var(--app-border-soft)` : "none",
      }}
    >
      <Container>
        <Grid container spacing={{ xs: 5, md: 8 }}>
          <Grid size={{ xs: 12, md: 7 }}>
            <Reveal variant="rise">
              <Typography variant="overline" sx={{ mb: 1.5, display: "block" }}>
                <Box component="span" sx={{ color: accent }}>
                  {String(index + 1).padStart(2, "0")}
                </Box>
                {" — "}
                {project.industry}
                {project.duration && ` · ${project.duration}`}
              </Typography>
              <Typography variant="h2" sx={{ mb: 2.5, maxWidth: 640 }}>
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
              <Typography variant="body1" sx={{ mb: 3, maxWidth: 620 }}>
                {project.summary}
              </Typography>
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                {project.tags.map((tag) => (
                  <Chip key={tag} label={tag} size="small" variant="outlined" />
                ))}
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap", mt: 4 }}>
                <LinkButton
                  variant="contained"
                  href={{ pathname: "/projects/[slug]", params: { slug: project.slug } }}
                  endIcon={<ArrowForwardIcon />}
                >
                  {labels.view}
                </LinkButton>
                {project.repo && (
                  <Button
                    component="a"
                    href={project.repo}
                    target="_blank"
                    rel="noopener noreferrer"
                    startIcon={<GitHubIcon />}
                  >
                    {labels.repo}
                  </Button>
                )}
              </Box>
            </Reveal>
          </Grid>

          {project.stats && project.stats.length > 0 && (
            <Grid size={{ xs: 12, md: 5 }}>
              <Reveal variant="rise" delay={120} sx={{ height: "100%" }}>
                <Box
                  sx={{
                    height: "100%",
                    pl: { md: 5 },
                    borderLeft: { md: "1px solid var(--app-border-soft)" },
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    gap: 3.5,
                  }}
                >
                  <Box
                    sx={{
                      width: 48,
                      height: 3,
                      background: `linear-gradient(to right, ${accent}, transparent)`,
                    }}
                  />
                  {project.stats.map((stat) => (
                    <MetaPair key={stat.label} label={stat.label} value={stat.value} />
                  ))}
                </Box>
              </Reveal>
            </Grid>
          )}
        </Grid>
      </Container>
    </Box>
  );
}
