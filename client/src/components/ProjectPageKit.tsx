import type { ReactNode } from "react";
import {
  Box,
  Button,
  Chip,
  Container,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import GitHubIcon from "@mui/icons-material/GitHub";
import { Link } from "@/i18n/navigation";
import Reveal from "@/components/Reveal";
import SplitText from "@/components/SplitText";
import MetaPair from "@/components/MetaPair";
import ProjectFigure from "@/components/ProjectFigure";
import { palette } from "@/theme/theme";

// Building blocks for the bespoke project pages (app/[locale]/projects/<slug>/).
// Each page composes these with its own content module; the visual language
// is shared so every case study reads as one family.

export interface Figure {
  kind: "diagram" | "screenshot";
  src: string;
  width: number;
  height: number;
  alt: string;
  caption: string;
  /** Diagrams only: .drawio source, rendered in draw.io's zoomable viewer. */
  drawioSrc?: string;
}

export interface TitledItem {
  title: string;
  body: string;
}

export interface Callout {
  value: string;
  label: string;
}

export const CARD_SX = {
  height: "100%",
  p: { xs: 3, md: 3.75 },
  borderRadius: "20px",
  border: `1px solid var(--app-border-soft)`,
  backgroundColor: "var(--app-surface-elevated)",
} as const;

export const CODE_SX = {
  fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
  fontSize: "0.85em",
  fontWeight: 500,
  px: 0.7,
  py: 0.2,
  borderRadius: "6px",
  backgroundColor: palette.offWhite,
  border: `1px solid ${palette.gray100}`,
  whiteSpace: "nowrap",
} as const;

const HEADING_NUMBER = (accent: string) =>
  ({ fontFamily: "var(--font-heading)", fontWeight: 700, color: accent }) as const;

/** A full-width page section; `shaded` alternates the surface colour. */
export function Band({ shaded, children }: { shaded?: boolean; children: ReactNode }) {
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
      <Container>{children}</Container>
    </Box>
  );
}

export function SectionTitle({ title, intro }: { title: string; intro?: string }) {
  return (
    <Reveal variant="rise">
      <Typography variant="h2" sx={{ mb: intro ? 2 : 4, maxWidth: 720 }}>
        {title}
      </Typography>
      {intro && (
        <Typography variant="subtitle1" sx={{ mb: 4, maxWidth: 720 }}>
          {intro}
        </Typography>
      )}
    </Reveal>
  );
}

export function SubTitle({ title }: { title: string }) {
  return (
    <Reveal variant="rise">
      <Typography variant="h3" sx={{ mb: 3, maxWidth: 720 }}>
        {title}
      </Typography>
    </Reveal>
  );
}

export function Prose({ paragraphs, sx }: { paragraphs: string[]; sx?: object }) {
  return (
    <Box sx={{ display: "grid", gap: 2, ...sx }}>
      {paragraphs.map((p) => (
        <Typography key={p.slice(0, 48)} variant="body1">
          {p}
        </Typography>
      ))}
    </Box>
  );
}

/** Body copy revealed on scroll, capped at reading width. */
export function ProseBlock({ paragraphs, delay = 100 }: { paragraphs: string[]; delay?: number }) {
  return (
    <Reveal variant="rise" delay={delay}>
      <Prose paragraphs={paragraphs} sx={{ maxWidth: 760 }} />
    </Reveal>
  );
}

export function FigureBlock({
  figure,
  priority,
}: {
  figure: Figure;
  priority?: boolean;
}) {
  return (
    <Reveal variant="fade" sx={{ my: { xs: 4, md: 5 } }}>
      <ProjectFigure {...figure} priority={priority} />
    </Reveal>
  );
}

