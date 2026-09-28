import { Box, Container, Typography, Button, Card } from "@mui/material";
import Grid from "@mui/material/Grid2";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import HandshakeIcon from "@mui/icons-material/HandshakeOutlined";
import MenuBookIcon from "@mui/icons-material/MenuBookOutlined";
import LayersIcon from "@mui/icons-material/LayersOutlined";
import ShieldIcon from "@mui/icons-material/ShieldOutlined";
import PanToolIcon from "@mui/icons-material/PanToolOutlined";
import FactCheckIcon from "@mui/icons-material/FactCheckOutlined";
import GridOnIcon from "@mui/icons-material/GridOnOutlined";
import TaskAltIcon from "@mui/icons-material/TaskAltOutlined";
import SwapHorizIcon from "@mui/icons-material/SwapHorizOutlined";
import StreamIcon from "@mui/icons-material/StreamOutlined";
import TimelapseIcon from "@mui/icons-material/TimelapseOutlined";
import MonitorHeartIcon from "@mui/icons-material/MonitorHeartOutlined";
import FormatQuoteIcon from "@mui/icons-material/FormatQuoteOutlined";
import BlockIcon from "@mui/icons-material/BlockOutlined";
import ManageSearchIcon from "@mui/icons-material/ManageSearchOutlined";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import Reveal from "@/components/Reveal";
import SplitText from "@/components/SplitText";
import HeroCircles from "@/components/HeroCircles";
import TechMarquee from "@/components/TechMarquee";
import BlogCard, { assignThumbVariants } from "@/components/BlogCard";
import ServicesShowcase from "@/components/ServicesShowcase";
import FlowLines from "@/components/FlowLines";
import ExperienceTimeline from "@/components/ExperienceTimeline";
import UnderTheHood from "@/components/UnderTheHood";
import Availability from "@/components/Availability";
import ProofStrip from "@/components/ProofStrip";
import PrinciplesAccordion from "@/components/PrinciplesAccordion";
import { getBlogPosts } from "@/lib/content";
import { LIVE_URL as TWIN_LIVE_URL } from "./projects/digital-twin/content";
import JsonLd from "@/components/JsonLd";
import { buildAlternates, buildOpenGraph, formatDate, SITE_URL } from "@/lib/seo";
import { hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing, type Locale } from "@/i18n/routing";
import { palette } from "@/theme/theme";
import type { Metadata } from "next";

const LINKEDIN_URL = "https://www.linkedin.com/in/r-j3";

// Past 1360px the hero, "What I do" and Experience grow wider than the
// standard 1200px container, up to 1440px. The formula equals 1200px at
// exactly 1360px, so there is no jump.
const WIDE_CONTAINER = {
  "@media (min-width:1360px)": { maxWidth: "min(1440px, calc(100vw - 160px))" },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "home" });
  return {
    // `absolute` bypasses the layout's "%s | Ruud Juffermans" template, which
    // would otherwise repeat the name that's already in this title.
    title: { absolute: t("metaTitle") },
    description: t("metaDescription"),
    alternates: buildAlternates("/", locale),
    openGraph: buildOpenGraph("/", locale),
  };
}