/** Numbered cards in two or three columns. */
export function NumberedCards({
  items,
  columns = 2,
  accent,
}: {
  items: TitledItem[];
  columns?: 2 | 3;
  accent: string;
}) {
  return (
    <Grid container spacing={{ xs: 2.5, md: 3 }}>
      {items.map((item, i) => (
        <Grid size={{ xs: 12, md: columns === 3 ? 4 : 6 }} key={item.title}>
          <Reveal variant="rise" delay={i * 90} sx={{ height: "100%" }}>
            <Box sx={CARD_SX}>
              <Typography sx={{ ...HEADING_NUMBER(accent), mb: 1.5 }}>
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
  );
}

/** Cards headed by a monospace command or identifier. */
export function CodeCards({ items }: { items: { code: string; title: string; body: string }[] }) {
  return (
    <Grid container spacing={{ xs: 2.5, md: 3 }}>
      {items.map((p, i) => (
        <Grid size={{ xs: 12, md: 6 }} key={p.code}>
          <Reveal variant="rise" delay={i * 90} sx={{ height: "100%" }}>
            <Box sx={CARD_SX}>
              <Typography component="code" sx={{ ...CODE_SX, display: "inline-block", mb: 2 }}>
                {p.code}
              </Typography>
              <Typography variant="h4" component="h3" sx={{ mb: 1.25 }}>
                {p.title}
              </Typography>
              <Typography variant="body1">{p.body}</Typography>
            </Box>
          </Reveal>
        </Grid>
      ))}
    </Grid>
  );
}

/** Stacked big-number tiles, for the column next to a prose block. */
export function Callouts({ items, accent }: { items: Callout[]; accent: string }) {
  return (
    <Reveal variant="slide-left" delay={200}>
      <Box sx={{ display: "grid", gap: 2 }}>
        {items.map((k) => (
          <Box
            key={k.value + k.label}
            sx={{
              display: "grid",
              gridTemplateColumns: "minmax(96px, auto) 1fr",
              alignItems: "baseline",
              gap: 2.5,
              p: { xs: 2.5, md: 3 },
              borderRadius: "16px",
              border: `1px solid var(--app-border-soft)`,
              backgroundColor: "var(--app-surface-elevated)",
            }}
          >
            <Typography
              sx={{
                fontFamily: "var(--font-heading)",
                fontWeight: 800,
                fontSize: "clamp(1.6rem, 2.2vw + 0.6rem, 2.2rem)",
                letterSpacing: "-0.03em",
                color: accent,
                lineHeight: 1,
              }}
            >
              {k.value}
            </Typography>
            <Typography variant="body2" sx={{ color: "var(--app-text-secondary)" }}>
              {k.label}
            </Typography>
          </Box>
        ))}
      </Box>
    </Reveal>
  );
}

/** Prose on the left, callouts on the right. */
export function ProseWithCallouts({
  paragraphs,
  callouts,
  accent,
}: {
  paragraphs: string[];
  callouts: Callout[];
  accent: string;
}) {
  return (
    <Grid container spacing={{ xs: 4, md: 8 }}>
      <Grid size={{ xs: 12, md: 7 }}>
        <Reveal variant="rise" delay={100}>
          <Prose paragraphs={paragraphs} />
        </Reveal>
      </Grid>
      <Grid size={{ xs: 12, md: 5 }}>
        <Callouts items={callouts} accent={accent} />
      </Grid>
    </Grid>
  );
}

/** A card with a title, a dotted list and an optional closing note. */
export function BulletCard({
  title,
  items,
  note,
  accent,
  ordered = false,
}: {
  title: string;
  items: string[];
  note?: string;
  accent: string;
  ordered?: boolean;
}) {
  return (
    <Reveal variant="rise">
      <Box sx={{ ...CARD_SX, height: "auto" }}>
        <Typography variant="h4" component="h3" sx={{ mb: 2 }}>
          {title}
        </Typography>
        <Box
          component={ordered ? "ol" : "ul"}
          sx={{ m: 0, p: 0, listStyle: "none", display: "grid", gap: ordered ? 1.75 : 1.25 }}
        >
          {items.map((q, i) => (
            <Box
              component="li"
              key={q}
              sx={{ display: "flex", gap: ordered ? 2 : 1.75, alignItems: "flex-start" }}
            >
              {ordered ? (
                <Typography sx={{ ...HEADING_NUMBER(accent), minWidth: 28, pt: "2px" }}>
                  {String(i + 1).padStart(2, "0")}
                </Typography>
              ) : (
                <Box
                  aria-hidden
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    backgroundColor: accent,
                    mt: "11px",
                    flexShrink: 0,
                  }}
                />
              )}
              <Typography variant="body1">{q}</Typography>
            </Box>
          ))}
        </Box>
        {note && (
          <Typography variant="body2" sx={{ mt: 2.5, color: "var(--app-text-secondary)" }}>
            {note}
          </Typography>
        )}
      </Box>
    </Reveal>
  );
}

/** Navy block with a monospace identifier and its explanation. */
export function CodeNote({ code, body }: { code: string; body: string }) {
  return (
    <Reveal variant="rise" sx={{ mt: { xs: 3, md: 4 } }}>
      <Box
        sx={{
          p: { xs: 3, md: 3.75 },
          borderRadius: "20px",
          backgroundColor: palette.navy,
          border: `1px solid ${palette.gray200}`,
        }}
      >
        <Typography
          component="code"
          sx={{
            display: "block",
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            fontSize: { xs: "0.8rem", md: "0.9rem" },
            color: "#7ee0c3",
            mb: 1.25,
            wordBreak: "break-all",
          }}
        >
          {code}
        </Typography>
        <Typography variant="body1" sx={{ color: "rgba(255,255,255,0.78)" }}>
          {body}
        </Typography>
      </Box>
    </Reveal>
  );
}

/** One emphasised sentence with an accent rule. */
export function PullQuote({ text, accent }: { text: string; accent: string }) {
  return (
    <Reveal variant="fade" delay={200}>
      <Typography
        variant="body1"
        sx={{
          mt: 3,
          pl: 2.5,
          borderLeft: `3px solid ${accent}`,
          fontFamily: "var(--font-heading)",
          fontSize: "1.15rem",
          color: palette.gray800,
          maxWidth: 760,
        }}
      >
        {text}
      </Typography>
    </Reveal>
  );
}

/**
 * Key/value table in a card. With `columns`, a header row is rendered and
 * the second column is emphasised; without, it's a two-column fact list.
 */
export function MetricsTable({
  caption,
  columns,
  rows,
  accent,
}: {
  caption?: string;
  columns?: string[];
  rows: string[][];
  accent: string;
}) {
  const cell = {
    px: { xs: 2.5, md: 3.5 },
    py: 1.75,
    borderColor: "var(--app-border-soft)",
    verticalAlign: "top",
  } as const;
  return (
    <Reveal variant="rise" delay={100}>
      <Box
        sx={{
          borderRadius: "20px",
          border: `1px solid var(--app-border-soft)`,
          backgroundColor: "var(--app-surface-elevated)",
          overflow: "hidden",
        }}
      >
        {caption && (
          <Typography
            variant="overline"
            sx={{
              display: "block",
              px: { xs: 2.5, md: 3.5 },
              py: 1.75,
              borderBottom: `1px solid var(--app-border-soft)`,
              color: accent,
            }}
          >
            {caption}
          </Typography>
        )}
        <Box sx={{ overflowX: "auto" }}>
          <Table size="small" sx={{ minWidth: { xs: 0, sm: 560 } }}>
            {columns && (
              <TableHead>
                <TableRow>
                  {columns.map((c) => (
                    <TableCell
                      key={c}
                      sx={{
                        ...cell,
                        fontFamily: "var(--font-heading)",
                        fontWeight: 700,
                        color: palette.gray900,
                        backgroundColor: palette.offWhite,
                      }}
                    >
                      {c}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
            )}
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r[0]} sx={{ "&:last-child td, &:last-child th": { borderBottom: 0 } }}>
                  {r.map((v, i) => (
                    <TableCell
                      key={`${r[0]}-${i}`}
                      component={i === 0 ? "th" : "td"}
                      scope={i === 0 ? "row" : undefined}
                      sx={{
                        ...cell,
                        width: i === 0 ? { md: columns ? "auto" : "34%" } : undefined,
                        whiteSpace: i === 1 && columns ? "nowrap" : "normal",
                        color:
                          i === 0
                            ? "var(--app-text-secondary)"
                            : i === 1
                              ? palette.gray900
                              : "var(--app-text-secondary)",
                        fontFamily: i === 1 ? "var(--font-heading)" : undefined,
                        fontWeight: i === 0 ? 500 : i === 1 ? 600 : 400,
                      }}
                    >
                      {v}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      </Box>
    </Reveal>
  );
}

/** The opening of a project page: claim, intro, tags, buttons, stats, facts. */
export function ProjectHero({
  accent,
  eyebrow,
  title,
  lead,
  intro,
  tags,
  facts,
  stats,
  repoUrl,
  labels,
  children,
}: {
  accent: string;
  eyebrow: string;
  title: string;
  lead: string;
  intro: string[];
  tags: string[];
  facts: string[];
  stats: { label: string; value: string }[];
  repoUrl: string;
  labels: { repo: string; allProjects: string; back: string };
  /** The hero figure, rendered below the stats. */
  children?: ReactNode;
}) {
  return (
    <Box component="section" sx={{ pt: { xs: 4, md: 8 }, pb: { xs: 6, md: 8 } }}>
      <Container>
        <Button
          component={Link}
          href="/projects"
          startIcon={<ArrowBackIcon />}
          sx={{ mb: 3, ml: -1, color: palette.gray500 }}
        >
          {labels.back}
        </Button>
        <Box sx={{ maxWidth: 820 }}>
          <Reveal variant="rise" delay={0}>
            <Typography variant="overline" sx={{ mb: 2, display: "block" }}>
              <Box component="span" sx={{ color: accent }}>
                {eyebrow}
              </Box>
            </Typography>
          </Reveal>
          <Reveal variant="rise" delay={100}>
            <Typography variant="h1" sx={{ mb: 3 }}>
              <SplitText text={title} />
            </Typography>
          </Reveal>
          <Reveal variant="rise" delay={200}>
            <Typography variant="subtitle1" sx={{ mb: 3 }}>
              {lead}
            </Typography>
            <Prose paragraphs={intro} />
          </Reveal>
          <Reveal variant="rise" delay={300}>
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mt: 3.5 }}>
              {tags.map((tag) => (
                <Chip key={tag} label={tag} size="small" variant="outlined" />
              ))}
            </Box>
            <Box sx={{ display: "flex", gap: 2, flexDirection: { xs: "column", sm: "row" }, mt: 4 }}>
              <Button
                variant="contained"
                size="large"
                component="a"
                href={repoUrl}
                target="_blank"
                rel="noopener noreferrer"
                startIcon={<GitHubIcon />}
                sx={{ px: 5, width: { xs: "100%", sm: "auto" } }}
              >
                {labels.repo}
              </Button>
              <Button
                variant="outlined"
                size="large"
                component={Link}
                href="/projects"
                endIcon={<ArrowForwardIcon />}
                sx={{ px: 5, width: { xs: "100%", sm: "auto" } }}
              >
                {labels.allProjects}
              </Button>
            </Box>
          </Reveal>
        </Box>

        <Reveal variant="rise" delay={350}>
          <Box
            sx={{
              mt: { xs: 5, md: 7 },
              pt: 3.5,
              borderTop: `1px solid var(--app-border-soft)`,
              display: "grid",
              gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(4, 1fr)" },
              gap: { xs: 3, md: 4 },
            }}
          >
            {stats.map((s) => (
              <MetaPair key={s.label} label={s.label} value={s.value} />
            ))}
          </Box>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75, mt: 3 }}>
            {facts.map((f) => (
              <Chip key={f} label={f} size="small" sx={{ fontSize: "0.78rem" }} />
            ))}
          </Box>
        </Reveal>

        {children}
      </Container>
    </Box>
  );
}

/** Two-column band: heading left, prose right. */
export function SplitBand({ title, paragraphs }: { title: string; paragraphs: string[] }) {
  return (
    <Band shaded>
      <Grid container spacing={{ xs: 3, md: 8 }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Reveal variant="rise">
            <Typography variant="h2">{title}</Typography>
          </Reveal>
        </Grid>
        <Grid size={{ xs: 12, md: 8 }}>
          <Reveal variant="rise" delay={100}>
            <Prose paragraphs={paragraphs} sx={{ maxWidth: 720 }} />
          </Reveal>
        </Grid>
      </Grid>
    </Band>
  );
}

/** The dark closing band: what the project shows, the closing line, links. */
export function ProjectClosing({
  accent,
  title,
  skills,
  closing,
  repoUrl,
  labels,
  footnotes,
}: {
  accent: string;
  title: string;
  skills: string[];
  closing: string;
  repoUrl: string;
  labels: { repo: string; allProjects: string };
  footnotes: string[];
}) {
  return (
    <Box
      component="section"
      sx={{
        position: "relative",
        overflow: "hidden",
        backgroundColor: "#070B15",
        py: { xs: 10, md: 13 },
        "&::before": {
          content: '""',
          position: "absolute",
          inset: 0,
          background: `radial-gradient(640px 340px at 50% 115%, ${accent}55, transparent 70%)`,
          pointerEvents: "none",
        },
      }}
    >
      <Container sx={{ position: "relative" }}>
        <Reveal variant="rise">
          <Typography variant="h2" sx={{ color: palette.white, mb: 3.5, maxWidth: 720 }}>
            {title}
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 4, maxWidth: 820 }}>
            {skills.map((s) => (
              <Chip
                key={s}
                label={s}
                variant="outlined"
                sx={{
                  color: "rgba(255,255,255,0.86)",
                  borderColor: "rgba(255,255,255,0.28)",
                  fontSize: "0.85rem",
                }}
              />
            ))}
          </Box>
          <Typography
            sx={{
              fontFamily: "var(--font-heading)",
              fontSize: "clamp(1.25rem, 1.4vw + 0.8rem, 1.6rem)",
              fontWeight: 600,
              color: palette.white,
              maxWidth: 720,
              mb: 5,
            }}
          >
            {closing}
          </Typography>
          <Box
            sx={{
              display: "flex",
              gap: 2,
              flexDirection: { xs: "column", sm: "row" },
              alignItems: { xs: "stretch", sm: "center" },
            }}
          >
            <Button
              variant="contained"
              size="large"
              component="a"
              href={repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              startIcon={<GitHubIcon />}
              sx={{ px: 5 }}
            >
              {labels.repo}
            </Button>
            <Button
              variant="outlined"
              size="large"
              component={Link}
              href="/projects"
              endIcon={<ArrowForwardIcon />}
              sx={{
                px: 5,
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
              {labels.allProjects}
            </Button>
          </Box>
          <Box sx={{ mt: 4, display: "grid", gap: 0.75 }}>
            {footnotes.map((f) => (
              <Typography key={f.slice(0, 48)} variant="body2" sx={{ color: "rgba(255,255,255,0.6)" }}>
                {f}
              </Typography>
            ))}
          </Box>
        </Reveal>
      </Container>
    </Box>
  );
}