export default async function Home({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  // The page renders in parallel with the [locale] layout, so its guard
  // doesn't protect this component. Unknown single-segment paths with a dot
  // (/llms.txt — dotted paths skip the middleware) land here with the path
  // as `locale`, and getTranslations throws on it.
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);
  const t = await getTranslations("home");
  const tc = await getTranslations("common");
  const allPosts = getBlogPosts(locale);
  const posts = allPosts.slice(0, 3);
  // Assign over every post, not just the three shown, so a post keeps the same
  // artwork here as on /blog.
  const thumbVariants = assignThumbVariants(allPosts.map((p) => p.slug));

  const servicesList = [
    {
      key: "analytics",
      label: t("services.service1Title"),
      title: t("services.slides.data.title"),
      subtitle: t("services.slides.data.subtitle"),
      slideLabel: `${t("services.carousel.slide", { index: 1, total: 2 })}: ${t("services.service1Title")}`,
      learnMore: t("services.slides.data.learnMore"),
      href: { pathname: "/expertise/[field]", params: { field: "data-engineering" } } as const,
      // Built from the draw.io export with scripts/drawio-to-web.mjs.
      visual: {
        image: {
          src: "/images/data-engineering.svg",
          alt: t("services.slides.data.diagramAlt"),
          width: 1010,
          height: 881,
        },
      },
    },
    {
      key: "ai",
      label: t("services.service2Title"),
      title: t("services.slides.ai.title"),
      subtitle: t("services.slides.ai.subtitle"),
      slideLabel: `${t("services.carousel.slide", { index: 2, total: 2 })}: ${t("services.service2Title")}`,
      learnMore: t("services.slides.ai.learnMore"),
      href: { pathname: "/expertise/[field]", params: { field: "ai-engineering" } } as const,
      // Built from the draw.io export with scripts/drawio-to-web.mjs.
      visual: {
        image: {
          src: "/images/ai-engineering.svg",
          alt: t("services.slides.ai.diagramAlt"),
          width: 962,
          height: 872,
        },
      },
    },
  ];

  // The three roles, in the order a hiring manager reads them: most recent
  // first. Copy lives in the `home.experience.items` translation array.
  const experienceItems = t.raw("experience.items") as {
    period: string;
    role: string;
    org: string;
    body: string;
  }[];

  // The portfolio projects, toggled in the dark "Under the hood" section.
  // Each variant links to its write-up on this site and to the repo. Icons
  // follow the features: shield/hand/fact-check for the agent's guards,
  // approval and evals; grid/check/swap for the modelling project;
  // stream/timer/monitor for the streaming one; quote/block/search for the
  // case-law RAG.
  const hoodIcon = { fontSize: 19 } as const;
  const hoodIcons: Record<string, [React.ReactNode, React.ReactNode, React.ReactNode]> = {
    "digital-twin": [
      <ShieldIcon sx={hoodIcon} key="1" />,
      <PanToolIcon sx={hoodIcon} key="2" />,
      <FactCheckIcon sx={hoodIcon} key="3" />,
    ],
    "open-data-warehouse": [
      <GridOnIcon sx={hoodIcon} key="1" />,
      <TaskAltIcon sx={hoodIcon} key="2" />,
      <SwapHorizIcon sx={hoodIcon} key="3" />,
    ],
    "ov-streaming-pipeline": [
      <StreamIcon sx={hoodIcon} key="1" />,
      <TimelapseIcon sx={hoodIcon} key="2" />,
      <MonitorHeartIcon sx={hoodIcon} key="3" />,
    ],
    "strafrecht-rag": [
      <FormatQuoteIcon sx={hoodIcon} key="1" />,
      <BlockIcon sx={hoodIcon} key="2" />,
      <ManageSearchIcon sx={hoodIcon} key="3" />,
    ],
  };
  const hoodVariants = [
    {
      key: "digital-twin",
      github: "https://github.com/datavakwerk/digital-twin",
      live: TWIN_LIVE_URL,
    },
    { key: "open-data-warehouse", github: "https://github.com/datavakwerk/nl-vehicle-warehouse" },
    { key: "ov-streaming-pipeline", github: "https://github.com/datavakwerk/ov-streaming-pipeline" },
    { key: "strafrecht-rag", github: "https://github.com/datavakwerk/strafrecht-rag" },
  ].map(({ key, github, live }: { key: string; github: string; live?: string }) => ({
    key,
    github,
    live,
    liveLabel: t("underhood.live"),
    toggleLabel: t(`underhood.projects.${key}.toggle`),
    eyebrow: t("underhood.eyebrow"),
    title: t(`underhood.projects.${key}.title`),
    sub: t(`underhood.projects.${key}.sub`),
    codeNote: t(`underhood.projects.${key}.codeNote`),
    githubLabel: t("underhood.github"),
    projectLabel: t("underhood.viewProject"),
    features: [
      {
        icon: hoodIcons[key][0],
        title: t(`underhood.projects.${key}.f1Title`),
        desc: t(`underhood.projects.${key}.f1Body`),
      },
      {
        icon: hoodIcons[key][1],
        title: t(`underhood.projects.${key}.f2Title`),
        desc: t(`underhood.projects.${key}.f2Body`),
      },
      {
        icon: hoodIcons[key][2],
        title: t(`underhood.projects.${key}.f3Title`),
        desc: t(`underhood.projects.${key}.f3Body`),
      },
    ],
  }));

  // Four working habits that are specific to Ruud and visible in the repos;
  // generic "team player / fast learner" lines were left out deliberately.
  const principleCards = [
    { icon: <LayersIcon sx={{ fontSize: 21 }} />, key: "card1" },
    { icon: <ShieldIcon sx={{ fontSize: 21 }} />, key: "card2" },
    { icon: <MenuBookIcon sx={{ fontSize: 21 }} />, key: "card3" },
    { icon: <HandshakeIcon sx={{ fontSize: 21 }} />, key: "card4" },
  ].map(({ icon, key }) => ({
    icon,
    title: t(`principles.${key}Title`),
    description: t(`principles.${key}Body`),
  }));

  // ── Flow backdrop ─────────────────────────────────────────────────────────
  // The scrolling line animation lives inside the Experience and How-I-work
  // sections — <FlowLines /> sizes itself to whichever wrapper holds it.
  // Layering inside each section: its own background, then the lines, then
  // the same background again at 100 - FLOW_SHOW percent, then the content.
  const FLOW_SHOW = 55;

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Person",
          "@id": `${SITE_URL}/#person`,
          name: "Ruud Juffermans",
          url: SITE_URL,
          jobTitle: "Data Engineer",
          description: t("metaDescription"),
          image: `${SITE_URL}/images/ruud-juffermans-portrait.jpg`,
          address: { "@type": "PostalAddress", addressLocality: "Amsterdam", addressCountry: "NL" },
          sameAs: [LINKEDIN_URL, "https://github.com/ruud-juffermans", "https://github.com/datavakwerk"],
        }}
      />
      {/* Hero — sits above the flow backdrop, which starts below it */}
      <Box
        sx={{
          position: "relative",
          pt: { xs: 12, md: 20 },
          pb: { xs: 12, md: 18 },
          overflow: "hidden",
          // Restrained backdrop: one soft brand glow + a faint dot grid that
          // fades out toward the content.
          "&::before": {
            content: '""',
            position: "absolute",
            top: -280,
            right: -160,
            width: 720,
            height: 720,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${palette.redMuted} 0%, transparent 62%)`,
            pointerEvents: "none",
          },
          "&::after": {
            content: '""',
            position: "absolute",
            inset: 0,
            backgroundImage: `radial-gradient(var(--app-gray-200) 1px, transparent 1px)`,
            backgroundSize: "26px 26px",
            maskImage: "radial-gradient(ellipse 90% 70% at 80% 10%, black 0%, transparent 68%)",
            WebkitMaskImage:
              "radial-gradient(ellipse 90% 70% at 80% 10%, black 0%, transparent 68%)",
            opacity: 0.7,
            pointerEvents: "none",
          },
        }}
      >
        <HeroCircles />
        {/* Past 1360px the hero grows wider than the standard 1200px
            container, up to 1440px, and the text column grows with it
            (820 → 1000px). Both formulas equal the base values at exactly
            1360px, so there is no jump; HeroCircles shifts to match. */}
        <Container sx={{ position: "relative", ...WIDE_CONTAINER }}>
          <Box
            sx={{
              maxWidth: 820,
              "@media (min-width:1360px)": { maxWidth: "min(1000px, calc(100vw - 540px))" },
            }}
          >
            <Reveal variant="rise" delay={0}>
              <Box sx={{ mb: 3 }}>
                <Availability variant="hero" />
              </Box>
            </Reveal>
            <Reveal variant="rise" delay={60}>
              <Typography variant="overline" sx={{ mb: 2.5, display: "block" }}>
                {t("hero.eyebrow")}
              </Typography>
            </Reveal>
            <Typography variant="h1" sx={{ mb: 3.5 }}>
              <SplitText text={t("hero.title")} />
            </Typography>
            <Reveal variant="rise" delay={240}>
              <Typography
                variant="subtitle1"
                sx={{
                  mb: 4,
                  maxWidth: 700,
                  // Grows with the wide hero: 700px at 1360px, 800px from 1460px up.
                  "@media (min-width:1360px)": { maxWidth: "min(800px, calc(100vw - 660px))" },
                }}
              >
                {t("hero.subtitle")}
              </Typography>
            </Reveal>
            {/* Proof before tools: the police work and the courses are the
                reason to believe the claim above, so they sit directly under
                it rather than buried in the About timeline. */}
            <Reveal variant="fade" delay={300}>
              <Box sx={{ mb: 6 }}>
                <ProofStrip />
              </Box>
            </Reveal>
            <Reveal variant="rise" delay={360}>
              <Box
                sx={{
                  display: "flex",
                  gap: 2,
                  flexDirection: { xs: "column", sm: "row" },
                }}
              >
                <Button
                  variant="contained"
                  size="large"
                  component={Link}
                  href="/contact"
                  sx={{ px: 6, width: { xs: "100%", sm: "auto" } }}
                >
                  {t("hero.ctaPrimary")}
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  component={Link}
                  href="/projects"
                  endIcon={<ArrowForwardIcon />}
                  sx={{
                    px: 6,
                    width: { xs: "100%", sm: "auto" },
                    // Solid white pill in both schemes, so text is pinned to a
                    // dark ink rather than the scheme's text token.
                    backgroundColor: "#FFFFFF",
                    color: "#0F172A",
                    borderColor: "#FFFFFF",
                    boxShadow: "0 1px 2px rgba(11,17,32,0.12)",
                    "@media (hover: hover)": {
                      "&:hover": {
                        backgroundColor: "#FFFFFF",
                        borderColor: "var(--app-red)",
                        color: "var(--app-red)",
                        transform: "translateY(-1px)",
                        boxShadow: "0 10px 28px rgba(11,17,32,0.14)",
                      },
                    },
                  }}
                >
                  {t("hero.ctaSecondary")}
                </Button>
              </Box>
            </Reveal>
            <Reveal variant="fade" delay={480}>
              <TechMarquee label={t("hero.toolsLabel")} />
            </Reveal>
          </Box>
        </Container>
      </Box>

      {/* What I do — deep brand-dark band with a soft dot grid; a two-slide
          slideshow (data engineering, AI & GenAI), each slide with its own
          heading and intro on the left and its diagram right. The band's
          overflow: hidden crops the data slide's diagram at its bottom edge. */}
      <Box
        sx={{
          py: { xs: 10, md: 13 },
          backgroundColor: "#0D2242",
          position: "relative",
          overflow: "hidden",
          "&::before": {
            content: '""',
            position: "absolute",
            inset: 0,
            backgroundImage: "radial-gradient(rgba(166, 200, 247, 0.16) 1px, transparent 1px)",
            backgroundSize: "26px 26px",
            maskImage: "radial-gradient(ellipse 70% 90% at 70% 50%, #000, transparent 75%)",
            WebkitMaskImage:
              "radial-gradient(ellipse 70% 90% at 70% 50%, #000, transparent 75%)",
            pointerEvents: "none",
          },
        }}
      >
        <Container sx={{ position: "relative", ...WIDE_CONTAINER }}>
          <Reveal variant="rise">
            <ServicesShowcase
              eyebrow={t("services.eyebrow")}
              services={servicesList}
            />
          </Reveal>
        </Container>
      </Box>

      {/* Experience — the three roles as cards on the flowing-line backdrop,
          dimmed by a second pass of the section's own background */}
      <Box
        sx={{
          py: { xs: 10, md: 14 },
          position: "relative",
          overflow: "hidden",
          backgroundColor: palette.offWhite,
          borderTop: `1px solid var(--app-border-soft)`,
          borderBottom: `1px solid var(--app-border-soft)`,
          "&::after": {
            content: '""',
            position: "absolute",
            inset: 0,
            background: palette.offWhite,
            opacity: (100 - FLOW_SHOW) / 100,
            pointerEvents: "none",
          },
          "& > .MuiContainer-root": { position: "relative", zIndex: 1 },
        }}
      >
        <FlowLines rate={0.85} />
        <Container sx={WIDE_CONTAINER}>
          <Reveal variant="rise">
            <Typography variant="overline" sx={{ mb: 1.5, display: "block" }}>
              {t("experience.eyebrow")}
            </Typography>
            <Typography variant="h2" sx={{ mb: 2, maxWidth: 600 }}>
              <SplitText text={t("experience.title")} />
            </Typography>
            <Typography variant="subtitle1" sx={{ mb: { xs: 4, md: 5 }, maxWidth: 640 }}>
              {t("experience.subtitle")}
            </Typography>
          </Reveal>
          {/* The one photo on the homepage: Ruud presenting, which is the
              Udemy half of the subtitle made visible, with the three roles
              sliding in over it as a timeline. */}
          <ExperienceTimeline
            photo={{
              src: "/images/ruud-juffermans-speaking.jpg",
              alt: t("experience.photoAlt"),
              objectPosition: "40% 50%",
            }}
            entries={experienceItems}
            cta={
              <Button component={Link} href="/about" endIcon={<ArrowForwardIcon />} sx={{ ml: -2 }}>
                {t("experience.cta")}
              </Button>
            }
          />
        </Container>
      </Box>

      {/* Projects — dark section with toggleable code panel */}
      <UnderTheHood variants={hoodVariants} allProjectsLabel={t("projects.all")} />

      {/* How I work — four-card band on the circuit-trace variant of the
          flow backdrop, dimmed the same way as the Experience section. */}
      <Box
        sx={{
          py: { xs: 10, md: 14 },
          position: "relative",
          overflow: "hidden",
          backgroundColor: palette.offWhite,
          borderTop: `1px solid var(--app-border-soft)`,
          borderBottom: `1px solid var(--app-border-soft)`,
          "&::after": {
            content: '""',
            position: "absolute",
            inset: 0,
            background: palette.offWhite,
            opacity: (100 - FLOW_SHOW) / 100,
            pointerEvents: "none",
          },
          "& > .MuiContainer-root": { position: "relative", zIndex: 1 },
        }}
      >
        <FlowLines variant="circuit" />
        <Container>
          <Reveal variant="rise">
            <Typography variant="overline" sx={{ mb: 1.5, display: "block" }}>
              {t("principles.eyebrow")}
            </Typography>
            <Typography variant="h2" sx={{ mb: 2, maxWidth: 600 }}>
              <SplitText text={t("principles.title")} />
            </Typography>
            <Typography
              variant="subtitle1"
              sx={{ mb: { xs: 5, md: 8 }, maxWidth: 620 }}
            >
              {t("principles.subtitle")}
            </Typography>
          </Reveal>
          {/* Mobile: collapsed accordion, one habit open at a time — the top
              one unfolds on its own as the section scrolls into view. */}
          <Reveal variant="rise" sx={{ display: { xs: "block", sm: "none" } }}>
            <PrinciplesAccordion items={principleCards} />
          </Reveal>

          {/* From 600px: the four habits side by side in one card, separated
              by hairline dividers — two per row up to 900px (with a divider
              between the rows), four in a row from there. */}
          <Reveal variant="rise" sx={{ display: { xs: "none", sm: "block" } }}>
            {/* Always in the theme card's lifted state, and no extra lift on
                hover: it's a panel, not a link. */}
            <Card
              sx={{
                borderColor: "var(--app-border)",
                // The theme card's hover shadows, at rest, per scheme.
                boxShadow: "0 16px 44px rgba(11, 17, 32, 0.09)",
                "[data-mui-color-scheme='dark'] &": {
                  boxShadow: "0 16px 44px rgba(0, 0, 0, 0.55)",
                },
                "@media (hover: hover)": {
                  "&:hover": { transform: "none" },
                },
              }}
            >
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { sm: "1fr 1fr", md: "repeat(4, 1fr)" },
                }}
              >
                {principleCards.map((card, i) => (
                  <Box
                    key={card.title}
                    sx={{
                      p: { xs: 3.5, md: 4 },
                      borderColor: "var(--app-border-soft)",
                      borderStyle: "solid",
                      borderWidth: 0,
                      "&:nth-of-type(even)": { borderLeftWidth: 1 },
                      "&:nth-of-type(n + 3)": {
                        borderTopWidth: { sm: 1, md: 0 },
                        borderLeftWidth: { md: 1 },
                      },
                    }}
                  >
                    <Reveal variant="rise" delay={i * 90}>
                      {/* Icon tile follows the scheme: a light brand-tinted
                          tile with the brand glyph in light mode, the navy
                          tile with the pale glyph in dark. */}
                      <Box
                        aria-hidden
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: 2.5,
                          display: "grid",
                          placeItems: "center",
                          backgroundColor:
                            "color-mix(in srgb, var(--app-red) 10%, transparent)",
                          color: "var(--app-red)",
                          mb: 2,
                          "[data-mui-color-scheme='dark'] &": {
                            backgroundColor: palette.navy,
                            color: "#a6c8f7",
                          },
                        }}
                      >
                        {card.icon}
                      </Box>
                      <Typography variant="h4" component="h3" sx={{ mb: 1 }}>
                        {card.title}
                      </Typography>
                      <Typography variant="body1">{card.description}</Typography>
                    </Reveal>
                  </Box>
                ))}
              </Box>
            </Card>
          </Reveal>
        </Container>
      </Box>

      {/* Latest Articles */}
      {posts.length > 0 && (
        <Box
          sx={{
            py: { xs: 10, md: 14 },
            backgroundColor: palette.bg,
            borderTop: `1px solid var(--app-border-soft)`,
            borderBottom: `1px solid var(--app-border-soft)`,
          }}
        >
          <Container>
            <Reveal variant="rise">
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-end",
                  mb: { xs: 5, md: 8 },
                }}
              >
                <Box>
                  <Typography variant="overline" sx={{ mb: 1.5, display: "block" }}>
                    {t("blog.eyebrow")}
                  </Typography>
                  <Typography variant="h2">
                    <SplitText text={t("blog.title")} />
                  </Typography>
                </Box>
                <Button
                  component={Link}
                  href="/blog"
                  endIcon={<ArrowForwardIcon />}
                  sx={{ display: { xs: "none", sm: "inline-flex" }, flexShrink: 0 }}
                >
                  {t("blog.all")}
                </Button>
              </Box>
            </Reveal>
            {/* Below md: swipe carousel — one post per view on phones, two
                side by side from 600px, with a sliver of the next card peeking
                in from the right as the swipe affordance. The negative margins
                cancel the Container's gutters (20px on xs, 32px from sm) so
                cards can slide to the screen edge. */}
            <Reveal variant="fade" sx={{ display: { xs: "block", md: "none" } }}>
              <Box
                sx={{
                  display: "flex",
                  gap: 2,
                  mx: { xs: "-20px", sm: "-32px" },
                  px: { xs: "20px", sm: "32px" },
                  overflowX: "auto",
                  scrollSnapType: "x mandatory",
                  scrollPaddingInline: { xs: "20px", sm: "32px" },
                  pb: 1,
                  scrollbarWidth: "none",
                  "&::-webkit-scrollbar": { display: "none" },
                }}
              >
                {posts.map((post) => (
                  <Box
                    key={post.slug}
                    sx={{
                      flex: { xs: "0 0 88%", sm: "0 0 45%" },
                      minWidth: 0,
                      scrollSnapAlign: "start",
                    }}
                  >
                    <BlogCard
                      post={post}
                      variant={thumbVariants[post.slug]}
                      meta={`${formatDate(post.date, locale)} · ${post.readingTime} ${tc("readingTimeSuffix")}`}
                    />
                  </Box>
                ))}
              </Box>
            </Reveal>

            <Grid container spacing={2.5} sx={{ display: { xs: "none", md: "flex" } }}>
              {posts.map((post, i) => (
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={post.slug}>
                  <Reveal variant="rise" delay={i * 120} sx={{ height: "100%" }}>
                    <BlogCard
                      post={post}
                      variant={thumbVariants[post.slug]}
                      meta={`${formatDate(post.date, locale)} · ${post.readingTime} ${tc("readingTimeSuffix")}`}
                    />
                  </Reveal>
                </Grid>
              ))}
            </Grid>
            <Button
              component={Link}
              href="/blog"
              endIcon={<ArrowForwardIcon />}
              sx={{ mt: 4, display: { xs: "inline-flex", sm: "none" } }}
            >
              {t("blog.all")}
            </Button>
          </Container>
        </Box>
      )}

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
                maxWidth: 760,
                mx: "auto",
              }}
            >
              <SplitText text={t("cta.title")} />
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
                component="a"
                href={LINKEDIN_URL}
                target="_blank"
                rel="noopener"
                endIcon={<LinkedInIcon />}
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
